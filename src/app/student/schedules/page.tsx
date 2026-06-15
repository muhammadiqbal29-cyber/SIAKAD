import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function StudentSchedulesPage() {
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

  const schedules = await prisma.schedule.findMany({
    where: { classId: currentClass.id },
    include: { subject: true, teacher: true },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
  });

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const grouped = days.map((day, idx) => ({
    day,
    schedules: schedules.filter(s => s.dayOfWeek === idx + 1)
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Jadwal Kelas: {currentClass.name}</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Jadwal pelajaran mingguan kamu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {grouped.map((group) => (
          <div key={group.day} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center">
              <CalendarDays className="w-5 h-5 text-indigo-500 mr-2" />
              <h3 className="font-bold text-slate-800">{group.day}</h3>
            </div>
            <div className="p-0">
              {group.schedules.length === 0 ? (
                <div className="p-6 text-center text-sm font-medium text-slate-400">Libur / Kosong</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {group.schedules.map(sch => (
                    <li key={sch.id} className="p-4 hover:bg-indigo-50/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-extrabold text-slate-800">{sch.subject.name}</div>
                          <div className="text-xs font-medium text-slate-500 mt-1">Guru: {sch.teacher.name}</div>
                        </div>
                        <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                          {sch.startTime} - {sch.endTime}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
