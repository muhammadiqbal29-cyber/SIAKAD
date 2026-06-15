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
import { createSubject } from "@/app/actions/subject";

export function AddSubjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    const result = await createSubject(formData);
    
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
          Tambah Mapel
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-6 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">Tambah Mata Pelajaran</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Tambahkan mata pelajaran baru untuk sekolah ini.
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
            <Label htmlFor="code" className="text-slate-700 font-bold">Kode Mapel <span className="text-slate-400 font-normal">(Opsional)</span></Label>
            <Input 
              id="code" 
              name="code" 
              placeholder="Contoh: MTK" 
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all font-medium text-slate-800 uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 font-bold">Nama Mata Pelajaran</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Contoh: Matematika Lanjut" 
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 focus-visible:bg-white transition-all font-medium text-slate-800"
              required 
            />
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
