"use client";

import SectionHeading from "@/components/SectionHeading";
import { SkeletonCard } from "@/components/SkeletonCard";

function EducationRow({ item }) {
  return (
    <li className="group relative mb-12 grid gap-4 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
      <div
        className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"
        aria-hidden="true"
      />

      <header className="z-10 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2">
        {item.statusTag || "Completed"}
      </header>

      <div className="z-10 sm:col-span-6">
        <h3 className="font-medium leading-snug text-slate-200 group-hover:text-teal-300">
          {item.institution}
        </h3>
        <p className="mt-1 text-sm font-medium text-slate-400">{item.program}</p>
        {item.description ? (
          <p className="mt-2 text-sm leading-normal text-slate-400">{item.description}</p>
        ) : null}
      </div>
    </li>
  );
}

export function EducationSection({ education, loading }) {
  const items = education ?? [];

  return (
    <section id="education" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
      <SectionHeading label="Education" />

      {loading ? (
        <div className="grid gap-4">
          {new Array(3).fill(0).map((_, idx) => (
            <SkeletonCard key={idx} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          <ul className="group/list">
            {items.map((item, idx) => (
              <EducationRow key={`${item.institution}-${item.program}-${idx}`} item={item} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
