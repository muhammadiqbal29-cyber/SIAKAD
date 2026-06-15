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
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteClass } from "@/app/actions/class";

interface Props {
  id: string;
  name: string;
  enrollmentsCount: number;
}

export function DeleteClassButton({ id, name, enrollmentsCount }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const hasStudents = enrollmentsCount > 0;

  async function handleDelete() {
    if (hasStudents) return; // Prevent deletion if there are students
    
    setIsLoading(true);
    setError("");
    
    const result = await deleteClass(id);
    
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
        <Button variant="outline" size="icon" className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-lg transition-colors">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-red-50 p-6 border-b border-red-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-red-900">Hapus Kelas?</DialogTitle>
            <DialogDescription className="text-red-700/80 font-medium mt-2">
              {hasStudents 
                ? `Kelas ${name} tidak bisa dihapus karena masih ada ${enrollmentsCount} siswa di dalamnya. Keluarkan siswa terlebih dahulu!`
                : `Anda yakin ingin menghapus kelas ${name}? Data tidak dapat dikembalikan.`}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 bg-white space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="h-11 flex-1 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              {hasStudents ? "Tutup" : "Batal"}
            </Button>
            {!hasStudents && (
              <Button 
                type="button" 
                onClick={handleDelete}
                disabled={isLoading}
                className="h-11 flex-1 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-lg shadow-red-200 transition-all active:scale-95"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Menghapus...</>
                ) : "Ya, Hapus Kelas"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
