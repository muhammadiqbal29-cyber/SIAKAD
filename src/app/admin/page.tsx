import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardCharts } from "./dashboard-charts";
import { Building2, GraduationCap, Users, Banknote } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // 1. Data Summary
  const totalSchools = await prisma.school.count();
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  const totalTeachers = await prisma.user.count({ where: { role: "TEACHER" } });
  
  // Hitung total pemasukan riil (Invoice lunas bulan ini atau total lunas)
  const paidInvoices = await prisma.invoice.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true }
  });
  const totalIncome = paidInvoices._sum.amount || 0;

  // 2. Finance Data (Pie Chart)
  const financeGroups = await prisma.invoice.groupBy({
    by: ['status'],
    _sum: { amount: true }
  });
  
  const financeData = [
    { name: 'Lunas', value: financeGroups.find(g => g.status === 'PAID')?._sum.amount || 0 },
    { name: 'Sebagian', value: financeGroups.find(g => g.status === 'PARTIAL')?._sum.amount || 0 },
    { name: 'Menunggak', value: financeGroups.find(g => g.status === 'UNPAID')?._sum.amount || 0 },
  ].filter(d => d.value > 0); // Hide empty slices

  // Jika belum ada invoice sama sekali, beri data dummy
  const finalFinanceData = financeData.length > 0 ? financeData : [{ name: 'Belum Ada Data', value: 1 }];

  // 3. Academic Data (Grouped Bar Chart YoY)
  // Ambil 2 tahun ajaran terakhir yang diurutkan dari yang terbaru
  const years = await prisma.academicYear.findMany({
    orderBy: { createdAt: 'desc' },
    take: 2
  });

  const thisYear = years[0];
  const lastYear = years[1];

  let academicData: any[] = [];
  const subjects = await prisma.subject.findMany();

  if (thisYear && lastYear) {
    const classesThisYear = await prisma.class.findMany({ where: { academicYearId: thisYear.id } });
    const classesLastYear = await prisma.class.findMany({ where: { academicYearId: lastYear.id } });

    const classesThisYearIds = classesThisYear.map(c => c.id);
    const classesLastYearIds = classesLastYear.map(c => c.id);

    const scoresThisYear = await prisma.academicScore.groupBy({
      by: ['subjectId'],
      where: { classId: { in: classesThisYearIds } },
      _avg: { score: true }
    });

    const scoresLastYear = await prisma.academicScore.groupBy({
      by: ['subjectId'],
      where: { classId: { in: classesLastYearIds } },
      _avg: { score: true }
    });

    academicData = subjects.map(sub => {
      const gThis = scoresThisYear.find(g => g.subjectId === sub.id);
      const gLast = scoresLastYear.find(g => g.subjectId === sub.id);
      return {
        subject: sub.name.length > 15 ? sub.name.substring(0, 15) + "..." : sub.name,
        thisYear: gThis?._avg.score ? Number(gThis._avg.score.toFixed(1)) : 0,
        lastYear: gLast?._avg.score ? Number(gLast._avg.score.toFixed(1)) : 0
      };
    }).sort((a, b) => b.thisYear - a.thisYear).slice(0, 7);

  } else {
    // Fallback jika belum ada 2 tahun ajaran
    const academicGroups = await prisma.academicScore.groupBy({
      by: ['subjectId'],
      _avg: { score: true }
    });
    academicData = subjects.map(sub => {
      const group = academicGroups.find(g => g.subjectId === sub.id);
      return {
        subject: sub.name.length > 15 ? sub.name.substring(0, 15) + "..." : sub.name,
        thisYear: group?._avg.score ? Number(group._avg.score.toFixed(1)) : 0,
        lastYear: 0
      };
    }).sort((a, b) => b.thisYear - a.thisYear).slice(0, 7);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Executive Dashboard</h2>
        <p className="text-slate-500 mt-2 font-medium">Ringkasan analitik dan performa yayasan secara real-time. Selamat datang, {session?.user.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 relative z-10">
            <Banknote className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <div className="text-slate-500 text-sm font-bold mb-1">Total Pemasukan</div>
            <div className="text-2xl font-black text-slate-800">Rp {(totalIncome / 1000000).toFixed(1)}Jt</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 relative z-10">
            <Users className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <div className="text-slate-500 text-sm font-bold mb-1">Siswa Terdaftar</div>
            <div className="text-2xl font-black text-slate-800">{totalStudents}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-amber-300 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 relative z-10">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <div className="text-slate-500 text-sm font-bold mb-1">Tenaga Pendidik</div>
            <div className="text-2xl font-black text-slate-800">{totalTeachers}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 relative z-10">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="relative z-10">
            <div className="text-slate-500 text-sm font-bold mb-1">Unit/Sekolah</div>
            <div className="text-2xl font-black text-slate-800">{totalSchools}</div>
          </div>
        </div>
      </div>
      
      {/* Visualisasi Data dengan Recharts */}
      <DashboardCharts financeData={finalFinanceData} academicData={academicData} />
      
    </div>
  );
}
