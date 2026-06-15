import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ClassReportsPage(props: { params: Promise<{ classId: string }> }) {
  const params = await props.params;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/teacher/reports" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kelas
        </Link>
        
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center">
            Daftar Cetak Rapor <span className="text-slate-400 text-2xl font-medium ml-2">({classData.name})</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Klik tombol cetak untuk membuka halaman Rapor PDF siswa.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-bold text-slate-600 w-16 text-center">No</th>
              <th className="p-4 font-bold text-slate-600">Nama Siswa</th>
              <th className="p-4 font-bold text-slate-600 w-48 text-right pr-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classData.enrollments.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500 font-medium">Belum ada siswa di kelas ini.</td>
              </tr>
            ) : (
              classData.enrollments.map((e, idx) => (
                <tr key={e.student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-800">{e.student.name}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">NISN: {e.student.nisn || "-"}</div>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <Link 
                      href={`/print/rapor/${classData.id}/${e.student.id}`} 
                      target="_blank"
                      className="inline-flex items-center h-10 px-4 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors text-sm"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Cetak PDF
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
