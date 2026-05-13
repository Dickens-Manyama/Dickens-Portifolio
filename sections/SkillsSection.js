"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { SKILL_ICONS } from "@/constants/skillIcons";
import { SkeletonCard } from "@/components/SkeletonCard";

function SkillProgress({ name, level, iconKey }) {
  const iconClass = SKILL_ICONS[iconKey] ?? SKILL_ICONS.code;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-cyan-400/15 border border-white/10">
            <i className={`bi ${iconClass} text-indigo-200 text-[18px]`} aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-white/95">{name}</p>
        </div>
        <p className="text-xs font-semibold text-slate-300">{level}%</p>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300"
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.max(0, Math.min(100, level))}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

export function SkillsSection({ skills, loading }) {
  return (
    <section id="skills" className="py-16 md:py-20">
      <Container>
        <Reveal>
          <div>
            <p className="text-sm font-semibold tracking-wide text-indigo-300">Skills</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">Everything I use to ship</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Modern engineering and data-driven thinking, grouped by the work I do most often.
            </p>
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {new Array(6).fill(0).map((_, idx) => (
              <SkeletonCard key={idx} className="h-28" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {(skills ?? []).map((group, groupIdx) => (
              <Reveal key={group.category} delay={0.06 + groupIdx * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-soft"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-white/95">{group.category}</h3>
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-cyan-400/10 border border-white/10" />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {group.skills.map((s) => (
                      <SkillProgress
                        key={s.name}
                        name={s.name}
                        level={s.level}
                        iconKey={s.iconKey}
                      />
                    ))}
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

