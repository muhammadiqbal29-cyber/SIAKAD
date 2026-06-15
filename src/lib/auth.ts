import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt", // Menggunakan JWT karena kita memakai Credentials Provider
  },
  pages: {
    signIn: "/login", // Halaman login kustom (akan kita buat nanti di Tahap 4/View)
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email/NISN/NUPTK", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Kredensial tidak lengkap");
        }

        // Login Fleksibel: Siswa pakai NISN, Guru pakai NUPTK, Admin pakai Email
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { nisn: credentials.email },
              { nuptk: credentials.email },
            ],
          },
        });

        if (!user) {
          throw new Error("Pengguna tidak ditemukan");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: user.schoolId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.schoolId = user.schoolId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.schoolId = token.schoolId as string | null;
      }
      return session;
    },
  },
};
