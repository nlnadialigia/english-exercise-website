import { getSession } from "@/lib/actions/session";
import { getExerciseById } from "@/lib/actions/exercises";
import { redirect } from "next/navigation";
import EditExerciseClient from "./EditExerciseClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditExercisePage({ params }: Props) {
  const { id } = await params;
  const user = await getSession();

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login");
  }

  // Admin não pode editar, redireciona para lista
  if (user.role === "admin") {
    redirect("/dashboard/teacher/exercises");
  }

  const exercise = await getExerciseById(id);

  if (!exercise) {
    redirect("/dashboard/teacher");
  }

  return <EditExerciseClient exercise={exercise} teacherId={user.id} />;
}
