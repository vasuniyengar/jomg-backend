export function parseDuprRating(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = parseFloat(String(value).trim());
  if (Number.isNaN(n) || n < 0 || n > 8) return null;
  return Math.round(n * 100) / 100;
}
