import { describe, expect, it, vi } from "vitest";
import { ANY_MAX, DEFAULT_FILTERS, filterListings, formatArea, formatPrice, parseFilters, toQuery, typeLabel } from "../lib/listings";
import { calcMortgage } from "../lib/mortgage";
import { addDays, checkViewingDate, isoDate } from "../lib/dates";
import { rules, validate } from "../lib/validation";
import { api, ApiError, request } from "../api/client";
import { DEMO_LISTINGS } from "../data/demo";

describe("listing filters", () => {
  it("parses valid params and ignores invalid ones", () => {
    const f = parseFilters(new URLSearchParams("city=München&type=villa&min_price=1000000&beds=4&sort=price_asc"));
    expect(f).toEqual({ city: "München", type: "villa", min_price: 1000000, max_price: ANY_MAX, beds: 4, sort: "price_asc" });
    const bad = parseFilters(new URLSearchParams("city=<script>&type=castle&min_price=-1&beds=abc&sort=drop"));
    expect(bad).toEqual(DEFAULT_FILTERS);
  });

  it("serialises only non-default values", () => {
    expect(toQuery(DEFAULT_FILTERS)).toBe("");
    expect(toQuery({ ...DEFAULT_FILTERS, city: "Berlin", max_price: 2000000, sort: "sqft_desc" })).toBe("city=Berlin&max_price=2000000&sort=sqft_desc");
  });

  it("filters and sorts like the API", () => {
    const miami = filterListings(DEMO_LISTINGS, { ...DEFAULT_FILTERS, city: "münchen", sort: "price_asc" });
    expect(miami.length).toBe(3);
    expect(miami.every((l) => l.city === "München")).toBe(true);
    expect(miami.map((l) => l.price)).toEqual([...miami.map((l) => l.price)].sort((a, b) => a - b));
    expect(filterListings(DEMO_LISTINGS, { ...DEFAULT_FILTERS, type: "villa", beds: 6 }).map((l) => l.id)).toEqual([3]);
    const big = filterListings(DEMO_LISTINGS, { ...DEFAULT_FILTERS, sort: "sqft_desc" });
    expect(big[0].sqft).toBeGreaterThanOrEqual(big[big.length - 1].sqft);
    const desc = filterListings(DEMO_LISTINGS, { ...DEFAULT_FILTERS, sort: "price_desc", min_price: 1000000, max_price: 3000000 });
    expect(desc.every((l) => l.price >= 1000000 && l.price <= 3000000)).toBe(true);
  });

  it("formats prices", () => {
    const nb = "\u00a0";
    expect(formatPrice(4850000)).toBe(`4.850.000${nb}€`);
    expect(formatPrice(4850000, true)).toBe(`4,85${nb}Mio.${nb}€`);
    expect(formatPrice(2000000, true)).toBe(`2${nb}Mio.${nb}€`);
    expect(formatPrice(750000, true)).toBe(`750${nb}Tsd.${nb}€`);
    expect(formatPrice(500, true)).toBe(`500${nb}€`);
    expect(formatArea(1250)).toBe(`1.250${nb}m²`);
    expect(typeLabel("villa")).toBe("Villa");
    expect(typeLabel("house")).toBe("Haus");
    expect(typeLabel("apartment")).toBe("Wohnung");
    expect(typeLabel("townhouse")).toBe("Stadthaus");
    expect(typeLabel("loft")).toBe("Loft");
  });
});

describe("mortgage", () => {
  it("computes a standard 30-year payment", () => {
    const r = calcMortgage({ price: 1000000, downPercent: 20, ratePercent: 6, years: 30 });
    expect(r.down).toBe(200000);
    expect(r.loan).toBe(800000);
    expect(r.monthly).toBe(4796);
    expect(r.totalInterest).toBeGreaterThan(900000);
  });

  it("handles zero interest and zero loan", () => {
    expect(calcMortgage({ price: 360000, downPercent: 0, ratePercent: 0, years: 30 }).monthly).toBe(1000);
    expect(calcMortgage({ price: 100, downPercent: 100, ratePercent: 5, years: 30 }).monthly).toBe(0);
  });
});

describe("viewing dates", () => {
  const today = new Date(2026, 10, 15);
  it("accepts dates in the window only", () => {
    expect(isoDate(today)).toBe("2026-11-15");
    expect(checkViewingDate("2026-11-16", today)).toBeNull();
    expect(checkViewingDate("2026-11-15", today)).toMatch(/Zukunft/);
    expect(checkViewingDate(isoDate(addDays(today, 200)), today)).toMatch(/innerhalb/);
    expect(checkViewingDate("", today)).toMatch(/wählen Sie ein Datum/);
  });
});

describe("validation", () => {
  it("flags each invalid field", () => {
    const schema = { name: [rules.name], email: [rules.email], phone: [rules.phone], beds: [rules.number("Schlafzimmer", 0, 20)], note: [rules.safeText] };
    expect(validate({ name: "Lena Hoffmann", email: "a@example.com", phone: "+49 89 5550 0100", beds: "3", note: "" }, schema)).toEqual({});
    expect(Object.keys(validate({ name: "<b>", email: "x", phone: "y", beds: "99", note: "<i>" }, schema)).sort()).toEqual(["beds", "email", "name", "note", "phone"]);
    expect(rules.required("Uhrzeit")("")).toBe("Uhrzeit ist erforderlich");
  });
});

describe("api client", () => {
  it("unwraps success and surfaces errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { ok: 1 }, error: null }))));
    await expect(api.get("/api/x")).resolves.toEqual({ ok: 1 });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, data: null, error: "Objekt nicht gefunden." }), { status: 404 })));
    await expect(api.post("/api/x", {})).rejects.toThrow("Objekt nicht gefunden.");
  });

  it("flags network and non-JSON failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const err = await request("/api/x").catch((e: unknown) => e);
    expect((err as ApiError).isNetwork).toBe(true);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html>", { status: 502 })));
    await expect(request("/api/x")).rejects.toThrow("unerwartete Antwort");
  });
});
