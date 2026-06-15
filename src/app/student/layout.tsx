import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* Sidebar Siswa */}
      <aside className="w-64 bg-amber-500 text-white shadow-xl hidden md:flex flex-col">
        <div className="p-6 font-extrabold text-2xl tracking-tight text-amber-950">Portal Siswa</div>
        <nav className="p-4 space-y-1 flex-1">
          <Link href="/student" className="block p-3 hover:bg-amber-600/50 text-amber-100 font-medium rounded-lg transition-colors">Beranda</Link>
          <Link href="/student/schedules" className="block p-3 hover:bg-amber-600/50 text-amber-100 font-medium rounded-lg transition-colors">Jadwal Kelas</Link>
          <Link href="/student/grades" className="block p-3 hover:bg-amber-600/50 text-amber-100 font-medium rounded-lg transition-colors">Nilai & Rapor</Link>
          <Link href="/student/invoices" className="block p-3 hover:bg-amber-600/50 text-amber-100 font-medium rounded-lg transition-colors">Tagihan SPP</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between sticky top-0 z-10 shadow-sm">
          <div className="font-semibold text-slate-700">Tahun Ajaran 2024/2025</div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Halo, {session.user.name || "Siswa"}</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              {session.user.name?.charAt(0) || "S"}
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
