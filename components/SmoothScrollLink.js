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
        "relative rounded-lg px-3 py-2 text-sm font-medium transition",
        active ? "text-white" : "text-slate-300 hover:text-white",
        active ? "after:absolute after:bottom-0 after:left-3 after:h-0.5 after:w-8 after:rounded-full after:bg-gradient-to-r after:from-indigo-400 after:to-violet-400" : "",
        className,
      ].join(" ")}
    >
      {children}
    </a>
  );
}

