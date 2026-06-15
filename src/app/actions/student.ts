"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function createStudent(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak. Anda tidak memiliki izin." };
  }

  const name = formData.get("name") as string;
  const nisn = formData.get("nisn") as string;
  const email = formData.get("email") as string;
  
  let schoolId = session.user.schoolId;
  
  if (!schoolId && session.user.role === "SUPERADMIN") {
    const firstSchool = await prisma.school.findFirst();
    schoolId = firstSchool?.id || null;
  }

  if (!name || !nisn) {
    return { error: "Nama dan NISN wajib diisi." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { nisn }
    });

    if (existingUser) {
      return { error: "NISN sudah terdaftar di sistem." };
    }

    const hashedPassword = await bcrypt.hash(nisn, 10);

    await prisma.user.create({
      data: {
        name,
        nisn,
        email: email || null,
        password: hashedPassword,
        role: "STUDENT",
        schoolId: schoolId,
      }
    });

    revalidatePath("/admin/master/students");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal menyimpan data siswa. Pastikan email belum terpakai." };
  }
}

export async function updateStudent(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const name = formData.get("name") as string;
  const nisn = formData.get("nisn") as string;
  const email = formData.get("email") as string;

  if (!name || !nisn) {
    return { error: "Nama dan NISN wajib diisi." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { nisn } });
    if (existingUser && existingUser.id !== id) {
      return { error: "NISN sudah digunakan oleh siswa lain." };
    }

    await prisma.user.update({
      where: { id },
      data: {
        name,
        nisn,
        email: email || null,
      }
    });

    revalidatePath("/admin/master/students");
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengupdate data siswa." };
  }
}

export async function deleteStudent(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.user.delete({
      where: { id }
    });
    revalidatePath("/admin/master/students");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus data. Siswa ini mungkin memiliki nilai atau tagihan." };
  }
}
