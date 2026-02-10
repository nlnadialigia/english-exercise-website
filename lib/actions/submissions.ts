"use server";

import { getSession } from "@/lib/actions/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ISubmission, SubmissionService } from "../services/submission-service";

export async function createSubmission(submissionData: ISubmission) {
  const user = await getSession();

  if (!user || user.role !== "student") {
    return { error: "Não autorizado" };
  }

  try {
    const submissionId = await SubmissionService.createSubmission(submissionData);
    revalidatePath("/dashboard/student");

    return { success: true, submissionId };
  } catch (error) {
    return { error: "Erro ao enviar exercício" };
  }
}

export async function getStudentSubmissions() {
  const user = await getSession();

  if (!user || user.role !== "student") {
    redirect("/login");
  }

  return await SubmissionService.getStudentSubmissions(user.id);
}

export async function getSubmissionByExercise(exerciseId: string) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return await SubmissionService.getSubmissionByExercise(exerciseId, user.id);
}

export async function getExerciseSubmissions(exerciseId: string) {
  const user = await getSession();

  if (!user || user.role !== "teacher") {
    redirect("/login");
  }

  return await SubmissionService.getExerciseSubmissions(exerciseId);
}

export async function getTotalSubmissions() {
  const user = await getSession();

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return 0;
  }

  // Se for admin, retorna 0 (modo view-only)
  if (user.role === "admin") {
    return 0;
  }

  return await SubmissionService.getTotalSubmissions(user.id);
}
