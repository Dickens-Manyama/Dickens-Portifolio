"use client";

export function SkeletonCard({ className = "" }) {
  return (
    <div
      className={[
        "animate-pulse rounded-none border-2 border-ink/15 bg-ink/5 p-5",
        className,
      ].join(" ")}
    />
  );
}

export function SkeletonLine({ className = "" }) {
  return (
    <div className={["h-3 w-full rounded-full bg-ink/10", className].join(" ")} />
  );
}
