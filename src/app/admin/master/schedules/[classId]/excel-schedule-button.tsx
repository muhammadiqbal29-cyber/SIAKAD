"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { uploadSchedules } from "@/app/actions/schedule";
import { useRouter } from "next/navigation";

interface ExcelScheduleButtonProps {
  classId: string;
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}

export function ExcelScheduleButton({ classId, subjects, teachers }: ExcelScheduleButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleDownloadTemplate() {
    const wb = XLSX.utils.book_new();

    // 1. Sheet Jadwal (Kosong untuk diisi)
    const scheduleData = [
      ["Hari (1=Sen, 2=Sel, 3=Rab, 4=Kam, 5=Jum, 6=Sab)", "Jam Mulai (HH:MM)", "Jam Selesai (HH:MM)", "ID Mapel", "ID Guru"],
      [1, "07:00", "08:30", "COPY_PASTE_DARI_SHEET_MAPEL", "COPY_PASTE_DARI_SHEET_GURU"],
      [1, "08:30", "10:00", "", ""],
      [2, "07:00", "08:30", "", ""]
    ];
    const wsSchedule = XLSX.utils.aoa_to_sheet(scheduleData);
    wsSchedule['!cols'] = [{ wch: 45 }, { wch: 20 }, { wch: 20 }, { wch: 35 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsSchedule, "1. Template Jadwal");

    // 2. Sheet Mapel
    const subjectData = [
      ["Nama Mapel", "ID Mapel (Copy)"],
      ...subjects.map(s => [s.name, s.id])
    ];
    const wsSubject = XLSX.utils.aoa_to_sheet(subjectData);
    wsSubject['!cols'] = [{ wch: 40 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsSubject, "2. Referensi Mapel");

    // 3. Sheet Guru
    const teacherData = [
      ["Nama Guru", "ID Guru (Copy)"],
      ...teachers.map(t => [t.name, t.id])
    ];
    const wsTeacher = XLSX.utils.aoa_to_sheet(teacherData);
    wsTeacher['!cols'] = [{ wch: 40 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsTeacher, "3. Referensi Guru");

    XLSX.writeFile(wb, `Template_Jadwal_Kelas.xlsx`);
  }

  function handleUploadExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        // Asumsi data ada di Sheet pertama
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        
        // Skip baris pertama (Header)
        const rows = data.slice(1);
        
        const payload: any[] = [];
        for (const row of rows) {
          const dayOfWeek = parseInt(row[0]);
          const startTime = row[1]?.toString().trim();
          const endTime = row[2]?.toString().trim();
          const subjectId = row[3]?.toString().trim();
          const teacherId = row[4]?.toString().trim();

          // Validasi sederhana: Abaikan baris yang kosong atau masih pakai string placeholder
          if (
            dayOfWeek >= 1 && dayOfWeek <= 7 &&
            startTime && endTime &&
            subjectId && subjectId.startsWith("c") && 
            teacherId && teacherId.startsWith("c")
          ) {
            payload.push({
              dayOfWeek,
              startTime,
              endTime,
              subjectId,
              teacherId
            });
          }
        }

        if (payload.length === 0) {
          throw new Error("Tidak ada data jadwal valid yang ditemukan.");
        }

        // Kirim ke server action
        const result = await uploadSchedules(classId, payload);
        
        if (result.error) {
          setMessage({ type: 'error', text: result.error });
        } else {
          setMessage({ type: 'success', text: `Berhasil mengimpor ${payload.length} jadwal.` });
          router.refresh();
          setTimeout(() => setMessage(null), 5000);
        }

      } catch (err: any) {
        console.error(err);
        setMessage({ type: 'error', text: err.message || "Gagal memproses file Excel." });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          onClick={handleDownloadTemplate} 
          disabled={isLoading}
          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          Upload Excel
        </Button>
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleUploadExcel}
        />
      </div>
      
      {message && (
        <div className={`flex items-center text-sm font-bold px-3 py-1.5 rounded-lg border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <AlertCircle className="w-4 h-4 mr-1.5" />}
          {message.text}
        </div>
      )}
    </div>
  );
}
