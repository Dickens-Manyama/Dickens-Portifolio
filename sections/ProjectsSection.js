"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Github, ArrowUpRight } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";

const CARD_ACCENTS = [
  { bar: "bg-punch", tag: "bg-lime text-ink" },
  { bar: "bg-wine", tag: "bg-punch text-paper" },
  { bar: "bg-lime", tag: "bg-wine text-paper" },
];

export function ProjectsSection({ projects, loading }) {
  const [gridParent] = useAutoAnimate({ duration: 250 });
  const items = projects ?? [];

  return (
    <section id="projects" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          number="03"
          label="Projects"
          title="Built systems you can trust"
          description="A mix of production apps and data/ML work. Each card highlights the real stack and the goal."
        />

        {loading ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {new Array(4).fill(0).map((_, idx) => (
              <SkeletonCard key={idx} className="min-h-[240px]" />
            ))}
          </div>
        ) : (
          <div ref={gridParent} className="mt-12 grid gap-6 md:grid-cols-2">
            {items.map((p, idx) => {
              const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
              return (
                <Reveal key={p.title ?? idx} delay={0.05 + (idx % 2) * 0.06}>
                  <article className="group flex h-full flex-col border-2 border-ink bg-paper shadow-hard transition-transform duration-200 hover:-translate-y-1.5 hover:shadow-hard-lg">
                    <div className={`h-2 w-full ${accent.bar}`} aria-hidden="true" />

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-2xl font-bold leading-tight text-ink">
                          {p.title}
                        </h3>
                        <span className="font-display text-sm font-bold text-ink-faint">
                          0{idx + 1}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(p.stack ?? []).map((t) => (
                          <span
                            key={t}
                            className={`border border-ink px-2.5 py-1 font-display text-xs font-bold ${accent.tag}`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex flex-wrap gap-3 pt-6">
                        {p.githubUrl ? (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-display text-sm font-bold text-paper transition-colors hover:bg-wine"
                          >
                            <Github size={16} />
                            Code
                          </a>
                        ) : null}

                        {p.demoUrl ? (
                          <a
                            href={p.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 border-2 border-ink bg-punch px-4 py-2 font-display text-sm font-bold text-paper transition-transform hover:-translate-y-0.5"
                          >
                            <ArrowUpRight size={16} />
                            Live demo
                          </a>
                        ) : (
                          <span className="inline-flex items-center border-2 border-dashed border-ink/30 px-4 py-2 font-display text-sm font-bold text-ink-faint">
                            In production use
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
