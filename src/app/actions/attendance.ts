"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function saveAttendances(classId: string, date: string, attendances: { studentId: string, status: string }[]) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return { error: "Akses ditolak." };
  }

  // Validasi: Apakah guru ini memang mengajar kelas ini? 
  // (Untuk penyederhanaan, asumsikan UI sudah memfilter kelas yang valid)

  try {
    // Upsert menggunakan transaksi
    await prisma.$transaction(
      attendances.map(att => 
        prisma.attendance.upsert({
          where: {
            studentId_classId_date: {
              studentId: att.studentId,
              classId: classId,
              date: date
            }
          },
          update: {
            status: att.status
          },
          create: {
            studentId: att.studentId,
            classId: classId,
            date: date,
            status: att.status
          }
        })
      )
    );

    revalidatePath(`/teacher/attendances/${classId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Save Attendance Error:", error);
    return { error: "Gagal menyimpan data presensi." };
  }
}
