/**
 * Extract hourly rate (rateMin/rateMax) from Dutch text when structured fields are missing.
 * Handles patterns like "Tarief: maximaal 86 euro per uur", "uurtarief van €85", "€90 per uur".
 */

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Parse Dutch rate phrases from content/description.
 * Returns rateMin/rateMax when patterns are found; prefers rateMax for "maximaal/tot" phrases.
 */
export function parseRateFromContent(text: string): { rateMin?: number; rateMax?: number } {
  if (!text || typeof text !== 'string') return {};
  const raw = text.includes('<') ? stripHtml(text) : text;
  const lower = raw.toLowerCase();

  // Range: "€85–90", "85-90 euro", "85 – 90 euro per uur"
  const rangeMatch = raw.match(/(?:€?\s*)(\d+)\s*[–\-]\s*(\d+)(?:\s*(?:euro|€)\s*per\s*uur)?/i)
    || lower.match(/(\d+)\s*[–\-]\s*(\d+)\s*(?:euro\s*per\s*uur)?/);
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1], 10);
    const b = parseInt(rangeMatch[2], 10);
    if (!isNaN(a) && !isNaN(b) && a > 0 && b > 0)
      return { rateMin: Math.min(a, b), rateMax: Math.max(a, b) };
  }

  // Max-only: "Tarief: maximaal 86 euro per uur", "maximaal 86 euro", "tot €90 per uur"
  const maximaalMatch = raw.match(/(?:tarief|rate)\s*:\s*maximaal\s+(\d+)/i) ?? raw.match(/maximaal\s+(\d+)\s*(?:euro|€)?/i);
  if (maximaalMatch?.[1]) {
    const n = parseInt(maximaalMatch[1], 10);
    if (!isNaN(n) && n > 0) return { rateMax: n };
  }
  const totMatch = raw.match(/tot\s*€?\s*(\d+)/i);
  if (totMatch?.[1]) {
    const n = parseInt(totMatch[1], 10);
    if (!isNaN(n) && n > 0) return { rateMax: n };
  }
  const euroPerUurMatch = raw.match(/(\d+)\s*(?:euro|€)\s*per\s*uur/i);
  if (euroPerUurMatch?.[1]) {
    const n = parseInt(euroPerUurMatch[1], 10);
    if (!isNaN(n) && n > 0) return { rateMax: n };
  }

  // "uurtarief van €X", "van €X per uur"
  const vanMatch = lower.match(/uurtarief\s+van\s*€?\s*(\d+)|van\s*€?\s*(\d+)\s*per\s*uur/);
  if (vanMatch) {
    const n = parseInt(vanMatch[1] || vanMatch[2], 10);
    if (!isNaN(n) && n > 0) return { rateMax: n };
  }

  // Standalone "€86" or "86 euro" near "per uur" / "uur"
  const standalone = raw.match(/€?\s*(\d+)\s*(?:euro|€)?\s*per\s*uur/i);
  if (standalone) {
    const n = parseInt(standalone[1], 10);
    if (!isNaN(n) && n > 0) return { rateMax: n };
  }

  return {};
}
