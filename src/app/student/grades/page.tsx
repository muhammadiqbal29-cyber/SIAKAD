import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, Star, AlertTriangle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function StudentGradesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      enrollments: {
        where: { class: { academicYear: { isActive: true } } },
        include: { class: true },
        take: 1
      }
    }
  });

  const currentClass = student?.enrollments[0]?.class;

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="text-slate-500 font-medium">Kamu belum didaftarkan ke kelas mana pun.</div>
      </div>
    );
  }

  // Intrakurikuler (Sumatif & Formatif)
  const academicScores = await prisma.academicScore.findMany({
    where: { studentId: session.user.id, classId: currentClass.id },
    include: { subject: true }
  });

  const subjectScores: Record<string, { name: string; total: number; count: number; avg: number }> = {};
  for (const s of academicScores) {
    if (!subjectScores[s.subjectId]) {
      subjectScores[s.subjectId] = { name: s.subject.name, total: 0, count: 0, avg: 0 };
    }
    subjectScores[s.subjectId].total += s.score;
    subjectScores[s.subjectId].count += 1;
  }
  
  const subjects = Object.values(subjectScores).map(s => ({
    name: s.name,
    avg: Math.round(s.total / s.count)
  })).sort((a, b) => a.name.localeCompare(b.name));

  // P5
  const p5Scores = await prisma.p5Score.findMany({
    where: { studentId: session.user.id, classId: currentClass.id }
  });

  const p5Projects: Record<string, any[]> = {};
  for (const p of p5Scores) {
    if (!p5Projects[p.projectName]) p5Projects[p.projectName] = [];
    p5Projects[p.projectName].push(p);
  }

  // Absensi
  const attendances = await prisma.attendance.findMany({
    where: { studentId: session.user.id, classId: currentClass.id }
  });

  const attStats = { sakit: 0, izin: 0, alpa: 0 };
  for (const a of attendances) {
    if (a.status === "SICK") attStats.sakit++;
    if (a.status === "EXCUSED") attStats.izin++;
    if (a.status === "ABSENT") attStats.alpa++;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Rapor & Presensi</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Pantau terus perkembangan akademikmu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Akademik */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center">
              <BookOpen className="w-5 h-5 text-emerald-600 mr-2" />
              <h3 className="font-bold text-slate-800">Nilai Intrakurikuler (Rata-rata)</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-sm">
                <tr>
                  <th className="p-4 font-bold text-slate-500">Mata Pelajaran</th>
                  <th className="p-4 font-bold text-slate-500 text-center w-24">Nilai</th>
                  <th className="p-4 font-bold text-slate-500 w-32">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada nilai.</td></tr>
                ) : (
                  subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td className="p-4 font-bold text-slate-800">{sub.name}</td>
                      <td className="p-4 text-center font-black text-lg text-emerald-600">{sub.avg}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${sub.avg >= 85 ? 'bg-emerald-100 text-emerald-800' : sub.avg >= 75 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                          {sub.avg >= 85 ? 'Sangat Baik' : sub.avg >= 75 ? 'Baik' : 'Kurang'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center">
              <Star className="w-5 h-5 text-amber-500 mr-2" />
              <h3 className="font-bold text-slate-800">Projek P5</h3>
            </div>
            <div className="p-5 space-y-6">
              {Object.keys(p5Projects).length === 0 ? (
                <div className="text-center text-slate-500">Belum ada nilai P5.</div>
              ) : (
                Object.keys(p5Projects).map((proj, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-amber-50 p-3 font-bold text-amber-900 border-b border-slate-200">{proj}</div>
                    <ul className="divide-y divide-slate-100">
                      {p5Projects[proj].map((s, sidx) => (
                        <li key={sidx} className="p-3 flex justify-between items-center bg-white">
                          <span className="text-sm font-medium text-slate-700">{s.dimension}</span>
                          <span className="text-xs font-black px-2 py-1 bg-amber-100 text-amber-800 rounded">{s.score}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Presensi */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="font-bold text-slate-800">Rekap Ketidakhadiran</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                <span className="font-bold text-orange-800">Sakit</span>
                <span className="text-xl font-black text-orange-600">{attStats.sakit} <span className="text-sm font-medium">Hari</span></span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                <span className="font-bold text-blue-800">Izin</span>
                <span className="text-xl font-black text-blue-600">{attStats.izin} <span className="text-sm font-medium">Hari</span></span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
                <span className="font-bold text-red-800">Tanpa Keterangan</span>
                <span className="text-xl font-black text-red-600">{attStats.alpa} <span className="text-sm font-medium">Hari</span></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
