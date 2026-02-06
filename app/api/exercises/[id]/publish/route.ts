import { getSession } from "@/lib/actions/session";
import logger from "@/lib/logger";
import { ExerciseService } from "@/lib/services/exercise-service";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const { id } = await params;
    const user = await getSession();

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se o exercício pertence ao professor
    const existingExercise = await ExerciseService.getExerciseById(id);

    if (!existingExercise || existingExercise.teacherId !== user.id) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    await ExerciseService.publishExercise(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error publishing exercise:", "DATABASE", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
