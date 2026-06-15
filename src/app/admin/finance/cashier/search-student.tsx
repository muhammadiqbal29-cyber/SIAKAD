"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User } from "lucide-react";

type StudentData = { id: string, name: string, nisn: string | null };

export function SearchStudent({ students }: { students: StudentData[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = query.length >= 2 
    ? students.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) || 
        (s.nisn && s.nisn.includes(query))
      ).slice(0, 5) // limit to top 5 results
    : [];

  return (
    <div className="relative w-full">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-5 bg-white border-2 border-slate-200 rounded-2xl text-lg font-bold shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
          placeholder="Ketik Nama atau NISN siswa..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query.length >= 2 && (
        <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {filtered.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {filtered.map((student) => (
                <li key={student.id}>
                  <button
                    onClick={() => router.push(`/admin/finance/cashier/${student.id}`)}
                    className="w-full text-left px-6 py-4 flex items-center hover:bg-indigo-50 transition-colors focus:bg-indigo-50 outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-4 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-800 text-lg">{student.name}</div>
                      <div className="text-sm font-medium text-slate-500">NISN: {student.nisn || "-"}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center text-slate-500 font-medium">
              Siswa tidak ditemukan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
