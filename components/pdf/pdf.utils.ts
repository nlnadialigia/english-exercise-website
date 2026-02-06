export function parseQuestion(question: string) {
  const regex = /\{\{([^}]+)\}\}/g;
  const parts: { text: string; isAnswer: boolean; }[] = [];

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(question)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: question.slice(lastIndex, match.index),
        isAnswer: false,
      });
    }

    parts.push({
      text: match[1].trim(),
      isAnswer: true,
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < question.length) {
    parts.push({
      text: question.slice(lastIndex),
      isAnswer: false,
    });
  }

  return parts;
}