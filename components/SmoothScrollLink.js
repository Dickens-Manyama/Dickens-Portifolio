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
      // Close the menu first so the body scroll lock is released, then
      // scroll on the next frame; otherwise the lock cleanup restores the
      // old scroll position and cancels the navigation.
      onNavigate?.();
      requestAnimationFrame(() => {
        document
          .getElementById(id)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
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
