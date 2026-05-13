"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export function EducationSection() {
  return (
    <section id="education" className="py-16 md:py-20">
      <Container>
        <Reveal>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-cyan-400/15 border border-white/10">
              <GraduationCap size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-indigo-300">Education</p>
              <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
                Learning, building, iterating
              </h2>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <p className="text-slate-300">
                Data science training combined with hands-on software development to deliver end-to-end,
                production-ready work.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="relative pl-6">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, amount: 0.25 }}
                className="relative mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              >
                <div className="absolute left-[-1.2rem] top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/15 border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-indigo-300" />
                </div>
                <p className="text-sm font-semibold text-white/95">EASTC</p>
                <p className="mt-1 text-sm text-slate-300">Eastern Africa Statistical Training Centre</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                viewport={{ once: true, amount: 0.25 }}
                className="relative mb-6 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              >
                <div className="absolute left-[-1.2rem] top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/15 border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-violet-300" />
                </div>
                <p className="text-sm font-semibold text-white/95">Bachelor of Science in Data Science</p>
                <p className="mt-1 text-sm text-slate-300">Core data science coursework + practical projects</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true, amount: 0.25 }}
                className="relative rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
              >
                <div className="absolute left-[-1.2rem] top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/15 border border-white/10">
                  <span className="h-2 w-2 rounded-full bg-cyan-300" />
                </div>
                <p className="text-sm font-semibold text-white/95">Final Year Status</p>
                <p className="mt-1 text-sm text-slate-300">Machine learning + ML-ready engineering mindset</p>
                <div className="mt-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                  In progress / final-year stage
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

