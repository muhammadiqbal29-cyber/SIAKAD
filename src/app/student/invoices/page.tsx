import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = 'force-dynamic';

export default async function StudentInvoicesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const invoices = await prisma.invoice.findMany({
    where: { studentId: session.user.id },
    orderBy: { dueDate: 'asc' }
  });

  const unpaidInvoices = invoices.filter(i => i.status === "UNPAID");
  const paidInvoices = invoices.filter(i => i.status === "PAID").sort((a, b) => {
    if (!a.paidAt || !b.paidAt) return 0;
    return b.paidAt.getTime() - a.paidAt.getTime();
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Tagihan SPP & Keuangan</h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">Informasi tagihan sekolah atas nama {session.user.name}</p>
      </div>

      {unpaidInvoices.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
          <div className="p-5 border-b border-red-100 bg-red-50 flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="font-extrabold text-red-800 text-lg">Belum Dibayar</h3>
            </div>
            <div className="text-right">
              <div className="text-xs text-red-600 font-bold uppercase">Total Tunggakan</div>
              <div className="text-xl font-black text-red-700">Rp {unpaidInvoices.reduce((a, c) => a + c.amount, 0).toLocaleString('id-ID')}</div>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {unpaidInvoices.map(inv => (
              <div key={inv.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xl">{inv.title}</h4>
                  <div className="text-sm font-medium text-slate-500 mt-1">Jenis: {inv.type}</div>
                  {inv.notes && <p className="text-sm text-slate-600 mt-2 italic">"{inv.notes}"</p>}
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-black text-red-600">Rp {inv.amount.toLocaleString('id-ID')}</div>
                  <div className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded mt-2">
                    Jatuh Tempo: {inv.dueDate ? format(new Date(inv.dueDate), 'dd MMM yyyy', { locale: id }) : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-sm text-slate-500 text-center font-medium">
            Silakan lakukan pembayaran melalui loket Kasir di Tata Usaha sekolah.
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-2xl font-extrabold text-emerald-800">Yeay! Bebas Tunggakan</h3>
          <p className="text-emerald-600 font-medium mt-2">Kamu tidak memiliki tagihan yang belum dibayar.</p>
        </div>
      )}

      {paidInvoices.length > 0 && (
        <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
            <h3 className="font-bold text-slate-800">Riwayat Pembayaran</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {paidInvoices.map(inv => (
              <div key={inv.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{inv.title}</h4>
                  <p className="text-sm font-medium text-emerald-600 mt-1">Rp {inv.amount.toLocaleString('id-ID')} - Lunas</p>
                </div>
                <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg text-right">
                  Dibayar pada:<br />
                  <span className="text-slate-800">{inv.paidAt ? format(new Date(inv.paidAt), 'dd MMMM yyyy HH:mm', { locale: id }) : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
