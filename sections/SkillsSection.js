"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { motion } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { SKILL_ICONS } from "@/constants/skillIcons";

const SKILL_NAME_ICON_KEYS = {
  php: "php",
  javascript: "javascript",
  python: "python",
  sql: "sql",
  laravel: "laravel",
  yii2: "yii2",
  react: "react",
  mysql: "mysql",
  postgresql: "postgresql",
  "machine learning": "machineLearning",
  "data analysis": "dataAnalysis",
  "statistical analysis": "dataAnalysis",
  "data visualization": "dataVisualization",
  networking: "networking",
  "system maintenance": "systemSupport",
  "system support": "systemSupport",
  "technical support": "technicalSupport",
  "rest apis": "restApi",
  webhooks: "webhook",
  "google apps script": "googleAppsScript",
};

const ACCENTS = [
  { ring: "#c6ff00", chip: "bg-lime text-ink" },
  { ring: "#ff006e", chip: "bg-punch text-paper" },
  { ring: "#f6f6f2", chip: "bg-paper text-ink" },
];

function proficiencyLabel(level) {
  const v = Number(level) || 0;
  if (v >= 85) return "Expert";
  if (v >= 70) return "Advanced";
  if (v >= 50) return "Working";
  return "Learning";
}

function resolveIconClass(name, iconKey) {
  const normalizedKey = String(iconKey ?? "").trim();
  const normalizedName = String(name ?? "").toLowerCase();
  const nameMappedKey = SKILL_NAME_ICON_KEYS[normalizedName];
  return (
    SKILL_ICONS[nameMappedKey] ??
    (normalizedKey && normalizedKey !== "code" ? SKILL_ICONS[normalizedKey] : undefined) ??
    SKILL_ICONS.code
  );
}

function SkillDial({ name, level, iconKey, accent }) {
  const iconClass = resolveIconClass(name, iconKey);
  const clamped = Math.max(0, Math.min(100, Number(level) || 70));
  const R = 34;
  const CIRC = 2 * Math.PI * R;

  return (
    <div className="group flex flex-col items-center gap-3 border border-paper/15 bg-paper/[0.04] p-4 transition-colors hover:border-paper/40 hover:bg-paper/[0.08]">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
          <circle
            cx="42"
            cy="42"
            r={R}
            fill="none"
            stroke="rgba(246,246,242,0.14)"
            strokeWidth="6"
          />
          <motion.circle
            cx="42"
            cy="42"
            r={R}
            fill="none"
            stroke={accent.ring}
            strokeWidth="6"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            whileInView={{ strokeDashoffset: CIRC * (1 - clamped / 100) }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <i
            className={`bi ${iconClass} text-[26px] text-paper transition-transform duration-300 group-hover:scale-110`}
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="text-center">
        <p className="font-display text-sm font-bold leading-tight text-paper">{name}</p>
        <span
          className={`mt-2 inline-block px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.14em] ${accent.chip}`}
        >
          {proficiencyLabel(clamped)}
        </span>
      </div>
    </div>
  );
}

export function SkillsSection({ skills, loading }) {
  const [gridParent] = useAutoAnimate({ duration: 250 });

  return (
    <section id="skills" className="border-y-2 border-ink bg-ink py-20 md:py-28">
      <Container>
        <Reveal>
          <div className="flex items-baseline gap-4">
            <span className="font-display text-sm font-bold tracking-[0.2em] text-punch">02</span>
            <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-lime">
              Skills
            </span>
            <span className="h-px flex-1 bg-paper/20" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-paper md:text-5xl">
            Everything I use to ship
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/70">
            Modern engineering and data-driven thinking, grouped by the work I do most often.
          </p>
        </Reveal>

        {loading ? (
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {new Array(4).fill(0).map((_, idx) => (
              <div
                key={idx}
                className="h-48 animate-pulse border-2 border-paper/15 bg-paper/5"
              />
            ))}
          </div>
        ) : (
          <div ref={gridParent} className="mt-12 grid gap-5 md:grid-cols-2">
            {(skills ?? []).map((group, groupIdx) => {
              const accent = ACCENTS[groupIdx % ACCENTS.length];
              return (
                <Reveal key={group.category} delay={0.05 + (groupIdx % 2) * 0.06}>
                  <div className="h-full border-2 border-paper/25 bg-ink p-5 transition-colors hover:border-paper/50 sm:p-6">
                    <div className="flex items-center justify-between gap-4 border-b border-paper/15 pb-4">
                      <h3 className="font-display text-lg font-bold text-paper sm:text-xl">
                        {group.category}
                      </h3>
                      <span
                        className={`px-2.5 py-1 font-display text-xs font-bold ${accent.chip}`}
                      >
                        {group.skills.length} tools
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {group.skills.map((s) => (
                        <SkillDial
                          key={s.name}
                          name={s.name}
                          level={s.level}
                          iconKey={s.iconKey}
                          accent={accent}
                        />
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
