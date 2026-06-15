import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddAcademicYearButton } from "./add-button";
import { EditAcademicYearButton } from "./edit-button";
import { DeleteAcademicYearButton } from "./delete-button";

export const dynamic = 'force-dynamic';

export default async function AcademicYearsPage() {
  // Mengambil data dari Model (Prisma)
  const academicYears = await prisma.academicYear.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tahun Ajaran</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Kelola data tahun ajaran dan semester aktif untuk seluruh unit</p>
        </div>
        <AddAcademicYearButton />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-b-slate-200">
              <TableHead className="w-[80px] font-bold text-slate-700">No</TableHead>
              <TableHead className="font-bold text-slate-700">Tahun Ajaran</TableHead>
              <TableHead className="font-bold text-slate-700">Semester</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="text-right font-bold text-slate-700">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {academicYears.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-medium">
                  Belum ada data tahun ajaran. Silakan tambah data baru.
                </TableCell>
              </TableRow>
            ) : (
              academicYears.map((ay, index) => (
                <TableRow key={ay.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-100">
                  <TableCell className="font-medium text-slate-600">{index + 1}</TableCell>
                  <TableCell className="font-bold text-slate-800">{ay.year}</TableCell>
                  <TableCell className="font-medium text-slate-600">
                    {ay.semester === 1 ? "Ganjil (1)" : "Genap (2)"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                      ay.isActive 
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {ay.isActive ? "AKTIF" : "TIDAK AKTIF"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EditAcademicYearButton academicYear={ay} />
                      <DeleteAcademicYearButton id={ay.id} year={ay.year} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
