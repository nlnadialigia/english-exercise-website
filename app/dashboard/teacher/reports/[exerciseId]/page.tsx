import {DashboardNav} from "@/components/dashboard-nav";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
  getExerciseById,
  getExerciseSubmissions,
} from "@/lib/actions/exercises";
import {getSession} from "@/lib/actions/session";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {ReportClient} from "./ReportClient";

export default async function ExerciseReportPage({
  params,
}: {
  params: {exerciseId: string;};
}) {
  const {exerciseId} = params;

  // 🔐 Auth no SERVER
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.role !== "teacher") {
    redirect("/dashboard");
  }

  // 📦 Dados
  const [exercise, submissions] = await Promise.all([
    getExerciseById(exerciseId),
    getExerciseSubmissions(exerciseId),
  ]);

  if (!exercise) {
    return <div>Exercício não encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <DashboardNav role="teacher" />

      <main className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/teacher">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Relatório: {exercise.title}
          </h1>
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Média da Turma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {submissions.length > 0
                  ? (
                    submissions.reduce(
                      (acc, s) => acc + s.score,
                      0
                    ) / submissions.length
                  ).toFixed(1)
                  : 0}
                <span className="text-lg text-muted-foreground ml-1">
                  / {exercise.content.questions.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Entregas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {submissions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Submissões dos Alunos
          </h2>

          <div className="grid gap-4">
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <ReportClient
                  key={submission.id}
                  submission={submission}
                  exercise={exercise}
                />
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhuma entrega realizada para este exercício.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
