/** Google Calendar reminder — next 17:30 Israel, same slot as the in-app bonding reminder. */

const ISRAEL_TZ = 'Asia/Jerusalem';
const REMINDER_HOUR = 17;
const REMINDER_MINUTE = 30;
const EVENT_DURATION_MS = 30 * 60 * 1000;

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
      Number(parts.hour) % 24,
      Number(parts.minute),
      Number(parts.second)
    );
    const diff = desired - displayed;
    if (diff === 0) break;
    guess += diff;
  }
  return new Date(guess);
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
  const hour = String(Number(parts.hour) % 24).padStart(2, '0');
  return `${parts.year}${parts.month}${parts.day}T${hour}${parts.minute}${parts.second}`;
}

export function buildBondingCalendarUrl(onboardingUrl: string, now = new Date()): string {
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISRAEL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  let start = now;
  for (let offset = 0; offset <= 1; offset++) {
    const probe = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const [year, month, day] = dateParts.format(probe).split('-').map(Number);
    const candidate = localTimeInZoneToUtc(year, month, day, REMINDER_HOUR, REMINDER_MINUTE, ISRAEL_TZ);
    if (candidate.getTime() > now.getTime()) {
      start = candidate;
      break;
    }
  }

  const end = new Date(start.getTime() + EVENT_DURATION_MS);
  const details = [
    'תזכורת להמשיך את תהליך הצירוף לג׳ויסטי כשאתם יחד.',
    '',
    onboardingUrl,
  ].join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'מצטרפים לג׳ויסטי',
    dates: `${formatIsraelLocalDateTime(start)}/${formatIsraelLocalDateTime(end)}`,
    details,
    location: onboardingUrl,
    ctz: ISRAEL_TZ,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
