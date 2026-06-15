"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as xlsx from "xlsx"
import bcrypt from "bcryptjs"

export async function importUsersFromExcel(formData: FormData, role: "TEACHER" | "STUDENT") {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "File Excel tidak ditemukan." };
  }

  let schoolId = session.user.schoolId;
  if (!schoolId && session.user.role === "SUPERADMIN") {
    const firstSchool = await prisma.school.findFirst();
    schoolId = firstSchool?.id || null;
  }

  try {
    // 1. Baca buffer dari file
    const buffer = await file.arrayBuffer();
    
    // 2. Parse menggunakan SheetJS
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // 3. Konversi ke JSON
    const rawData = xlsx.utils.sheet_to_json<any>(sheet);
    
    if (rawData.length === 0) {
      return { error: "File Excel kosong atau format tidak sesuai." };
    }

    const usersToInsert = [];
    const identityKey = role === "TEACHER" ? "NUPTK" : "NISN";

    // 4. Looping & Hashing
    for (const row of rawData) {
      // Mendukung fleksibilitas header (case-insensitive di level aplikasi kita)
      const name = row["Nama Lengkap"] || row["Nama"] || row["nama"];
      const identity = row[identityKey] || row[identityKey.toLowerCase()] || row[identityKey.toUpperCase()];
      const email = row["Email"] || row["email"] || null;

      if (!name || !identity) {
        continue; // Lewati baris tidak valid
      }

      const strIdentity = String(identity).trim();
      const hashedPassword = await bcrypt.hash(strIdentity, 10);

      usersToInsert.push({
        name: String(name).trim(),
        [role === "TEACHER" ? "nuptk" : "nisn"]: strIdentity,
        email: email ? String(email).trim() : null,
        password: hashedPassword,
        role: role,
        schoolId: schoolId
      });
    }

    if (usersToInsert.length === 0) {
      return { error: "Tidak ada data valid yang bisa diimport. Pastikan kolom Nama dan NUPTK/NISN terisi dengan benar." };
    }

    // 5. Bulk Insert
    const result = await prisma.user.createMany({
      data: usersToInsert,
      skipDuplicates: true
    });

    revalidatePath(role === "TEACHER" ? "/admin/master/teachers" : "/admin/master/students");
    
    return { 
      success: true, 
      count: result.count
    };
  } catch (error: any) {
    console.error("Import Error:", error);
    return { error: "Terjadi kesalahan sistem saat memproses file." };
  }
}
