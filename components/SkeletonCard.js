"use client";

export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={[
        "animate-pulse rounded-2xl border border-white/10 bg-white/5 p-5 shadow-soft",
        className,
      ].join(" ")}
    />
  );
}

export function SkeletonLine({ className = "" }) {
  return (
    <div className={["h-3 w-full rounded-full bg-white/10", className].join(" ")} />
  );
}

