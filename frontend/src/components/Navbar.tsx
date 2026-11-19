import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export const NAV_LINKS = [
  { to: "/", label: "Start" },
  { to: "/listings", label: "Immobilien" },
  { to: "/agents", label: "Berater" },
  { to: "/sell", label: "Verkaufen" },
];

const SCROLL_THRESHOLD = 40;

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`flex flex-col leading-none ${light ? "text-white" : "text-ink"}`} aria-label="Skyline Immobilien – Startseite">
      <span className="font-serif text-2xl font-semibold tracking-wide">SKYLINE</span>
      <span className="mt-0.5 text-[9px] font-semibold tracking-[0.32em] text-gold-light">IMMOBILIEN</span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const overHero = pathname === "/" && !scrolled && !open;
  const linkBase = overHero ? "text-white/85 hover:text-white" : "text-stone hover:text-ink";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${overHero ? "bg-gradient-to-b from-black/50 to-transparent" : "border-b border-line bg-ivory/95 backdrop-blur"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Zum Inhalt springen</a>
      <nav className="container-x flex h-20 items-center justify-between" aria-label="Hauptnavigation">
        <Logo light={overHero} />
        <ul className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.to === "/"} className={({ isActive }) => `text-xs font-semibold tracking-[0.2em] uppercase transition ${isActive ? (overHero ? "text-white" : "text-gold") : linkBase}`}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <Link to="/sell" className={`hidden lg:inline-flex ${overHero ? "btn-light" : "btn-primary"} !px-5 !py-3`}>Kostenlose Bewertung</Link>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Menü schließen" : "Menü öffnen"} className={`grid size-11 place-items-center lg:hidden ${overHero ? "text-white" : "text-ink"}`}>
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-line bg-ivory lg:hidden">
            <ul className="container-x flex flex-col py-6">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end={l.to === "/"} className={({ isActive }) => `block border-b border-line py-4 font-serif text-2xl ${isActive ? "text-gold" : "text-ink"}`}>{l.label}</NavLink>
                </li>
              ))}
              <li className="pt-6"><Link to="/sell" className="btn-primary w-full">Kostenlose Bewertung</Link></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
