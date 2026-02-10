"use server";

import { getSession } from "@/lib/actions/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "../db/prisma";
import logger from "../logger";
import { ExerciseService, ISubmitExercise } from "../services/exercise-service";
import { CreateExerciseInput, ExerciseWithRelations } from "../types";
import { Submission } from "@prisma/client";

export async function createExercise(exerciseData: Omit<CreateExerciseInput, "teacherId">) {
  const user = await getSession();

  if (!user || user.role !== "teacher") {
    return { success: false, error: "Não autorizado" };
  }

  try {
    const exerciseId = await ExerciseService.createExercise({
      ...exerciseData,
      teacherId: user.id,
    });

    revalidatePath("/dashboard/teacher");
    return { success: true, exerciseId };
  } catch (error) {
    logger.error("Error creating exercise:", "DATABASE", error);
    return { success: false, error: "Erro interno do servidor. Tente novamente." };
  }
}

export async function getTeacherExercises() {
  const user = await getSession();

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login");
  }

  // Se for admin, retorna array vazio (modo view-only)
  if (user.role === "admin") {
    return [];
  }

  return await ExerciseService.getTeacherExercises(user.id);
}

export async function getPublishedExercises() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return await ExerciseService.getPublishedExercises();
}

export async function getExercises() {
  return getPublishedExercises();
}

export async function getAvailableExercisesForStudent() {
  const user = await getSession();

  if (!user || user.role !== "student") {
    redirect("/login");
  }

  return await ExerciseService.getAvailableExercisesForStudent(user.level, user.role, user.isGeneral);
}

export async function getOpenExercisesForStudent() {
  const user = await getSession();

  if (!user || (user.role !== "student" && user.role !== "admin")) {
    redirect("/login");
  }

  // Se for admin, retorna array vazio
  if (user.role === "admin") {
    return [];
  }

  // Buscar exercícios vinculados ao aluno
  const assignedExercises = await prisma.studentExerciseAccess.findMany({
    where: {
      studentId: user.id,
      isActive: true
    },
    include: {
      exercise: true
    }
  });

  logger.info(`Assigned exercises for student ${user.id}: ${assignedExercises.length}`, "EXERCISES");

  // Filtrar apenas exercícios publicados
  const availableExercises = assignedExercises
    .filter(assignment => assignment.exercise.isPublished)
    .map(assignment => assignment.exercise);

  const submittedExercises = await prisma.submission.findMany({
    where: { studentId: user.id },
    select: { exerciseId: true }
  });

  const submittedIds = new Set(submittedExercises.map(s => s.exerciseId));

  return availableExercises.filter(exercise => !submittedIds.has(exercise.id));
}

export async function getCompletedExercisesForStudent() {
  const user = await getSession();

  if (!user || (user.role !== "student" && user.role !== "admin")) {
    redirect("/login");
  }

  if (user.role === "admin") return [];

  // Buscar exercícios vinculados ao aluno
  const assignedExercises = await prisma.studentExerciseAccess.findMany({
    where: {
      studentId: user.id,
      isActive: true
    },
    include: {
      exercise: true
    }
  });

  // Filtrar apenas exercícios publicados
  const availableExercises = assignedExercises
    .filter(assignment => assignment.exercise.isPublished)
    .map(assignment => assignment.exercise);

  const allSubmissions = await prisma.submission.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  const bestSubmissions = allSubmissions.reduce((acc, sub) => {
    if (!acc[sub.exerciseId] || sub.score > acc[sub.exerciseId].score) {
      acc[sub.exerciseId] = sub;
    }
    return acc;
  }, {} as Record<string, Submission>);

  const submittedIds = Object.keys(bestSubmissions);

  return availableExercises
    .filter(exercise => submittedIds.includes(exercise.id))
    .map(exercise => ({
      ...exercise,
      submission: bestSubmissions[exercise.id]
    }));
}

export async function getExerciseById(id: string) {
  try {
    return await ExerciseService.getExerciseById(id);
  } catch (error) {
    logger.error("Error fetching exercise:", "DATABASE", error);
    return null;
  }
}

export async function getExerciseSubmissions(exerciseId: string) {
  try {
    const result = await ExerciseService.getExerciseSubmissions(exerciseId);

    return result.map((submission) => {
      return {
        ...submission,
        answers: JSON.parse(submission.answers as string),
      };
    });
  } catch (error) {
    logger.error("Error fetching submissions:", "DATABASE", error);
    return [];
  }
}

export async function getSubmissionsByStudent(studentId: string) {
  try {
    const result = await ExerciseService.getSubmissionsByStudent(studentId);

    return result.map((submission) => {
      return {
        ...submission,
        answers: JSON.parse(submission.answers as string),
      };
    });
  } catch (error) {
    logger.error("Error fetching student submissions:", "DATABASE", error);
    return [];
  }
}

export async function submitExercise(data: ISubmitExercise) {
  const user = await getSession();

  if (!user || user.role !== "student") {
    return { error: "Não autorizado" };
  }

  try {
    const submissionId = await ExerciseService.submitExercise({
      ...data,
      studentId: user.id,
    });

    revalidatePath("/dashboard/student");
    return { success: true, submissionId };
  } catch (error) {
    logger.error("Error submitting exercise:", "DATABASE", error);
    return { error: "Erro ao submeter exercício" };
  }
}
