import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddTeacherButton } from "./add-button";
import { EditTeacherButton } from "./edit-button";
import { DeleteTeacherButton } from "./delete-button";
import { ImportExcelModal } from "@/components/import-excel-modal";

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Guru</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola data tenaga pendidik, NUPTK, dan akses login guru</p>
        </div>
        <div className="flex items-center gap-3">
          <ImportExcelModal role="TEACHER" />
          <AddTeacherButton />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-1">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b-slate-100">
                <TableHead className="font-bold text-slate-700 w-16 text-center">No</TableHead>
                <TableHead className="font-bold text-slate-700">Nama Guru</TableHead>
                <TableHead className="font-bold text-slate-700">NUPTK</TableHead>
                <TableHead className="font-bold text-slate-700">Email</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                    Belum ada data guru. Silakan tambah data baru.
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher, index) => (
                  <TableRow key={teacher.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-100">
                    <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                    <TableCell className="font-bold text-slate-800">{teacher.name}</TableCell>
                    <TableCell className="font-medium text-slate-600">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-sm border border-slate-200">
                        {teacher.nuptk || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600">{teacher.email || <span className="italic text-slate-400">Tidak ada email</span>}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <EditTeacherButton teacher={{ id: teacher.id, name: teacher.name, nuptk: teacher.nuptk || "", email: teacher.email || "" }} />
                        <DeleteTeacherButton id={teacher.id} name={teacher.name} />
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
