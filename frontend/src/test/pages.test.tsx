import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import { DEMO_AGENTS, DEMO_LISTINGS } from "../data/demo";
import { mockApi, renderAt } from "./render";

const offline = () => vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
const detail = { ...DEMO_LISTINGS[1], agent: DEMO_AGENTS.find((a) => a.id === DEMO_LISTINGS[1].agent_id) };

describe("home and navigation", () => {
  it("renders hero, featured listings and agents", async () => {
    vi.stubGlobal("fetch", mockApi({ "/api/listings": DEMO_LISTINGS.slice(0, 3), "/api/agents": DEMO_AGENTS }));
    renderAt(<App />);
    expect(screen.getByRole("heading", { level: 1, name: /wohnen in seiner schönsten form/i })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: DEMO_LISTINGS[0].title })).toBeInTheDocument();
    expect(screen.getAllByText("Charlotte von Arnim").length).toBeGreaterThan(0);
  });

  it("hero search navigates to filtered listings", async () => {
    offline();
    renderAt(<App />);
    await userEvent.selectOptions(screen.getByLabelText("Standort"), "Hamburg");
    await userEvent.selectOptions(screen.getByLabelText("Objektart"), "apartment");
    await userEvent.click(screen.getByRole("button", { name: /suchen/i }));
    expect(await screen.findByRole("heading", { level: 1, name: /residenzen zum kauf/i })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Gartenwohnung Harvestehude" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Villa am Isarhochufer" })).not.toBeInTheDocument();
  });

  it("toggles the mobile menu and shows 404", async () => {
    offline();
    const { unmount } = renderAt(<App />);
    await userEvent.click(screen.getByRole("button", { name: /menü öffnen/i }));
    expect(screen.getByRole("button", { name: /menü schließen/i })).toHaveAttribute("aria-expanded", "true");
    unmount();
    renderAt(<App />, "/nowhere");
    expect(screen.getByRole("heading", { name: /nicht mehr auf dem markt/i })).toBeInTheDocument();
  });

  it("renders the agents page", async () => {
    vi.stubGlobal("fetch", mockApi({ "/api/agents": DEMO_AGENTS }));
    renderAt(<App />, "/agents");
    expect(await screen.findByRole("heading", { name: "Jonas Weber" })).toBeInTheDocument();
  });
});

describe("listings page", () => {
  it("falls back to demo data offline and filters by beds", async () => {
    offline();
    renderAt(<App />, "/listings");
    expect(await screen.findByText("(Offline-Demodaten)")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(12);
    await userEvent.selectOptions(screen.getByLabelText("Schlafzimmer"), "5");
    await waitFor(() => expect(screen.getAllByRole("article").length).toBeLessThan(12));
    await userEvent.click(screen.getByRole("button", { name: /filter zurücksetzen/i }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(12));
  });

  it("shows an empty state when nothing matches", async () => {
    offline();
    renderAt(<App />, "/listings?city=Berlin&type=villa");
    expect(await screen.findByText(/keine residenzen entsprechen/i)).toBeInTheDocument();
  });

  it("warns when the price range is inverted", async () => {
    offline();
    renderAt(<App />, "/listings?min_price=5000000&max_price=1000000");
    expect(await screen.findByText(/mindestpreis liegt über dem höchstpreis/i)).toBeInTheDocument();
  });

  it("requests the API with the filter query", async () => {
    const fetchMock = mockApi({ "/api/listings": DEMO_LISTINGS.filter((l) => l.city === "Berlin") });
    vi.stubGlobal("fetch", fetchMock);
    renderAt(<App />, "/listings?city=Berlin&sort=price_desc");
    expect(await screen.findByRole("heading", { name: "Stadtvilla Grunewald" })).toBeInTheDocument();
    expect(fetchMock.mock.calls.some((c) => String(c[0]) === "/api/listings?city=Berlin&sort=price_desc")).toBe(true);
  });
});

describe("listing detail", () => {
  it("shows gallery, mortgage and agent, and switches photos", async () => {
    vi.stubGlobal("fetch", mockApi({ "/api/listings/2": detail }));
    renderAt(<App />, "/listings/2");
    expect(await screen.findByRole("heading", { level: 1, name: "Haus Elbhang" })).toBeInTheDocument();
    expect(screen.getByText("Maximilian Hartmann")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Foto 3 anzeigen" }));
    expect(screen.getByText("3 / 4")).toBeInTheDocument();
    const monthly = () => screen.getByText("/ Monat").parentElement?.textContent;
    const before = monthly();
    await userEvent.click(screen.getByRole("button", { name: "20 Jahre" }));
    fireEvent.change(screen.getByLabelText("Eigenkapital"), { target: { value: "40" } });
    fireEvent.change(screen.getByLabelText("Sollzins"), { target: { value: "4" } });
    expect(monthly()).not.toBe(before);
  });

  it("shows not found for unknown ids", async () => {
    offline();
    renderAt(<App />, "/listings/999");
    expect(await screen.findByRole("heading", { name: /nicht mehr auf dem markt/i })).toBeInTheDocument();
  });

  it("validates and submits a viewing request", async () => {
    const fetchMock = mockApi({ "/api/listings/2": detail, "/api/viewings": { id: 3, message: "Ihre private Besichtigung von Haus Elbhang ist angefragt." } });
    vi.stubGlobal("fetch", fetchMock);
    renderAt(<App />, "/listings/2");
    await screen.findByRole("heading", { level: 1, name: "Haus Elbhang" });
    await userEvent.click(screen.getByRole("button", { name: /besichtigung anfragen/i }));
    expect(screen.getByText("Bitte wählen Sie eine Uhrzeit")).toBeInTheDocument();
    expect(screen.getByText("Bitte geben Sie Ihren vollständigen Namen ein")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "14:00" }));
    await userEvent.type(screen.getByLabelText("Vollständiger Name"), "Lena Hoffmann");
    await userEvent.type(screen.getByLabelText("E-Mail"), "lena@example.com");
    await userEvent.type(screen.getByLabelText("Telefon"), "089 5550 0100");
    await userEvent.click(screen.getByRole("button", { name: /besichtigung anfragen/i }));
    expect(await screen.findByRole("heading", { name: "Besichtigung angefragt" })).toBeInTheDocument();
    const post = fetchMock.mock.calls.find((c) => String(c[0]) === "/api/viewings") as unknown as [string, RequestInit];
    expect(JSON.parse(post[1].body as string)).toMatchObject({ listing_id: 2, time: "14:00", name: "Lena Hoffmann" });
    await userEvent.click(screen.getByRole("button", { name: /weiteren termin anfragen/i }));
    expect(screen.getByRole("button", { name: /besichtigung anfragen/i })).toBeInTheDocument();
  });

  it("shows an error toast when booking fails", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url === "/api/viewings"
        ? new Response(JSON.stringify({ success: false, data: null, error: "Objekt nicht gefunden." }), { status: 404 })
        : new Response(JSON.stringify({ success: true, data: detail, error: null })),
    );
    vi.stubGlobal("fetch", fetchMock);
    renderAt(<App />, "/listings/2");
    await screen.findByRole("heading", { level: 1, name: "Haus Elbhang" });
    await userEvent.click(screen.getByRole("button", { name: "09:00" }));
    await userEvent.type(screen.getByLabelText("Vollständiger Name"), "Lena Hoffmann");
    await userEvent.type(screen.getByLabelText("E-Mail"), "lena@example.com");
    await userEvent.type(screen.getByLabelText("Telefon"), "089 5550 0100");
    await userEvent.click(screen.getByRole("button", { name: /besichtigung anfragen/i }));
    expect(await screen.findByText(/konnte nicht gebucht werden/i)).toBeInTheDocument();
  });
});

describe("sell page", () => {
  it("rejects invalid input then submits a valuation", async () => {
    const fetchMock = mockApi({ "/api/valuations": { id: 12, message: "Vielen Dank, Lena Hoffmann. Ihre kostenfreie Bewertung erhalten Sie innerhalb von 48 Stunden." } });
    vi.stubGlobal("fetch", fetchMock);
    renderAt(<App />, "/sell");
    await userEvent.click(screen.getByRole("button", { name: /bewertung anfordern/i }));
    expect(await screen.findByText("Bitte geben Sie eine gültige E-Mail-Adresse ein")).toBeInTheDocument();
    expect(fetchMock.mock.calls.some((c) => String(c[0]) === "/api/valuations")).toBe(false);
    await userEvent.type(screen.getByLabelText("Adresse der Immobilie"), "Prinzregentenstraße 22, München");
    await userEvent.selectOptions(screen.getByLabelText("Objektart"), "villa");
    await userEvent.type(screen.getByLabelText("Vollständiger Name"), "Lena Hoffmann");
    await userEvent.type(screen.getByLabelText("E-Mail"), "lena@example.com");
    await userEvent.type(screen.getByLabelText("Telefon"), "089 5550 0100");
    await userEvent.click(screen.getByRole("button", { name: /bewertung anfordern/i }));
    expect(await screen.findByText(/Referenznummer SKY-00012/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /neue anfrage/i }));
    expect(screen.getByLabelText("Vollständiger Name")).toHaveValue("");
  });

  it("shows an error toast when the server fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, data: null, error: "Zu viele Anfragen." }), { status: 429 })));
    renderAt(<App />, "/sell");
    await userEvent.type(screen.getByLabelText("Adresse der Immobilie"), "Prinzregentenstraße 22, München");
    await userEvent.type(screen.getByLabelText("Vollständiger Name"), "Lena Hoffmann");
    await userEvent.type(screen.getByLabelText("E-Mail"), "lena@example.com");
    await userEvent.type(screen.getByLabelText("Telefon"), "089 5550 0100");
    await userEvent.click(screen.getByRole("button", { name: /bewertung anfordern/i }));
    expect(await screen.findByText(/konnte nicht gesendet werden/i)).toBeInTheDocument();
  });
});
