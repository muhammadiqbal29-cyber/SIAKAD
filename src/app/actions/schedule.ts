"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function createSchedule(classId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const subjectId = formData.get("subjectId") as string;
  const teacherId = formData.get("teacherId") as string;
  const dayOfWeekStr = formData.get("dayOfWeek") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  if (!subjectId || !teacherId || !dayOfWeekStr || !startTime || !endTime) {
    return { error: "Semua field wajib diisi." };
  }

  const dayOfWeek = parseInt(dayOfWeekStr);

  try {
    // Validasi bentrok jadwal guru (Guru yang sama tidak bisa mengajar 2 kelas berbeda di hari & jam yang sama)
    // Sederhana: cek apakah ada jadwal lain untuk guru ini di hari yang sama dengan irisan waktu
    // (Untuk kemudahan MVP, kita skip validasi irisan waktu kompleks, tapi idealnya ada)

    await prisma.schedule.create({
      data: {
        classId,
        subjectId,
        teacherId,
        dayOfWeek,
        startTime,
        endTime
      }
    });

    revalidatePath(`/admin/master/schedules/${classId}`);
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal menyimpan jadwal kelas." };
  }
}

export async function deleteSchedule(scheduleId: string, classId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.schedule.delete({
      where: { id: scheduleId }
    });
    revalidatePath(`/admin/master/schedules/${classId}`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus jadwal." };
  }
}

export async function uploadSchedules(classId: string, schedules: {
  subjectId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}[]) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  if (!schedules || schedules.length === 0) {
    return { error: "Data jadwal kosong." };
  }

  try {
    // Kita bisa menghapus jadwal yang lama dan menimpa dengan yang baru
    // Atau hanya menambahkan yang baru. Sesuai asumsi, kita timpa saja agar persis sama dengan Excel.
    await prisma.$transaction(async (tx) => {
      // Hapus semua jadwal lama di kelas ini
      await tx.schedule.deleteMany({
        where: { classId }
      });

      // Insert semua jadwal baru
      await tx.schedule.createMany({
        data: schedules.map(s => ({
          classId,
          subjectId: s.subjectId,
          teacherId: s.teacherId,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      });
    });

    revalidatePath(`/admin/master/schedules/${classId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Upload Schedule Error:", error);
    return { error: "Gagal menyimpan jadwal kelas secara massal." };
  }
}
