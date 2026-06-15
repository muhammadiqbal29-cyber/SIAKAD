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
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2, Clock } from "lucide-react";
import { createSchedule } from "@/app/actions/schedule";

interface Props {
  classId: string;
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}

export function AddScheduleButton({ classId, subjects, teachers }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const result = await createSchedule(classId, formData);
    
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
    }
  }

  const days = [
    { value: "1", label: "Senin" },
    { value: "2", label: "Selasa" },
    { value: "3", label: "Rabu" },
    { value: "4", label: "Kamis" },
    { value: "5", label: "Jumat" },
    { value: "6", label: "Sabtu" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 rounded-xl px-5 transition-all active:scale-95">
          <PlusCircle className="mr-2 h-5 w-5" />
          Tambah Jadwal
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-6 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">Tambah Jadwal Pelajaran</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Atur mata pelajaran, guru, hari, dan jam untuk kelas ini.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 flex items-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="subjectId" className="text-slate-700 font-bold">Mata Pelajaran</Label>
            <select 
              name="subjectId" 
              id="subjectId" 
              className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800 px-3"
              required
            >
              <option value="">Pilih Mata Pelajaran...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherId" className="text-slate-700 font-bold">Guru Pengajar</Label>
            <select 
              name="teacherId" 
              id="teacherId" 
              className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800 px-3"
              required
            >
              <option value="">Pilih Guru...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dayOfWeek" className="text-slate-700 font-bold">Hari</Label>
            <select 
              name="dayOfWeek" 
              id="dayOfWeek" 
              className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800 px-3"
              required
            >
              <option value="">Pilih Hari...</option>
              {days.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <Label htmlFor="startTime" className="text-slate-700 font-bold">Jam Mulai</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                  type="time" 
                  id="startTime" 
                  name="startTime" 
                  className="w-full h-12 pl-10 rounded-xl border-slate-200 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold text-slate-800"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="endTime" className="text-slate-700 font-bold">Jam Selesai</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                  type="time" 
                  id="endTime" 
                  name="endTime" 
                  className="w-full h-12 pl-10 rounded-xl border-slate-200 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-bold text-slate-800"
                  required 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 mt-6">
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
              ) : "Simpan Jadwal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
