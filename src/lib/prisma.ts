import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const createPrismaClient = () => {
  // Hanya inisialisasi jika ada string koneksi
  if (connectionString) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter, log: ["query"] });
  }
  // Fallback tanpa adapter jika sedang build/tanpa koneksi
  return new PrismaClient();
};

export const prisma =
  globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
