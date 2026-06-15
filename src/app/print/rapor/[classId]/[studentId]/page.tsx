import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PrintButton } from "@/components/print-button";

export const dynamic = 'force-dynamic';

export default async function PrintRaporPage(props: { params: Promise<{ classId: string; studentId: string }> }) {
  const params = await props.params;

  const student = await prisma.user.findUnique({
    where: { id: params.studentId }
  });

  const classData = await prisma.class.findUnique({
    where: { id: params.classId },
    include: {
      school: true,
      academicYear: true,
      homeroom: true
    }
  });

  if (!student || !classData) notFound();

  // 1. Ambil Nilai Intrakurikuler (Akademik)
  const academicScores = await prisma.academicScore.findMany({
    where: { studentId: params.studentId, classId: params.classId },
    include: { subject: true }
  });

  // Group by Subject
  type SubjectStats = {
    name: string;
    total: number;
    count: number;
    avg: number;
    formatives: { topic: string; score: number }[];
  };
  const subjectScores: Record<string, SubjectStats> = {};
  
  for (const s of academicScores) {
    if (!subjectScores[s.subjectId]) {
      subjectScores[s.subjectId] = { name: s.subject.name, total: 0, count: 0, avg: 0, formatives: [] };
    }
    subjectScores[s.subjectId].total += s.score;
    subjectScores[s.subjectId].count += 1;
    
    if (s.type === "FORMATIVE") {
      subjectScores[s.subjectId].formatives.push({ topic: s.topicName, score: s.score });
    }
  }
  
  const subjects = Object.values(subjectScores).map(s => {
    const avg = Math.round(s.total / s.count);
    
    // Generate Descriptive Narrative based on Highest and Lowest Formative
    let description = "-";
    if (s.formatives.length > 0) {
      s.formatives.sort((a, b) => b.score - a.score);
      const highest = s.formatives[0];
      const lowest = s.formatives[s.formatives.length - 1];
      
      if (s.formatives.length === 1) {
        description = `Menunjukkan pemahaman yang ${highest.score >= 80 ? 'sangat baik' : 'cukup'} dalam ${highest.topic}.`;
      } else {
        description = `Menunjukkan penguasaan yang sangat baik dalam ${highest.topic}, namun perlu bimbingan lebih pada ${lowest.topic}.`;
      }
    }

    return {
      name: s.name,
      avg: avg,
      description
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // 2. Ambil Nilai P5
  const p5Scores = await prisma.p5Score.findMany({
    where: { studentId: params.studentId, classId: params.classId }
  });

  const p5Projects: Record<string, any[]> = {};
  for (const p of p5Scores) {
    if (!p5Projects[p.projectName]) p5Projects[p.projectName] = [];
    p5Projects[p.projectName].push(p);
  }

  // 3. Ambil Absensi
  const attendances = await prisma.attendance.findMany({
    where: { studentId: params.studentId, classId: params.classId }
  });

  const attStats = { sakit: 0, izin: 0, alpa: 0 };
  for (const a of attendances) {
    if (a.status === "SICK") attStats.sakit++;
    if (a.status === "EXCUSED") attStats.izin++;
    if (a.status === "ABSENT") attStats.alpa++;
  }

  return (
    <div className="bg-white min-h-screen text-black p-8 font-serif mx-auto max-w-4xl" style={{ fontSize: '14px' }}>
      
      {/* Tombol Print (Sembunyi saat diprint) */}
      <div className="mb-8 print:hidden flex justify-end">
        <PrintButton />
      </div>

      {/* HEADER */}
      <div className="text-center border-b-4 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider">{classData.school.name}</h1>
        <h2 className="text-xl font-bold">LAPORAN HASIL BELAJAR (RAPOR)</h2>
        <p className="text-sm mt-1">Kurikulum Merdeka</p>
      </div>

      {/* IDENTITAS */}
      <table className="w-full mb-8 font-bold text-sm">
        <tbody>
          <tr>
            <td className="w-32 py-1">Nama Peserta Didik</td>
            <td className="w-4">:</td>
            <td className="uppercase">{student.name}</td>
            
            <td className="w-32 py-1">Kelas</td>
            <td className="w-4">:</td>
            <td>{classData.name}</td>
          </tr>
          <tr>
            <td className="py-1">NISN</td>
            <td>:</td>
            <td>{student.nisn || "-"}</td>
            
            <td className="py-1">Tahun Ajaran</td>
            <td>:</td>
            <td>{classData.academicYear.year} - {classData.academicYear.semester === 1 ? 'Ganjil' : 'Genap'}</td>
          </tr>
        </tbody>
      </table>

      {/* NILAI INTRAKURIKULER */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-2">A. Nilai Akademik (Intrakurikuler)</h3>
        <table className="w-full border-collapse border border-black text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 w-12 text-center">No</th>
              <th className="border border-black p-2">Mata Pelajaran</th>
              <th className="border border-black p-2 w-24 text-center">Nilai Akhir</th>
              <th className="border border-black p-2 w-32 text-center">Capaian</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr><td colSpan={4} className="border border-black p-4 text-center italic">Belum ada nilai diinput</td></tr>
            ) : (
              subjects.map((sub, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 text-center align-top">{idx + 1}</td>
                  <td className="border border-black p-2 align-top font-bold">{sub.name}</td>
                  <td className="border border-black p-2 text-center text-lg font-bold align-top">{sub.avg}</td>
                  <td className="border border-black p-2 text-sm leading-relaxed text-justify">
                    {sub.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* NILAI P5 */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-2">B. Projek Penguatan Profil Pelajar Pancasila (P5)</h3>
        {Object.keys(p5Projects).length === 0 ? (
          <div className="border border-black p-4 italic text-sm">Belum ada data projek P5.</div>
        ) : (
          Object.keys(p5Projects).map((projName, idx) => (
            <div key={idx} className="mb-4">
              <div className="font-bold bg-gray-100 border border-black p-2 border-b-0">
                Projek {idx + 1}: {projName}
              </div>
              <table className="w-full border-collapse border border-black text-sm">
                <thead>
                  <tr>
                    <th className="border border-black p-2 text-left">Dimensi</th>
                    <th className="border border-black p-2 w-24 text-center">BB</th>
                    <th className="border border-black p-2 w-24 text-center">MB</th>
                    <th className="border border-black p-2 w-24 text-center">BSH</th>
                    <th className="border border-black p-2 w-24 text-center">SB</th>
                  </tr>
                </thead>
                <tbody>
                  {p5Projects[projName].map((score, sIdx) => (
                    <tr key={sIdx}>
                      <td className="border border-black p-2">{score.dimension}</td>
                      <td className="border border-black p-2 text-center text-lg font-bold">{score.score === 'BB' ? '✓' : ''}</td>
                      <td className="border border-black p-2 text-center text-lg font-bold">{score.score === 'MB' ? '✓' : ''}</td>
                      <td className="border border-black p-2 text-center text-lg font-bold">{score.score === 'BSH' ? '✓' : ''}</td>
                      <td className="border border-black p-2 text-center text-lg font-bold">{score.score === 'SB' ? '✓' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
        <div className="text-xs mt-1">
          Keterangan: BB (Belum Berkembang), MB (Mulai Berkembang), BSH (Berkembang Sesuai Harapan), SB (Sangat Berkembang)
        </div>
      </div>

      {/* ABSENSI */}
      <div className="mb-12">
        <h3 className="font-bold text-lg mb-2">C. Ketidakhadiran</h3>
        <table className="w-64 border-collapse border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-2">Sakit</td>
              <td className="border border-black p-2 text-center font-bold">{attStats.sakit} hari</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Izin</td>
              <td className="border border-black p-2 text-center font-bold">{attStats.izin} hari</td>
            </tr>
            <tr>
              <td className="border border-black p-2">Tanpa Keterangan</td>
              <td className="border border-black p-2 text-center font-bold">{attStats.alpa} hari</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TTD */}
      <div className="flex justify-between mt-16 text-sm">
        <div className="text-center w-64">
          <p>Mengetahui,</p>
          <p>Orang Tua / Wali</p>
          <br /><br /><br /><br />
          <p className="border-b border-black w-48 mx-auto"></p>
        </div>
        <div className="text-center w-64">
          <p>Jakarta, {format(new Date(), 'dd MMMM yyyy', { locale: id })}</p>
          <p>Wali Kelas</p>
          <br /><br /><br /><br />
          <p className="font-bold underline">{classData.homeroom?.name || "..........................."}</p>
          <p>NUPTK: {classData.homeroom?.nuptk || "-"}</p>
        </div>
      </div>

    </div>
  );
}
