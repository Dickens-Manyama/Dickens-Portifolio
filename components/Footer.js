"use client";

import Container from "@/components/Container";
import { SECTIONS } from "@/constants/sections";
import SmoothScrollLink from "@/components/SmoothScrollLink";
import { Github, Linkedin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t-2 border-ink bg-ink text-paper">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <p className="font-display text-3xl font-bold uppercase tracking-tight text-paper">
              Dickens<span className="text-lime">.</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/70">
              Software Developer | Data Scientist | IT Systems & Networking
            </p>
            <a
              href="mailto:dickensmanyama8@gmail.com"
              className="mt-5 inline-flex items-center gap-2 border-2 border-lime px-4 py-2 font-display text-sm font-bold text-lime transition-colors hover:bg-lime hover:text-ink"
            >
              Get in touch <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="md:col-span-3">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-paper/50">
              Navigation
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <SmoothScrollLink
                  key={s.id}
                  href={`#${s.id}`}
                  className="!px-0 !text-paper/80 hover:!text-lime"
                >
                  {s.label}
                </SmoothScrollLink>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-paper/50">
              Social
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="https://github.com/Dickens-Manyama"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-display text-sm font-semibold text-paper/80 transition-colors hover:text-lime"
              >
                <Github size={16} />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/dickens-manyama-560450327"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-display text-sm font-semibold text-paper/80 transition-colors hover:text-lime"
              >
                <Linkedin size={16} />
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-paper/15 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-paper/50">
            © {year} Dickens Manyama. All rights reserved.
          </p>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-paper/50">
            Dar es Salaam, Tanzania
          </p>
        </div>
      </Container>
    </footer>
  );
}
