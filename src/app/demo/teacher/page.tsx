import { BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";
import { TeacherCharts } from "@/app/teacher/dashboard/teacher-charts";

export const dynamic = 'force-dynamic';

export default function DemoTeacherDashboard() {
  const sessionName = "Siti Aminah, S.Pd";

  // Data Dummy Diagnostik Guru
  const classData = [
    { className: "10-A", avgScore: 88.5 },
    { className: "10-B", avgScore: 82.3 },
    { className: "10-C", avgScore: 79.8 },
  ];

  const topicData = [
    { topic: "Aljabar Linear dan Matriks", avgScore: 92.5 },
    { topic: "Trigonometri Dasar", avgScore: 88.0 },
    { topic: "Geometri Ruang", avgScore: 76.5 },
    { topic: "Statistika dan Peluang", avgScore: 85.2 },
    { topic: "Kalkulus Dasar", avgScore: 71.0 },
  ];

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      <div className="bg-emerald-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">Selamat Datang, Bapak/Ibu {sessionName}!</h1>
          <p className="text-emerald-100 font-medium max-w-xl">
            Di Portal Guru ini, Anda bisa mengelola presensi siswa setiap hari dan mengisi nilai formatif (Tujuan Pembelajaran) dengan mudah.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="w-48 h-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Presensi Harian</h3>
          <p className="text-slate-500 font-medium mb-6">
            Jangan lupa untuk selalu mengecek kehadiran siswa di kelas Anda setiap hari sebelum memulai pelajaran.
          </p>
          <div className="inline-block px-5 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer">
            Isi Presensi Sekarang
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Penilaian Intrakurikuler</h3>
          <p className="text-slate-500 font-medium mb-6">
            Input capaian kompetensi siswa berdasarkan Tujuan Pembelajaran (TP) secara langsung.
          </p>
          <div className="inline-block px-5 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors cursor-pointer">
            Input Nilai
          </div>
        </div>
      </div>

      {/* Komponen Visualisasi Data Diagnostik */}
      <TeacherCharts classData={classData} topicData={topicData} />

    </div>
  );
}
