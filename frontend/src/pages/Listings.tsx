import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ListingCard, ListingSkeleton } from "../components/ListingCard";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks/useApi";
import { CITIES, DEMO_LISTINGS, TYPES, type Listing } from "../data/demo";
import { ANY_MAX, DEFAULT_FILTERS, PRICE_STEPS, SORTS, filterListings, formatPrice, parseFilters, toQuery, typeLabel, type Filters } from "../lib/listings";

const BED_OPTIONS = [0, 2, 3, 4, 5];

interface FilterSelectProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

function FilterSelect({ label, value, onChange, children }: FilterSelectProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="field-label">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field-input !py-2.5">
        {children}
      </select>
    </label>
  );
}

export default function Listings() {
  const [params, setParams] = useSearchParams();
  const filters = parseFilters(params);
  const query = toQuery(filters);
  const { data, loading, isFallback } = useApi<Listing[]>(`/api/listings${query ? `?${query}` : ""}`, filterListings(DEMO_LISTINGS, filters));

  const update = (patch: Partial<Filters>) => {
    const next = toQuery({ ...filters, ...patch });
    setParams(new URLSearchParams(next), { replace: true });
  };
  const isFiltered = query !== "" && query !== `sort=${filters.sort}`;
  const priceError = filters.min_price > filters.max_price;

  return (
    <>
      <PageHeader eyebrow="Immobilien" title="Residenzen zum Kauf" lead="Entdecken Sie unsere aktuelle Kollektion in München, Hamburg, Berlin, Frankfurt und Düsseldorf." />

      <section className="sticky top-20 z-30 border-b border-line bg-ivory/95 backdrop-blur" aria-label="Filter">
        <div className="container-x py-5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-stone uppercase lg:hidden">
            <SlidersHorizontal className="size-4" aria-hidden /> Suche verfeinern
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <FilterSelect label="Stadt" value={filters.city} onChange={(city) => update({ city })}>
              <option value="">Alle Städte</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </FilterSelect>
            <FilterSelect label="Objektart" value={filters.type} onChange={(type) => update({ type: type as Filters["type"] })}>
              <option value="">Alle Objektarten</option>
              {TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
            </FilterSelect>
            <FilterSelect label="Mindestpreis" value={filters.min_price} onChange={(v) => update({ min_price: Number(v) })}>
              {PRICE_STEPS.slice(0, -1).map((p) => <option key={p} value={p}>{p === 0 ? "Ohne Minimum" : formatPrice(p, true)}</option>)}
            </FilterSelect>
            <FilterSelect label="Höchstpreis" value={filters.max_price} onChange={(v) => update({ max_price: Number(v) })}>
              <option value={ANY_MAX}>Ohne Maximum</option>
              {PRICE_STEPS.slice(1).map((p) => <option key={p} value={p}>{formatPrice(p, true)}</option>)}
            </FilterSelect>
            <FilterSelect label="Schlafzimmer" value={filters.beds} onChange={(v) => update({ beds: Number(v) })}>
              {BED_OPTIONS.map((b) => <option key={b} value={b}>{b === 0 ? "Beliebig" : `${b}+`}</option>)}
            </FilterSelect>
            <FilterSelect label="Sortierung" value={filters.sort} onChange={(v) => update({ sort: v as Filters["sort"] })}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </FilterSelect>
          </div>
        </div>
      </section>

      <section className="section !pt-12">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-stone" aria-live="polite">
              <span className="font-serif text-2xl text-ink">{priceError ? 0 : data.length}</span> {data.length === 1 ? "Residenz" : "Residenzen"}
              {isFallback && <span className="ml-2 text-xs">(Offline-Demodaten)</span>}
            </p>
            {isFiltered && (
              <button type="button" onClick={() => setParams(new URLSearchParams(toQuery({ ...DEFAULT_FILTERS, sort: filters.sort })))} className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] text-gold uppercase hover:text-ink">
                <X className="size-4" aria-hidden /> Filter zurücksetzen
              </button>
            )}
          </div>

          {priceError ? (
            <p className="py-16 text-center text-stone" role="alert">Der Mindestpreis liegt über dem Höchstpreis. Bitte passen Sie Ihre Preisspanne an.</p>
          ) : loading && data.length === 0 ? (
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <ListingSkeleton key={i} />)}</div>
          ) : data.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif text-3xl">Keine Residenzen entsprechen Ihrer Suche</p>
              <p className="mt-3 text-stone">Erweitern Sie Ihre Preisspanne oder wählen Sie eine andere Stadt.</p>
            </div>
          ) : (
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
              {data.map((l, i) => (
                <Reveal key={l.id} delay={(i % 3) * 0.06}>
                  <ListingCard listing={l} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
