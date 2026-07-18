"use client";

import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { SkeletonCard } from "@/components/SkeletonCard";
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

function SkillChip({ name, iconKey }) {
  const iconClass = resolveIconClass(name, iconKey);
  return (
    <li className="flex items-center gap-2 rounded-full bg-teal-400/10 px-3 py-1.5 text-xs font-medium leading-5 text-teal-300">
      <i className={`bi ${iconClass} text-sm`} aria-hidden="true" />
      {name}
    </li>
  );
}

export function SkillsSection({ skills, loading }) {
  const groups = skills ?? [];

  return (
    <section id="skills" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
      <SectionHeading label="Skills" />

      {loading ? (
        <div className="grid gap-4">
          {new Array(3).fill(0).map((_, idx) => (
            <SkeletonCard key={idx} className="h-24" />
          ))}
        </div>
      ) : (
        <ul className="group/list">
          {groups.map((group, idx) => (
            <Reveal key={group.category} delay={0.04 * idx}>
              <li className="group relative mb-12 transition-all lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                <div
                  className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"
                  aria-hidden="true"
                />
                <div className="z-10 lg:relative">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200 group-hover:text-teal-300">
                    {group.category}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${group.category} skills`}>
                    {group.skills.map((s) => (
                      <SkillChip key={s.name} name={s.name} iconKey={s.iconKey} />
                    ))}
                  </ul>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      )}
    </section>
  );
}
