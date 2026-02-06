"use client";

import SubmissionPDF from "@/components/pdf/SubmissionPDF";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { pdf } from '@react-pdf/renderer';
import { CheckCircle, ChevronDown, ChevronUp, FileDown, User, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  correctAnswer: string;
}

export function ReportClient({ submission, exercise }: { submission: any; exercise: any; }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const studentName = submission.profiles?.full_name || "Estudante";
  const questions = exercise.content.questions as Question[];

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Converter dados para o formato esperado pelo SubmissionPDF
      const submissionData = {
        student: {
          fullName: submission.profiles?.full_name || "Estudante",
          email: submission.profiles?.email || "",
        },
        exercise: {
          title: exercise.title,
        },
        score: submission.score,
        totalQuestions: submission.total_questions,
        attempt: 1,
        corrections: questions.map((q, index) => {
          const studentAnswer = submission.answers[q.id] || "";
          const isCorrect = studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
          return {
            question: q.question,
            userAnswer: studentAnswer || "Não respondido",
            correctAnswer: q.correctAnswer,
            isCorrect,
            explanation: "",
          };
        }),
        createdAt: submission.created_at,
      };

      const blob = await pdf(<SubmissionPDF submission={submissionData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${studentName.replace(/\s+/g, "-").toLowerCase()}-${exercise.title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4 bg-background">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{studentName}</h3>
              <p className="text-xs text-muted-foreground">
                Entregue em: {new Date(submission.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold">
                {submission.score} / {submission.total_questions}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Acertos</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                disabled={isExporting}
                className="gap-2 bg-transparent"
              >
                <FileDown className="h-4 w-4" />
                {isExporting ? "Gerando..." : "PDF"}
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="p-6 border-t bg-muted/10">
            <div className="bg-white p-8 rounded-lg border shadow-sm space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-primary">Relatório de Desempenho</h2>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p>
                      <span className="font-semibold">Aluno:</span> {studentName}
                    </p>
                    <p>
                      <span className="font-semibold">Exercício:</span> {exercise.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      <span className="font-semibold">Data:</span>{" "}
                      {new Date(submission.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <p>
                      <span className="font-semibold">Pontuação:</span> {submission.score} /{" "}
                      {submission.total_questions} ({Math.round((submission.score / submission.total_questions) * 100)}
                      %)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, index) => {
                  const studentAnswer = submission.answers[q.id] || "(Sem resposta)";
                  const isCorrect = studentAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();

                  return (
                    <div key={q.id} className="p-4 rounded-md border text-sm">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">
                          Questão {index + 1}: {q.question}
                        </p>
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <p>
                          <span className="text-muted-foreground">Resposta do Aluno:</span>{" "}
                          <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                            {studentAnswer}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Gabarito:</span>{" "}
                          <span className="font-medium">{q.correctAnswer}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 text-center text-[10px] text-muted-foreground border-t">
                Gerado automaticamente pelo English Exercises Hub Platform
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
