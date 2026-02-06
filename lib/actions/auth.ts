"use server";

import { verifyPassword } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "../db/prisma";

export async function login(email: string, password: string) {
  logger.auth(`Tentativa de login`, { email });

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      logger.auth("Usuário não encontrado", { email });
      return { error: "Usuário ou senha inválidos" };
    }

    // Para alunos, permitir login sem senha (se passwordHash for null ou vazio)
    if (user.role === "student" && (!user.passwordHash || user.passwordHash === "")) {
      // Login direto para alunos sem senha
    } else {
      // Para professores e admins, verificar senha
      const isValid = await verifyPassword(password, user.passwordHash as string);

      if (!isValid) {
        logger.auth("Senha inválida", { email });
        return { error: "Usuário ou senha inválidos" };
      }
    }

    // Criar sessão
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
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

    logger.auth(`Login bem-sucedido`, { email: user.email, role: user.role });
  } catch (error) {
    logger.error("Erro no login", 'AUTH', error);
    return { error: "Ocorreu um erro ao processar o login" };
  }

  redirect("/");
}

export async function logout() {
  logger.auth("Logout iniciado");

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (sessionId) {
    await prisma.session.delete({
      where: { id: sessionId }
    });

    cookieStore.delete("session_id");
    logger.session("Sessão removida", { sessionId: '***' });
  }

  redirect("/login");
}