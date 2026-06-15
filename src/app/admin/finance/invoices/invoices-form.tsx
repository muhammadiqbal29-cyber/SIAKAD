"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateBulkInvoices } from "@/app/actions/finance";
import { Loader2, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function InvoicesForm({ classes }: { classes: any[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await generateBulkInvoices(formData);

    setIsLoading(false);
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: `Berhasil membuat ${result.count} tagihan untuk siswa!` });
      (e.target as HTMLFormElement).reset();
      router.refresh();
      setTimeout(() => setMessage(null), 5000);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <PlusCircle className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-slate-800">Buat Tagihan Massal</h3>
      </div>
      
      <form onSubmit={onSubmit} className="p-5 space-y-4">
        {message && (
          <div className={`p-3 rounded-lg text-sm font-bold flex items-start ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> : <AlertCircle className="w-5 h-5 mr-2 shrink-0" />}
            {message.text}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Judul Tagihan <span className="text-red-500">*</span></label>
          <input type="text" name="title" required placeholder="Contoh: SPP Bulan Juli 2026" className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Kategori <span className="text-red-500">*</span></label>
          <select name="type" required className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
            <option value="SPP">SPP Bulanan</option>
            <option value="UANG_GEDUNG">Uang Gedung</option>
            <option value="SERAGAM">Seragam / Buku</option>
            <option value="LAINNYA">Lainnya</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Nominal (Rp) <span className="text-red-500">*</span></label>
          <input type="number" name="amount" min="0" required placeholder="Contoh: 350000" className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Jatuh Tempo</label>
          <input type="date" name="dueDate" className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700">Target Penerima <span className="text-red-500">*</span></label>
          <select name="classId" required className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white">
            <option value="ALL">Semua Siswa Aktif</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>Kelas {c.name}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Pilih ALL untuk membuat tagihan serentak satu sekolah.</p>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg mt-4">
          {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</> : "Generate Tagihan"}
        </Button>
      </form>
    </div>
  );
}
