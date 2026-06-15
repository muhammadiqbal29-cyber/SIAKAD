import { prisma } from "@/lib/prisma";
import { SearchStudent } from "./search-student";

export const dynamic = 'force-dynamic';

export default async function CashierPage() {
  // Pre-fetch some students for initial suggestions (e.g., active students)
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, name: true, nisn: true },
    orderBy: { name: 'asc' },
    take: 100 // limit to 100 to avoid huge payload initially
  });

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto pt-8">
        <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">Kasir (Penerimaan)</h2>
        <p className="text-slate-500 font-medium text-lg">
          Cari nama atau NISN siswa yang ingin melakukan pembayaran untuk melihat daftar tagihannya.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <SearchStudent students={students} />
      </div>

      <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="text-3xl font-black text-indigo-600 mb-2">1</div>
          <h4 className="font-bold text-slate-800">Cari Siswa</h4>
          <p className="text-xs text-slate-500 mt-2">Ketik nama atau NISN di kolom pencarian.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="text-3xl font-black text-amber-500 mb-2">2</div>
          <h4 className="font-bold text-slate-800">Pilih Tagihan</h4>
          <p className="text-xs text-slate-500 mt-2">Sistem akan menampilkan tagihan yang belum lunas.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="text-3xl font-black text-emerald-500 mb-2">3</div>
          <h4 className="font-bold text-slate-800">Bayar Lunas</h4>
          <p className="text-xs text-slate-500 mt-2">Klik tombol bayar, otomatis tercatat di riwayat.</p>
        </div>
      </div>
    </div>
  );
}
