export function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d)) return value; // fall back to showing the raw value if it can't be parsed
  return d.toLocaleString();
}
