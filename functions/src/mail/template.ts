export type MailLang = 'he' | 'en';

export interface MailButton {
  label: string;
  href: string;
}

export interface PlainMailInput {
  lang: MailLang;
  preview: string;
  /** Paragraphs before the links. */
  before: string[];
  buttons?: MailButton[];
  /** Paragraphs after the links (sign-off). */
  after: string[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const INLINE_LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;

/** `[label](url)` becomes an underlined link; the rest of the line stays plain text. */
function renderInline(value: string, font: string): string {
  const links = new RegExp(INLINE_LINK.source, 'g');
  let html = '';
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = links.exec(value)) !== null) {
    const index = match.index;
    html += escapeHtml(value.slice(last, index));
    html += `<a href="${escapeHtml(match[2])}" style="color:#262135;font-family:${font};font-size:14px;text-decoration:underline;">${escapeHtml(match[1])}</a>`;
    last = index + match[0].length;
  }
  html += escapeHtml(value.slice(last));
  return html;
}

function plainInline(value: string): string {
  return value.replace(new RegExp(INLINE_LINK.source, 'g'), '$1 ($2)');
}

/**
 * Plain lifecycle mail: Rubik 14px, logo keeps its aspect ratio,
 * aligned to the start edge (right in Hebrew, left in English).
 */
export function renderPlainMail(input: PlainMailInput): { html: string; text: string } {
  const rtl = input.lang === 'he';
  const dir = rtl ? 'rtl' : 'ltr';
  const align = rtl ? 'right' : 'left';
  // Gmail ignores Rubik and uses the next installed face. Roboto is on Gmail's list; Arial is not required.
  const font = "Rubik, Roboto, Helvetica, sans-serif";
  const fontFace = `
    @font-face { font-family: 'Rubik'; font-style: normal; font-weight: 400; src: url(https://fonts.gstatic.com/s/rubik/v31/iJWKBXyIfDnIV7nDrXyi0A.woff2) format('woff2'); unicode-range: U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F; }
    @font-face { font-family: 'Rubik'; font-style: normal; font-weight: 400; src: url(https://fonts.gstatic.com/s/rubik/v31/iJWKBXyIfDnIV7nBrXw.woff2) format('woff2'); unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+20AC, U+2122; }
  `;

  const paragraphs = (lines: string[]) =>
    lines
      .map((line) => {
        const rows = line.split('\n').map((row) => renderInline(row, font)).join('<br>');
        return `<p style="margin:0 0 14px;font-family:${font};font-size:14px;line-height:1.6;color:#262135;text-align:${align};">${rows}</p>`;
      })
      .join('');

  const buttons = (input.buttons ?? [])
    .map(
      (button) =>
        `<p style="margin:0 0 14px;font-family:${font};font-size:14px;line-height:1.6;text-align:${align};"><a href="${escapeHtml(button.href)}" style="color:#262135;font-family:${font};font-size:14px;text-decoration:underline;">${escapeHtml(button.label)}</a></p>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${input.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400&amp;display=swap" rel="stylesheet">
  <style>${fontFace}</style>
  <title>Joystie</title>
</head>
<body style="margin:0;padding:24px;background:#ffffff;font-family:${font};font-size:14px;font-weight:400;color:#262135;direction:${dir};text-align:${align};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(input.preview)}</div>
  <div style="text-align:${align};margin:0 0 20px;">
    <img src="cid:joystie-logo" alt="Joystie" width="74" height="36" style="width:74px;height:36px;display:inline-block;border:0;outline:none;" />
  </div>
  ${paragraphs(input.before)}
  ${buttons}
  ${paragraphs(input.after)}
</body>
</html>`;

  const text = [
    input.preview,
    '',
    ...input.before.map(plainInline),
    '',
    ...(input.buttons ?? []).map((button) => `${button.label}: ${button.href}`),
    '',
    ...input.after.map(plainInline),
  ]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { html, text };
}
