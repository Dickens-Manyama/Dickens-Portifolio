"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import TypingEffect from "@/components/TypingEffect";
import { ArrowRight, Download } from "lucide-react";
import { SkeletonCard } from "@/components/SkeletonCard";
import { getApiBaseUrl } from "@/lib/api";
import portraitImage from "../my potrait.jpeg";

function HeroPortrait({ src }) {
  const isStringSource = typeof src === "string";

  return (
    <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-cyan-400/15 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      {isStringSource ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Portrait of Dickens Manyama"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
      ) : (
        <Image
          src={src}
          alt="Portrait of Dickens Manyama"
          fill
          priority
          className="object-cover transition duration-700 group-hover:scale-110"
          sizes="(max-width: 1024px) 19rem, 22rem"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent" />
    </div>
  );
}

export function HeroSection({ profile }) {
  const name = profile?.name ?? "DICKENS DEUS MANYAMA";
  const titles = profile?.titles ?? ["Software Developer", "Data Scientist", "IT Systems & Networking"];
  const intro = profile?.professionalSummary ?? "";
  const portraitSrc = profile?.profileImageUrl || portraitImage;
  const apiBaseUrl = getApiBaseUrl() || "";
  const cvHref = profile?.cvUrl ? `${apiBaseUrl.replace(/\/$/, "")}${profile.cvUrl}` : "/Dickens_Manyama_CV.pdf";

  return (
    <section id="home" className="relative pt-16 md:pt-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-violet-500/15 to-cyan-400/15 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.25),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(34,211,238,0.2),transparent_45%)]" />
      </div>

      <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7 xl:col-span-6">
          <Reveal>
            <motion.div
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 shadow-[0_0_20px_rgba(99,102,241,0.6)]" />
              <span>Available for hands-on development & data-driven automation</span>
            </motion.div>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              {name}
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-3 text-lg text-slate-200 md:text-2xl">
              <span className="text-slate-300">I&apos;m </span>
              <TypingEffect words={titles} />
            </p>
          </Reveal>

          <Reveal delay={0.22}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
              {intro}
            </p>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:opacity-95"
              >
                View Projects
                <ArrowRight className="transition group-hover:translate-x-0.5" size={18} />
              </a>

              <a
                href={cvHref}
                download={profile?.cvOriginalName || undefined}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 backdrop-blur-md transition hover:bg-white/10"
              >
                <Download size={18} />
                Download CV
              </a>

              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 backdrop-blur-md transition hover:bg-white/10"
              >
                Contact Me
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.34}>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                <p className="text-xs text-slate-400">Focus</p>
                <p className="mt-1 text-sm font-semibold text-white/95">Cloud-ready APIs & automation</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md">
                <p className="text-xs text-slate-400">Data</p>
                <p className="mt-1 text-sm font-semibold text-white/95">ML, analysis & visualization</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5 xl:col-span-6">
          <Reveal delay={0.12}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.05 }}
              className="relative"
            >
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-indigo-500/20 via-violet-500/20 to-cyan-400/20 blur-lg" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-soft">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_40%)]" />
                <div className="relative flex flex-col gap-5">
                  <div className="mx-auto flex w-full max-w-[19rem] items-center justify-center lg:max-w-[22rem]">
                    <HeroPortrait src={portraitSrc} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Profile</p>
                        <p className="mt-1 text-sm font-semibold text-white/95">{profile?.name ?? name}</p>
                      </div>
                      <div className="hidden rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2 text-xs text-slate-200 sm:block">
                        Final-year DS
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {profile ? (
                        <>
                          <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                            <p className="text-xs text-slate-400">Email</p>
                            <p className="mt-1 break-words text-sm font-semibold text-white/95">
                              {profile.email}
                            </p>
                          </div>
                          <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                            <p className="text-xs text-slate-400">Phone</p>
                            <p className="mt-1 break-words text-sm font-semibold text-white/95">
                              {profile.phoneNumbers?.[0] ?? "—"}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <SkeletonCard className="h-24" />
                          <SkeletonCard className="h-24" />
                        </>
                      )}
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-slate-400">Quick highlight</p>
                      <p className="mt-2 text-sm font-semibold text-white/95">
                        Building reliable systems, integrating APIs, and making data actionable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

