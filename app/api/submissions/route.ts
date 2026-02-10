import { getSession } from "@/lib/actions/session";
import logger from "@/lib/logger";
import { ExerciseService } from "@/lib/services/exercise-service";
import { SubmissionService } from "@/lib/services/submission-service";
import { NextResponse } from "next/server";
import { ExerciseItem, MultipleChoiceContent, FillBlankContent, BlankResult, CorrectionResult } from "@/lib/types";

interface CorrectionResponse {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string;
  blankResults?: BlankResult[];
  score?: string;
}

function correctAnswer(question: ExerciseItem, userAnswer: string): CorrectionResponse {
  switch (question.type) {
    case "multiple_choice": {
      const content = question.content as MultipleChoiceContent;
      const correctOption = content.options.find(opt => opt.correct);
      const isCorrect = userAnswer === correctOption?.id;

      logger.info("Checking multiple choice answer", "CORRECTION", {
        userAnswer,
        correctOptionId: correctOption?.id,
        correctOptionText: correctOption?.text,
        isCorrect,
        allOptions: content.options
      });

      return {
        isCorrect,
        correctAnswer: correctOption?.text || "",
        explanation: content.explanation
      };
    }

    case "fill_blank": {
      const content = question.content as FillBlankContent;
      const blanks = content.blanks;
      const userAnswers = typeof userAnswer === 'string' ? JSON.parse(userAnswer || '{}') : userAnswer;
      const caseSensitive = content.caseSensitive || false;
      
      let correctCount = 0;
      let totalBlanks = 0;
      const blankResults: BlankResult[] = [];
      
      for (const [blankKey, possibleAnswers] of Object.entries(blanks)) {
        totalBlanks++;
        const userBlankAnswer = userAnswers[blankKey]?.trim() || '';
        
        const isBlankCorrect = possibleAnswers.some(acceptedAnswer => 
          caseSensitive 
            ? acceptedAnswer === userBlankAnswer
            : acceptedAnswer.toLowerCase() === userBlankAnswer.toLowerCase()
        );
        
        if (isBlankCorrect) correctCount++;
        
        blankResults.push({
          blank: blankKey,
          userAnswer: userAnswers[blankKey] || '',
          correctAnswers: possibleAnswers,
          isCorrect: isBlankCorrect
        });
      }
      
      const allBlanksCorrect = correctCount === totalBlanks;
      
      return {
        isCorrect: allBlanksCorrect,
        correctAnswer: JSON.stringify(blanks),
        explanation: content.explanation,
        blankResults,
        score: `${correctCount}/${totalBlanks}`
      };
    }

    default:
      return { isCorrect: false, correctAnswer: "" };
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exerciseId, answers } = await request.json();

    // Buscar o exercício
    const exercise = await ExerciseService.getExerciseById(exerciseId);

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Verificar próximo número de tentativa
    const existingSubmissions = await SubmissionService.getStudentSubmissionsByExercise(exerciseId, session.id);
    const nextAttempt = existingSubmissions.length + 1;

    // Corrigir exercício
    const exerciseItems = exercise.exercises as unknown as ExerciseItem[];
    const corrections: CorrectionResult[] = exerciseItems.map((question, index) => {
      const questionId = `q_${index}`;
      const userAnswer = answers[questionId] || "";
      const correction = correctAnswer(question, userAnswer);

      return {
        questionIndex: index,
        question: question.prompt,
        userAnswer,
        isCorrect: correction.isCorrect,
        correctAnswer: correction.correctAnswer,
        explanation: correction.explanation,
        blankResults: correction.blankResults,
      };
    });

    // Calcular pontuação total considerando lacunas individuais
    let totalScore = 0;
    let totalQuestions = 0;

    corrections.forEach(correction => {
      if (correction.blankResults) {
        correction.blankResults.forEach((blankResult) => {
          if (blankResult.isCorrect) totalScore++;
          totalQuestions++;
        });
      } else {
        if (correction.isCorrect) totalScore++;
        totalQuestions++;
      }
    });

    // Salvar submissão
    const submissionId = await SubmissionService.createSubmission({
      exerciseId,
      studentId: session.id,
      answers,
      corrections,
      score: totalScore,
      totalQuestions,
      attempt: nextAttempt,
    });

    return NextResponse.json({
      submissionId,
      score: totalScore,
      totalQuestions,
      attempt: nextAttempt,
      corrections
    });
  } catch (error) {
    logger.error("Error creating submission:", "DATABASE", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
