import {getSession} from "@/lib/actions/session";
import prisma from "@/lib/db/prisma";
import {NextRequest, NextResponse} from "next/server";

export async function GET(
  request: NextRequest,
  {params}: {params: Promise<{submissionId: string;}>;}
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "teacher") {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    const {submissionId} = await params;

    // Buscar a submissão com todos os detalhes
    const submission = await prisma.submission.findUnique({
      where: {id: submissionId},
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
            teacherId: true,
            exercises: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({error: "Submission not found"}, {status: 404});
    }

    // Verificar se o professor tem acesso a esta submissão
    if (submission.exercise.teacherId !== session.id) {
      return NextResponse.json({error: "Access denied"}, {status: 403});
    }

    return NextResponse.json(submission);

  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      {error: "Internal server error"},
      {status: 500}
    );
  }
}
