/**
 * Shuffle helper that returns both the shuffled items and the permutation mapping indices
 */
export function shuffleWithMapping<T>(items: T[]): { shuffled: T[]; mapping: number[] } {
  const mapping = items.map((_, i) => i);
  for (let i = mapping.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mapping[i], mapping[j]] = [mapping[j], mapping[i]];
  }
  const shuffled = mapping.map((idx) => items[idx]);
  return { shuffled, mapping };
}

/**
 * Reconstruct questions in specified questionOrder and optionOrders
 */
export function reconstructSanitizedQuestions(
  originalQuestions: any[],
  questionOrder: number[],
  optionOrders: number[][]
) {
  return questionOrder.map((origQIdx, displayIdx) => {
    const origQ = originalQuestions[origQIdx];
    const optMapping = optionOrders[displayIdx] || origQ.options.map((_: any, i: number) => i);
    const shuffledOptions = optMapping.map((optIdx: number) => origQ.options[optIdx]);

    return {
      _id: origQ._id || `q_${displayIdx}`,
      displayIndex: displayIdx,
      question: origQ.question,
      options: shuffledOptions,
      timeLimit: origQ.timeLimit || 30,
      marks: origQ.marks || 1,
      // NOTE: correctIndex is STRICTLY OMITTED to prevent leakage to client
    };
  });
}
