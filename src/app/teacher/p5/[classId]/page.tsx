import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Star, Target } from "lucide-react";
import { notFound } from "next/navigation";
import { ClientP5Form } from "./client-p5-form";

export const dynamic = 'force-dynamic';

export default async function P5EditorPage(props: {
  params: Promise<{ classId: string }>,
  searchParams: Promise<{ project?: string; dimension?: string }>
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

  // Ambil semua projek P5 yang pernah diinput untuk kelas ini
  const existingScores = await prisma.p5Score.findMany({
    where: { classId: params.classId },
    distinct: ['projectName', 'dimension'],
    select: { projectName: true, dimension: true }
  });

  // Unique projects and dimensions for datalist suggestions
  const availableProjects = Array.from(new Set(existingScores.map(s => s.projectName)));
  const availableDimensions = [
    "Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia",
    "Berkebinekaan Global",
    "Bergotong Royong",
    "Mandiri",
    "Bernalar Kritis",
    "Kreatif"
  ];
  
  const activeProject = searchParams.project || "";
  const activeDimension = searchParams.dimension || "";

  // Ambil nilai P5 untuk kombinasi yang aktif
  let currentScores: any[] = [];
  if (activeProject && activeDimension) {
    currentScores = await prisma.p5Score.findMany({
      where: {
        classId: params.classId,
        projectName: activeProject,
        dimension: activeDimension
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
      score: scoreRow ? scoreRow.score : "",
      notes: scoreRow ? (scoreRow.notes || "") : ""
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/teacher/p5" className="inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-800 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kelas P5
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
              Penilaian P5
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">Kelas: <strong className="text-slate-700">{classData.name}</strong></p>
          </div>
          
          <form className="flex flex-col md:flex-row items-end gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto">
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-500">Nama Projek</label>
              <input 
                type="text" 
                name="project"
                list="project-list"
                placeholder="Contoh: Gaya Hidup Berkelanjutan..."
                defaultValue={activeProject}
                className="h-10 px-3 min-w-[250px] w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-amber-500 focus:border-amber-500 font-bold text-slate-700"
                required
              />
              <datalist id="project-list">
                {availableProjects.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-500">Dimensi Pancasila</label>
              <select 
                name="dimension"
                defaultValue={activeDimension}
                className="h-10 px-3 min-w-[200px] w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-amber-500 focus:border-amber-500 font-bold text-slate-700"
                required
              >
                <option value="">-- Pilih Dimensi --</option>
                {availableDimensions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <button type="submit" className="h-10 px-6 mt-2 md:mt-0 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors shrink-0">
              Pilih
            </button>
          </form>
        </div>
      </div>

      {(!activeProject || !activeDimension) ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-4">
            <Star className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Tentukan Projek & Dimensi</h3>
          <p className="text-slate-500 font-medium max-w-md">
            Masukkan nama projek dan pilih dimensi Pancasila di atas untuk mulai menilai perkembangan karakter siswa.
          </p>
        </div>
      ) : (
        <ClientP5Form 
          classId={classData.id}
          projectName={activeProject}
          dimension={activeDimension}
          initialStudents={students}
        />
      )}
    </div>
  );
}
