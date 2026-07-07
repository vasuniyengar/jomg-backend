function roundDuprDecimal(n) {
  return Math.round(n * 100) / 100;
}

export function parseDuprRating(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = parseFloat(String(value).trim());
  if (Number.isNaN(n) || n < 0 || n > 8) return null;
  return roundDuprDecimal(n);
}

export function parseDuprCombinedRating(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = parseFloat(String(value).trim());
  if (Number.isNaN(n) || n < 0 || n > 99.99) return null;
  return roundDuprDecimal(n);
}
