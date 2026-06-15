"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function registerProspectiveStudent(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const previousSchool = formData.get("previousSchool") as string;

  if (!name || !phone) {
    return { error: "Nama dan Nomor HP wajib diisi." };
  }

  try {
    await prisma.prospectiveStudent.create({
      data: {
        name,
        email,
        phone,
        previousSchool
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("PPDB Error:", error);
    return { error: "Gagal mengirim formulir pendaftaran. Silakan coba lagi." };
  }
}

export async function updateProspectiveStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  try {
    await prisma.prospectiveStudent.update({
      where: { id },
      data: { status }
    });

    revalidatePath("/admin/ppdb");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal memperbarui status prospek." };
  }
}
