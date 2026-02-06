import { getSession } from "@/lib/actions/session";
import { SubmissionService } from "@/lib/services/submission-service";
import logger from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSession();

    if (!user || user.role !== "teacher") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Contar submissões para o exercício
    const count = await SubmissionService.countSubmissionsByExercise(id);

    return NextResponse.json({ count });
  } catch (error) {
    logger.error("Error counting submissions:", "DATABASE", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
