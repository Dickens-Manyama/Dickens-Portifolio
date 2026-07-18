"use client";

import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Github, ArrowUpRight, ArrowRight } from "lucide-react";

export const FEATURED_PROJECT_COUNT = 3;

export function ProjectCard({ project }) {
  const primaryUrl = project.demoUrl || project.githubUrl || null;

  return (
    <li className="group relative mb-12 grid gap-4 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
      <div
        className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"
        aria-hidden="true"
      />

      {project.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.imageUrl}
          alt={`Screenshot of ${project.title}`}
          loading="lazy"
          className="z-10 rounded border-2 border-slate-200/10 transition group-hover:border-slate-200/30 sm:order-1 sm:col-span-2 sm:translate-y-1 sm:self-start"
        />
      ) : null}

      <div className={`z-10 ${project.imageUrl ? "sm:order-2 sm:col-span-6" : "sm:col-span-8"}`}>
        <h3 className="font-medium leading-snug text-slate-200">
          {primaryUrl ? (
            <a
              href={primaryUrl}
              target="_blank"
              rel="noreferrer"
              className="group/link inline-flex items-baseline text-base font-medium leading-tight text-slate-200 transition-colors hover:text-teal-300 focus-visible:text-teal-300"
            >
              <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block" aria-hidden="true" />
              <span>
                {project.title}
                <ArrowUpRight
                  size={16}
                  className="ml-1 inline-block shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
            </a>
          ) : (
            <span className="text-base font-medium leading-tight text-slate-200">
              {project.title}
            </span>
          )}
        </h3>

        <p className="mt-2 text-sm leading-normal text-slate-400">{project.description}</p>

        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="relative z-10 mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-teal-300"
            aria-label={`${project.title} source code on GitHub`}
          >
            <Github size={14} />
            Source code
          </a>
        ) : null}

        {(project.stack ?? []).length ? (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Technologies used">
            {project.stack.map((t) => (
              <li
                key={t}
                className="rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

export function ProjectsSection({ projects, loading }) {
  const items = projects ?? [];
  const featured = items.slice(0, FEATURED_PROJECT_COUNT);
  const hasMore = items.length > FEATURED_PROJECT_COUNT;

  return (
    <section id="projects" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
      <SectionHeading label="Projects" />

      {loading ? (
        <div className="grid gap-4">
          {new Array(3).fill(0).map((_, idx) => (
            <SkeletonCard key={idx} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <ul className="group/list">
            {featured.map((p, idx) => (
              <ProjectCard key={p.title ?? idx} project={p} />
            ))}
          </ul>

          {hasMore ? (
            <div className="mt-4">
              <Link
                href="/projects"
                className="group/more inline-flex items-center font-semibold leading-tight text-slate-200 transition-colors hover:text-teal-300"
              >
                <span className="border-b border-transparent pb-px transition group-hover/more:border-teal-300">
                  View More Projects ({items.length})
                </span>
                <ArrowRight
                  size={16}
                  className="ml-1 shrink-0 transition-transform group-hover/more:translate-x-1 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
