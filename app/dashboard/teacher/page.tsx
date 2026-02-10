export const dynamic = "force-dynamic";

import { getTeacherExercises } from "@/lib/actions/exercises";
import { getSession } from "@/lib/actions/session";
import { getTotalSubmissions } from "@/lib/actions/submissions";
import { ExerciseWithRelations } from "@/lib/types";
import TeacherDashboardClient from "./TeacherDashboardClient";

export default async function TeacherDashboard() {
  const user = await getSession();
  const exercises = await getTeacherExercises();
  const totalSubmissions = await getTotalSubmissions();

  return (
    <TeacherDashboardClient 
      exercises={exercises as ExerciseWithRelations[]} 
      totalSubmissions={totalSubmissions}
      publishedCount={exercises?.filter((ex) => ex.isPublished).length || 0}
      isAdmin={user?.role === "admin"}
    />
  );
}
