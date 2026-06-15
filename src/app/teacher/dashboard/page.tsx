import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TeacherCharts } from "./teacher-charts";

export const dynamic = 'force-dynamic';

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") redirect("/login");

  // Ekstraksi Data Diagnostik Guru
  // 1. Ambil jadwal guru untuk mengetahui kombinasi Kelas & Mapel yang ia ajar
  const schedules = await prisma.schedule.findMany({
    where: { teacherId: session.user.id },
    select: { classId: true, subjectId: true, class: true }
  });

  // Hapus duplikasi jika mengajar mapel yang sama di kelas yang sama lebih dari 1x seminggu
  const uniqueCombos = Array.from(new Set(schedules.map(s => JSON.stringify({ classId: s.classId, subjectId: s.subjectId }))))
    .map(str => JSON.parse(str));

  let classData: any[] = [];
  let topicData: any[] = [];

  if (uniqueCombos.length > 0) {
    // 2. Ambil seluruh AcademicScore yang relevan dengan kombinasi yang diajarnya
    const scores = await prisma.academicScore.findMany({
      where: {
        OR: uniqueCombos.map((combo: any) => ({
          classId: combo.classId,
          subjectId: combo.subjectId
        }))
      },
      include: { class: true }
    });

    // 3. Agregasi Rata-rata per Kelas (Class Average)
    const classGroups: Record<string, { total: number; count: number }> = {};
    // 4. Agregasi Rata-rata per Topik/TP (Topic Analysis)
    const topicGroups: Record<string, { total: number; count: number }> = {};

    scores.forEach(score => {
      // Kelompokkan per kelas
      const className = score.class.name;
      if (!classGroups[className]) classGroups[className] = { total: 0, count: 0 };
      classGroups[className].total += score.score;
      classGroups[className].count += 1;

      // Kelompokkan per Topik (hanya Formatif / Tujuan Pembelajaran)
      if (score.type === "FORMATIVE" && score.topicName) {
        const topic = score.topicName;
        if (!topicGroups[topic]) topicGroups[topic] = { total: 0, count: 0 };
        topicGroups[topic].total += score.score;
        topicGroups[topic].count += 1;
      }
    });

    classData = Object.keys(classGroups).map(className => ({
      className,
      avgScore: Number((classGroups[className].total / classGroups[className].count).toFixed(1))
    })).sort((a, b) => b.avgScore - a.avgScore);

    topicData = Object.keys(topicGroups).map(topic => ({
      // Potong nama topik jika kepanjangan (misal lebih dari 25 karakter)
      topic: topic.length > 25 ? topic.substring(0, 25) + "..." : topic,
      avgScore: Number((topicGroups[topic].total / topicGroups[topic].count).toFixed(1))
    })).sort((a, b) => b.avgScore - a.avgScore); // Diurutkan supaya yang tertinggi di atas
  }

  return (
    <div className="space-y-8">
      <div className="bg-emerald-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">Selamat Datang, Bapak/Ibu {session.user.name}!</h1>
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
          <Link href="/teacher/attendances" className="inline-block px-5 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors">
            Isi Presensi Sekarang
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Penilaian Intrakurikuler</h3>
          <p className="text-slate-500 font-medium mb-6">
            Input capaian kompetensi siswa berdasarkan Tujuan Pembelajaran (TP) secara langsung.
          </p>
          <Link href="/teacher/scores" className="inline-block px-5 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors">
            Input Nilai
          </Link>
        </div>
      </div>

      {/* Komponen Visualisasi Data Diagnostik */}
      <TeacherCharts classData={classData} topicData={topicData} />

    </div>
  );
}
