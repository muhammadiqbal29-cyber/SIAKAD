"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function createAcademicYear(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak. Anda tidak memiliki izin." };
  }

  const year = formData.get("year") as string;
  const semester = parseInt(formData.get("semester") as string);
  const isActive = formData.get("isActive") === "on";

  if (!year || !semester) {
    return { error: "Kolom Tahun Ajaran dan Semester wajib diisi." };
  }

  try {
    if (isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    await prisma.academicYear.create({
      data: {
        year,
        semester,
        isActive,
      }
    });

    revalidatePath("/admin/master/academic-years");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal menyimpan data tahun ajaran. Silakan coba lagi." };
  }
}

export async function updateAcademicYear(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const year = formData.get("year") as string;
  const semester = parseInt(formData.get("semester") as string);
  const isActive = formData.get("isActive") === "on";

  if (!year || !semester) {
    return { error: "Kolom wajib diisi." };
  }

  try {
    if (isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true, id: { not: id } },
        data: { isActive: false }
      });
    }

    await prisma.academicYear.update({
      where: { id },
      data: {
        year,
        semester,
        isActive,
      }
    });

    revalidatePath("/admin/master/academic-years");
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengupdate data." };
  }
}

export async function deleteAcademicYear(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.academicYear.delete({
      where: { id }
    });
    revalidatePath("/admin/master/academic-years");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus data. Mungkin data ini sedang terhubung dengan tabel lain." };
  }
}
