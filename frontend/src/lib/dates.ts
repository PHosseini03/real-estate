const DAY_MS = 86400000;
export const MAX_DAYS_AHEAD = 180;

/** Local calendar date as YYYY-MM-DD (avoids UTC shifting). */
export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * DAY_MS);
}

/** Validates a viewing date: must be after today and within the booking window. */
export function checkViewingDate(value: string, today = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Bitte wählen Sie ein Datum";
  if (value <= isoDate(today)) return "Bitte wählen Sie ein Datum in der Zukunft";
  if (value > isoDate(addDays(today, MAX_DAYS_AHEAD))) return `Bitte wählen Sie ein Datum innerhalb der nächsten ${MAX_DAYS_AHEAD} Tage`;
  return null;
}
