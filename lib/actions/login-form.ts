"use server";

import { verifyPassword } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "../db/prisma";
import { UserService } from "../services/user-service";

export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string || "";

  const user = await UserService.getUserByEmail(email);

  if (!user) {
    logger.error("Usuário não encontrado", 'AUTH', { email });
    redirect("/login?error=invalid");
  }

  // Bloquear login de alunos via formulário
  if (user.role === "student") {
    logger.error("Tentativa de login de aluno via formulário", 'AUTH', { email });
    redirect("/login?error=invalid");
  }

  // Para professores e admins, verificar senha
  const isValid = await verifyPassword(password, user.passwordHash as string);

  if (!isValid) {
    logger.error("Senha inválida", 'AUTH', { email });
    redirect("/login?error=invalid");
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

  // Redirect baseado no role
  if (user.role === "admin") {
    redirect("/dashboard/admin");
  } else if (user.role === "teacher") {
    redirect("/dashboard/teacher");
  } else {
    redirect("/dashboard/student");
  }
}