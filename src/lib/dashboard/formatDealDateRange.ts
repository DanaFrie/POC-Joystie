const HE_MONTHS = [
  'בינואר',
  'בפברואר',
  'במרץ',
  'באפריל',
  'במאי',
  'ביוני',
  'ביולי',
  'באוגוסט',
  'בספטמבר',
  'באוקטובר',
  'בנובמבר',
  'בדצמבר',
] as const;

/** Inclusive challenge window label, e.g. `9-16 באוגוסט` or `31 באוגוסט-6 בספטמבר`. */
export function formatDealDateRange(startIso?: string, challengeDays = 6): string {
  if (!startIso) return '';
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return '';
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(0, challengeDays - 1));

  const sd = start.getDate();
  const ed = end.getDate();
  const sm = HE_MONTHS[start.getMonth()];
  const em = HE_MONTHS[end.getMonth()];

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${sd}-${ed} ${sm}`;
  }
  return `${sd} ${sm}-${ed} ${em}`;
}
