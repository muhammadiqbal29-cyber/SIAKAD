import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function TeacherScoresPage() {
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

  // Cari semua jadwal unik di mana guru ini mengajar
  // Karena jadwal bisa berulang per hari (misal MTK kelas X hari Senin dan Rabu),
  // kita cukup ambil list kombinasi kelas & mapel yang unik
  const schedules = await prisma.schedule.findMany({
    where: {
      teacherId: session.user.id,
      class: { academicYearId: activeYear.id }
    },
    include: {
      class: true,
      subject: true
    }
  });

  // Buat array unik (ClassId + SubjectId)
  const uniqueCombos = [];
  const map = new Set();
  
  for (const s of schedules) {
    const key = `${s.classId}-${s.subjectId}`;
    if (!map.has(key)) {
      map.add(key);
      uniqueCombos.push({
        classId: s.classId,
        className: s.class.name,
        gradeLevel: s.class.gradeLevel,
        subjectId: s.subjectId,
        subjectName: s.subject.name
      });
    }
  }

  uniqueCombos.sort((a, b) => a.gradeLevel - b.gradeLevel || a.className.localeCompare(b.className));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">E-Rapor & Nilai</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Pilih kelas dan mata pelajaran untuk menginput nilai formatif</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {uniqueCombos.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-medium bg-white rounded-xl border border-slate-200 shadow-sm">
            Anda belum ditugaskan mengajar mata pelajaran apa pun di jadwal kelas.
          </div>
        ) : (
          uniqueCombos.map((combo) => (
            <Link key={`${combo.classId}-${combo.subjectId}`} href={`/teacher/scores/${combo.classId}/${combo.subjectId}`}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                      Tingkat {combo.gradeLevel}
                    </div>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-1 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2 text-slate-400" /> {combo.subjectName}
                  </h3>
                  <p className="text-sm font-bold text-slate-500">Kelas {combo.className}</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-extrabold text-blue-600 group-hover:text-blue-700 bg-blue-50/50 p-2 rounded-lg justify-center transition-colors">
                  Input Nilai <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
