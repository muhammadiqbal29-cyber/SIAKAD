"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// --- MANAJEMEN KELAS ---

export async function createClass(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const name = formData.get("name") as string;
  const gradeLevel = parseInt(formData.get("gradeLevel") as string);
  const homeroomId = formData.get("homeroomId") as string || null;
  const academicYearId = formData.get("academicYearId") as string;
  
  let schoolId = session.user.schoolId;
  if (!schoolId && session.user.role === "SUPERADMIN") {
    const firstSchool = await prisma.school.findFirst();
    schoolId = firstSchool?.id || null;
  }

  if (!name || !gradeLevel || !academicYearId || !schoolId) {
    return { error: "Data kelas tidak lengkap." };
  }

  try {
    await prisma.class.create({
      data: {
        name,
        gradeLevel,
        homeroomId,
        academicYearId,
        schoolId,
      }
    });

    revalidatePath("/admin/master/classes");
    return { success: true };
  } catch (error: any) {
    return { error: "Gagal membuat kelas." };
  }
}

export async function updateClass(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const name = formData.get("name") as string;
  const gradeLevel = parseInt(formData.get("gradeLevel") as string);
  const homeroomId = formData.get("homeroomId") as string || null;

  if (!name || !gradeLevel) {
    return { error: "Data tidak lengkap." };
  }

  try {
    await prisma.class.update({
      where: { id },
      data: {
        name,
        gradeLevel,
        homeroomId,
      }
    });

    revalidatePath("/admin/master/classes");
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengupdate kelas." };
  }
}

export async function deleteClass(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  try {
    // Prisma akan menolak jika ada siswa di dalam kelas karena `restrict`.
    // Atau kita bisa menggunakan transaction untuk menghapus semua enrollment dulu.
    // Tapi untuk keamanan, kita tolak jika masih ada isinya.
    const enrollmentsCount = await prisma.enrollment.count({ where: { classId: id } });
    if (enrollmentsCount > 0) {
      return { error: "Kosongkan daftar siswa di kelas ini terlebih dahulu sebelum menghapus." };
    }

    await prisma.class.delete({
      where: { id }
    });
    
    revalidatePath("/admin/master/classes");
    return { success: true };
  } catch (error) {
    return { error: "Gagal menghapus kelas." };
  }
}

// --- MANAJEMEN SISWA DI DALAM KELAS (ENROLLMENTS) ---

export async function addStudentsToClass(classId: string, studentIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  try {
    const data = studentIds.map(studentId => ({
      classId,
      studentId
    }));

    // Masukkan data sekaligus (Bulk Insert)
    await prisma.enrollment.createMany({
      data,
      skipDuplicates: true, // Abaikan jika sudah ada
    });

    revalidatePath(`/admin/master/classes/${classId}`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal memasukkan siswa ke kelas." };
  }
}

export async function removeStudentFromClass(enrollmentId: string, classId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  try {
    await prisma.enrollment.delete({
      where: { id: enrollmentId }
    });

    revalidatePath(`/admin/master/classes/${classId}`);
    return { success: true };
  } catch (error) {
    return { error: "Gagal mengeluarkan siswa." };
  }
}
