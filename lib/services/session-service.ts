import prisma from "../db/prisma";
import logger from "../logger";

export class SessionService {
  static async getSessionById(id: string) {
    logger.database("Buscando a sessão do usuário");

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            level: true,
            isGeneral: true
          }
        }
      }
    });

    return session ?? null;
  }
}