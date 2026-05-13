"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";

export function ProjectsSection({ projects, loading }) {
  const items = projects ?? [];

  return (
    <section id="projects" className="py-16 md:py-20">
      <Container>
        <Reveal>
          <div>
            <p className="text-sm font-semibold tracking-wide text-indigo-300">Projects</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
              Built systems you can trust
            </h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              A mix of production apps and data/ML work. Each card highlights the real stack and the goal.
            </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {new Array(4).fill(0).map((_, idx) => (
              <SkeletonCard key={idx} className="min-h-[220px]" />
            ))}
          </div>
        ) : (
          <motion.div
            className="mt-10 grid gap-5 md:grid-cols-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {items.map((p, idx) => (
              <Reveal key={p.title ?? idx} delay={0.06 + idx * 0.05}>
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-soft"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100">
                    <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/10 blur-xl" />
                    <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-gradient-to-br from-cyan-400/15 via-indigo-500/20 to-violet-500/15 blur-xl" />
                  </div>

                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-white/95">{p.title}</h3>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 animate-pulse" />
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-slate-300">{p.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(p.stack ?? []).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {p.githubUrl ? (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                        >
                          <Github size={18} />
                          GitHub
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400">
                          GitHub
                        </span>
                      )}

                      {p.demoUrl ? (
                        <a
                          href={p.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500/70 via-violet-500/60 to-cyan-400/60 border border-white/10 px-4 py-2 text-sm font-semibold text-slate-950 shadow-soft transition hover:opacity-95"
                        >
                          <ExternalLink size={18} />
                          Demo
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400">
                          Demo
                        </span>
                      )}
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            ))}
          </motion.div>
        )}
      </Container>
    </section>
  );
}

