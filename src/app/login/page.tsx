import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  // Jika sudah login, redirect sesuai Role
  if (session) {
    const role = session.user.role;
    if (role === "SUPERADMIN" || role === "ADMIN") redirect("/admin");
    if (role === "TEACHER") redirect("/teacher");
    if (role === "STUDENT") redirect("/student");
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background Ornaments (Aesthetic) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-200/40 blur-3xl mix-blend-multiply"></div>
        <div className="absolute top-[50%] -right-[10%] w-[50%] h-[60%] rounded-full bg-indigo-200/40 blur-3xl mix-blend-multiply"></div>
      </div>

      <div className="w-full max-w-md p-6 z-10">
        <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">SIAKAD</h1>
            <p className="text-slate-500 mt-2 font-medium">Sistem Informasi Akademik Yayasan</p>
          </div>
          
          <LoginForm />
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500 font-medium">
          &copy; 2026 Yayasan Pendidikan. All rights reserved.
        </div>
      </div>
    </div>
  );
}
