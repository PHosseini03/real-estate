import { Mail, Phone } from "lucide-react";
import type { Agent } from "../data/demo";

export function AgentCard({ agent, compact = false }: { agent: Agent; compact?: boolean }) {
  if (compact) {
    return (
      <div className="card flex items-center gap-5 p-5">
        <img src={agent.photo} alt={agent.name} loading="lazy" className="size-20 object-cover" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">Ihr Ansprechpartner</p>
          <p className="font-serif text-2xl">{agent.name}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone">
            <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-ink"><Phone className="size-3.5" aria-hidden />{agent.phone}</a>
            <a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 hover:text-ink"><Mail className="size-3.5" aria-hidden />E-Mail</a>
          </div>
        </div>
      </div>
    );
  }
  return (
    <article className="group">
      <div className="aspect-[4/5] overflow-hidden bg-sand">
        <img src={agent.photo} alt={agent.name} loading="lazy" className="size-full object-cover grayscale transition duration-700 group-hover:grayscale-0" />
      </div>
      <p className="mt-4 text-[9px] font-semibold tracking-[0.2em] text-gold uppercase sm:mt-5 sm:text-[10px] sm:tracking-[0.25em]">{agent.title} · {agent.city}</p>
      <h3 className="mt-1 text-2xl sm:text-3xl">{agent.name}</h3>
      <p className="mt-2 hidden text-sm leading-relaxed text-stone sm:block">{agent.bio}</p>
      <p className="mt-3 text-sm font-semibold">{agent.sales} verkaufte Immobilien</p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone">
        <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-gold" aria-label={`${agent.name} anrufen`}><Phone className="size-4" aria-hidden /><span className="hidden sm:inline">{agent.phone}</span><span className="sm:hidden">Anrufen</span></a>
        <a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 hover:text-gold"><Mail className="size-4" aria-hidden />E-Mail</a>
      </div>
    </article>
  );
}
