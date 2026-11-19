import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Bath, BedDouble, CalendarDays, Check, MapPin, Maximize2 } from "lucide-react";
import { MortgageCalculator } from "../components/MortgageCalculator";
import { ViewingForm } from "../components/ViewingForm";
import { AgentCard } from "../components/AgentCard";
import { useApi } from "../hooks/useApi";
import { DEMO_AGENTS, DEMO_LISTINGS, type ListingDetail as Detail } from "../data/demo";
import { formatArea, formatPrice, typeLabel } from "../lib/listings";
import NotFound from "./NotFound";

function demoDetail(id: number): Detail | null {
  const listing = DEMO_LISTINGS.find((l) => l.id === id);
  if (!listing) return null;
  return { ...listing, agent: DEMO_AGENTS.find((a) => a.id === listing.agent_id) ?? null };
}

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden bg-sand">
        <AnimatePresence mode="wait">
          <motion.img key={images[active]} src={images[active]} alt={`${title}, Foto ${active + 1} von ${images.length}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="size-full object-cover" />
        </AnimatePresence>
        <span className="absolute right-4 bottom-4 bg-black/60 px-3 py-1 text-xs text-white">{active + 1} / {images.length}</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3" role="group" aria-label="Fotoübersicht">
        {images.map((src, i) => (
          <button key={src} type="button" onClick={() => setActive(i)} aria-label={`Foto ${i + 1} anzeigen`} aria-pressed={i === active} className={`aspect-[4/3] overflow-hidden transition ${i === active ? "ring-2 ring-gold ring-offset-2 ring-offset-ivory" : "opacity-70 hover:opacity-100"}`}>
            <img src={src} alt="" loading="lazy" className="size-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const listingId = Number(id);
  const isValidId = Number.isInteger(listingId) && listingId > 0;
  const { data: listing, loading } = useApi<Detail | null>(`/api/listings/${isValidId ? listingId : 0}`, isValidId ? demoDetail(listingId) : null);

  if (!listing) {
    if (loading) return <div className="min-h-screen pt-40" aria-busy="true" />;
    return <NotFound />;
  }

  const specs = [
    { icon: BedDouble, label: "Schlafzimmer", value: listing.beds },
    { icon: Bath, label: "Bäder", value: listing.baths.toLocaleString("de-DE") },
    { icon: Maximize2, label: "Wohnfläche", value: formatArea(listing.sqft) },
    { icon: CalendarDays, label: "Baujahr", value: listing.year_built },
  ];

  return (
    <article className="pt-28 pb-24 sm:pt-32">
      <div className="container-x">
        <Link to="/listings" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-stone uppercase hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden /> Alle Immobilien
        </Link>

        <header className="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <span className="eyebrow">{typeLabel(listing.type)} · {listing.city}</span>
            <h1 className="heading mt-4">{listing.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-stone"><MapPin className="size-4 text-gold" aria-hidden />{listing.address}, {listing.city}</p>
          </div>
          <p className="font-serif text-4xl text-ink sm:text-5xl">{formatPrice(listing.price)}</p>
        </header>

        <div className="mt-10"><Gallery images={listing.gallery} title={listing.title} /></div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-14">
            <dl className="grid grid-cols-2 border border-line bg-white sm:grid-cols-4">
              {specs.map(({ icon: Icon, label, value }, i) => (
                <div key={label} className={`p-6 ${i > 0 ? "border-line sm:border-l" : ""} ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t sm:border-t-0" : ""}`}>
                  <Icon className="size-5 text-gold" aria-hidden />
                  <dt className="mt-3 text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">{label}</dt>
                  <dd className="mt-1 font-serif text-2xl">{value}</dd>
                </div>
              ))}
            </dl>
            <section>
              <h2 className="text-3xl">Über diese Residenz</h2>
              <p className="mt-4 leading-relaxed text-stone">{listing.description}</p>
            </section>
            <section>
              <h2 className="text-3xl">Ausstattung</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {listing.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 border-b border-line pb-3 text-sm"><Check className="size-4 text-gold" aria-hidden />{f}</li>
                ))}
              </ul>
            </section>
            <MortgageCalculator price={listing.price} />
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {listing.agent && <AgentCard agent={listing.agent} compact />}
            <ViewingForm listingId={listing.id} title={listing.title} />
          </aside>
        </div>
      </div>
    </article>
  );
}
