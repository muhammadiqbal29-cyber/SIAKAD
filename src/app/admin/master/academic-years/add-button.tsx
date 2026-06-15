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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";
import { createAcademicYear } from "@/app/actions/academic-year";

export function AddAcademicYearButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    // Memanggil Server Action (Controller MVC)
    const result = await createAcademicYear(formData);
    
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false); // Tutup modal jika sukses
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* @ts-ignore: Radix UI asChild prop type mismatch in some TS versions */}
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 rounded-xl px-5 transition-all active:scale-95">
          <PlusCircle className="mr-2 h-5 w-5" />
          Tambah Data
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-6 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">Tambah Tahun Ajaran</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Masukkan periode akademik baru. Centang opsi "Aktifkan" untuk menjadikannya semester berjalan.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form action={handleSubmit} className="p-6 space-y-6 bg-white">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="year" className="text-slate-700 font-bold">Tahun Ajaran</Label>
            <Input 
              id="year" 
              name="year" 
              placeholder="Format: 2024/2025" 
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all font-medium text-slate-800"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="semester" className="text-slate-700 font-bold">Semester</Label>
            <select 
              id="semester" 
              name="semester" 
              className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition-all hover:bg-white"
              required
            >
              <option value="1">Semester Ganjil (1)</option>
              <option value="2">Semester Genap (2)</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
            <input 
              type="checkbox" 
              id="isActive" 
              name="isActive" 
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" 
            />
            <Label htmlFor="isActive" className="text-sm font-bold text-indigo-900 cursor-pointer">
              Jadikan Semester Aktif Sekarang
            </Label>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="h-11 rounded-xl font-bold px-6 text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-lg shadow-indigo-200 px-6 transition-all active:scale-95"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
              ) : "Simpan Data"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
