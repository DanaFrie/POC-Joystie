# Cardcom Low Profile — Joystie v0.3 skin

Custom HTML/CSS for Cardcom hosted checkout (trial token capture).

| File | Paste into |
|------|------------|
| `payment.html` | Cardcom Low Profile **custom HTML** |
| `payment.css` | Cardcom Low Profile **custom CSS** |

Design: [Figma 14239:13158](https://www.figma.com/design/JzP4ygtXS3V7KSXiPro7hA/Joystie---Platform?node-id=14239-13158&m=dev)

Synced from Figma MCP `get_design_context` on node `14239:13158` (Screen 42/43). iPhone status/home chrome omitted. Re-paste both files into Cardcom after updates.

Icons are **inline SVG** in `payment.html` (credit-card + info). Copies also in `assets/`.

## Required footer copy

Must remain visible:

**הסליקה מתבצעת דרך קארדקום**

(also in `.footer-required` in HTML)

## Cardcom console rules

Do **not** reintroduce these — save will fail:

**HTML** — forbidden tags: `embed`, `object`, `frameset`, `frame`, `iframe`, `meta`, `link`, `style`  
Also **no inline event handlers** (`onclick`, `onfocus`, `onerror`, …).

**CSS**

- `http:` URLs (use relative `/Images/...` or `https:`)
- SVG `xmlns="http://…"` — omit `xmlns` on inline SVG (HTML5)
- CSS variables (`:root`, `var(--…)`)
- Backslash escapes (`\2713`, etc.)
- `@import` (e.g. Google Fonts)

**Rubik:** `@font-face` in `payment.css` with `https://fonts.gstatic.com/...` (no `<link>`, no `@import`).

## Fixed in template (vs Cardcom defaults)

| Figma | How |
|-------|-----|
| Title הזנת אמצעי תשלום | Static `.hero-title` (hides Cardcom `lph1`) |
| Button אישור | `value="אישור"` without `buttonText` bind |
| Short field labels | Static labels (no Knockout `text:` overwrite) |
| Expiry + CVV one row | `display:table` (floats break in Cardcom) |
| CVV max 3 digits | `maxlength="3"` on `#txtCvv` |
| תוקף / CVV labels | `text-align: right` on split `.fieldName` |
| Month / year placeholders | `חודש` / `שנה` when empty; hidden from open list (`hidden` + CSS) |
| Phone for 3DS | Visible when `cardOwnerPhone.hide` is false |
| No מספר תשלומים | `.payments-count-row { display:none }` |
| Card icon | Inline SVG in `.card-icon` |
| Info icon | Inline SVG in `.totalPill-info` |

## Hidden by CSS

- Invoice block (`.OrderDetails`)
- Section titles / company details
- Green validation dots / CVV help icon
- Number of payments row
- Figma iPhone status bar / home indicator (not in HTML)
