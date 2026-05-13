"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Layers, Sparkles, Wrench } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";

const iconList = [Sparkles, Wrench, Layers];

export function AboutSection({ profile }) {
  return (
    <section id="about" className="relative py-16 md:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="text-sm font-semibold tracking-wide text-indigo-300">About</p>
              <h2 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">A hands-on builder</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                {profile?.professionalSummary ??
                  "Highly motivated Software Developer and Data Scientist with strong hands-on experience building production-ready systems."}
              </p>
            </Reveal>

            <div className="mt-6">
              <Reveal delay={0.12}>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                  <p className="text-sm font-semibold text-white/95">Career Objective</p>
                  <p className="mt-2 text-slate-300">{profile?.careerObjective ?? "—"}</p>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.18}>
              <h3 className="text-lg font-bold text-white/95">Personal strengths</h3>
            </Reveal>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(profile?.strengths ?? []).length ? (
                profile.strengths.map((s, idx) => {
                  const Icon = iconList[idx % iconList.length];
                  return (
                    <Reveal key={s} delay={0.06 + idx * 0.05}>
                      <motion.div
                        whileHover={{ y: -4, scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-soft"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/15 border border-white/10">
                            <Icon size={18} className="text-indigo-200" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white/95">{s}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              Built for consistency, reliability, and measurable outcomes.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Reveal>
                  );
                })
              ) : (
                <>
                  <SkeletonCard className="h-32" />
                  <SkeletonCard className="h-32" />
                  <SkeletonCard className="h-32" />
                  <SkeletonCard className="h-32" />
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

