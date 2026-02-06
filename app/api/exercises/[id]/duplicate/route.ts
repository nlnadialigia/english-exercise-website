import { getSession } from "@/lib/actions/session";
import prisma from "@/lib/db/prisma";
import { InputJsonValue } from "@prisma/client/runtime/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const { id: exerciseId } = await params;
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Buscar o exercício original
    const originalExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!originalExercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Verificar se o usuário é o dono do exercício (exceto admin)
    if (user.role !== "admin" && originalExercise.teacherId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Criar cópia com target invertido
    const duplicatedExercise = await prisma.exercise.create({
      data: {
        title: `${originalExercise.title}`,
        description: originalExercise.description,
        exercises: originalExercise.exercises as InputJsonValue,
        difficulty: originalExercise.difficulty,
        level: originalExercise.level,
        role: originalExercise.role,
        isGeneral: !originalExercise.isGeneral, // Inverter o target
        isPublished: false, // Sempre criar como rascunho
        teacherId: user.id,
      },
    });

    return NextResponse.json(duplicatedExercise);
  } catch (error) {
    console.error("Error duplicating exercise:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
