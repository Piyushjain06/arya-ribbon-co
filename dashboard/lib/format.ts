/**
 * Indian number formatting utilities.
 * Uses Lakh (L) and Crore (Cr) instead of K/M/B.
 */

/**
 * Format a number in full Indian locale style with commas
 * e.g. 8329927 → "₹83,29,927"
 */
export function formatINRFull(value: number): string {
  return (
    '₹' +
    Math.round(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })
  );
}

/**
 * Compact Indian format for chart axes / labels:
 *  ≥ 1 Crore  (1,00,00,000) → "X.XX Cr"
 *  ≥ 1 Lakh   (1,00,000)    → "X.XX L"
 *  Otherwise                → full en-IN number
 */
export function formatINRCompact(value: number): string {
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(2)} L`;
  }
  return '₹' + Math.round(value).toLocaleString('en-IN');
}

/**
 * Short axis tick label — fewer decimal places for cleanliness.
 *  ≥ 1 Cr → "X.X Cr"
 *  ≥ 1 L  → "X.X L"
 */
export function formatINRAxis(value: number): string {
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(1)} Cr`;
  }
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(1)} L`;
  }
  return '₹' + Math.round(value).toLocaleString('en-IN');
}
