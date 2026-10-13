// Simple Levenshtein-distance similarity check used to flag guests who
// might be re-submitting the RSVP under a slightly different spelling of
// their name (e.g. "Tan Wei Ming" vs "Tan Wei Min"), so Allen can review
// and merge rather than the system silently blocking or duplicating them.

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

/** Returns a 0..1 similarity score (1 = identical). */
export function nameSimilarity(a: string, b: string): number {
  const normA = a.trim().toLowerCase().replace(/\s+/g, ' ');
  const normB = b.trim().toLowerCase().replace(/\s+/g, ' ');
  if (normA === normB) return 1;
  const dist = levenshtein(normA, normB);
  const maxLen = Math.max(normA.length, normB.length) || 1;
  return 1 - dist / maxLen;
}

/** Names scoring at or above this are flagged as possible duplicates. */
export const DUPLICATE_THRESHOLD = 0.78;

export function findPossibleDuplicates<T extends { full_name: string }>(
  candidateName: string,
  existing: T[]
): Array<T & { score: number }> {
  return existing
    .map((g) => ({ ...g, score: nameSimilarity(candidateName, g.full_name) }))
    .filter((g) => g.score >= DUPLICATE_THRESHOLD && g.score < 1) // exact matches handled separately
    .sort((a, b) => b.score - a.score);
}
