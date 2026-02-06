import { NextResponse, type NextRequest } from "next/server";
import { SessionService } from "./lib/services/session-service";
import { logger } from "./lib/logger";

export async function proxy(request: NextRequest) {
  logger.middleware(`Executando para: ${request.nextUrl.pathname}`);

  // Skip middleware for static assets and API routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/student/access/")
  ) {
    logger.middleware(`Pulando para: ${request.nextUrl.pathname}`);
    return NextResponse.next();
  }

  const sessionId = request.cookies.get("session_id")?.value;
  logger.session(`Session ID encontrado: ${sessionId ? 'Sim' : 'Não'}`, { sessionId: sessionId ? '***' : null });

  let user = null;
  if (sessionId) {
    try {
      const session = await SessionService.getSessionById(sessionId);

      if (session && new Date(session.expiresAt) > new Date()) {
        user = {
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.fullName,
          role: session.user.role,
        };
        logger.auth(`Usuário autenticado: ${user.email} (${user.role})`);
      } else {
        logger.session("Sessão não encontrada ou expirada");
      }
    } catch (error) {
      logger.error("Erro ao verificar sessão", 'MIDDLEWARE', error);
    }
  }

  // Redirect to login if not authenticated
  if (!user) {
    logger.middleware("Redirecionando para login - usuário não autenticado");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from root to their dashboard if they are on home
  if (request.nextUrl.pathname === "/") {
    logger.middleware(`Redirecionando da home para dashboard: ${user.role}`);
    const url = request.nextUrl.clone();
    if (user.role === "admin") {
      url.pathname = "/dashboard/admin";
    } else if (user.role === "teacher") {
      url.pathname = "/dashboard/teacher";
    } else {
      url.pathname = "/dashboard/student";
    }
    return NextResponse.redirect(url);
  }

  logger.middleware(`Permitindo acesso para: ${user.email}`);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};