/** Local calendar reminder when parent is not with the child yet. */

const ISRAEL_TZ = 'Asia/Jerusalem';
const REMINDER_HOUR = 17;
const REMINDER_MINUTE = 30;
const EVENT_DURATION_MS = 30 * 60 * 1000;

export const JOYSTIE_BONDING_CALENDAR_TITLE = "מצטרפים לג'ויסטי";

function localTimeInZoneToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const desired = Date.UTC(year, month - 1, day, hour, minute, 0);
  let guess = desired;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  for (let i = 0; i < 12; i++) {
    const parts = Object.fromEntries(
      formatter.formatToParts(new Date(guess)).map((p) => [p.type, p.value])
    );
    const displayed = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    const diff = desired - displayed;
    if (diff === 0) break;
    guess += diff;
  }

  return new Date(guess);
}

/** Next 17:30 in Israel — today if still ahead, otherwise tomorrow. */
export function getNextJoystieBondingReminderTimes(now = new Date()): {
  start: Date;
  end: Date;
} {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISRAEL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  for (let offset = 0; offset <= 1; offset++) {
    const probe = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const [year, month, day] = dateParts.format(probe).split('-').map(Number);
    const start = localTimeInZoneToUtc(
      year,
      month,
      day,
      REMINDER_HOUR,
      REMINDER_MINUTE,
      ISRAEL_TZ
    );
    if (start.getTime() > now.getTime()) {
      return { start, end: new Date(start.getTime() + EVENT_DURATION_MS) };
    }
  }

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const [year, month, day] = dateParts.format(tomorrow).split('-').map(Number);
  const start = localTimeInZoneToUtc(
    year,
    month,
    day,
    REMINDER_HOUR,
    REMINDER_MINUTE,
    ISRAEL_TZ
  );
  return { start, end: new Date(start.getTime() + EVENT_DURATION_MS) };
}

function formatIsraelLocalDateTime(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: ISRAEL_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );

  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`;
}

/** Google Calendar “add event” URL. */
export function buildJoystieBondingGoogleCalendarUrl(
  title = JOYSTIE_BONDING_CALENDAR_TITLE,
  now = new Date()
): string {
  const { start, end } = getNextJoystieBondingReminderTimes(now);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatIsraelLocalDateTime(start)}/${formatIsraelLocalDateTime(end)}`,
    ctz: ISRAEL_TZ,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Always Google Calendar (ICS breaks Chrome mobile emulation and is unnecessary). */
export function openJoystieBondingCalendarReminder(): void {
  if (typeof window === 'undefined') return;

  const url = buildJoystieBondingGoogleCalendarUrl();
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
