import { getSession } from "@/lib/actions/session";
import logger from "@/lib/logger";
import { ExerciseService } from "@/lib/services/exercise-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const { id } = await params;
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const exercise = await ExerciseService.getExerciseById(id);

    if (!exercise) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    return NextResponse.json(exercise);
  } catch (error) {
    logger.error("Error fetching exercise:", "DATABASE", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const { id } = await params;
    const user = await getSession();

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, exercises, difficulty, level, isGeneral } = body;

    // Verificar se o exercício pertence ao professor
    const existingExercise = await ExerciseService.getExerciseById(id);

    if (!existingExercise || existingExercise.teacherId !== user.id) {
      return NextResponse.json({ error: "Exercício não encontrado" }, { status: 404 });
    }

    const data = {
      title,
      description,
      exercises,
      difficulty,
      level,
      isGeneral,
      isPublished: false // Volta para rascunho quando editado
    };

    await ExerciseService.updateExercise(id, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error updating exercise:", "DATABASE", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function DELETE(
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

    await ExerciseService.deleteExercise(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting exercise:", "DATABASE", error);
    
    if (error instanceof Error && error.message.includes("submissões associadas")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
