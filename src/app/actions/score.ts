"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function saveScores(
  classId: string, 
  subjectId: string, 
  topicName: string, 
  type: string,
  scores: { studentId: string, score: number }[]
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") {
    return { error: "Akses ditolak." };
  }

  if (!topicName || topicName.trim() === "") {
    return { error: "Nama Topik / Tujuan Pembelajaran wajib diisi." };
  }

  try {
    await prisma.$transaction(
      scores.map(s => 
        prisma.academicScore.upsert({
          where: {
            studentId_classId_subjectId_type_topicName: {
              studentId: s.studentId,
              classId,
              subjectId,
              type,
              topicName
            }
          },
          update: {
            score: s.score
          },
          create: {
            studentId: s.studentId,
            classId,
            subjectId,
            type,
            topicName,
            score: s.score
          }
        })
      )
    );

    revalidatePath(`/teacher/scores/${classId}/${subjectId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Save Score Error:", error);
    return { error: "Gagal menyimpan data nilai." };
  }
}
