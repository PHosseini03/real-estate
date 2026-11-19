import { Link } from "react-router-dom";
import { Bath, BedDouble, Maximize2 } from "lucide-react";
import type { Listing } from "../data/demo";
import { formatArea, formatPrice, typeLabel } from "../lib/listings";

const NEW_DAYS = 7;

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="group">
      <Link to={`/listings/${listing.id}`} className="block" aria-label={`${listing.title}, ${formatPrice(listing.price)}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          <img src={listing.image} alt={`${listing.title}, Außenansicht`} loading="lazy" className="size-full object-cover transition duration-[1200ms] ease-out group-hover:scale-105" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-white/95 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-ink uppercase">{typeLabel(listing.type)}</span>
            {listing.listed_days_ago <= NEW_DAYS && <span className="bg-gold px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-white uppercase">Neu</span>}
          </div>
        </div>
        <div className="pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-2xl text-ink transition group-hover:text-gold">{listing.title}</h3>
            <p className="shrink-0 font-serif text-2xl text-ink">{formatPrice(listing.price, true)}</p>
          </div>
          <p className="mt-1 text-sm text-stone">{listing.address}, {listing.city}</p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-xs tracking-wide text-stone">
            <li className="flex items-center gap-2"><BedDouble className="size-4 text-gold" aria-hidden />{listing.beds} Schlafzimmer</li>
            <li className="flex items-center gap-2"><Bath className="size-4 text-gold" aria-hidden />{listing.baths.toLocaleString("de-DE")} {listing.baths === 1 ? "Bad" : "Bäder"}</li>
            <li className="flex items-center gap-2"><Maximize2 className="size-4 text-gold" aria-hidden />{formatArea(listing.sqft)}</li>
          </ul>
        </div>
      </Link>
    </article>
  );
}

export function ListingSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="aspect-[4/3] bg-sand" />
      <div className="mt-5 h-6 w-2/3 bg-sand" />
      <div className="mt-3 h-4 w-1/2 bg-sand" />
    </div>
  );
}
