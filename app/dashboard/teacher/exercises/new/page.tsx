export const dynamic = "force-dynamic";

import { getSession } from "@/lib/actions/session";
import { redirect } from "next/navigation";
import NewExerciseClient from "./NewExerciseClient";

export default async function NewExercisePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "teacher" && session.role !== "admin") {
    redirect("/dashboard");
  }

  // Admin não pode criar exercícios, redireciona para lista
  if (session.role === "admin") {
    redirect("/dashboard/teacher/exercises");
  }

  return <NewExerciseClient teacherId={session.id} />;
}
