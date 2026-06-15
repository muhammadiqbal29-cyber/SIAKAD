"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TeacherChartsProps {
  classData: { className: string; avgScore: number }[];
  topicData: { topic: string; avgScore: number }[];
}

export function TeacherCharts({ classData, topicData }: TeacherChartsProps) {
  // Warnai bar berdasarkan nilai (merah jika di bawah 70, kuning 70-85, hijau > 85)
  const getBarColor = (score: number) => {
    if (score < 70) return '#ef4444'; // Red
    if (score < 85) return '#f59e0b'; // Amber
    return '#10b981'; // Emerald
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
      
      {/* Chart 1: Rata-rata per Kelas */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-extrabold text-slate-800">Komparasi Performa Antarkelas</h3>
          <p className="text-sm text-slate-500 font-medium">Bandingkan daya tangkap antarkelas yang Anda ajar.</p>
        </div>
        <div className="h-[300px] w-full">
          {classData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium italic">Belum ada data nilai tersedia.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="className" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${Number(value || 0).toFixed(1)}`, 'Rata-rata Nilai']}
                />
                <Bar dataKey="avgScore" radius={[6, 6, 0, 0]}>
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.avgScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Analisis Topik Pembelajaran */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-extrabold text-slate-800">Peta Diagnostik Tujuan Pembelajaran</h3>
          <p className="text-sm text-slate-500 font-medium">Identifikasi materi mana yang paling sulit dikuasai siswa.</p>
        </div>
        <div className="h-[300px] w-full">
          {topicData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-400 font-medium italic">Belum ada data topik tersedia.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topicData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="topic" type="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${Number(value || 0).toFixed(1)}`, 'Rata-rata Kelas']}
                />
                <Bar dataKey="avgScore" radius={[0, 6, 6, 0]}>
                  {topicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.avgScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}
