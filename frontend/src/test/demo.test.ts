import { demoResponse } from "../api/demo";

describe("demoResponse (static demo build)", () => {
  it("confirms /api/viewings like the backend does", () => {
    const result = demoResponse("/api/viewings", {"listing_id":-1,"date":"2026-11-24","time":"10:00"}) as Record<string, unknown>;
    expect(typeof result.id).toBe("number");
    expect(result.message).toContain("um 10:00 Uhr");
    expect(result).toMatchObject({});
  });

  it("confirms /api/valuations like the backend does", () => {
    const result = demoResponse("/api/valuations", {"name":"Avery"}) as Record<string, unknown>;
    expect(typeof result.id).toBe("number");
    expect(result.message).toContain("48 Stunden");
    expect(result).toMatchObject({});
  });

  it("falls back to a generic confirmation for unknown endpoints and bad payloads", () => {
    const result = demoResponse("/api/unknown", null) as Record<string, unknown>;
    expect(typeof result.id).toBe("number");
    expect(result.message).toBe("Vielen Dank! Ihre Anfrage ist eingegangen.");
  });
});
