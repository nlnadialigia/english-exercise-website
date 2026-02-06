import { getSession } from "@/lib/actions/session";
import { getExerciseById } from "@/lib/actions/exercises";
import { redirect } from "next/navigation";
import ExercisePreviewClient from "./ExercisePreviewClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ExercisePreviewPage({ params }: Props) {
  const { id } = await params;
  const user = await getSession();

  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    redirect("/login");
  }

  const exercise = await getExerciseById(id);

  if (!exercise) {
    redirect("/dashboard/teacher");
  }

  return <ExercisePreviewClient exercise={exercise} />;
}
