"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Save, AlertCircle, Download, Upload } from "lucide-react";
import { saveScores } from "@/app/actions/score";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface Student {
  id: string;
  name: string;
  nisn: string | null;
  score: number;
}

export function ClientScoreForm({ classId, subjectId, topicName, type, initialStudents }: { classId: string, subjectId: string, topicName: string, type: string, initialStudents: Student[] }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDownloadTemplate() {
    const wsData = [
      ["ID_SISTEM (JANGAN DIUBAH)", "No", "NISN", "Nama Siswa", "Nilai (0-100)"],
      ...students.map((s, idx) => [s.id, idx + 1, s.nisn || "-", s.name, s.score || 0])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Set column widths
    ws['!cols'] = [{ wch: 30 }, { wch: 5 }, { wch: 15 }, { wch: 35 }, { wch: 15 }];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Format Nilai");
    XLSX.writeFile(wb, `Template_Nilai_${topicName.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  }

  function handleUploadExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        
        // Skip header row
        const rows = data.slice(1);
        let updatedCount = 0;

        setStudents(prev => {
          const newStudents = [...prev];
          for (const row of rows) {
            const studentId = row[0]; // ID_SISTEM
            const rawScore = row[4];  // Nilai
            
            if (studentId && rawScore !== undefined) {
              const parsedScore = Math.min(100, Math.max(0, Number(rawScore) || 0));
              const idx = newStudents.findIndex(s => s.id === studentId);
              if (idx !== -1) {
                newStudents[idx].score = parsedScore;
                updatedCount++;
              }
            }
          }
          return newStudents;
        });
        
        setMessage({ type: 'success', text: `Berhasil sinkronisasi ${updatedCount} nilai dari Excel!` });
        setTimeout(() => setMessage(null), 3000);
      } catch (err) {
        setMessage({ type: 'error', text: "Gagal membaca file Excel. Pastikan menggunakan format template." });
      }
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  }

  function handleScoreChange(studentId: string, val: string) {
    const num = Math.min(100, Math.max(0, Number(val) || 0)); // Validasi 0-100
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, score: num } : s));
  }

  async function handleSave() {
    setIsLoading(true);
    setMessage(null);
    
    const payload = students.map(s => ({ studentId: s.id, score: s.score }));
    const result = await saveScores(classId, subjectId, topicName, type, payload);
    
    setIsLoading(false);
    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: "Nilai berhasil disimpan!" });
      router.refresh();
      
      setTimeout(() => setMessage(null), 3000);
    }
  }

  // Hitung rata-rata kelas
  const average = students.length > 0 ? (students.reduce((acc, curr) => acc + curr.score, 0) / students.length).toFixed(1) : "0";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Menilai Topik ({type === 'FORMATIVE' ? 'Formatif' : 'Sumatif'}):</div>
          <div className="text-lg font-extrabold text-blue-700 bg-blue-100 px-4 py-1.5 rounded-lg border border-blue-200 shadow-sm inline-block">
            {topicName}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-4 text-sm font-bold bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-500">Rata-rata:</span>
            <span className={`text-xl ${Number(average) >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{average}</span>
          </div>
          
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="h-10 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold">
            <Download className="w-4 h-4 mr-2" /> Template
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-10 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold">
            <Upload className="w-4 h-4 mr-2" /> Upload Excel
          </Button>
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleUploadExcel}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-bold text-slate-600 w-16 text-center">No</th>
              <th className="p-4 font-bold text-slate-600">Nama Siswa</th>
              <th className="p-4 font-bold text-slate-600 text-center w-48">Nilai (0-100)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-500 font-medium">Belum ada siswa di kelas ini.</td>
              </tr>
            ) : (
              students.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-800">{student.name}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">NISN: {student.nisn || "-"}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={student.score === 0 && !message ? "" : student.score} // Trik UX: Kosong saat awal load jika 0, tapi tampilkan jika sudah disave
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        className={`w-24 text-center h-12 rounded-xl border font-bold text-lg transition-all focus:ring-4 outline-none ${
                          student.score >= 75 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-100' 
                            : student.score > 0 
                              ? 'bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500 focus:ring-amber-100'
                              : 'bg-slate-50 text-slate-700 border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                        placeholder="0"
                      />
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold h-12 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...</>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> Simpan Semua Nilai</>
          )}
        </Button>
      </div>
    </div>
  );
}
