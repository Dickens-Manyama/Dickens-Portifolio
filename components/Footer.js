"use client";

import Container from "@/components/Container";
import { SECTIONS } from "@/constants/sections";
import SmoothScrollLink from "@/components/SmoothScrollLink";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/40 backdrop-blur-xl">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-white/95">Dickens Manyama</p>
            <p className="mt-2 text-sm text-slate-300">
              Software Developer | Data Scientist | IT Systems & Networking
            </p>
            <p className="mt-4 text-xs text-slate-400">
              © {year} Dickens Manyama. All rights reserved.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/95">Quick navigation</p>
            <div className="mt-3 flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <SmoothScrollLink key={s.id} href={`#${s.id}`} className="text-sm text-slate-300">
                  {s.label}
                </SmoothScrollLink>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-white/95">Social</p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://github.com/Dickens-Manyama"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                <Github size={18} />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/dickens-manyama-560450327"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                <Linkedin size={18} />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

