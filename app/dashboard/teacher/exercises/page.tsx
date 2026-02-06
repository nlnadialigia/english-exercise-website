export const dynamic = "force-dynamic";

import { getSession } from "@/lib/actions/session";
import { redirect } from "next/navigation";
import { ExerciseList } from "./ExerciseList";

export default async function NewExercisePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "teacher" && session.role !== "admin") {
    redirect("/dashboard");
  }

  // Se for admin, mostrar lista vazia em modo view-only
  if (session.role === "admin") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Exercícios (Visualização Admin)</h1>
          <p className="text-muted-foreground">
            Modo somente leitura - Esta é a visualização que os professores têm.
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum exercício disponível no modo de visualização.</p>
        </div>
      </div>
    );
  }

  return <ExerciseList teacherId={session.id} />;
}
