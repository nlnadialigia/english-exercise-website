// app/dashboard/student/exercises/[id]/page.tsx
export const dynamic = "force-dynamic";

import { getSession } from "@/lib/actions/session";
import { redirect } from "next/navigation";
import ExerciseClient from "./ExerciseClient";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "student") {
    redirect("/dashboard");
  }

  return <ExerciseClient exerciseId={id} />;
}
