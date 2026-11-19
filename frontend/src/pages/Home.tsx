import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { ListingCard, ListingSkeleton } from "../components/ListingCard";
import { AgentCard } from "../components/AgentCard";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks/useApi";
import { DEMO_AGENTS, DEMO_LISTINGS, type Agent, type Listing } from "../data/demo";

const FEATURED = DEMO_LISTINGS.filter((l) => l.featured)
  .sort((a, b) => b.price - a.price)
  .slice(0, 3);
const STATS = [
  { value: "2,4 Mrd. €", label: "Verkaufsvolumen seit 2004" },
  { value: "1.180", label: "Verkaufte Immobilien" },
  { value: "23", label: "Tage bis zum Verkauf (Ø)" },
  { value: "98 %", label: "Des Angebotspreises erzielt" },
];
const CITY_TILES = [
  { city: "München", image: "/images/home-3.jpg" },
  { city: "Hamburg", image: "/images/home-2.jpg" },
  { city: "Berlin", image: "/images/home-4.jpg" },
  { city: "Frankfurt", image: "/images/home-6.jpg" },
];

function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden pt-32 pb-14 sm:items-center sm:pb-20">
      <motion.img src="/images/hero.jpg" alt="" fetchPriority="high" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 2.4, ease: "easeOut" }} className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/55 to-black/45 sm:from-black/80 sm:via-black/30 sm:to-black/40" />
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-black/55 via-black/15 to-transparent sm:block" />
      <div className="container-x">
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="eyebrow !text-gold-light before:!bg-gold-light">
          München · Hamburg · Berlin · Frankfurt · Düsseldorf
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9 }} className="mt-6 max-w-4xl text-5xl leading-[0.98] text-white sm:text-7xl lg:text-8xl">
          Wohnen in seiner <em className="font-light text-gold-light">schönsten Form.</em>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }} className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          Eine private Auswahl architektonischer Residenzen – vertreten von Beratern, die jede Straße, jeden Ausblick und jeden Käufer kennen.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.9 }} className="mt-10">
          <SearchBar />
        </motion.div>
      </div>
    </section>
  );
}

function StatsStrip() {
  return (
    <section aria-label="Unsere Bilanz" className="border-b border-line bg-white">
      <div className="container-x grid grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={s.label} className={`py-10 text-center ${i % 2 ? "border-l border-line" : ""} ${i === 2 ? "lg:border-l" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""}`}>
            <p className="font-serif text-4xl text-ink sm:text-5xl">{s.value}</p>
            <p className="mt-2 text-[11px] font-semibold tracking-[0.2em] text-stone uppercase">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, to, cta }: { eyebrow: string; title: string; to?: string; cta?: string }) {
  return (
    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
      <Reveal>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="heading mt-5">{title}</h2>
      </Reveal>
      {to && (
        <Link to={to} className="btn-outline self-start sm:self-auto">
          {cta} <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

function Approach() {
  return (
    <section className="section bg-ink text-white">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="grid grid-cols-2 gap-4">
            <img src="/images/interior-1.jpg" alt="Offener Wohnbereich mit Holzwand" loading="lazy" className="aspect-[3/4] w-full object-cover" />
            <img src="/images/interior-2.jpg" alt="Zweigeschossiger Wohnraum mit Glasfronten" loading="lazy" className="mt-12 aspect-[3/4] w-full object-cover" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <span className="eyebrow !text-gold-light before:!bg-gold-light">Unser Anspruch</span>
          <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
            Weniger Objekte. <em className="text-gold-light">Weit mehr Aufmerksamkeit.</em>
          </h2>
          <p className="mt-6 leading-relaxed text-white/70">
            Wir betreuen jede Saison nur eine begrenzte Zahl von Immobilien. So erhält jede einzelne Architekturfotografie, einen eigenen Film, private Vorpremieren für unser Käufernetzwerk und eine Vermarktungsstrategie, die ihre Geschichte erzählt.
          </p>
          <ul className="mt-8 space-y-4 border-t border-white/10 pt-8 text-sm text-white/80">
            <li>· Cineastische Fotografie und Film für jedes Objekt</li>
            <li>· Diskrete Off-Market-Präsentation für über 4.000 vorgemerkte Käufer</li>
            <li>· Home Staging, Styling und Vorbereitung – alles aus einer Hand</li>
          </ul>
          <Link to="/sell" className="btn-light mt-10">
            Bewertung anfordern <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Cities() {
  return (
    <section className="section">
      <div className="container-x">
        <SectionHead eyebrow="Unsere Standorte" title="Nach Stadt entdecken" />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {CITY_TILES.map((c, i) => (
            <Reveal key={c.city} delay={i * 0.06}>
              <Link to={`/listings?city=${encodeURIComponent(c.city)}`} className="group relative block aspect-[3/4] overflow-hidden">
                <img src={c.image} alt="" loading="lazy" className="size-full object-cover transition duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 text-white sm:inset-x-6 sm:bottom-6">
                  <p className="font-serif text-2xl sm:text-3xl">{c.city}</p>
                  <p className="mt-1 text-[10px] tracking-[0.25em] text-white/70 uppercase">
                    {DEMO_LISTINGS.filter((l) => l.city === c.city).length} Residenzen
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { data: featured, loading } = useApi<Listing[]>("/api/listings?featured=true&limit=3&sort=price_desc", FEATURED);
  const { data: agents } = useApi<Agent[]>("/api/agents", DEMO_AGENTS);

  return (
    <>
      <Hero />
      <StatsStrip />

      <section className="section">
        <div className="container-x">
          <SectionHead eyebrow="Ausgewählte Residenzen" title="Die Kollektion" to="/listings" cta="Alle Immobilien ansehen" />
          <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {loading && featured.length === 0
              ? [0, 1, 2].map((i) => <ListingSkeleton key={i} />)
              : featured.map((l, i) => (
                  <Reveal key={l.id} delay={i * 0.08}>
                    <ListingCard listing={l} />
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      <Approach />
      <Cities />

      <section className="section bg-sand/60">
        <div className="container-x">
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="font-serif text-3xl leading-snug text-ink sm:text-4xl lg:text-5xl">
              „Charlotte hat unser Haus in neun Tagen verkauft – über dem Angebotspreis und ganz ohne öffentliche Besichtigung. Diskret, brillant und gelassen.“
            </p>
            <p className="mt-8 text-[11px] font-semibold tracking-[0.25em] text-gold uppercase">Private Verkäuferin · Grünwald</p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHead eyebrow="Das Team" title="Berater, keine Verkäufer" to="/agents" cta="Das Team kennenlernen" />
          <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-10 lg:grid-cols-4">
            {agents.slice(0, 4).map((a, i) => (
              <Reveal key={a.id} delay={i * 0.06}>
                <AgentCard agent={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-28 sm:py-36">
        <img src="/images/home-1.jpg" alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-black/60" />
        <Reveal className="container-x text-center text-white">
          <h2 className="mx-auto max-w-3xl text-4xl leading-tight sm:text-6xl">Was ist Ihre Immobilie heute wert?</h2>
          <p className="mx-auto mt-5 max-w-xl text-white/80">Eine kostenfreie, datenbasierte Bewertung durch einen lokalen Experten – innerhalb von 48 Stunden.</p>
          <Link to="/sell" className="btn-light mt-10">Jetzt Bewertung erhalten</Link>
        </Reveal>
      </section>
    </>
  );
}
