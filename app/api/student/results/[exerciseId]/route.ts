// app/api/student/results/[exerciseId]/route.ts
import { getSession } from "@/lib/actions/session";
import { ExerciseService } from "@/lib/services/exercise-service";
import { SubmissionService } from "@/lib/services/submission-service";

export async function GET(
  _: Request,
  { params }: { params: { exerciseId: string; }; }
) {
  const session = await getSession();

  if (!session || session.role !== "student") {
    return new Response("Unauthorized", { status: 401 });
  }

  const exercise = await ExerciseService.getExerciseById(params.exerciseId);

  if (!exercise) {
    return new Response("Not found", { status: 404 });
  }

  const submission = await SubmissionService.getSubmissionByExercise(
    exercise.id,
    session.id
  );

  if (!submission) {
    return new Response("No submission", { status: 404 });
  }

  return Response.json({
    exercise,
    submission: {
      score: submission.score,
      totalQuestions: submission.totalQuestions,
      answers: submission.answers,
    },
  });
}
