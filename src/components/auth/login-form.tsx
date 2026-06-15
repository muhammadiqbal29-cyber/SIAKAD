"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Memanggil fungsi signIn dari NextAuth (menuju ke Controller di route.ts)
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.refresh(); // Memicu pengecekan session di Server Component (page.tsx)
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">Identitas Pengguna</Label>
        <Input 
          id="email" 
          type="text" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email / NISN / NUPTK" 
          className="h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">Kata Sandi</Label>
        </div>
        <Input 
          id="password" 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••" 
          className="h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Mengautentikasi...
          </>
        ) : "Masuk ke Sistem"}
      </Button>
    </form>
  );
}
