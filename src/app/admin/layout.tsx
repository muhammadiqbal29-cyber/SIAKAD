import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar Admin (Akan di-upgrade dengan shadcn nanti) */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col">
        <div className="p-6 font-extrabold text-2xl text-indigo-600 tracking-tight">SIAKAD Admin</div>
        <nav className="p-4 space-y-1 flex-1">
          <Link href="/admin" className="block p-3 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-medium rounded-lg transition-colors">Dashboard</Link>
          <div className="pt-4 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Data Master</div>
          <Link href="/admin/master/academic-years" className="block p-3 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors">Tahun Ajaran</Link>
          <Link href="/admin/master/teachers" className="block p-3 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors">Data Guru</Link>
          <Link href="/admin/master/students" className="block p-3 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors">Data Siswa</Link>
          <Link href="/admin/master/classes" className="block p-3 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors">Data Kelas</Link>
          <Link href="/admin/master/subjects" className="block p-3 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors">Mata Pelajaran</Link>
          <Link href="/admin/master/schedules" className="block p-3 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors">Jadwal Kelas</Link>
          <div className="pt-4 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Operasional</div>
          <Link href="/admin/finance/invoices" className="block p-3 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors">Buat Tagihan</Link>
          <Link href="/admin/finance/cashier" className="block p-3 hover:bg-slate-100 text-slate-600 font-medium rounded-lg transition-colors">Kasir (Penerimaan)</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b flex items-center px-8 justify-between sticky top-0 z-10">
          <div className="font-semibold text-slate-700">
            {session.user.role === "SUPERADMIN" ? "Yayasan Pusat" : `Unit ID: ${session.user.schoolId}`}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">Halo, {session.user.name || "Admin"}</span>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              {session.user.name?.charAt(0) || "A"}
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
