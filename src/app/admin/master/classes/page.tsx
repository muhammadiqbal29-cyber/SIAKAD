import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddClassButton } from "./add-button";
import { DeleteClassButton } from "./delete-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  const activeYear = await prisma.academicYear.findFirst({
    where: { isActive: true }
  });

  if (!activeYear) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800">Tidak ada Tahun Ajaran Aktif</h3>
        <p className="text-slate-500 mt-2">Silakan atur tahun ajaran aktif terlebih dahulu di menu Tahun Ajaran.</p>
        <Link href="/admin/master/academic-years">
          <Button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Ke Halaman Tahun Ajaran</Button>
        </Link>
      </div>
    );
  }

  const classes = await prisma.class.findMany({
    where: { academicYearId: activeYear.id },
    include: {
      homeroom: true,
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: [
      { gradeLevel: 'asc' },
      { name: 'asc' }
    ]
  });

  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Kelas</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Tahun Ajaran Aktif: <span className="font-bold text-indigo-600">{activeYear.year} (Semester {activeYear.semester})</span>
          </p>
        </div>
        <AddClassButton academicYearId={activeYear.id} teachers={teachers} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-1">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b-slate-100">
                <TableHead className="font-bold text-slate-700 text-center w-24">Tingkat</TableHead>
                <TableHead className="font-bold text-slate-700">Nama Kelas</TableHead>
                <TableHead className="font-bold text-slate-700">Wali Kelas</TableHead>
                <TableHead className="font-bold text-slate-700 text-center">Jumlah Siswa</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500 font-medium">
                    Belum ada kelas di tahun ajaran ini.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-100">
                    <TableCell className="text-center font-black text-indigo-600 text-lg">{cls.gradeLevel}</TableCell>
                    <TableCell className="font-bold text-slate-800">{cls.name}</TableCell>
                    <TableCell className="text-slate-600 font-medium">
                      {cls.homeroom?.name || <span className="text-slate-400 italic">Belum diset</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100">
                        {cls._count.enrollments} Siswa
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/master/classes/${cls.id}`}>
                          <Button variant="outline" size="sm" className="h-9 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 rounded-lg transition-colors font-semibold">
                            <Users className="h-4 w-4 mr-2" />
                            Kelola Siswa
                          </Button>
                        </Link>
                        <DeleteClassButton id={cls.id} name={cls.name} enrollmentsCount={cls._count.enrollments} />
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
