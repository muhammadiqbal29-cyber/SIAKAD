import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PlusCircle, FileText, CheckCircle2 } from "lucide-react";
import { InvoicesForm } from "./invoices-form";

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const classes = await prisma.class.findMany({
    orderBy: [{ gradeLevel: 'asc' }, { name: 'asc' }]
  });

  // Ambil history tagihan (group by title & type)
  const recentInvoices = await prisma.invoice.groupBy({
    by: ['title', 'type', 'amount', 'dueDate'],
    _count: { id: true },
    orderBy: { dueDate: 'desc' },
    take: 10
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tagihan & Keuangan</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Buat dan pantau tagihan masal untuk siswa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <InvoicesForm classes={classes} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                Riwayat Pembuatan Tagihan (Massal)
              </h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-sm">
                  <th className="p-4 font-bold text-slate-500">Judul Tagihan</th>
                  <th className="p-4 font-bold text-slate-500">Nominal</th>
                  <th className="p-4 font-bold text-slate-500">Jatuh Tempo</th>
                  <th className="p-4 font-bold text-slate-500 text-center">Jml Sasaran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">Belum ada tagihan yang dibuat.</td>
                  </tr>
                ) : (
                  recentInvoices.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{inv.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{inv.type}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        Rp {inv.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 font-medium text-slate-600">
                        {inv.dueDate ? format(new Date(inv.dueDate), 'dd MMM yyyy', { locale: id }) : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                          {inv._count.id} Siswa
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
