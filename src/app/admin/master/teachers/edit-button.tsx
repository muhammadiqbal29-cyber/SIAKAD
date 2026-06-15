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
import { updateTeacher } from "@/app/actions/teacher";

interface EditButtonProps {
  teacher: {
    id: string;
    name: string;
    nuptk: string;
    email: string;
  }
}

export function EditTeacherButton({ teacher }: EditButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError("");
    
    const result = await updateTeacher(teacher.id, formData);
    
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
        <Button variant="outline" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 rounded-lg transition-colors">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-white p-6 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">Edit Data Guru</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Perbarui informasi profil pendidik.
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
            <Label htmlFor="name" className="text-slate-700 font-bold">Nama Lengkap</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={teacher.name}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500 focus-visible:bg-white transition-all font-medium text-slate-800"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nuptk" className="text-slate-700 font-bold">NUPTK / NIP</Label>
            <Input 
              id="nuptk" 
              name="nuptk" 
              defaultValue={teacher.nuptk}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500 focus-visible:bg-white transition-all font-medium text-slate-800"
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-bold">Email Pribadi</Label>
            <Input 
              id="email" 
              name="email" 
              type="email"
              defaultValue={teacher.email}
              className="h-12 rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-blue-500 focus-visible:bg-white transition-all font-medium text-slate-800"
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
