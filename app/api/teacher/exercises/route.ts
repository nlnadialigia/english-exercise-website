import { getTeacherExercises } from "@/lib/actions/exercises";
import { getSession } from "@/lib/actions/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getSession();

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const exercises = await getTeacherExercises();
    return NextResponse.json(exercises);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
