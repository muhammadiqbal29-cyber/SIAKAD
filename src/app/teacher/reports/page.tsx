import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, ChevronRight, Printer } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function TeacherReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") redirect("/login");

  const activeYear = await prisma.academicYear.findFirst({
    where: { isActive: true }
  });

  if (!activeYear) {
    return (
      <div className="p-6 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 font-medium">
        Belum ada Tahun Ajaran yang aktif.
      </div>
    );
  }

  // Hanya wali kelas yang bisa mencetak rapor
  const classes = await prisma.class.findMany({
    where: {
      academicYearId: activeYear.id,
      homeroomId: session.user.id
    },
    orderBy: [{ gradeLevel: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { enrollments: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Cetak E-Rapor</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Pilih kelas perwalian Anda untuk mencetak Rapor Siswa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-medium bg-white rounded-xl border border-slate-200 shadow-sm">
            Anda belum ditugaskan sebagai Wali Kelas di tahun ajaran ini. Fasilitas Cetak Rapor hanya untuk wali kelas.
          </div>
        ) : (
          classes.map((cls) => (
            <Link key={cls.id} href={`/teacher/reports/${cls.id}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:border-emerald-400 hover:shadow-md transition-all group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Printer className="w-6 h-6" />
                    </div>
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-extrabold border border-emerald-200 shadow-sm">
                      Wali Kelas
                    </div>
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-800 mb-1">{cls.name}</h3>
                  <p className="text-sm font-bold text-slate-500">Tingkat {cls.gradeLevel} • {cls._count.enrollments} Siswa</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-extrabold text-slate-700 group-hover:text-slate-900 bg-slate-100 p-2 rounded-lg justify-center transition-colors">
                  Daftar Siswa <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
