"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { registerProspectiveStudent } from "@/app/actions/ppdb";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function PPDBForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await registerProspectiveStudent(formData);
    
    setIsLoading(false);
    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: "Pendaftaran berhasil! Tim kami akan segera menghubungi Anda." });
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 max-w-md w-full mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      
      <h3 className="text-2xl font-black text-slate-800 mb-2">Daftar Sekarang</h3>
      <p className="text-slate-500 text-sm font-medium mb-6">Masa depan cerah dimulai dari sini. Isi form di bawah dan jadilah bagian dari kami.</p>

      {message && (
        <div className={`mb-6 flex items-start text-sm font-bold px-4 py-3 rounded-xl border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" /> : <AlertCircle className="w-5 h-5 mr-2 shrink-0" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap Anak</label>
          <input type="text" name="name" required className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800" placeholder="Budi Santoso" />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor WhatsApp (Orang Tua)</label>
          <input type="tel" name="phone" required className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800" placeholder="081234567890" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email (Opsional)</label>
          <input type="email" name="email" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800" placeholder="budi@example.com" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Asal Sekolah</label>
          <input type="text" name="previousSchool" className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800" placeholder="SMP Negeri 1" />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-xl shadow-lg shadow-indigo-200 mt-2 transition-all active:scale-95">
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Kirim Pendaftaran"}
        </Button>
      </form>
    </div>
  );
}
