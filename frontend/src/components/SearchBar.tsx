import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { CITIES, TYPES } from "../data/demo";
import { ANY_MAX, DEFAULT_FILTERS, PRICE_STEPS, formatPrice, toQuery, typeLabel } from "../lib/listings";

export function SearchBar() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [maxPrice, setMaxPrice] = useState(String(ANY_MAX));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = toQuery({ ...DEFAULT_FILTERS, city, type: type as typeof DEFAULT_FILTERS.type, max_price: Number(maxPrice) });
    navigate(query ? `/listings?${query}` : "/listings");
  }

  const selectCls = "w-full appearance-none bg-transparent py-1 text-base text-ink outline-none";
  return (
    <form onSubmit={onSubmit} role="search" aria-label="Immobilien suchen" className="grid w-full max-w-4xl grid-cols-1 bg-white shadow-2xl shadow-black/30 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="border-b border-line px-6 py-4 sm:border-r sm:border-b-0">
        <span className="field-label block">Standort</span>
        <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls} aria-label="Standort">
          <option value="">Alle Städte</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="border-b border-line px-6 py-4 sm:border-r sm:border-b-0">
        <span className="field-label block">Objektart</span>
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls} aria-label="Objektart">
          <option value="">Alle Objektarten</option>
          {TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </select>
      </label>
      <label className="px-6 py-4">
        <span className="field-label block">Höchstpreis</span>
        <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={selectCls} aria-label="Höchstpreis">
          <option value={ANY_MAX}>Ohne Limit</option>
          {PRICE_STEPS.slice(1).map((p) => <option key={p} value={p}>{formatPrice(p, true)}</option>)}
        </select>
      </label>
      <button type="submit" className="btn-primary !py-5 sm:!px-9"><Search className="size-4" aria-hidden /> Suchen</button>
    </form>
  );
}
