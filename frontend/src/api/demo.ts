import { DEMO_LISTINGS } from "../data/demo";

// Demo-mode responses for the static (GitHub Pages) build, where no backend runs.
// Mirrors the success payloads of backend/app/routers so forms show their real confirmation.
// Nothing is sent or stored anywhere.

type Payload = Readonly<Record<string, unknown>>;
type Handler = (p: Payload) => unknown;

const ID_RANGE = 100_000;

const demoId = (): number => Date.now() % ID_RANGE;
const isPayload = (value: unknown): value is Payload =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (p: Payload, key: string): string => String(p[key] ?? "").trim();
const num = (p: Payload, key: string): number => Number(p[key] ?? 0);

/** "2026-11-24" -> "Dienstag, den 24. November" (as the backend phrases it) */
const spokenDate = (iso: string): string => {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  const weekday = date.toLocaleDateString("de-DE", { weekday: "long" });
  const month = date.toLocaleDateString("de-DE", { month: "long" });
  return `${weekday}, den ${date.getDate()}. ${month}`;
};

const HANDLERS: Readonly<Record<string, Handler>> = {
  "/api/viewings": (p) => {
    const title = DEMO_LISTINGS.find((l) => l.id === num(p, "listing_id"))?.title ?? "dieser Immobilie";
    return {
      id: demoId(),
      message: `Ihre private Besichtigung von ${title} ist für ${spokenDate(text(p, "date"))} um ${text(p, "time")} Uhr angefragt.`,
    };
  },
  "/api/valuations": (p) => ({
    id: demoId(),
    message: `Vielen Dank, ${text(p, "name")}. Ihre kostenfreie Bewertung erhalten Sie innerhalb von 48 Stunden.`,
  }),
};

const FALLBACK_MESSAGE = "Vielen Dank! Ihre Anfrage ist eingegangen.";

export function demoResponse(path: string, payload: unknown): unknown {
  const handler = HANDLERS[path];
  const body = isPayload(payload) ? payload : {};
  return handler ? handler(body) : { id: demoId(), message: FALLBACK_MESSAGE };
}
