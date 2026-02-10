import { Exercise } from "@prisma/client";
import { getSession } from "@/lib/actions/session";
import logger from "@/lib/logger";
import { ExerciseService } from "@/lib/services/exercise-service";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session || session.role !== "teacher") {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const teacherId = searchParams.get("teacherId");

  if (!teacherId) {
    return new Response("Teacher ID required", { status: 400 });
  }

  // Verificar se o professor está tentando acessar seus próprios exercícios
  if (session.id !== teacherId) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const exercises: Exercise[] = await ExerciseService.getTeacherExercises(teacherId);
    return Response.json(exercises);
  } catch (error) {
    logger.error("Error fetching exercises:", "DATABASE", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
