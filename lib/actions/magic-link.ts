"use server";

import { cookies } from "next/headers";
import prisma from "../db/prisma";

export async function processMagicLink(token: string) {
  try {
    // Buscar token válido
    const studentToken = await prisma.studentToken.findUnique({
      where: { token },
      include: { student: true }
    });

    if (!studentToken) {
      return { success: false, error: "invalid_token" };
    }

    // Verificar se token não expirou
    if (studentToken.expiresAt && studentToken.expiresAt < new Date()) {
      return { success: false, error: "expired_token" };
    }

    // Criar sessão
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: studentToken.student.id,
        expiresAt,
      }
    });

    const cookieStore = await cookies();
    cookieStore.set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Error accessing via token:", error);
    return { success: false, error: "access_error" };
  }
}
