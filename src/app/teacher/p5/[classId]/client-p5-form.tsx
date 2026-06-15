"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Save, AlertCircle } from "lucide-react";
import { saveP5Scores } from "@/app/actions/p5";
import { useRouter } from "next/navigation";

interface Student {
  id: string;
  name: string;
  nisn: string | null;
  score: string;
  notes: string;
}

export function ClientP5Form({ classId, projectName, dimension, initialStudents }: { classId: string, projectName: string, dimension: string, initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const router = useRouter();

  function handleScoreChange(studentId: string, val: string) {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, score: val } : s));
  }

  function handleNotesChange(studentId: string, val: string) {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, notes: val } : s));
  }

  function setAllTo(val: string) {
    setStudents(prev => prev.map(s => ({ ...s, score: val })));
  }

  async function handleSave() {
    setIsLoading(true);
    setMessage(null);
    
    // Validasi apakah ada yang kosong
    const emptyScore = students.find(s => !s.score);
    if (emptyScore) {
      setIsLoading(false);
      setMessage({ type: 'error', text: `Nilai untuk ${emptyScore.name} belum diisi.` });
      return;
    }

    const payload = students.map(s => ({ studentId: s.id, score: s.score, notes: s.notes }));
    const result = await saveP5Scores(classId, projectName, dimension, payload);
    
    setIsLoading(false);
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: "Nilai P5 berhasil disimpan!" });
      router.refresh();
      setTimeout(() => setMessage(null), 3000);
    }
  }

  const SCORE_OPTIONS = [
    { value: "BB", label: "Belum Berkembang", color: "text-red-600 bg-red-50 border-red-200" },
    { value: "MB", label: "Mulai Berkembang", color: "text-amber-600 bg-amber-50 border-amber-200" },
    { value: "BSH", label: "Berkembang Sesuai Harapan", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { value: "SB", label: "Sangat Berkembang", color: "text-emerald-600 bg-emerald-50 border-emerald-200" }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col gap-3">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setAllTo('BSH')} className="font-bold text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-sm">Set Semua BSH</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAllTo('SB')} className="font-bold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 shadow-sm">Set Semua SB</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-bold text-slate-600 w-16 text-center">No</th>
              <th className="p-4 font-bold text-slate-600">Nama Siswa</th>
              <th className="p-4 font-bold text-slate-600 w-56 text-center">Predikat (Capaian)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">Belum ada siswa di kelas ini.</td>
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
                    <select 
                      value={student.score} 
                      onChange={(e) => handleScoreChange(student.id, e.target.value)}
                      className={`w-full h-11 px-3 rounded-lg border font-bold focus:ring-4 outline-none transition-all ${
                        student.score ? SCORE_OPTIONS.find(o => o.value === student.score)?.color : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <option value="" disabled>-- Pilih --</option>
                      {SCORE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.value} - {opt.label}</option>
                      ))}
                    </select>
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
          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold h-12 px-8 rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...</>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> Simpan Nilai Projek</>
          )}
        </Button>
      </div>
    </div>
  );
}
