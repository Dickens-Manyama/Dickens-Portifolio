"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, Download, ArrowUpRight } from "lucide-react";
import { downloadCvFile } from "@/lib/downloadCv";
import { getCvDownloadFilename, getCvDownloadHref, hasUploadedCv } from "@/lib/cvUrls";

function HeroPortrait({ src, name }) {
  const isStringSource = typeof src === "string" && src.length > 0;
  const initials = String(name || "DM")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <div className="absolute -bottom-3 -right-3 h-full w-full border-2 border-ink bg-wine" aria-hidden="true" />
      <div className="absolute -top-3 -left-3 h-full w-full border-2 border-ink bg-lime" aria-hidden="true" />
      <div className="relative aspect-[4/5] w-full overflow-hidden border-2 border-ink bg-paper">
        {isStringSource ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`Portrait of ${name}`}
            className="h-full w-full object-cover object-center grayscale transition duration-500 hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-wine">
            <span className="font-display text-7xl font-bold text-lime sm:text-8xl">{initials}</span>
          </div>
        )}
      </div>
    </div>
  );
}

const ROLE_TAG_STYLES = [
  "border-2 border-ink bg-ink text-paper rotate-[-1.5deg]",
  "border-2 border-ink bg-lime text-ink rotate-[1deg]",
  "border-2 border-ink bg-wine text-paper rotate-[-1deg]",
];

function RoleTags({ titles }) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-3">
      {titles.map((title, idx) => (
        <motion.span
          key={title}
          initial={{ opacity: 0, y: 14, rotate: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.22 + idx * 0.12, ease: "easeOut" }}
          whileHover={{ rotate: 0, y: -3 }}
          className={[
            "inline-block px-4 py-2 font-display text-sm font-bold uppercase tracking-wide shadow-hard-sm transition-transform sm:text-base",
            ROLE_TAG_STYLES[idx % ROLE_TAG_STYLES.length],
          ].join(" ")}
        >
          {title}
        </motion.span>
      ))}
    </div>
  );
}

function MarqueeStrip({ items }) {
  const row = items.join("  ✦  ");
  return (
    <div className="mt-16 overflow-hidden border-y-2 border-ink bg-lime py-3 md:mt-24">
      <div className="flex w-max animate-marquee whitespace-nowrap font-display text-sm font-bold uppercase tracking-[0.25em] text-ink">
        <span className="px-4">{row}  ✦  {row}</span>
        <span className="px-4">{row}  ✦  {row}</span>
      </div>
    </div>
  );
}

export function HeroSection({ profile }) {
  const name = profile?.name ?? "Dickens Deus Manyama";
  const titles = profile?.titles ?? ["Software Developer", "Data Scientist", "IT Systems & Networking"];
  const intro = profile?.professionalSummary ?? "";
  const portraitSrc = profile?.profileImageUrl || null;
  const cvHref = hasUploadedCv(profile) ? getCvDownloadHref(profile) : "/Dickens_Manyama_CV.pdf";
  const cvDownloadName = getCvDownloadFilename(profile);

  const [firstName, ...restNames] = name.split(" ");
  const lastName = restNames.length ? restNames[restNames.length - 1] : "";

  async function handleCvDownload(e) {
    e.preventDefault();
    if (!hasUploadedCv(profile)) {
      window.alert("CV is not available yet. Please try again after the page finishes loading.");
      return;
    }
    try {
      await downloadCvFile(cvHref, cvDownloadName);
    } catch (err) {
      window.alert(err?.message || "Could not download CV. Please try again later.");
    }
  }

  return (
    <section id="home" className="relative overflow-hidden pt-24 sm:pt-28 md:pt-36">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:px-8">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1.5 shadow-hard-sm"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-punch" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ink">
              Available for work
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-6 break-words font-display font-bold uppercase leading-[0.95] tracking-tight text-ink"
          >
            <span className="block text-[2.6rem] sm:text-7xl md:text-8xl">{firstName}</span>
            <span className="text-outline block text-[2.6rem] sm:text-7xl md:text-8xl">{lastName}</span>
          </motion.h1>

          <RoleTags titles={titles} />

          {intro ? (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg"
            >
              {intro}
            </motion.p>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="group inline-flex items-center gap-2 border-2 border-ink bg-punch px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-paper shadow-hard transition-transform hover:-translate-y-1 hover:translate-x-0.5 sm:px-6 sm:py-3.5"
            >
              View Projects
              <ArrowDownRight size={18} className="transition-transform group-hover:rotate-45" />
            </a>

            <a
              href={cvHref}
              onClick={handleCvDownload}
              className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-ink shadow-hard transition-transform hover:-translate-y-1 hover:bg-lime sm:px-6 sm:py-3.5"
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
              className="link-sweep inline-flex items-center gap-1 px-1 py-1 font-display text-sm font-bold uppercase tracking-wide text-ink"
            >
              Contact me <ArrowUpRight size={16} />
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto w-full max-w-xs px-3 sm:max-w-sm sm:px-0 lg:col-span-5"
        >
          <HeroPortrait src={portraitSrc} name={name} />

          <div className="mt-8 grid grid-cols-2 border-2 border-ink shadow-hard">
            <div className="border-r-2 border-ink bg-paper p-3 sm:p-4">
              <p className="font-display text-lg font-bold text-ink sm:text-2xl">Full-stack</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-soft sm:text-xs">
                APIs, apps & automation
              </p>
            </div>
            <div className="bg-wine p-3 sm:p-4">
              <p className="font-display text-lg font-bold text-lime sm:text-2xl">Data & ML</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-paper/80 sm:text-xs">
                Analysis to insight
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <MarqueeStrip items={titles} />
    </section>
  );
}
