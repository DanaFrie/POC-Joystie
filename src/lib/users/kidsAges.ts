/** Extract age strings from user kidsAges (legacy string[] or { age, dailyScreenTimeHours }[]). */
export function extractKidAgeStrings(kidsAges: unknown): string[] {
  if (!Array.isArray(kidsAges)) return [];
  return kidsAges
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (entry && typeof entry === 'object' && 'age' in entry) {
        return String((entry as { age: string }).age).trim();
      }
      return '';
    })
    .filter(Boolean);
}
