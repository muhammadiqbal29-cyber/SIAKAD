"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function createTeacher(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak. Anda tidak memiliki izin." };
  }

  const name = formData.get("name") as string;
  const nuptk = formData.get("nuptk") as string;
  const email = formData.get("email") as string;
  
  // Jika superadmin, idealnya bisa milih schoolId, tapi untuk sementara pakai punya session (null jika superadmin global, tapi kita asumsikan pakai default school sementara atau form pilih sekolah)
  // Untuk MVP, kita gunakan schoolId pertama yang ada jika dia superadmin
  let schoolId = session.user.schoolId;
  
  if (!schoolId && session.user.role === "SUPERADMIN") {
    const firstSchool = await prisma.school.findFirst();
    schoolId = firstSchool?.id || null;
  }

  if (!name || !nuptk) {
    return { error: "Nama dan NUPTK wajib diisi." };
  }

  try {
    // Cek duplikasi NUPTK
    const existingUser = await prisma.user.findUnique({
      where: { nuptk }
    });

    if (existingUser) {
      return { error: "NUPTK sudah terdaftar di sistem." };
    }

    // Password default adalah NUPTK itu sendiri
    const hashedPassword = await bcrypt.hash(nuptk, 10);

    await prisma.user.create({
      data: {
        name,
        nuptk,
        email: email || null,
        password: hashedPassword,
        role: "TEACHER",
        schoolId: schoolId,
      }
    });

    revalidatePath("/admin/master/teachers");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal menyimpan data guru. Pastikan email belum terpakai." };
  }
}

export async function updateTeacher(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const name = formData.get("name") as string;
  const nuptk = formData.get("nuptk") as string;
  const email = formData.get("email") as string;

  if (!name || !nuptk) {
    return { error: "Nama dan NUPTK wajib diisi." };
  }

  try {
    // Cek duplikasi jika NUPTK diubah
    const existingUser = await prisma.user.findUnique({ where: { nuptk } });
    if (existingUser && existingUser.id !== id) {
      return { error: "NUPTK sudah digunakan oleh guru lain." };
    }

    await prisma.user.update({
      where: { id },
      data: {
        name,
        nuptk,
        email: email || null,
      }
    });

    revalidatePath("/admin/master/teachers");
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengupdate data guru." };
  }
}

export async function deleteTeacher(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.user.delete({
      where: { id }
    });
    revalidatePath("/admin/master/teachers");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus data. Guru ini mungkin sedang memiliki kelas yang diajar." };
  }
}
