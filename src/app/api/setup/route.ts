import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // 1. Cek apakah Superadmin sudah ada
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@yayasan.com" }
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Database sudah diinisialisasi sebelumnya!" });
    }

    // 2. Buat Sekolah/Yayasan Induk Pertama
    const school = await prisma.school.create({
      data: {
        name: "SMA Plus Yayasan Nusantara",
        level: "SMA",
      }
    });

    // 3. Buat Akun Superadmin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await prisma.user.create({
      data: {
        name: "Superadmin Yayasan",
        email: "admin@yayasan.com",
        password: hashedPassword,
        role: "SUPERADMIN",
        schoolId: school.id,
      }
    });

    await prisma.academicYear.create({
      data: {
        year: "2024/2025",
        semester: 1,
        isActive: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Berhasil! Akun Superadmin dan Data Yayasan awal telah dibuat.",
      credentials: {
        email: "admin@yayasan.com",
        password: "admin123"
      }
    });

  } catch (error: any) {
    console.error("Setup Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
