"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function generateBulkInvoices(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  const title = formData.get("title") as string;
  const amountStr = formData.get("amount") as string;
  const type = formData.get("type") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const targetClassId = formData.get("classId") as string; // "ALL" atau classId
  const notes = formData.get("notes") as string;

  if (!title || !amountStr || !type) {
    return { error: "Judul, Nominal, dan Tipe wajib diisi." };
  }

  const amount = parseFloat(amountStr);
  const dueDate = dueDateStr ? new Date(dueDateStr) : null;

  try {
    let studentIds: string[] = [];

    if (targetClassId === "ALL") {
      const activeStudents = await prisma.user.findMany({
        where: { role: "STUDENT", schoolId: session.user.schoolId || undefined },
        select: { id: true }
      });
      studentIds = activeStudents.map(s => s.id);
    } else {
      const enrollments = await prisma.enrollment.findMany({
        where: { classId: targetClassId },
        select: { studentId: true }
      });
      studentIds = enrollments.map(e => e.studentId);
    }

    if (studentIds.length === 0) {
      return { error: "Tidak ada siswa ditemukan di target yang dipilih." };
    }

    const invoicesData = studentIds.map(studentId => ({
      studentId,
      title,
      amount,
      type,
      status: "UNPAID",
      dueDate,
      notes: notes || null
    }));

    await prisma.invoice.createMany({
      data: invoicesData
    });

    revalidatePath("/admin/finance/invoices");
    return { success: true, count: invoicesData.length };
  } catch (error: any) {
    console.error("Bulk Invoice Error:", error);
    return { error: "Gagal membuat tagihan massal." };
  }
}

export async function payInvoice(invoiceId: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return { error: "Akses ditolak." };
  }

  try {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAt: new Date()
      }
    });

    revalidatePath("/admin/finance/cashier");
    return { success: true };
  } catch (error) {
    return { error: "Gagal memproses pembayaran." };
  }
}
