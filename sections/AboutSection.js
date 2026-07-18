"use client";

import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";

export function AboutSection({ profile }) {
  const summary =
    profile?.professionalSummary ??
    "Highly motivated Software Developer and Data Scientist with strong hands-on experience building production-ready systems.";
  const strengths = profile?.strengths ?? [];

  return (
    <section id="about" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
      <SectionHeading label="About" />

      <Reveal>
        <p className="leading-relaxed text-slate-400">{summary}</p>
      </Reveal>

      {strengths.length ? (
        <Reveal delay={0.08}>
          <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {strengths.map((s) => (
              <li key={s} className="flex items-start gap-3 text-sm leading-relaxed">
                <span className="mt-1 text-teal-300" aria-hidden="true">
                  ▹
                </span>
                <span className="text-slate-400">{s}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}
    </section>
  );
}
