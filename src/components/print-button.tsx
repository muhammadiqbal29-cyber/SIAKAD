"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow hover:bg-blue-700 transition-colors"
    >
      <Printer className="w-5 h-5 mr-2" />
      Cetak PDF / Print
    </button>
  );
}
