import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

interface ExerciseBackButtonProps {
  exerciseId: string;
}

export function ExerciseBackButton({ exerciseId }: ExerciseBackButtonProps) {
  return (
    <div className="mt-8 flex justify-center gap-4">
      <Button variant="outline" asChild>
        <Link href="/dashboard/student">
          Back to Dashboard
        </Link>
      </Button>

      <Button asChild>
        <Link href={`/dashboard/student/exercises/${exerciseId}`}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Try again
        </Link>
      </Button>
    </div>
  );
}