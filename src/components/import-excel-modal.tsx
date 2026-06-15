"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUp, Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { importUsersFromExcel } from "@/app/actions/import";
import * as xlsx from "xlsx";

interface Props {
  role: "TEACHER" | "STUDENT";
}

export function ImportExcelModal({ role }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [resultMsg, setResultMsg] = useState<{ type: "error" | "success", text: string } | null>(null);

  const identityName = role === "TEACHER" ? "NUPTK" : "NISN";
  const typeName = role === "TEACHER" ? "Guru" : "Siswa";

  function downloadTemplate() {
    const ws = xlsx.utils.json_to_sheet([
      { "Nama Lengkap": "Andi Supriadi", [identityName]: "1234567890", "Email": "andi@sekolah.com" }
    ]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Template");
    xlsx.writeFile(wb, `Template_Import_${typeName}.xlsx`);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setResultMsg(null);

    const formData = new FormData();
    formData.append("file", file);

    const result = await importUsersFromExcel(formData, role);
    setIsLoading(false);

    if (result?.error) {
      setResultMsg({ type: "error", text: result.error });
    } else if (result?.success) {
      setResultMsg({ type: "success", text: `Berhasil mengimport ${result.count} baris data ${typeName}.` });
      setFile(null);
      setTimeout(() => {
        setIsOpen(false);
        setResultMsg(null);
      }, 2500);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 shadow-sm rounded-xl px-4 transition-all">
          <FileUp className="mr-2 h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-white p-6 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">Import {typeName} Massal</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Upload file Excel (.xlsx) untuk menambahkan banyak data sekaligus.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleUpload} className="p-6 space-y-6 bg-white">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h4 className="font-bold text-amber-800 flex items-center text-sm mb-2">
              <AlertCircle className="w-4 h-4 mr-1.5" /> Panduan Import
            </h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc pl-5">
              <li>Download template terlebih dahulu.</li>
              <li>Kolom <b>Nama Lengkap</b> dan <b>{identityName}</b> wajib diisi.</li>
              <li>Password akun otomatis menggunakan {identityName}.</li>
              <li>Data dengan {identityName} yang sudah terdaftar akan diabaikan.</li>
            </ul>
            <Button 
              type="button" 
              onClick={downloadTemplate}
              variant="outline" 
              className="mt-3 w-full bg-white border-amber-300 text-amber-700 hover:bg-amber-100"
            >
              <Download className="w-4 h-4 mr-2" /> Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Upload File Excel</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-8 h-8 text-slate-400 mb-3" />
                  <p className="mb-1 text-sm text-slate-600">
                    <span className="font-bold text-emerald-600">Klik untuk upload</span> atau drag and drop
                  </p>
                  <p className="text-xs text-slate-500">
                    {file ? file.name : "Hanya file .xlsx"}
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx, .xls" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          {resultMsg && (
            <div className={`p-3 rounded-xl border flex items-center ${resultMsg.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
              {resultMsg.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />}
              <span className="text-sm font-bold">{resultMsg.text}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="h-11 rounded-xl font-bold px-6 text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              Tutup
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !file}
              className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-lg shadow-emerald-200 px-6 transition-all active:scale-95"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...</>
              ) : "Mulai Import"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
