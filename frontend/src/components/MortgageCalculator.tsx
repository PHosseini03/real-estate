import { useId, useState } from "react";
import { calcMortgage } from "../lib/mortgage";
import { formatPrice } from "../lib/listings";

const TERMS = [20, 25, 30];
const RATE = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 3 });

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, display, onChange }: SliderProps) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="field-label">{label}</label>
        <output htmlFor={id} className="text-sm font-semibold text-ink">{display}</output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="gold-range mt-4" style={{ "--fill": `${fill}%` } as React.CSSProperties} />
    </div>
  );
}

export function MortgageCalculator({ price }: { price: number }) {
  const [downPercent, setDown] = useState(20);
  const [ratePercent, setRate] = useState(3.5);
  const [years, setYears] = useState(30);
  const result = calcMortgage({ price, downPercent, ratePercent, years });

  return (
    <section className="card p-6 sm:p-8" aria-labelledby="mortgage-title">
      <h2 id="mortgage-title" className="text-3xl">Baufinanzierungsrechner</h2>
      <p className="mt-1 text-sm text-stone">Monatliche Rate aus Zins und Tilgung (Annuität). Kaufnebenkosten wie Grunderwerbsteuer, Notar und Makler sind nicht enthalten.</p>
      <p className="mt-6 font-serif text-5xl text-ink" aria-live="polite">
        {formatPrice(result.monthly)}<span className="font-sans text-base text-stone"> / Monat</span>
      </p>
      <div className="mt-8 space-y-7">
        <Slider label="Eigenkapital" value={downPercent} min={10} max={60} step={5} display={`${downPercent}\u00a0% · ${formatPrice(result.down, true)}`} onChange={setDown} />
        <Slider label="Sollzins" value={ratePercent} min={1} max={8} step={0.125} display={`${RATE.format(ratePercent)}\u00a0%`} onChange={setRate} />
        <fieldset>
          <legend className="field-label">Laufzeit</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {TERMS.map((t) => (
              <button key={t} type="button" onClick={() => setYears(t)} aria-pressed={years === t} className={`border py-2.5 text-sm transition ${years === t ? "border-ink bg-ink text-white" : "border-line text-stone hover:border-ink"}`}>
                {t} Jahre
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
        <div><dt className="text-stone">Darlehensbetrag</dt><dd className="mt-1 font-semibold">{formatPrice(result.loan)}</dd></div>
        <div><dt className="text-stone">Zinskosten gesamt</dt><dd className="mt-1 font-semibold">{formatPrice(result.totalInterest)}</dd></div>
      </dl>
    </section>
  );
}
