import { getSession } from "@/lib/actions/session";
import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscar submissões dos exercícios do professor
    const submissions = await prisma.submission.findMany({
      where: {
        exercise: {
          teacherId: session.id
        }
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        exercise: {
          select: {
            id: true,
            title: true,
            description: true,
            exercises: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limitar a 50 submissões mais recentes
    });

    return NextResponse.json(submissions);

  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
