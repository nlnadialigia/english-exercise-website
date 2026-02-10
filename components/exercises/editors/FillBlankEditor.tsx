import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { FillBlankContent } from "@/lib/types";

interface FillBlankEditorProps {
  content: FillBlankContent;
  setContent: (content: FillBlankContent) => void;
}

export function FillBlankEditor({ content, setContent }: FillBlankEditorProps) {
  const [text, setText] = useState(content.text || "");
  const [blanks, setBlanks] = useState<Record<string, string[]>>(content.blanks || {});
  const [caseSensitive, setCaseSensitive] = useState(content.caseSensitive || false);

  useEffect(() => {
    setContent({
      text,
      blanks,
      caseSensitive,
    });
  }, [text, blanks, caseSensitive]);

  const extractBlanks = (inputText: string) => {
    // Primeiro, converter ___ para {{palavra}} automaticamente
    let processedText = inputText;
    let blankIndex = 1;
    
    processedText = processedText.replace(/_+/g, () => {
      return `{{word${blankIndex++}}}`;
    });
    
    // Depois extrair as lacunas normalmente
    const matches = processedText.match(/{{(.*?)}}/g);
    if (matches) {
      const newBlanks: Record<string, string[]> = {};
      matches.forEach(match => {
        const key = match.replace(/[{}]/g, "");
        if (!newBlanks[key]) {
          newBlanks[key] = blanks[key] || [""];
        }
      });
      setBlanks(newBlanks);
      setText(processedText);
    }
  };

  const updateBlankAnswers = (key: string, answers: string) => {
    const answerArray = answers.split(",").map(a => a.trim()).filter(a => a);
    setBlanks(prev => ({ ...prev, [key]: answerArray }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text with Blanks</Label>
        <Textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            extractBlanks(e.target.value);
          }}
          placeholder="Type text using {{word}} to create blanks..."
          rows={4}
        />
        <p className="text-sm text-muted-foreground">
          Use {"{{word}}"} to create blanks. Example: "She {"{{verb}}"} studying English for {"{{time}}"}." or use ___ and then define the answers.
        </p>
      </div>

      {Object.keys(blanks).length > 0 && (
        <div className="space-y-4">
          <Label>Accepted Answers (separated by comma)</Label>
          {Object.keys(blanks).map(key => (
            <div key={key} className="space-y-2">
              <Label className="text-sm font-medium">Blank: {key}</Label>
              <Input
                value={blanks[key].join(", ")}
                onChange={(e) => updateBlankAnswers(key, e.target.value)}
                placeholder="answer1, answer2, answer3"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="caseSensitive"
          checked={caseSensitive}
          onChange={(e) => setCaseSensitive(e.target.checked)}
        />
        <Label htmlFor="caseSensitive">Case sensitive</Label>
      </div>
    </div>
  );
}
