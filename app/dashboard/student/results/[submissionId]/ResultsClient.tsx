"use client";

import { DetailedCorrection } from "@/components/exercises/DetailedCorrection";
import { ExerciseBackButton } from "@/components/exercises/ExerciseBackButton";
import { ScoringExplanation } from "@/components/exercises/ScoringExplanation";
import { translations } from "@/lib/translations";
import { CorrectionResult, ExerciseItem } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Submission {
  id: string;
  score: number;
  totalQuestions: number;
  attempt: number;
  corrections: CorrectionResult[];
  exercise: {
    id: string;
    title: string;
    description: string;
    exercises: ExerciseItem[];
  };
  createdAt: string;
}

export default function ResultsClient({ submissionId }: { submissionId: string; }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`);
        if (!res.ok) throw new Error("Submission not found");

        const data = await res.json();
        setSubmission(data);
      } catch (error) {
        toast.error("Error loading results");
        router.push("/dashboard/student");
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
      <ExerciseBackButton exerciseId={submission.exercise.id} />
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{submission.exercise.title}</h1>
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
          </div>
        </div>

        <ScoringExplanation />

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Detailed Correction</h2>

          <DetailedCorrection
            corrections={submission.corrections}
            exercises={submission.exercise.exercises}
          />
        </div>
        <ExerciseBackButton exerciseId={submission.exercise.id} />
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {translations.completedAt}: {new Date(submission.createdAt).toLocaleString()}
        </div>
      </main>
    </div>
  );
}
