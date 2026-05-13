"use client";

import { useEffect, useState } from "react";

export function useActiveSection(sectionIds) {
  const [activeId, setActiveId] = useState(sectionIds?.[0] ?? "home");

  useEffect(() => {
    if (!sectionIds?.length) return;

    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the most visible intersecting section.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      {
        threshold: [0.15, 0.25, 0.35, 0.5],
        rootMargin: "-20% 0px -60% 0px",
      }
    );

    for (const el of els) observer.observe(el);

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}

