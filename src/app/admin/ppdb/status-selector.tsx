"use client";

import { useState } from "react";
import { updateProspectiveStatus } from "@/app/actions/ppdb";
import { Loader2 } from "lucide-react";

export function StatusSelector({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setIsUpdating(true);
    await updateProspectiveStatus(id, e.target.value);
    setIsUpdating(false);
  }

  return (
    <div className="relative inline-block w-32">
      <select 
        value={currentStatus}
        onChange={handleChange}
        disabled={isUpdating}
        className={`w-full appearance-none px-3 py-1.5 text-xs font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
          currentStatus === 'NEW' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          currentStatus === 'FOLLOW_UP' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          currentStatus === 'REGISTERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          'bg-slate-50 text-slate-700 border-slate-200'
        }`}
      >
        <option value="NEW">Baru Masuk</option>
        <option value="FOLLOW_UP">Follow Up</option>
        <option value="REGISTERED">Telah Daftar</option>
      </select>
      {isUpdating && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
        </div>
      )}
    </div>
  );
}
