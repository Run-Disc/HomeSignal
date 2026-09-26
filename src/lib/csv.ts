const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function neutralizeSpreadsheetText(value: string): string {
  if (value.length === 0) return value;
  if (FORMULA_PREFIX.test(value)) return `'${value}`;
  return value;
}

export function csvEscape(value: string | number | null | undefined): string {
  const raw = value == null ? "" : String(value);
  const safe = neutralizeSpreadsheetText(raw);
  return `"${safe.replaceAll('"', '""')}"`;
}

export function toCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(","));
  }
  return `${lines.join("\r\n")}\r\n`;
}
