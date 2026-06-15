import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Guru */}
      <aside className="w-64 bg-emerald-900 text-white shadow-xl hidden md:flex flex-col">
        <div className="p-6 font-extrabold text-2xl tracking-tight text-emerald-100">Portal Guru</div>
        <nav className="p-4 space-y-1 flex-1">
          <Link href="/teacher/dashboard" className="block p-3 hover:bg-emerald-800/50 text-emerald-100 font-medium rounded-lg transition-colors">Beranda Guru</Link>
          <Link href="/teacher/scores" className="block p-3 hover:bg-emerald-800/50 text-emerald-100 font-medium rounded-lg transition-colors">E-Rapor & Nilai</Link>
          <Link href="/teacher/attendances" className="block p-3 hover:bg-emerald-800/50 text-emerald-100 font-medium rounded-lg transition-colors">Presensi Kelas</Link>
          <Link href="/teacher/p5" className="block p-3 hover:bg-emerald-800/50 text-emerald-100 font-medium rounded-lg transition-colors">Penilaian P5</Link>
          <Link href="/teacher/reports" className="block p-3 mt-4 border border-emerald-700 bg-emerald-800/30 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors">Cetak E-Rapor</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between sticky top-0 z-10">
          <div className="font-semibold text-slate-700">Tahun Ajaran 2024/2025</div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Halo, {session.user.name || "Guru"}</span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              {session.user.name?.charAt(0) || "G"}
            </div>
            <LogoutButton />
          </div>
        </header>
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
