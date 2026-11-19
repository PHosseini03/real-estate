import type { Listing, PropertyType } from "../data/demo";

export type SortOption = "newest" | "price_asc" | "price_desc" | "sqft_desc";

export interface Filters {
  city: string;
  type: PropertyType | "";
  min_price: number;
  max_price: number;
  beds: number;
  sort: SortOption;
}

export const SORTS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Neueste zuerst" },
  { value: "price_desc", label: "Preis absteigend" },
  { value: "price_asc", label: "Preis aufsteigend" },
  { value: "sqft_desc", label: "Größte Wohnfläche" },
];

export const PRICE_STEPS = [0, 1000000, 1500000, 2000000, 3000000, 5000000, 7500000, 10000000];
export const ANY_MAX = 100000000;
export const DEFAULT_FILTERS: Filters = { city: "", type: "", min_price: 0, max_price: ANY_MAX, beds: 0, sort: "newest" };

const TYPES = new Set(["house", "villa", "apartment", "townhouse"]);
const SORT_VALUES = new Set(SORTS.map((s) => s.value));
const CITY_RE = /^[A-Za-zÄÖÜäöüß .'-]{0,40}$/;

function toInt(value: string | null, fallback: number, min: number, max: number) {
  const n = Number(value);
  return value !== null && value !== "" && Number.isInteger(n) && n >= min && n <= max ? n : fallback;
}

/** Reads filters from the URL, ignoring anything invalid. */
export function parseFilters(params: URLSearchParams): Filters {
  const city = params.get("city") ?? "";
  const type = params.get("type") ?? "";
  const sort = params.get("sort") ?? "newest";
  return {
    city: CITY_RE.test(city) ? city : "",
    type: TYPES.has(type) ? (type as PropertyType) : "",
    min_price: toInt(params.get("min_price"), 0, 0, ANY_MAX),
    max_price: toInt(params.get("max_price"), ANY_MAX, 0, ANY_MAX),
    beds: toInt(params.get("beds"), 0, 0, 20),
    sort: SORT_VALUES.has(sort as SortOption) ? (sort as SortOption) : "newest",
  };
}

/** Serialises only non-default filters, for both the URL and the API query. */
export function toQuery(f: Filters): string {
  const q = new URLSearchParams();
  if (f.city) q.set("city", f.city);
  if (f.type) q.set("type", f.type);
  if (f.min_price > 0) q.set("min_price", String(f.min_price));
  if (f.max_price < ANY_MAX) q.set("max_price", String(f.max_price));
  if (f.beds > 0) q.set("beds", String(f.beds));
  if (f.sort !== "newest") q.set("sort", f.sort);
  return q.toString();
}

const COMPARE: Record<SortOption, (a: Listing, b: Listing) => number> = {
  newest: (a, b) => a.listed_days_ago - b.listed_days_ago,
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  sqft_desc: (a, b) => b.sqft - a.sqft,
};

/** Client-side mirror of the API filter, used when the API is offline. */
export function filterListings(listings: Listing[], f: Filters): Listing[] {
  return listings
    .filter((l) => (!f.city || l.city.toLowerCase() === f.city.toLowerCase()) && (!f.type || l.type === f.type))
    .filter((l) => l.price >= f.min_price && l.price <= f.max_price && l.beds >= f.beds)
    .sort(COMPARE[f.sort]);
}

const EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const DECIMAL = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
const NBSP = " ";

/** Euro price in German format; compact uses "Mio." and "Tsd." (e.g. 4,85 Mio. €). */
export function formatPrice(n: number, compact = false) {
  if (compact && n >= 1000000) return `${DECIMAL.format(Number((n / 1000000).toFixed(2)))}${NBSP}Mio.${NBSP}€`;
  if (compact && n >= 1000) return `${Math.round(n / 1000)}${NBSP}Tsd.${NBSP}€`;
  return EUR.format(n);
}

/** Living area in m², German number format. */
export const formatArea = (m2: number) => `${m2.toLocaleString("de-DE")}${NBSP}m²`;

const TYPE_LABELS: Record<string, string> = { house: "Haus", villa: "Villa", apartment: "Wohnung", townhouse: "Stadthaus" };
export const typeLabel = (t: string) => TYPE_LABELS[t] ?? t.charAt(0).toUpperCase() + t.slice(1);
