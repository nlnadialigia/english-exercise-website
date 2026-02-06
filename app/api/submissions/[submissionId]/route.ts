import { getSession } from "@/lib/actions/session";
import { ExerciseService } from "@/lib/services/exercise-service";
import { SubmissionService } from "@/lib/services/submission-service";
import logger from "@/lib/logger";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ submissionId: string; }>; }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = await params;

    // Buscar submissão
    const submission = await SubmissionService.getSubmissionById(submissionId);

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Verificar autorização
    if (session.role === "student" && submission.studentId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Buscar dados do exercício
    const exercise = await ExerciseService.getExerciseById(submission.exerciseId);

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const result = {
      id: submission.id,
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      attempt: submission.attempt,
      corrections: submission.corrections,
      createdAt: submission.createdAt,
      exercise: {
        id: exercise.id,
        title: exercise.title,
        description: exercise.description,
        exercises: exercise.exercises,
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Error fetching submission:", "DATABASE", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
