import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";
import { notFound } from "next/navigation";
import { ClientScoreForm } from "./client-score-form";

export const dynamic = 'force-dynamic';

export default async function ScoreEditorPage(props: {
  params: Promise<{ classId: string; subjectId: string }>,
  searchParams: Promise<{ topic?: string, type?: string }>
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

  const subjectData = await prisma.subject.findUnique({
    where: { id: params.subjectId }
  });

  if (!classData || !subjectData) notFound();

  // Ambil semua TP yang pernah diinput untuk kombinasi kelas & mapel ini
  const existingScores = await prisma.academicScore.findMany({
    where: {
      classId: params.classId,
      subjectId: params.subjectId
    },
    distinct: ['topicName'],
    select: { topicName: true }
  });

  const availableTPs = existingScores.map(s => s.topicName);
  
  // TP aktif dari URL atau default
  const activeTopic = searchParams.topic || "";
  const activeType = searchParams.type || "FORMATIVE";

  // Ambil nilai untuk TP yang aktif
  let currentScores: any[] = [];
  if (activeTopic) {
    currentScores = await prisma.academicScore.findMany({
      where: {
        classId: params.classId,
        subjectId: params.subjectId,
        topicName: activeTopic,
        type: activeType
      }
    });
  }

  // Siapkan data siswa untuk form
  const students = classData.enrollments.map(e => {
    const scoreRow = currentScores.find(s => s.studentId === e.studentId);
    return {
      id: e.student.id,
      name: e.student.name,
      nisn: e.student.nisn,
      score: scoreRow ? scoreRow.score : 0
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/teacher/scores" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kelas
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
              Nilai {subjectData.name} 
              <span className="text-slate-400 text-2xl font-medium ml-2">({classData.name})</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Input nilai capaian formatif / Tujuan Pembelajaran</p>
          </div>
          
          <form className="flex flex-col md:flex-row items-start md:items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
            <div className="flex items-center text-slate-500 font-bold shrink-0">
              <Target className="w-5 h-5 mr-2" />
              Nilai:
            </div>
            
            <select name="type" defaultValue={activeType} className="h-10 px-3 rounded-lg border-slate-200 bg-slate-50 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-700">
              <option value="FORMATIVE">Formatif (TP)</option>
              <option value="SUMMATIVE">Sumatif (SAS/PAS)</option>
            </select>

            {/* Input list (combobox / datalist) for entering or selecting TP */}
            <input 
              type="text" 
              name="topic"
              list="topic-list"
              placeholder="Contoh: TP 1, atau PAS Semester 1"
              defaultValue={activeTopic}
              className="h-10 px-3 min-w-[250px] w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-blue-500 focus:border-blue-500 font-bold text-slate-700"
              required
            />
            <datalist id="topic-list">
              {availableTPs.map(tp => (
                <option key={tp} value={tp} />
              ))}
            </datalist>
            <button type="submit" className="h-10 px-4 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors">
              Pilih
            </button>
          </form>
        </div>
      </div>

      {!activeTopic ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Pilih Topik & Jenis Penilaian</h3>
          <p className="text-slate-500 font-medium max-w-md">
            Pilih jenis penilaian (Formatif/Sumatif) dan ketik Topik pada kotak di atas lalu klik "Pilih" untuk mulai menginput nilai siswa.
          </p>
        </div>
      ) : (
        <ClientScoreForm 
          classId={classData.id}
          subjectId={subjectData.id}
          topicName={activeTopic}
          type={activeType}
          initialStudents={students}
        />
      )}
    </div>
  );
}
