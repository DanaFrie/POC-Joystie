const ISRAEL_TZ = 'Asia/Jerusalem';

/** Sunday=0 … Saturday=6 in Asia/Jerusalem (matches א…ש tracker columns). */
export function israelSundayBasedDayIndex(date = new Date()): number {
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: ISRAEL_TZ,
    weekday: 'short',
  }).format(date);
  switch (weekday) {
    case 'Sun':
      return 0;
    case 'Mon':
      return 1;
    case 'Tue':
      return 2;
    case 'Wed':
      return 3;
    case 'Thu':
      return 4;
    case 'Fri':
      return 5;
    case 'Sat':
      return 6;
    default:
      return date.getDay();
  }
}

export function areAllDaysChecked(checks: boolean[] | undefined): boolean {
  return Boolean(checks && checks.length === 7 && checks.every(Boolean));
}

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
