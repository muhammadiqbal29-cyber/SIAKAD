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
import { createClass } from "@/app/actions/class";

interface Props {
  academicYearId: string;
  teachers: { id: string; name: string }[];
}

export function AddClassButton({ academicYearId, teachers }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    // Inject academicYearId ke dalam form data karena field ini hidden/tidak diinput user
    formData.append("academicYearId", academicYearId);
    
    const result = await createClass(formData);
    
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 rounded-xl px-5 transition-all active:scale-95">
          <PlusCircle className="mr-2 h-5 w-5" />
          Buat Kelas Baru
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-6 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">Buat Kelas Baru</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Bentuk rombongan belajar baru untuk tahun ajaran yang sedang aktif.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form action={handleSubmit} className="p-6 space-y-6 bg-white">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 flex items-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="gradeLevel" className="text-slate-700 font-bold">Tingkat Kelas</Label>
            <select 
              id="gradeLevel" 
              name="gradeLevel" 
              className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition-all hover:bg-white"
              required
            >
              <option value="">Pilih Tingkat...</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>Kelas {num}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-bold">Nama Kelas</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Contoh: X MIPA 1" 
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all font-medium text-slate-800"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="homeroomId" className="text-slate-700 font-bold">Wali Kelas <span className="text-slate-400 font-normal">(Opsional)</span></Label>
            <select 
              id="homeroomId" 
              name="homeroomId" 
              className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition-all hover:bg-white"
            >
              <option value="">-- Tanpa Wali Kelas --</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </select>
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
              ) : "Buat Kelas"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
