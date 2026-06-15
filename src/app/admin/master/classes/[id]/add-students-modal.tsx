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
import { PlusCircle, Loader2, Search } from "lucide-react";
import { addStudentsToClass } from "@/app/actions/class";
import { Input } from "@/components/ui/input";

interface Props {
  classId: string;
  availableStudents: { id: string; name: string; nisn: string | null }[];
}

export function AddStudentsModal({ classId, availableStudents }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredStudents = availableStudents.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    (s.nisn && s.nisn.includes(search))
  );

  function toggleStudent(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function toggleAll() {
    if (selectedIds.size === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  }

  async function handleSave() {
    if (selectedIds.size === 0) return;
    
    setIsLoading(true);
    const result = await addStudentsToClass(classId, Array.from(selectedIds));
    setIsLoading(false);
    
    if (result?.success) {
      setIsOpen(false);
      setSelectedIds(new Set()); // Reset
      setSearch("");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* @ts-ignore */}
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 rounded-xl px-5 transition-all active:scale-95">
          <PlusCircle className="mr-2 h-5 w-5" />
          Tambah Siswa ({availableStudents.length} Tersedia)
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] rounded-2xl border-0 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-6 border-b border-slate-100 flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold text-slate-800">Pilih Siswa ke Kelas</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium mt-2">
              Daftar di bawah ini hanya menampilkan siswa yang belum memiliki kelas. Pilih beberapa siswa sekaligus.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Cari nama atau NISN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto p-4 flex-1 bg-slate-50/50">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Tidak ada siswa yang tersedia.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center p-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" onClick={toggleAll}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.size === filteredStudents.length && filteredStudents.length > 0}
                  readOnly
                  className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 pointer-events-none" 
                />
                <span className="ml-3 font-bold text-slate-700">Pilih Semua ({filteredStudents.length})</span>
              </div>
              
              <div className="h-px bg-slate-200 my-2"></div>

              {filteredStudents.map(student => (
                <div 
                  key={student.id} 
                  onClick={() => toggleStudent(student.id)}
                  className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                    selectedIds.has(student.id) ? "bg-indigo-50 border-indigo-200" : "bg-white border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(student.id)}
                    readOnly
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 pointer-events-none" 
                  />
                  <div className="ml-3">
                    <p className="font-bold text-slate-800">{student.name}</p>
                    <p className="text-sm font-medium text-slate-500">NISN: {student.nisn || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            {selectedIds.size} Dipilih
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="rounded-xl font-bold px-6 text-slate-600 border-slate-200 hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isLoading || selectedIds.size === 0}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-md shadow-indigo-200 px-6 transition-all active:scale-95"
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
              ) : "Simpan Pilihan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
