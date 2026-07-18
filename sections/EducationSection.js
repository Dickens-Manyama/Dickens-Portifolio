"use client";

import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { motion } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { GraduationCap } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";

export function EducationSection({ education, loading }) {
  const [listParent] = useAutoAnimate({ duration: 250 });
  const items = education ?? [];

  return (
    <section id="education" className="border-y-2 border-ink bg-wine py-20 md:py-28">
      <Container>
        <div className="flex items-baseline gap-4">
          <span className="font-display text-sm font-bold tracking-[0.2em] text-lime">04</span>
          <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-lime">
            Education
          </span>
          <span className="h-px flex-1 bg-paper/25" aria-hidden="true" />
        </div>
        <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-paper md:text-5xl">
          Learning, building, iterating
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/75">
          Data science training combined with hands-on software development to deliver end-to-end,
          production-ready work.
        </p>

        <div ref={listParent} className="mt-12 space-y-0">
          {loading ? (
            <div className="space-y-4">
              {new Array(3).fill(0).map((_, idx) => (
                <SkeletonCard key={idx} className="h-24 !border-paper/25 !bg-paper/10" />
              ))}
            </div>
          ) : (
            items.map((item, idx) => (
              <motion.div
                key={`${item.institution}-${item.program}-${idx}`}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                className="group grid gap-4 border-b-2 border-paper/20 py-6 transition-colors first:border-t-2 hover:bg-paper/5 lg:grid-cols-12 lg:items-center lg:px-4"
              >
                <div className="flex items-start gap-4 lg:col-span-6 lg:items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-paper bg-lime text-ink transition-transform group-hover:rotate-6">
                    <GraduationCap size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold leading-snug text-paper">
                      {item.institution}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-lime">{item.program}</p>
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <p className="text-sm leading-relaxed text-paper/75">{item.description}</p>
                </div>
                <div className="lg:col-span-2 lg:text-right">
                  {item.statusTag ? (
                    <span className="inline-block border-2 border-lime px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-lime">
                      {item.statusTag}
                    </span>
                  ) : null}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Container>
    </section>
  );
}
