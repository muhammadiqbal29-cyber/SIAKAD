import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddStudentsModal } from "./add-students-modal";
import { RemoveStudentButton } from "./remove-student-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ClassDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const classData = await prisma.class.findUnique({
    where: { id: params.id },
    include: {
      homeroom: true,
      academicYear: true,
      enrollments: {
        include: {
          student: true
        },
        orderBy: {
          student: { name: 'asc' }
        }
      }
    }
  });

  if (!classData) {
    notFound();
  }

  // Ambil semua siswa yang BELUM TERDAFTAR di kelas MANA PUN pada Tahun Ajaran yang sama
  const availableStudents = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      enrollments: {
        none: {
          class: {
            academicYearId: classData.academicYearId
          }
        }
      }
    },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, nisn: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link href="/admin/master/classes" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kelas
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Kelas {classData.name} <span className="text-slate-400 text-2xl font-medium">(Tingkat {classData.gradeLevel})</span>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-md font-medium border border-slate-200">
                <UserCircle2 className="w-4 h-4 mr-1.5" />
                Wali Kelas: {classData.homeroom?.name || <span className="italic text-slate-400 ml-1">Belum diset</span>}
              </span>
              <span className="text-sm font-medium text-slate-500">
                Total: <b className="text-indigo-600">{classData.enrollments.length} Siswa</b>
              </span>
            </div>
          </div>
          <AddStudentsModal 
            classId={classData.id} 
            availableStudents={availableStudents} 
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-1">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b-slate-100">
                <TableHead className="font-bold text-slate-700 w-16 text-center">No</TableHead>
                <TableHead className="font-bold text-slate-700">Nama Siswa</TableHead>
                <TableHead className="font-bold text-slate-700">NISN</TableHead>
                <TableHead className="font-bold text-slate-700 text-right pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classData.enrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500 font-medium">
                    Kelas ini masih kosong. Silakan tambahkan siswa.
                  </TableCell>
                </TableRow>
              ) : (
                classData.enrollments.map((enrollment, index) => (
                  <TableRow key={enrollment.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-100">
                    <TableCell className="text-center font-medium text-slate-500">{index + 1}</TableCell>
                    <TableCell className="font-bold text-slate-800">{enrollment.student.name}</TableCell>
                    <TableCell className="font-medium text-slate-600">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-md text-sm border border-slate-200">
                        {enrollment.student.nisn || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <RemoveStudentButton 
                        enrollmentId={enrollment.id} 
                        classId={classData.id} 
                        studentName={enrollment.student.name} 
                      />
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
