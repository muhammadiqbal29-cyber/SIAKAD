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
import { Edit2, Loader2 } from "lucide-react";
import { updateAcademicYear } from "@/app/actions/academic-year";

interface EditButtonProps {
  academicYear: {
    id: string;
    year: string;
    semester: number;
    isActive: boolean;
  }
}

export function EditAcademicYearButton({ academicYear }: EditButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    const result = await updateAcademicYear(academicYear.id, formData);
    
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* @ts-ignore: Radix UI asChild prop type mismatch */}
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 rounded-lg transition-colors">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">Edit Tahun Ajaran</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Perbarui data tahun ajaran.
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
            <Label htmlFor="year" className="text-slate-700 font-bold">Tahun Ajaran</Label>
            <Input 
              id="year" 
              name="year" 
              defaultValue={academicYear.year}
              placeholder="Format: 2024/2025" 
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500 focus-visible:bg-white transition-all font-medium text-slate-800"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="semester" className="text-slate-700 font-bold">Semester</Label>
            <select 
              id="semester" 
              name="semester" 
              defaultValue={academicYear.semester}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 transition-all hover:bg-white"
              required
            >
              <option value="1">Semester Ganjil (1)</option>
              <option value="2">Semester Genap (2)</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <input 
              type="checkbox" 
              id="isActive" 
              name="isActive" 
              defaultChecked={academicYear.isActive}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer" 
            />
            <Label htmlFor="isActive" className="text-sm font-bold text-blue-900 cursor-pointer">
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
              className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-200 px-6 transition-all active:scale-95"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menyimpan...</>
              ) : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
