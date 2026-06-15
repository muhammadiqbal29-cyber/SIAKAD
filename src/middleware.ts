import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Proteksi rute berdasarkan Role (RBAC)
    if (pathname.startsWith("/superadmin") && token?.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    
    // Admin Unit / Kepala Sekolah
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN" && token?.role !== "SUPERADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Guru & Print
    if ((pathname.startsWith("/teacher") || pathname.startsWith("/print")) && token?.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Siswa
    if (pathname.startsWith("/student") && token?.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // User harus memiliki token (sudah login) untuk masuk ke rute-rute di bawah
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Rute (View) yang diproteksi oleh Middleware (Controller) ini
  matcher: [
    "/superadmin/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/print/:path*",
  ],
};
