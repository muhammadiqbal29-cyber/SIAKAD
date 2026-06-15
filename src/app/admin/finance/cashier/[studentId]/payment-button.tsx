"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { payInvoice } from "@/app/actions/finance";
import { Loader2, Banknote } from "lucide-react";
import { useRouter } from "next/navigation";

export function PaymentButton({ invoiceId }: { invoiceId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handlePay() {
    if (!confirm("Konfirmasi: Tandai tagihan ini sebagai LUNAS?")) return;

    setIsLoading(true);
    const res = await payInvoice(invoiceId);
    setIsLoading(false);

    if (res?.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  }

  return (
    <Button 
      onClick={handlePay}
      disabled={isLoading}
      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-10 px-5 rounded-xl shadow-sm shrink-0"
    >
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Banknote className="w-4 h-4 mr-2" />}
      Bayar Lunas
    </Button>
  );
}
