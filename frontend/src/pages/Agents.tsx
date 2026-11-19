import { PageHeader } from "../components/PageHeader";
import { AgentCard } from "../components/AgentCard";
import { Reveal } from "../components/Reveal";
import { useApi } from "../hooks/useApi";
import { DEMO_AGENTS, type Agent } from "../data/demo";

export default function Agents() {
  const { data: agents } = useApi<Agent[]>("/api/agents", DEMO_AGENTS);
  return (
    <>
      <PageHeader eyebrow="Unsere Berater" title="Lokale Expertise. Internationale Reichweite." lead="Jeder Skyline-Berater ist auf eine Stadt spezialisiert – so haben Sie einen Ansprechpartner, der jede Straße, jede Schule und jeden Verkauf kennt." />
      <section className="section">
        <div className="container-x grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-10 sm:gap-y-16 lg:grid-cols-4">
          {agents.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.06}>
              <AgentCard agent={a} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
