"use client";

export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={[
        "animate-pulse rounded-md border border-slate-800 bg-slate-800/40 p-5",
        className,
      ].join(" ")}
    />
  );
}

export function SkeletonLine({ className = "" }) {
  return (
    <div className={["h-3 w-full rounded-full bg-slate-800", className].join(" ")} />
  );
}
