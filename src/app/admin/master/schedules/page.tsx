import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SchedulesPage() {
  const activeYear = await prisma.academicYear.findFirst({
    where: { isActive: true }
  });

  if (!activeYear) {
    return (
      <div className="p-6 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
        Belum ada Tahun Ajaran yang aktif. Silakan aktifkan di menu Tahun Ajaran.
      </div>
    );
  }

  const classes = await prisma.class.findMany({
    where: { academicYearId: activeYear.id },
    orderBy: [{ gradeLevel: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { schedules: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Jadwal Pelajaran</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Pilih kelas untuk mengatur jadwal mingguan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
            Belum ada kelas di Tahun Ajaran ini.
          </div>
        ) : (
          classes.map((cls) => (
            <Link key={cls.id} href={`/admin/master/schedules/${cls.id}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                      Tingkat {cls.gradeLevel}
                    </div>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">{cls.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    {cls._count.schedules > 0 ? (
                      <span className="text-emerald-600 font-bold">{cls._count.schedules} Sesi Terjadwal</span>
                    ) : (
                      <span className="text-amber-600 font-bold">Belum ada jadwal</span>
                    )}
                  </p>
                </div>
                <div className="mt-5 flex items-center text-sm font-bold text-indigo-600 group-hover:text-indigo-700">
                  Kelola Jadwal <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
