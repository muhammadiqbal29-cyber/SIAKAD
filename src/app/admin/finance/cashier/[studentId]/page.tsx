import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PaymentButton } from "./payment-button";

export const dynamic = 'force-dynamic';

export default async function CashierDetailPage(props: { params: Promise<{ studentId: string }> }) {
  const params = await props.params;

  const student = await prisma.user.findUnique({
    where: { id: params.studentId },
    include: {
      enrollments: {
        include: { class: true },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!student || student.role !== "STUDENT") notFound();

  const currentClass = student.enrollments[0]?.class;

  const invoices = await prisma.invoice.findMany({
    where: { studentId: params.studentId },
    orderBy: { dueDate: 'asc' }
  });

  const unpaidInvoices = invoices.filter(i => i.status === "UNPAID");
  const paidInvoices = invoices.filter(i => i.status === "PAID").sort((a, b) => {
    if (!a.paidAt || !b.paidAt) return 0;
    return b.paidAt.getTime() - a.paidAt.getTime();
  });

  return (
    <div className="space-y-6">
      <Link href="/admin/finance/cashier" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Pencarian Kasir
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Profil Siswa */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
            <div className="p-8 text-center border-b border-slate-100 bg-slate-50">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <User className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800">{student.name}</h2>
              <p className="text-slate-500 font-medium mt-1">
                {currentClass ? `Kelas ${currentClass.name}` : "Belum masuk kelas"}
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">NISN</div>
                <div className="font-bold text-slate-700">{student.nisn || "-"}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</div>
                <div className="font-bold text-slate-700">{student.email || "-"}</div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Tunggakan</div>
                <div className="text-2xl font-black text-red-600">
                  Rp {unpaidInvoices.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tagihan */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tagihan Belum Lunas */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
            <div className="p-5 border-b border-red-100 bg-red-50 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="font-bold text-red-800">Tagihan Belum Lunas ({unpaidInvoices.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {unpaidInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">
                  Yeay! Tidak ada tagihan yang tertunggak.
                </div>
              ) : (
                unpaidInvoices.map(inv => (
                  <div key={inv.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{inv.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Rp {inv.amount.toLocaleString('id-ID')}</span>
                        {inv.dueDate && (
                          <span className="text-xs font-medium text-slate-500">
                            Jatuh Tempo: {format(new Date(inv.dueDate), 'dd MMM yyyy', { locale: id })}
                          </span>
                        )}
                      </div>
                      {inv.notes && <p className="text-xs text-slate-500 mt-2">{inv.notes}</p>}
                    </div>
                    <PaymentButton invoiceId={inv.id} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Riwayat Lunas */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
              <h3 className="font-bold text-slate-800">Riwayat Pembayaran</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {paidInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">
                  Belum ada riwayat pembayaran.
                </div>
              ) : (
                paidInvoices.map(inv => (
                  <div key={inv.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800">{inv.title}</h4>
                      <p className="text-sm font-medium text-emerald-600 mt-1">Rp {inv.amount.toLocaleString('id-ID')} - Lunas</p>
                    </div>
                    <div className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg text-right">
                      Dibayar pada:<br />
                      {inv.paidAt ? format(new Date(inv.paidAt), 'dd MMM yyyy HH:mm', { locale: id }) : '-'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
