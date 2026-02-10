"use client";

import { DetailedCorrection } from "@/components/exercises/DetailedCorrection";
import { ScoringExplanation } from "@/components/exercises/ScoringExplanation";
import SubmissionPDF from "@/components/pdf/SubmissionPDF";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { translations } from "@/lib/translations";
import { CorrectionResult, ExerciseItem } from "@/lib/types";
import { pdf } from '@react-pdf/renderer';
import { Download, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SubmissionViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: {
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
  } | null;
}

export function SubmissionViewDialog({ open, onOpenChange, submission }: SubmissionViewDialogProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!submission) return null;

  const percentage = Math.round((submission.score / submission.totalQuestions) * 100);
  const passed = percentage >= 70;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const blob = await pdf(<SubmissionPDF submission={submission} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resultado-${submission.student.fullName}-${submission.exercise.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF exported successfully!");
    } catch (error) {
      toast.error("Error exporting PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-[75vw] max-h-[90vh] overflow-y-auto" style={{ width: '60vw', maxWidth: 'none' }}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>View Results</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="gap-2 mr-8 bg-cyan-100 hover:bg-cyan-200"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : translations.pdf}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
              <div>
                <h2 className="text-2xl font-bold">{submission.student.fullName}</h2>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-2">{submission.exercise.title}</h3>
            <p className="text-muted-foreground mb-4">{translations.attempt} #{submission.attempt}</p>

            <div className="flex justify-center items-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">{submission.score}/{submission.totalQuestions}</div>
                <div className="text-sm text-muted-foreground">{translations.correct}</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage}%
                </div>
                <div className="text-sm text-muted-foreground">{translations.score}</div>
              </div>
            </div>
          </div>

          <ScoringExplanation />

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Detailed Correction</h4>

            <DetailedCorrection
              corrections={submission.corrections}
              exercises={submission.exercise.exercises}
              size="compact"
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {translations.completedAt}: {new Date(submission.createdAt).toLocaleString()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
