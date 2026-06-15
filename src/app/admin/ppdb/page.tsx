import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { StatusSelector } from "./status-selector";
import { Users, Phone, Inbox, Briefcase } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PPDBPage() {
  const leads = await prisma.prospectiveStudent.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    followUp: leads.filter(l => l.status === 'FOLLOW_UP').length,
    registered: leads.filter(l => l.status === 'REGISTERED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data PPDB / Calon Siswa</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manajemen *Leads* pendaftar dari Landing Page</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500">Total Pendaftar</div>
            <div className="text-2xl font-black text-slate-800">{stats.total}</div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 relative z-10">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-bold text-blue-600/80">Prospek Baru</div>
            <div className="text-2xl font-black text-blue-700">{stats.new}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 relative z-10">
            <Phone className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-bold text-amber-600/80">Follow Up</div>
            <div className="text-2xl font-black text-amber-700">{stats.followUp}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 relative z-10">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-bold text-emerald-600/80">Resmi Daftar</div>
            <div className="text-2xl font-black text-emerald-700">{stats.registered}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 font-bold text-slate-600">Nama Calon Siswa</th>
                <th className="p-4 font-bold text-slate-600">Kontak</th>
                <th className="p-4 font-bold text-slate-600">Asal Sekolah</th>
                <th className="p-4 font-bold text-slate-600">Tgl Masuk</th>
                <th className="p-4 font-bold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">Belum ada data pendaftar.</td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-extrabold text-slate-800">{lead.name}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-700">{lead.phone}</div>
                      {lead.email && <div className="text-xs font-medium text-slate-500">{lead.email}</div>}
                    </td>
                    <td className="p-4 font-medium text-slate-600">{lead.previousSchool || "-"}</td>
                    <td className="p-4 text-sm font-medium text-slate-500">{format(lead.createdAt, "dd MMM yyyy")}</td>
                    <td className="p-4">
                      <StatusSelector id={lead.id} currentStatus={lead.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
