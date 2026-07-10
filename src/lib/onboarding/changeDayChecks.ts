/** Firestore-safe day-check rows (nested boolean[][] is rejected by Firestore). */
export type ChangeDayChecksRow = {
  days: boolean[];
};

export function emptyDayChecks(): boolean[] {
  return [false, false, false, false, false, false, false];
}

export function buildChangeDayCheckRows(changeCount: number): ChangeDayChecksRow[] {
  const n = Math.max(0, Math.min(2, changeCount));
  return Array.from({ length: n }, () => ({ days: emptyDayChecks() }));
}

/** Normalize Firestore / legacy in-memory shapes to a boolean[][] matrix. */
export function changeDayChecksToMatrix(
  value: ChangeDayChecksRow[] | boolean[][] | Record<string, boolean[]> | null | undefined
): boolean[][] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((row) => {
      if (Array.isArray(row)) return row.length === 7 ? [...row] : emptyDayChecks();
      if (row && typeof row === 'object' && Array.isArray((row as ChangeDayChecksRow).days)) {
        const days = (row as ChangeDayChecksRow).days;
        return days.length === 7 ? [...days] : emptyDayChecks();
      }
      return emptyDayChecks();
    });
  }

  if (typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => {
        const days = value[key];
        return Array.isArray(days) && days.length === 7 ? [...days] : emptyDayChecks();
      });
  }

  return [];
}

export function matrixToChangeDayCheckRows(matrix: boolean[][]): ChangeDayChecksRow[] {
  return matrix.map((days) => ({
    days: days.length === 7 ? [...days] : emptyDayChecks(),
  }));
}
