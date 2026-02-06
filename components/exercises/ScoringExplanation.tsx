import { translations } from "@/lib/translations";
import { Info } from "lucide-react";

export function ScoringExplanation() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-2">{translations.scoringExplanation.title}</p>
          <ul className="space-y-1 text-blue-700">
            <li>• <strong>{translations.multipleChoice}:</strong> {translations.scoringExplanation.multipleChoice}</li>
            <li>• <strong>{translations.fillBlank}:</strong> {translations.scoringExplanation.fillBlank}</li>
          </ul>
          <p className="mt-2 text-blue-600">
            <strong>{translations.scoringExplanation.example}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
