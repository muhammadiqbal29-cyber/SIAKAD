"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
