"use client";

import Reveal from "@/components/Reveal";

export default function SectionHeading({ number, label, title, description }) {
  return (
    <Reveal>
      <div className="flex items-baseline gap-4">
        <span className="font-display text-sm font-bold tracking-[0.2em] text-punch">
          {number}
        </span>
        <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-wine">
          {label}
        </span>
        <span className="h-px flex-1 bg-ink/20" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">{description}</p>
      ) : null}
    </Reveal>
  );
}
