"use client";

import { useCallback } from "react";

export default function SmoothScrollLink({
  href,
  className = "",
  active = false,
  onNavigate,
  style,
  children,
}) {
  const id = href?.startsWith("#") ? href.slice(1) : href;

  const handleClick = useCallback(
    (e) => {
      if (!id) return;
      e.preventDefault();
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      onNavigate?.();
    },
    [id, onNavigate]
  );

  return (
    <a
      href={href}
      onClick={handleClick}
      style={style}
      className={[
        "link-sweep relative px-1 py-1 font-display text-sm font-semibold transition-colors",
        active ? "text-wine" : "text-ink hover:text-wine",
        className,
      ].join(" ")}
    >
      {children}
    </a>
  );
}
