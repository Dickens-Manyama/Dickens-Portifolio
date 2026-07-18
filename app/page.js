"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Github, Linkedin, Mail, MessageCircle, Lock } from "lucide-react";
import { SECTIONS } from "@/constants/sections";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useFetchPortfolioData } from "@/hooks/useFetchPortfolioData";
import { AboutSection } from "@/sections/AboutSection";
import { SkillsSection } from "@/sections/SkillsSection";
import { ProjectsSection } from "@/sections/ProjectsSection";
import { EducationSection } from "@/sections/EducationSection";
import { ContactSection } from "@/sections/ContactSection";

function normalizePhoneForWhatsApp(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length > 10) return digits;
  return digits.startsWith("0") ? `255${digits.slice(1)}` : digits;
}

function MouseSpotlight() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 hidden transition duration-300 lg:block"
      style={{
        background: `radial-gradient(600px at ${pos.x}px ${pos.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
      }}
    />
  );
}

function NavLink({ id, label, active }) {
  return (
    <li>
      <a className="group flex items-center py-3" href={`#${id}`}>
        <span
          className={[
            "mr-4 h-px transition-all motion-reduce:transition-none",
            active
              ? "w-16 bg-slate-200"
              : "w-8 bg-slate-600 group-hover:w-16 group-hover:bg-slate-200",
          ].join(" ")}
          aria-hidden="true"
        />
        <span
          className={[
            "text-xs font-bold uppercase tracking-widest transition-colors",
            active ? "text-slate-200" : "text-slate-500 group-hover:text-slate-200",
          ].join(" ")}
        >
          {label}
        </span>
      </a>
    </li>
  );
}

export default function HomePage() {
  const { loading, profile, skills, projects, education } = useFetchPortfolioData();
  const sectionIds = useMemo(() => SECTIONS.map((s) => s.id), []);
  const activeId = useActiveSection(sectionIds);

  const name = profile?.name ?? "Dickens Deus Manyama";
  const titles = profile?.titles ?? ["Software Developer", "Data Scientist"];
  const tagline =
    profile?.careerObjective ||
    "I build reliable, data-driven systems — from backend APIs to machine learning.";
  const email = profile?.email ?? "dickensmanyama8@gmail.com";
  const githubUrl = profile?.githubUrl ?? "https://github.com/Dickens-Manyama";
  const linkedinUrl =
    profile?.linkedinUrl ?? "https://www.linkedin.com/in/dickens-manyama-560450327";
  const whatsappNumber = normalizePhoneForWhatsApp(profile?.phoneNumbers?.[0]);
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-screen">
      <MouseSpotlight />

      <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 md:px-12 md:py-16 lg:flex lg:justify-between lg:gap-4 lg:px-24 lg:py-0">
        {/* Left column: sticky identity + nav + socials */}
        <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[48%] lg:flex-col lg:justify-between lg:py-24">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">
              <a href="#about" className="transition-colors hover:text-teal-300">
                {name}
              </a>
            </h1>
            <h2 className="mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl">
              {titles.join(" · ")}
            </h2>
            <p className="mt-4 max-w-xs leading-normal text-slate-400">{tagline}</p>

            <nav className="hidden lg:block" aria-label="In-page jump links">
              <ul className="mt-16 w-max">
                {SECTIONS.map((s) => (
                  <NavLink key={s.id} id={s.id} label={s.label} active={activeId === s.id} />
                ))}
              </ul>
            </nav>
          </div>

          <ul className="mt-8 flex items-center gap-5" aria-label="Social media">
            <li>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-slate-400 transition-colors hover:text-teal-300"
              >
                <Github size={22} />
              </a>
            </li>
            <li>
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-slate-400 transition-colors hover:text-teal-300"
              >
                <Linkedin size={22} />
              </a>
            </li>
            <li>
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className="text-slate-400 transition-colors hover:text-teal-300"
              >
                <Mail size={22} />
              </a>
            </li>
            {whatsappNumber ? (
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="text-slate-400 transition-colors hover:text-teal-300"
                >
                  <MessageCircle size={22} />
                </a>
              </li>
            ) : null}
            <li>
              <Link
                href="/admin"
                aria-label="Admin login"
                className="text-slate-600 transition-colors hover:text-teal-300"
              >
                <Lock size={18} />
              </Link>
            </li>
          </ul>
        </header>

        {/* Right column: scrollable content */}
        <main className="pt-24 lg:w-[52%] lg:py-24">
          <AboutSection profile={profile} />
          <SkillsSection skills={skills} loading={loading} />
          <ProjectsSection projects={projects} loading={loading} />
          <EducationSection education={education} loading={loading} />
          <ContactSection profile={profile} />

          <footer className="max-w-md pb-16 text-sm text-slate-500">
            <p>
              © {year} {name}. Based in Dar es Salaam, Tanzania.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
