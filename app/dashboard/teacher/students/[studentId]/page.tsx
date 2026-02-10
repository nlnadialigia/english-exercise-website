export const dynamic = "force-dynamic";

import {BackButton} from "@/components/back-button";
import {DashboardNav} from "@/components/dashboard-nav";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {getSession} from "@/lib/actions/session";
import prisma from "@/lib/db/prisma";
import {SubmissionService} from "@/lib/services/submission-service";
import {UserService} from "@/lib/services/user-service";
import {translations} from "@/lib/translations";
import {CheckCircle2, Clock, History, User} from "lucide-react";
import Link from "next/link";
import {notFound, redirect} from "next/navigation";

interface Props {
  params: Promise<{studentId: string;}>;
}

export default async function StudentDetailsPage({params}: Props) {
  const {studentId} = await params;
  const session = await getSession();

  if (!session || (session.role !== "teacher" && session.role !== "admin")) {
    redirect("/login");
  }

  // Buscar dados do aluno
  const student = await UserService.getUserById(studentId);

  if (!student || student.role !== "student") {
    notFound();
  }

  // Verificar se o professor pode ver este aluno
  if (session.role === "teacher" && student.teacherId !== session.id) {
    notFound();
  }

  // Buscar exercícios atribuídos ao aluno
  const assignedExercises = await prisma.studentExerciseAccess.findMany({
    where: {
      studentId,
      isActive: true
    },
    include: {
      exercise: true
    }
  });

  const availableExercises = assignedExercises
    .filter(assignment => assignment.exercise.isPublished)
    .map(assignment => assignment.exercise);

  // Buscar submissões do aluno
  const studentSubmissions = await SubmissionService.getStudentSubmissions(studentId);

  // Criar mapa de submissões por exercício (pegar a mais recente de cada)
  const submissionMap = new Map();
  studentSubmissions.forEach(sub => {
    const existing = submissionMap.get(sub.exerciseId);
    if (!existing || new Date(sub.createdAt) > new Date(existing.createdAt)) {
      submissionMap.set(sub.exerciseId, sub);
    }
  });

  // Separar exercícios
  const openExercises = availableExercises.filter(ex => !submissionMap.has(ex.id));
  const completedExercises = availableExercises
    .filter(ex => submissionMap.has(ex.id))
    .map(ex => ({
      ...ex,
      submission: submissionMap.get(ex.id)
    }));

  // Agrupar submissões por exercício para o histórico
  const submissionsByExercise = studentSubmissions.reduce((acc, sub) => {
    if (!acc[sub.exerciseId]) acc[sub.exerciseId] = [];
    acc[sub.exerciseId].push(sub);
    return acc;
  }, {} as Record<string, typeof studentSubmissions>);

  // Ordenar submissões por data (mais recente primeiro)
  Object.keys(submissionsByExercise).forEach(exerciseId => {
    submissionsByExercise[exerciseId].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

  // Mostrar link mágico
  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/student/access/${student.studentToken.token}`;

  return (
    <div className="min-h-screen bg-muted/30">
      <DashboardNav role="teacher" />
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8 flex justify-between">
          <div className="flex items-center gap-4 mb-4">
            <User className="h-8 w-8 text-muted-foreground" />
            <div>
              <h1 className="text-3xl font-bold">
                {student.fullName} {session.role === "admin" && "(Visualização Admin)"}
              </h1>
              <p className="text-muted-foreground">
                {translations.level}: {student.level}
                {session.role === "admin" && " • Modo somente leitura"}
              </p>
              <Link href={magicLink} className="text-muted-foreground">{translations.magicLink}</Link>
            </div>
          </div>
          <BackButton href="/dashboard/teacher" />
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openExercises.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedExercises.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{translations.averageScore}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedExercises.length > 0
                  ? Math.round(
                    completedExercises.reduce((acc, ex) =>
                      acc + (ex.submission!.score / ex.submission!.totalQuestions * 100), 0
                    ) / completedExercises.length
                  ) + "%"
                  : "N/A"
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="open" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="open">
              Open Exercises ({openExercises.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed Exercises ({completedExercises.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({Object.keys(submissionsByExercise).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {openExercises.map((exercise) => (
                <Card key={exercise.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <CardDescription className="line-clamp-2">
                      <div dangerouslySetInnerHTML={{__html: exercise.description || translations.noDescription}} />
                    </CardDescription>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded">{exercise.difficulty}</span>
                      <span className="bg-muted px-2 py-1 rounded">{exercise.level}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {translations.createdAt}: {new Date(exercise.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {openExercises.length === 0 && (
                <div className="col-span-full py-12 text-center bg-background rounded-lg border border-dashed">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{translations.noOpenExercises}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedExercises.map((exercise) => (
                <Card key={exercise.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{exercise.title}</CardTitle>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <CardDescription className="line-clamp-2">
                      <div dangerouslySetInnerHTML={{__html: exercise.description || translations.noDescription}} />
                    </CardDescription>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded">{exercise.difficulty}</span>
                      <span className="bg-muted px-2 py-1 rounded">{exercise.level}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{translations.score}:</span>
                        <span className="font-bold text-green-600">
                          {exercise.submission!.score}/{exercise.submission!.totalQuestions}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{translations.percentage}:</span>
                        <span className="font-bold">
                          {Math.round(exercise.submission!.score / exercise.submission!.totalQuestions * 100)}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {translations.completedAt}: {new Date(exercise.submission!.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {completedExercises.length === 0 && (
                <div className="col-span-full py-12 text-center bg-background rounded-lg border border-dashed">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{translations.noCompletedExercises}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(submissionsByExercise).map(([exerciseId, submissions]) => {
                const exercise = availableExercises.find(ex => ex.id === exerciseId);
                if (!exercise) return null;

                return (
                  <Card key={exerciseId}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{exercise.title}</CardTitle>
                        <History className="h-5 w-5 text-blue-500" />
                      </div>
                      <CardDescription className="line-clamp-2">
                        <div dangerouslySetInnerHTML={{__html: exercise.description || "No description available."}} />
                      </CardDescription>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="bg-muted px-2 py-1 rounded">{exercise.difficulty}</span>
                        <span className="bg-muted px-2 py-1 rounded">{exercise.level}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm font-medium">
                          {submissions.length} {translations.attempt}{submissions.length > 1 ? 's' : ''}
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {submissions.map((sub, index) => (
                            <div key={sub.id} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                              <span>{translations.attempt} #{sub.attempt}</span>
                              <div className="flex items-center gap-2">
                                <span className={sub.score >= (sub.totalQuestions * 0.7) ? "text-green-600 font-medium" : "text-red-500 font-medium"}>
                                  {sub.score}/{sub.totalQuestions}
                                </span>
                                <Link
                                  href={`/dashboard/teacher/submissions/${sub.id}`}
                                  className="text-xs text-blue-500 hover:underline"
                                >
                                  {translations.view}
                                </Link>
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
                  <p className="text-muted-foreground">{translations.noHistory || "No history available."}</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
