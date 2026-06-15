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
import { UserMinus, Loader2 } from "lucide-react";
import { removeStudentFromClass } from "@/app/actions/class";

interface Props {
  enrollmentId: string;
  classId: string;
  studentName: string;
}

export function RemoveStudentButton({ enrollmentId, classId, studentName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRemove() {
    setIsLoading(true);
    const result = await removeStudentFromClass(enrollmentId, classId);
    setIsLoading(false);
    
    if (result?.success) {
      setIsOpen(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-lg transition-colors font-semibold">
          <UserMinus className="h-4 w-4 mr-1.5" />
          Keluarkan
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-red-50 p-6 border-b border-red-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <UserMinus className="h-6 w-6" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-red-900">Keluarkan Siswa?</DialogTitle>
            <DialogDescription className="text-red-700/80 font-medium mt-2">
              Anda yakin ingin mengeluarkan <b>{studentName}</b> dari kelas ini?
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 bg-white flex gap-3 justify-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="h-11 flex-1 rounded-xl font-bold text-slate-600 border-slate-200 hover:bg-slate-50"
          >
            Batal
          </Button>
          <Button 
            type="button" 
            onClick={handleRemove}
            disabled={isLoading}
            className="h-11 flex-1 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-lg shadow-red-200 transition-all active:scale-95"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Proses...</>
            ) : "Ya, Keluarkan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
