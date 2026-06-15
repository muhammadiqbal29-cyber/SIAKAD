"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function saveP5Scores(
  classId: string, 
  projectName: string, 
  dimension: string, 
  scores: { studentId: string, score: string }[]
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return { error: "Akses ditolak." };
  }

  if (!projectName || projectName.trim() === "") {
    return { error: "Nama Projek wajib diisi." };
  }

  if (!dimension || dimension.trim() === "") {
    return { error: "Dimensi Pancasila wajib diisi." };
  }

  try {
    await prisma.$transaction(
      scores.map(s => 
        prisma.p5Score.upsert({
          where: {
            studentId_classId_projectName_dimension: {
              studentId: s.studentId,
              classId,
              projectName,
              dimension
            }
          },
          update: {
            score: s.score
          },
          create: {
            studentId: s.studentId,
            classId,
            projectName,
            dimension,
            score: s.score
          }
        })
      )
    );

    revalidatePath(`/teacher/p5/${classId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Save P5 Score Error:", error);
    return { error: "Gagal menyimpan data nilai P5." };
  }
}
