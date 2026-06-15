"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function createSubject(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  
  let schoolId = session.user.schoolId;
  if (!schoolId && session.user.role === "SUPERADMIN") {
    const firstSchool = await prisma.school.findFirst();
    schoolId = firstSchool?.id || null;
  }

  if (!name || !schoolId) {
    return { error: "Nama mata pelajaran wajib diisi." };
  }

  try {
    await prisma.subject.create({
      data: {
        name,
        code: code || null,
        schoolId,
      }
    });

    revalidatePath("/admin/master/subjects");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal menyimpan mata pelajaran." };
  }
}

export async function updateSubject(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;

  if (!name) {
    return { error: "Nama wajib diisi." };
  }

  try {
    await prisma.subject.update({
      where: { id },
      data: {
        name,
        code: code || null,
      }
    });

    revalidatePath("/admin/master/subjects");
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengupdate mata pelajaran." };
  }
}

export async function deleteSubject(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized" };
  }

  try {
    // Cek relasi ke jadwal
    const schedulesCount = await prisma.schedule.count({ where: { subjectId: id } });
    if (schedulesCount > 0) {
      return { error: "Gagal menghapus: Mata pelajaran ini sedang digunakan dalam jadwal kelas." };
    }

    await prisma.subject.delete({
      where: { id }
    });
    revalidatePath("/admin/master/subjects");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus mata pelajaran." };
  }
}
