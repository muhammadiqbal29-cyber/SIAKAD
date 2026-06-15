import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: { id: true, name: true, email: true, nuptk: true }
  });

  return (
    <div className="p-8 font-mono">
      <h1 className="text-2xl font-bold mb-4">Daftar Guru untuk Testing</h1>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-slate-100">
            <th className="p-2 border">Nama</th>
            <th className="p-2 border">Email (Untuk Login)</th>
            <th className="p-2 border">NUPTK (Gunakan sebagai Password)</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(t => (
            <tr key={t.id}>
              <td className="p-2 border">{t.name}</td>
              <td className="p-2 border text-blue-600 font-bold">{t.email || t.nuptk}</td>
              <td className="p-2 border text-red-600 font-bold">{t.nuptk}</td>
            </tr>
          ))}
          {teachers.length === 0 && (
            <tr><td colSpan={3} className="p-4 text-center">Belum ada data guru. Silakan buat di Admin &gt; Data Guru.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
