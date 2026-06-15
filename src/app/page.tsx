import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Users, Trophy, Star, CheckCircle2 } from "lucide-react";
import { PPDBForm } from "@/components/ppdb-form";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Ambil 3 siswa berprestasi berdasarkan rata-rata nilai AcademicScore
  const academicScores = await prisma.academicScore.groupBy({
    by: ['studentId'],
    _avg: {
      score: true
    },
    orderBy: {
      _avg: {
        score: 'desc'
      }
    },
    take: 3
  });

  // Karena groupBy tidak mendukung 'include', kita fetch manual nama siswanya
  const topStudentsRaw = await prisma.user.findMany({
    where: { id: { in: academicScores.map(s => s.studentId) } },
    select: { id: true, name: true, classesHandled: false }
  });

  const topStudents = academicScores.map((score, index) => {
    const student = topStudentsRaw.find(s => s.id === score.studentId);
    return {
      rank: index + 1,
      name: student?.name || "Siswa Berprestasi",
      avg: score._avg.score?.toFixed(1) || "0"
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Navbar */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">SIAKAD</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#ppdb" className="hidden md:block text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Pendaftaran PPDB</Link>
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Masuk Sistem</Link>
            <Link href="/login" className="text-sm font-bold bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95">
              Portal Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col pt-20">
        <section className="relative overflow-hidden flex-1 py-16 lg:py-24">
          {/* Ornamen Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Kiri: Teks Promosi */}
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-sm mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
                  Pendaftaran PPDB Dibuka!
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                  Manajemen Sekolah <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Modern & Elegan</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mb-8 leading-relaxed">
                  Platform digital pintar terpadu. Mencakup Kurikulum Merdeka, Rapor P5, Presensi, hingga Pembayaran SPP dalam satu ekosistem canggih.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 hover:scale-105 hover:shadow-2xl transition-all group">
                    Masuk ke Portal
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link href="#ppdb" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-100 font-bold rounded-full hover:border-indigo-600 transition-colors">
                    Daftar Sekolah Sekarang
                  </Link>
                </div>
              </div>

              {/* Kanan: Hall of Fame */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-yellow-400 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 flex items-center">
                        <Trophy className="w-8 h-8 text-amber-500 mr-3" /> Hall of Fame
                      </h3>
                      <p className="text-slate-500 font-medium mt-1">Siswa Berprestasi Akademik Teratas</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {topStudents.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 font-medium italic">Belum ada data nilai tercatat di sistem.</div>
                    ) : (
                      topStudents.map((student) => (
                        <div key={student.rank} className="flex items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all group">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner mr-4 shrink-0 ${
                            student.rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-white' : 
                            student.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' : 
                            'bg-gradient-to-br from-orange-300 to-orange-400 text-white'
                          }`}>
                            {student.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-lg truncate">{student.name}</h4>
                            <div className="flex items-center text-sm font-bold text-slate-500 mt-0.5">
                              <Star className="w-4 h-4 text-amber-400 mr-1 fill-amber-400" />
                              Rata-rata: <span className="text-indigo-600 ml-1">{student.avg}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="bg-white py-20 border-t border-slate-100 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Mengapa Memilih Kami?</h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">Kami mengadopsi teknologi terdepan untuk memastikan proses pendidikan anak Anda terpantau secara transparan dan profesional.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-50 hover:bg-indigo-50 hover:scale-105 transition-all cursor-default group border border-transparent hover:border-indigo-100">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:text-indigo-600">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Kurikulum Merdeka</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Dukungan penuh untuk pencatatan Capaian Pembelajaran, Tujuan Pembelajaran, dan Projek P5 yang terintegrasi langsung dengan E-Rapor PDF.
                </p>
              </div>
              
              <div className="p-8 rounded-3xl bg-slate-50 hover:bg-emerald-50 hover:scale-105 transition-all cursor-default group border border-transparent hover:border-emerald-100">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:text-emerald-600">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Portal Orang Tua</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Orang tua dapat memantau jadwal pelajaran, rekap presensi, nilai akademik secara real-time langsung dari *smartphone*.
                </p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-50 hover:bg-amber-50 hover:scale-105 transition-all cursor-default group border border-transparent hover:border-amber-100">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:text-amber-600">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Manajemen Keuangan</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Sistem pembayaran SPP yang transparan dan akurat. Semua riwayat tagihan dan tunggakan tercatat rapi di dalam sistem.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PPDB Section */}
        <section id="ppdb" className="py-24 bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Tunggu Apa Lagi? <br/><span className="text-indigo-400">Bergabunglah Bersama Kami!</span></h2>
                <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
                  Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran ini telah dibuka. Segera daftarkan putra-putri Anda dan nikmati fasilitas pendidikan berstandar tinggi yang didukung teknologi modern.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center text-slate-300 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3" /> Kuota Terbatas untuk Tahun Ajaran Ini
                  </div>
                  <div className="flex items-center text-slate-300 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3" /> Pendaftaran Online 100% Gratis
                  </div>
                  <div className="flex items-center text-slate-300 font-bold">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-3" /> Layanan Konsultasi Pendidikan
                  </div>
                </div>
              </div>
              
              <div className="relative z-20">
                <PPDBForm />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-slate-500" />
            <span className="text-xl font-black tracking-tight text-slate-500">SIAKAD</span>
          </div>
          <p className="text-slate-600 font-medium text-sm max-w-md">
            Sistem Informasi Akademik Terpadu untuk Sekolah Modern. 
            <br/>&copy; 2026 Dibangun oleh Antigravity.
          </p>
        </div>
      </footer>
    </div>
  );
}
