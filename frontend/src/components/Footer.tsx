import { Link } from "react-router-dom";
import { Logo, NAV_LINKS } from "./Navbar";
import { CONTACT } from "../data/demo";

export function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5 lg:col-span-2">
          <Logo light />
          <p className="max-w-sm text-sm leading-relaxed">Seit 2004 vermitteln wir außergewöhnliche Immobilien in München, Hamburg, Berlin, Frankfurt und Düsseldorf. Diskret, durchdacht und stets bestens vorbereitet.</p>
        </div>
        <div>
          <h2 className="mb-5 font-sans text-[11px] font-semibold tracking-[0.25em] text-gold-light uppercase">Entdecken</h2>
          <ul className="space-y-3 text-sm">
            {NAV_LINKS.map((l) => <li key={l.to}><Link to={l.to} className="hover:text-white">{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h2 className="mb-5 font-sans text-[11px] font-semibold tracking-[0.25em] text-gold-light uppercase">Kontakt</h2>
          <ul className="space-y-3 text-sm">
            <li><a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-white">{CONTACT.phone}</a></li>
            <li><a href={`mailto:${CONTACT.email}`} className="hover:text-white">{CONTACT.email}</a></li>
            <li>{CONTACT.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-x py-6 text-center text-xs text-white/40">© {new Date().getFullYear()} Skyline Immobilien. Demo-Website – alle Namen, Personen und Zahlen sind fiktiv.</p>
      </div>
    </footer>
  );
}
