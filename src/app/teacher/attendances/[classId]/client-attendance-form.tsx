"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";
import { saveAttendances } from "@/app/actions/attendance";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  nisn: string | null;
  status: string;
}

export function ClientAttendanceForm({ classId, date, initialStudents }: { classId: string, date: string, initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const router = useRouter();

  function handleStatusChange(studentId: string, newStatus: string) {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
  }

  function setAllTo(status: string) {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  }

  async function handleSave() {
    setIsLoading(true);
    setMessage(null);
    
    const payload = students.map(s => ({ studentId: s.id, status: s.status }));
    const result = await saveAttendances(classId, date, payload);
    
    setIsLoading(false);
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: "Presensi berhasil disimpan!" });
      router.refresh();
      
      // Hilangkan pesan sukses setelah 3 detik
      setTimeout(() => setMessage(null), 3000);
    }
  }

  const stats = {
    hadir: students.filter(s => s.status === 'PRESENT').length,
    sakit: students.filter(s => s.status === 'SICK').length,
    izin: students.filter(s => s.status === 'EXCUSED').length,
    alpa: students.filter(s => s.status === 'ABSENT').length,
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setAllTo('PRESENT')} className="font-bold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100">Set Semua Hadir</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAllTo('ABSENT')} className="font-bold text-red-700 bg-red-50 border-red-200 hover:bg-red-100">Set Semua Alpa</Button>
        </div>
        
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="text-emerald-600">Hadir: {stats.hadir}</span>
          <span className="text-amber-500">Sakit: {stats.sakit}</span>
          <span className="text-blue-500">Izin: {stats.izin}</span>
          <span className="text-red-600">Alpa: {stats.alpa}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-bold text-slate-600 w-16 text-center">No</th>
              <th className="p-4 font-bold text-slate-600">Nama Siswa</th>
              <th className="p-4 font-bold text-slate-600 text-center">Kehadiran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500 font-medium">Belum ada siswa di kelas ini.</td>
              </tr>
            ) : (
              students.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-800">{student.name}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">NISN: {student.nisn || "-"}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all border ${student.status === 'PRESENT' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input type="radio" className="hidden" name={`status-${student.id}`} value="PRESENT" checked={student.status === 'PRESENT'} onChange={() => handleStatusChange(student.id, 'PRESENT')} />
                        Hadir
                      </label>
                      <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all border ${student.status === 'SICK' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input type="radio" className="hidden" name={`status-${student.id}`} value="SICK" checked={student.status === 'SICK'} onChange={() => handleStatusChange(student.id, 'SICK')} />
                        Sakit
                      </label>
                      <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all border ${student.status === 'EXCUSED' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input type="radio" className="hidden" name={`status-${student.id}`} value="EXCUSED" checked={student.status === 'EXCUSED'} onChange={() => handleStatusChange(student.id, 'EXCUSED')} />
                        Izin
                      </label>
                      <label className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-bold transition-all border ${student.status === 'ABSENT' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input type="radio" className="hidden" name={`status-${student.id}`} value="ABSENT" checked={student.status === 'ABSENT'} onChange={() => handleStatusChange(student.id, 'ABSENT')} />
                        Alpa
                      </label>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex-1">
          {message && (
            <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <AlertCircle className="w-4 h-4 mr-2" />}
              {message.text}
            </div>
          )}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isLoading || students.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-12 px-8 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...</>
          ) : (
            <><UserCheck className="w-5 h-5 mr-2" /> Simpan Presensi</>
          )}
        </Button>
      </div>
    </div>
  );
}
