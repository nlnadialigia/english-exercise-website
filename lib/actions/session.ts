"use server";

import { cookies } from "next/headers";
import { UserSession } from "../auth";
import logger from "../logger";
import { SessionService } from "../services/session-service";

export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) return null;

    const session = await SessionService.getSessionById(sessionId);

    if (!session) return null;

    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      role: session.user.role,
      level: session.user.level,
      isGeneral: session.user.isGeneral
    };
  } catch (error) {
    logger.error("Erro ao recuperar sessão:", "DATABASE", error);
    return null;
  }
}
