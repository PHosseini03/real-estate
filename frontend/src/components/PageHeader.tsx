import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

interface Props {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, lead, children }: Props) {
  return (
    <section className="border-b border-line bg-sand/60 pt-36 pb-14 sm:pt-44 sm:pb-16">
      <div className="container-x">
        <Reveal>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="heading mt-5 max-w-3xl">{title}</h1>
          {lead && <p className="lead mt-5 max-w-2xl">{lead}</p>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
