import { hashPassword } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { StudentToken, User, UserRole } from "@prisma/client";
import prisma from "../db/prisma";


export interface IUser {
  id?: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  level?: string;
  isGeneral?: boolean;
  teacherId?: string | null;
}

export interface UserWithIncludes extends User {
  studentToken: StudentToken;
}

export class UserService {
  /**
   * Criar um novo usuário
   */
  static async createUser(data: IUser): Promise<User> {
    logger.database("Criando novo usuário", { email: data.email, role: data.role });

    let passwordHash: string | null = null;
    if (data.password && data.password !== "") {
      passwordHash = await hashPassword(data.password);
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role,
        level: data.level || "",
        isGeneral: data.isGeneral ?? true,
        teacherId: data.teacherId || null
      }
    });

    logger.database("Usuário criado com sucesso");
    return user;
  }

  /**
   * Buscar usuário por ID
   */
  static async getUserById(id: string): Promise<UserWithIncludes | null> {
    logger.database("Buscando usuário por ID", { id });

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentToken: true
      }
    });

    return user as UserWithIncludes ?? null;
  }

  /**
   * Buscar usuário por email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    logger.database("Buscando usuário por email", { email });

    return await prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Listar todos os usuários
   */
  static async getAllUsers(): Promise<User[]> {
    logger.database("Listando todos os usuários");

    return await prisma.user.findMany({
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Listar usuários por role
   */
  static async getUsersByRole(role: UserRole): Promise<User[]> {
    logger.database("Listando usuários por role", { role });

    return await prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Buscar usuários (search)
   */
  static async searchUsers(query: string): Promise<User[]> {
    logger.database("Buscando usuários");

    return await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  /**
   * Atualizar usuário
   */
  static async updateUser(
    id: string,
    data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<User> {
    logger.database("Atualizando usuário", { email: data.email });

    // Se a senha foi fornecida, fazer hash
    if (data.passwordHash) {
      data.passwordHash = await hashPassword(data.passwordHash);
    }

    const user = await prisma.user.update({
      where: { id },
      data
    });

    logger.database("Usuário atualizado", { id: user.id });
    return user;
  }

  /**
   * Deletar usuário
   */
  static async deleteUser(id: string): Promise<void> {
    logger.database("Deletando usuário", { id });

    await prisma.user.delete({
      where: { id }
    });

    logger.database("Usuário deletado", { id });
  }

  /**
   * Contar usuários por role
   */
  static async countUsersByRole(): Promise<Record<UserRole, number>> {
    logger.database("Contando usuários por role");

    const counts = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    const result = counts.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<UserRole, number>);

    // Garantir que todas as roles tenham um valor
    return {
      admin: result.admin || 0,
      teacher: result.teacher || 0,
      student: result.student || 0,
    };
  }

  /**
   * Buscar alunos de um professor específico
   */
  static async getStudentsByTeacher(teacherId: string): Promise<User[]> {
    logger.database("Buscando alunos por professor", { teacherId });

    return await prisma.user.findMany({
      where: { teacherId },
      orderBy: { fullName: 'asc' }
    });
  }
}