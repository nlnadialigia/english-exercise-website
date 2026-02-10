"use client";

import { DetailedCorrection } from "@/components/exercises/DetailedCorrection";
import { ScoringExplanation } from "@/components/exercises/ScoringExplanation";
import { Button } from "@/components/ui/button";
import { translations } from "@/lib/translations";
import { CorrectionResult, ExerciseItem } from "@/lib/types";
import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SubmissionReview {
  id: string;
  score: number;
  totalQuestions: number;
  attempt: number;
  corrections: CorrectionResult[];
  createdAt: string;
  student: {
    id: string;
    fullName: string;
    email: string;
  };
  exercise: {
    id: string;
    title: string;
    description: string;
    exercises: ExerciseItem[];
  };
}

export default function SubmissionReviewClient({ submissionId }: { submissionId: string; }) {
  const [submission, setSubmission] = useState<SubmissionReview | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const res = await fetch(`/api/teacher/submissions/${submissionId}`);
        if (!res.ok) throw new Error("Submission not found");

        const data = await res.json();
        setSubmission(data);
      } catch (error) {
        toast.error("Error loading submission");
        router.push("/dashboard/teacher");
      } finally {
        setLoading(false);
      }
    }

    fetchSubmission();
  }, [submissionId, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!submission) return null;

  const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
  const passed = percentage >= 70;

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-bold">{submission.student.fullName}</h1>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-2">{submission.exercise.title}</h2>
            <p className="text-muted-foreground mb-4">{translations.attempt} #{submission.attempt}</p>

            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{submission.score}/{submission.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">{translations.correct}</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage}%
                </div>
                <div className="text-sm text-muted-foreground">{translations.score}</div>
              </div>
            </div>

            {/* <div className="text-center">
              <Badge variant={passed ? "default" : "destructive"} className="text-lg px-4 py-2">
                {passed ? "Aprovado" : "Reprovado"}
              </Badge>
            </div> */}
          </div>
        </div>

        <ScoringExplanation />

        <div className="space-y-6">
          <h3 className="text-2xl font-semibold">Detailed Correction</h3>

          <DetailedCorrection
            corrections={submission.corrections}
            exercises={submission.exercise.exercises}
          />
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/teacher/students/${submission.student.id}`}>
              Ver Perfil do Aluno
            </Link>
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Realizado em: {new Date(submission.createdAt).toLocaleString()}
        </div>
      </main>
    </div>
  );
}
