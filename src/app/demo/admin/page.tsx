import { DashboardCharts } from "@/app/admin/dashboard-charts";
import { Building2, GraduationCap, Users, Banknote } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function DemoAdminDashboardPage() {
  const sessionName = "Admin Budi";

  // 1. Data Summary Mock
  const totalSchools = 4;
  const totalStudents = 1250;
  const totalTeachers = 85;
  const totalIncome = 450000000;

  // 2. Finance Data (Pie Chart) Mock
  const finalFinanceData = [
    { name: 'Lunas', value: 450000000 },
    { name: 'Sebagian', value: 25000000 },
    { name: 'Menunggak', value: 12000000 },
  ];

  // 3. Academic Data (Grouped Bar Chart YoY) Mock
  const academicData = [
    { subject: 'Matematika', thisYear: 88.5, lastYear: 82.0 },
    { subject: 'B. Inggris', thisYear: 90.2, lastYear: 85.5 },
    { subject: 'Fisika', thisYear: 85.0, lastYear: 78.5 },
    { subject: 'Biologi', thisYear: 89.4, lastYear: 86.0 },
    { subject: 'Kimia', thisYear: 84.5, lastYear: 80.2 },
    { subject: 'B. Indonesia', thisYear: 92.0, lastYear: 89.5 },
    { subject: 'Sejarah', thisYear: 87.5, lastYear: 84.0 },
  ];

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Executive Dashboard</h2>
        <p className="text-slate-500 mt-2 font-medium">Ringkasan analitik dan performa yayasan secara real-time. Selamat datang, {sessionName}</p>
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
