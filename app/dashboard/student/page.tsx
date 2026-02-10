export const dynamic = "force-dynamic";

import {DashboardNav} from "@/components/dashboard-nav";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {getCompletedExercisesForStudent, getOpenExercisesForStudent} from "@/lib/actions/exercises";
import {getSession} from "@/lib/actions/session";
import {SubmissionService} from "@/lib/services/submission-service";
import {translations} from "@/lib/translations";
import {BookOpen, CheckCircle2, Clock, Eye, History, RotateCcw} from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // Admin pode visualizar em modo read-only
  if (session.role !== "student" && session.role !== "admin") {
    return null;
  }

  const openExercises = await getOpenExercisesForStudent();
  const completedExercises = await getCompletedExercisesForStudent();

  // Se for admin, mostrar dados vazios (modo view-only)
  if (session.role === "admin") {
    return (
      <div className="min-h-screen bg-muted/30">
        <DashboardNav role="student" />
        <main className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard do Aluno (Visualização Admin)</h1>
            <p className="text-muted-foreground">
              Modo somente leitura - Esta é a visualização que os alunos têm.
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum dado disponível no modo de visualização.</p>
          </div>
        </main>
      </div>
    );
  }

  const submissionsHistory = await SubmissionService.getStudentSubmissions(session.id);

  const submissionsByExercise = submissionsHistory.reduce((acc, sub) => {
    if (!acc[sub.exerciseId]) acc[sub.exerciseId] = [];
    acc[sub.exerciseId].push(sub);
    return acc;
  }, {} as Record<string, typeof submissionsHistory>);

  Object.keys(submissionsByExercise).forEach(exerciseId => {
    submissionsByExercise[exerciseId].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav role="student" />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Hello, {session.fullName}!</h1>
          <p className="text-muted-foreground">
            These are the exercise books available for your level.
          </p>
        </div>

        <Tabs defaultValue="open" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="open" className="cursor-pointer">
              Open Exercises ({openExercises?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="completed" className="cursor-pointer">
              Completed Exercises ({completedExercises?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="history" className="cursor-pointer">
              History ({Object.keys(submissionsByExercise).length})
            </TabsTrigger>
          </TabsList>

          {/* Open Exercises */}
          <TabsContent value="open" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {openExercises?.map((exercise) => (
                <Card key={exercise.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <CardDescription className="line-clamp-2">
                      <div dangerouslySetInnerHTML={{__html: exercise.description || "No description provided"}} />
                    </CardDescription>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded">{exercise.difficulty}</span>
                      <span className="bg-muted px-2 py-1 rounded">{exercise.level}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <Link href={`/dashboard/student/exercises/${exercise.id}`}>Start Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {(!openExercises || openExercises.length === 0) && (
                <div className="col-span-full py-12 text-center bg-background rounded-lg border border-dashed">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No exercises available at the moment.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    All exercises for your level have been completed or no exercises are published.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Cadernos Resolvidos */}
          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedExercises?.map((exercise) => (
                <Card key={exercise.id} className="opacity-80">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <CardDescription className="line-clamp-2">
                      {exercise.description || "No description provided."}
                    </CardDescription>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded">{exercise.difficulty}</span>
                      <span className="bg-muted px-2 py-1 rounded">{exercise.level}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm font-medium">
                        Best Score: {exercise.submission?.score} / {exercise.submission?.totalQuestions}
                      </div>
                      <div className="flex justify-between gap-2">
                        <Button variant="outline" className="bg-blue-100 w-1/2">
                          <Eye className="h-4 w-4" />
                          <Link href={`/dashboard/student/results/${submissionsByExercise[exercise.id]?.[0]?.id || exercise.submission?.id}`}>View Results</Link>
                        </Button>
                        <Button variant={"outline"} className="bg-orange-200 w-1/2">
                          <RotateCcw className="h-4 w-4" />
                          <Link href={`/dashboard/student/exercises/${exercise.id}`}>
                            Try Again
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!completedExercises || completedExercises.length === 0) && (
                <div className="col-span-full py-12 text-center bg-background rounded-lg border border-dashed">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No exercises completed yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete some exercises to see them here.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(submissionsByExercise).map(([exerciseId, submissions]) => {
                const exercise = [...(openExercises || []), ...(completedExercises || [])].find(ex => ex.id === exerciseId);
                if (!exercise) return null;

                return (
                  <Card key={exerciseId}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{exercise.title}</CardTitle>
                        <History className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardDescription className="line-clamp-2">
                        {exercise.description || "No description available."}
                      </CardDescription>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-1 rounded">{exercise.difficulty}</span>
                        <span className="bg-muted px-2 py-1 rounded">{exercise.level}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm font-medium">
                          {submissions.length} attempt{submissions.length > 1 ? 's' : ''}
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {submissions.map((sub, index) => (
                            <div key={sub.id} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                              <span>{translations.attempt} #{sub.attempt}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{sub.score}/{sub.totalQuestions}</span>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/dashboard/student/results/${sub.id}`}>{translations.view}</Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {Object.keys(submissionsByExercise).length === 0 && (
                <div className="col-span-full py-12 text-center bg-background rounded-lg border border-dashed">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No exercises completed yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
