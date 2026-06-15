import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { notFound } from "next/navigation";
import { ClientAttendanceForm } from "./client-attendance-form";

export const dynamic = 'force-dynamic';

export default async function ClassAttendancePage(props: { 
  params: Promise<{ classId: string }>,
  searchParams: Promise<{ date?: string }>
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const classData = await prisma.class.findUnique({
    where: { id: params.classId },
    include: {
      enrollments: {
        include: { student: true },
        orderBy: { student: { name: 'asc' } }
      }
    }
  });

  if (!classData) notFound();

  // Tentukan tanggal aktif
  const todayStr = new Date().toISOString().split('T')[0];
  const activeDate = searchParams.date || todayStr;

  // Ambil data presensi yang sudah ada pada tanggal tersebut
  const attendances = await prisma.attendance.findMany({
    where: {
      classId: params.classId,
      date: activeDate
    }
  });

  // Map data ke format yang mudah digunakan oleh client component
  const students = classData.enrollments.map(e => {
    const existing = attendances.find(a => a.studentId === e.studentId);
    return {
      id: e.student.id,
      name: e.student.name,
      nisn: e.student.nisn,
      status: existing ? existing.status : "PRESENT" // Default hadir
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/teacher/attendances" className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-800 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kelas
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Presensi {classData.name}
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Catat kehadiran siswa untuk hari tertentu</p>
          </div>
          
          <form className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center px-3 text-slate-500 font-bold">
              <Calendar className="w-5 h-5 mr-2" />
              Tanggal:
            </div>
            <input 
              type="date" 
              name="date"
              defaultValue={activeDate}
              className="h-10 px-3 rounded-lg border-slate-200 bg-slate-50 focus:ring-emerald-500 focus:border-emerald-500 font-bold text-slate-700"
            />
            <button type="submit" className="h-10 px-4 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors">
              Pilih
            </button>
          </form>
        </div>
      </div>

      <ClientAttendanceForm 
        classId={classData.id} 
        date={activeDate} 
        initialStudents={students} 
      />
    </div>
  );
}
