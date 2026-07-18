"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProjects } from "@/services/api";
import { ProjectCard } from "@/sections/ProjectsSection";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function AllProjectsPage() {
  const [projects, setProjects] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getProjects()
      .then((rows) => {
        if (mounted) setProjects(rows || []);
      })
      .catch((err) => {
        if (mounted) setError(err?.message || "Failed to load projects.");
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-screen-md px-6 py-12 md:px-12 md:py-20">
      <Link
        href="/#projects"
        className="group inline-flex items-center font-semibold leading-tight text-teal-300"
      >
        <ArrowLeft
          size={16}
          className="mr-1 shrink-0 transition-transform group-hover:-translate-x-1 motion-reduce:transition-none"
          aria-hidden="true"
        />
        Dickens Deus Manyama
      </Link>

      <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">
        All Projects
      </h1>

      <div className="mt-12">
        {error ? (
          <p className="rounded-md border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        ) : projects === null ? (
          <div className="grid gap-4">
            {new Array(4).fill(0).map((_, idx) => (
              <SkeletonCard key={idx} className="h-32" />
            ))}
          </div>
        ) : projects.length ? (
          <ul className="group/list">
            {projects.map((p, idx) => (
              <ProjectCard key={p.title ?? idx} project={p} />
            ))}
          </ul>
        ) : (
          <p className="text-slate-400">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
