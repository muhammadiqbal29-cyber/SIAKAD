import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CalendarDays, BookOpen, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "STUDENT") redirect("/login");

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

  if (!student) redirect("/login");

  const currentClass = student.enrollments[0]?.class;

  const unpaidInvoices = await prisma.invoice.count({
    where: { studentId: student.id, status: "UNPAID" }
  });

  return (
    <div className="space-y-8">
      <div className="bg-amber-500 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2 flex items-center">
            Selamat Datang, {student.name}! <Sparkles className="w-6 h-6 ml-2 text-amber-200" />
          </h1>
          <p className="text-amber-100 font-medium max-w-xl text-lg">
            Kamu saat ini terdaftar di <strong className="text-white bg-amber-600 px-2 py-0.5 rounded-md">{currentClass ? `Kelas ${currentClass.name}` : "Belum ada kelas"}</strong>. Terus semangat belajar dan raih mimpimu!
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-48 h-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link href="/student/schedules" className="group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group-hover:border-blue-300 group-hover:shadow-md transition-all h-full">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Jadwal Kelas</h3>
            <p className="text-slate-500 font-medium">Lihat jadwal pelajaranmu hari ini dan persiapkan buku yang tepat.</p>
          </div>
        </Link>

        <Link href="/student/grades" className="group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group-hover:border-emerald-300 group-hover:shadow-md transition-all h-full">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Nilai & Presensi</h3>
            <p className="text-slate-500 font-medium">Pantau terus perkembangan akademik dan capaian P5 kamu.</p>
          </div>
        </Link>

        <Link href="/student/invoices" className="group">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group-hover:border-red-300 group-hover:shadow-md transition-all h-full relative overflow-hidden">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tagihan SPP</h3>
            <p className="text-slate-500 font-medium">Cek status pembayaran SPP dan uang seragam/gedung.</p>
            {unpaidInvoices > 0 && (
              <div className="absolute top-6 right-6 bg-red-500 text-white font-black w-8 h-8 rounded-full flex items-center justify-center animate-bounce shadow-md">
                {unpaidInvoices}
              </div>
            )}
          </div>
        </Link>

      </div>
    </div>
  );
}
