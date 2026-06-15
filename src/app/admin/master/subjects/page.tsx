import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddSubjectButton } from "./add-button";
import { EditSubjectButton } from "./edit-button";
import { DeleteSubjectButton } from "./delete-button";
import { BookOpen } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' },
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
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mata Pelajaran</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola daftar mata pelajaran yang akan diajarkan</p>
        </div>
        <AddSubjectButton />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-1">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b-slate-100">
                <TableHead className="font-bold text-slate-700 w-16 text-center">No</TableHead>
                <TableHead className="font-bold text-slate-700">Kode</TableHead>
                <TableHead className="font-bold text-slate-700">Nama Mata Pelajaran</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">Dipakai di Jadwal</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                    Belum ada mata pelajaran.
                  </TableCell>
                </TableRow>
              ) : (
                subjects.map((subject, index) => (
                  <TableRow key={subject.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-100">
                    <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                    <TableCell className="font-bold text-slate-600">{subject.code || "-"}</TableCell>
                    <TableCell className="font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      {subject.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                        {subject._count.schedules} kelas
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <EditSubjectButton subject={{ id: subject.id, name: subject.name, code: subject.code || "" }} />
                        <DeleteSubjectButton id={subject.id} name={subject.name} schedulesCount={subject._count.schedules} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
