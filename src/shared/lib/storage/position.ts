export const POSITION_GAP = 1000;
export const MIN_GAP = 1;

/**
 * Calculate position for inserting an item.
 * - No neighbors: returns POSITION_GAP
 * - Only after (prepend): returns after / 2
 * - Only before (append): returns before + POSITION_GAP
 * - Between: returns midpoint of before and after
 */
export function calculatePosition(before?: number, after?: number): number {
  if (before === undefined && after === undefined) {
    return POSITION_GAP;
  }
  if (before === undefined && after !== undefined) {
    return after / 2;
  }
  if (before !== undefined && after === undefined) {
    return before + POSITION_GAP;
  }
  // both defined
  return ((before as number) + (after as number)) / 2;
}

/**
 * Check if reindexing is needed (gap between adjacent sorted positions < MIN_GAP).
 */
export function needsReindex(positions: number[]): boolean {
  if (positions.length < 2) return false;
  const sorted = [...positions].sort((a, b) => a - b);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev !== undefined && curr !== undefined && curr - prev < MIN_GAP) {
      return true;
    }
  }
  return false;
}

/**
 * Reindex items to even POSITION_GAP spacing.
 * Items must be sorted by position before calling.
 */
export function reindexPositions<T extends { position: number }>(
  items: T[],
): T[] {
  return items.map((item, index) => ({
    ...item,
    position: (index + 1) * POSITION_GAP,
  }));
}
