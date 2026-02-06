"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExerciseRenderer } from "@/components/exercises/ExerciseRenderer";
import { ScoringExplanation } from "@/components/exercises/ScoringExplanation";
import { translations } from "@/lib/translations";
import logger from "@/lib/logger";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  title: string;
  description: string;
  exercises: any[];
}

export default function ExerciseClient({ exerciseId }: { exerciseId: string; }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!exerciseId) {
      toast.error("Exercise ID not found");
      router.push("/dashboard/student");
      return;
    }

    async function fetchExercise() {
      try {
        const res = await fetch(`/api/exercises/${exerciseId}`);
        if (!res.ok) throw new Error("Exercise not found");

        const data = await res.json();
        logger.info("Exercise data received", "API", data);
        setExercise(data);
      } catch (error) {
        logger.error("Error fetching exercise", "API", error);
        toast.error("Exercise not found or not available");
        router.push("/dashboard/student");
      } finally {
        setLoading(false);
      }
    }

    fetchExercise();
  }, [exerciseId, router]);

  const handleAnswer = (questionIndex: number, answer: any) => {
    const questionId = `q_${questionIndex}`;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Verificar se todas as questões foram respondidas
  const allQuestionsAnswered = exercise?.exercises.every((_, index) => {
    const questionId = `q_${index}`;
    const answer = answers[questionId];
    
    // Para múltipla escolha, verificar se há uma resposta
    if (exercise.exercises[index].type === "multiple_choice") {
      return answer && answer.trim() !== "";
    }
    
    // Para fill_blank, verificar se todas as lacunas foram preenchidas
    if (exercise.exercises[index].type === "fill_blank") {
      if (!answer || typeof answer !== 'object') return false;
      const blanks = exercise.exercises[index].content.blanks;
      return Object.keys(blanks).every(blankKey => 
        answer[blankKey] && answer[blankKey].trim() !== ""
      );
    }
    
    return answer && answer.trim() !== "";
  }) || false;

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Processar respostas para diferentes tipos de exercício
      const processedAnswers: Record<string, any> = {};
      
      exercise?.exercises.forEach((question, index) => {
        const questionId = `q_${index}`;
        const answer = answers[questionId];
        
        if (question.type === "fill_blank" && typeof answer === 'object') {
          // Para fill_blank, converter objeto para JSON
          processedAnswers[questionId] = JSON.stringify(answer);
        } else {
          processedAnswers[questionId] = answer || "";
        }
      });

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId,
          answers: processedAnswers,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error);

      toast.success(translations.exerciseCompleted);

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["teacher-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-submissions-count"] });

      router.push(`/dashboard/student/results/${result.submissionId}`);
    } catch (error: any) {
      toast.error(error.message || "Error submitting exercise");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!exercise) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard/student">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {translations.back}
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-2">{exercise.title}</h1>
          {exercise.description && (
            <div className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: exercise.description }} />
          )}
        </div>

        <ScoringExplanation />

        <div className="space-y-6">
          {exercise.exercises.map((question, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{translations.question} {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <ExerciseRenderer 
                  exercise={question} 
                  onAnswer={(answer) => handleAnswer(index, answer)} 
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !allQuestionsAnswered}
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              translations.finishExercise
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
