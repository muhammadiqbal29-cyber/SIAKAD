import { prisma } from "@/lib/prisma";
import { AddScheduleButton } from "./add-button";
import { DeleteScheduleButton } from "./delete-button";
import { ExcelScheduleButton } from "./excel-schedule-button";
import Link from "next/link";
import { ArrowLeft, Clock, UserCircle2, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ClassSchedulePage(props: { params: Promise<{ classId: string }> }) {
  const params = await props.params;
  const classData = await prisma.class.findUnique({
    where: { id: params.classId },
    include: {
      schedules: {
        include: {
          subject: true,
          teacher: true
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
      }
    }
  });

  if (!classData) notFound();

  const subjects = await prisma.subject.findMany({
    where: { schoolId: classData.schoolId },
    orderBy: { name: 'asc' }
  });

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER", schoolId: classData.schoolId },
    orderBy: { name: 'asc' }
  });

  const daysMap = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  
  // Group by day
  const schedulesByDay = classData.schedules.reduce((acc, curr) => {
    if (!acc[curr.dayOfWeek]) acc[curr.dayOfWeek] = [];
    acc[curr.dayOfWeek].push(curr);
    return acc;
  }, {} as Record<number, typeof classData.schedules>);

  // Pastikan hari 1-6 ada, walaupun kosong
  const displayDays = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/admin/master/schedules" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kelas
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Jadwal Kelas {classData.name} <span className="text-slate-400 text-2xl font-medium">(Tingkat {classData.gradeLevel})</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Atur jam pelajaran dan guru pengajar dari Senin hingga Sabtu</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExcelScheduleButton 
              classId={classData.id}
              subjects={subjects.map(s => ({id: s.id, name: s.name}))} 
              teachers={teachers.map(t => ({id: t.id, name: t.name}))} 
            />
            <AddScheduleButton 
              classId={classData.id} 
              subjects={subjects.map(s => ({id: s.id, name: s.name}))} 
              teachers={teachers.map(t => ({id: t.id, name: t.name}))} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayDays.map(dayNum => {
          const daySchedules = schedulesByDay[dayNum] || [];
          return (
            <div key={dayNum} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-700 text-lg">{daysMap[dayNum]}</h3>
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{daySchedules.length} Sesi</span>
              </div>
              
              <div className="p-4 flex-1 flex flex-col gap-3">
                {daySchedules.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-sm text-slate-400 font-medium italic py-8 border-2 border-dashed border-slate-100 rounded-xl">
                    Libur / Kosong
                  </div>
                ) : (
                  daySchedules.map(sched => (
                    <div key={sched.id} className="relative bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl hover:shadow-md hover:border-indigo-300 transition-all group">
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DeleteScheduleButton scheduleId={sched.id} classId={classData.id} />
                      </div>
                      
                      <div className="flex items-center text-indigo-600 font-extrabold text-sm mb-2 bg-white w-fit px-2 py-0.5 rounded border border-indigo-100">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {sched.startTime} - {sched.endTime}
                      </div>
                      
                      <div className="font-bold text-slate-800 text-base mb-1 flex items-start">
                        <BookOpen className="w-4 h-4 mr-1.5 mt-0.5 text-indigo-400" />
                        {sched.subject.name}
                      </div>
                      
                      <div className="text-sm font-medium text-slate-500 flex items-center">
                        <UserCircle2 className="w-4 h-4 mr-1.5 text-slate-400" />
                        {sched.teacher.name}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
