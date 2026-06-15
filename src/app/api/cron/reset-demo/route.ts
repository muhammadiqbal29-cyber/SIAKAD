import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    // Verifikasi Vercel Cron Secret untuk keamanan
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 1. Hapus semua data (urutan dari tabel paling bawah ke tabel induk)
    await prisma.academicScore.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.p5Score.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.class.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();
    await prisma.academicYear.deleteMany();
    await prisma.school.deleteMany();
    await prisma.prospectiveStudent.deleteMany();

    // 2. Buat kembali data default (School, Admin, AcademicYear)
    const school = await prisma.school.create({
      data: {
        name: "SMA Plus Yayasan Nusantara",
        level: "SMA",
      }
    });

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

    return NextResponse.json({ success: true, message: "Database berhasil di-reset!" });
  } catch (error: any) {
    console.error('Reset error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
