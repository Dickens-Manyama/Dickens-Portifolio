"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Sparkles, Wrench, Layers, Target } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";

const iconList = [Sparkles, Wrench, Layers];

export function AboutSection({ profile }) {
  const [strengthsParent] = useAutoAnimate({ duration: 250 });
  const strengths = profile?.strengths ?? [];

  return (
    <section id="about" className="relative py-20 md:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading number="01" label="About" title="A hands-on builder" />

            <Reveal delay={0.1}>
              <p className="mt-6 text-base leading-relaxed text-ink-soft">
                {profile?.professionalSummary ??
                  "Highly motivated Software Developer and Data Scientist with strong hands-on experience building production-ready systems."}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 border-2 border-ink bg-wine p-6 shadow-hard-lime">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-lime" />
                  <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-lime">
                    Career Objective
                  </p>
                </div>
                <p className="mt-3 text-base leading-relaxed text-paper">
                  {profile?.careerObjective ?? "—"}
                </p>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.12}>
              <h3 className="font-display text-lg font-bold uppercase tracking-wide text-ink">
                Personal strengths
              </h3>
            </Reveal>

            <div ref={strengthsParent} className="mt-5 grid gap-4 sm:grid-cols-2">
              {strengths.length ? (
                strengths.map((s, idx) => {
                  const Icon = iconList[idx % iconList.length];
                  return (
                    <div
                      key={s}
                      className="group border-2 border-ink bg-paper p-5 shadow-hard-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-hard-punch"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-ink bg-lime transition-colors group-hover:bg-punch">
                          <Icon size={18} className="text-ink transition-colors group-hover:text-paper" />
                        </div>
                        <p className="pt-1.5 text-sm font-semibold leading-snug text-ink">{s}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <SkeletonCard className="h-28" />
                  <SkeletonCard className="h-28" />
                  <SkeletonCard className="h-28" />
                  <SkeletonCard className="h-28" />
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
