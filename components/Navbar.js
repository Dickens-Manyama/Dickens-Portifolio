"use client";

import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { SECTIONS } from "@/constants/sections";
import SmoothScrollLink from "@/components/SmoothScrollLink";
import ThemeToggle from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveSection } from "@/hooks/useActiveSection";
import Container from "@/components/Container";
import { SkeletonCard } from "@/components/SkeletonCard";

export default function Navbar({ loading = false }) {
  const sectionIds = useMemo(() => SECTIONS.map((s) => s.id), []);
  const activeId = useActiveSection(sectionIds);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Close menu when switching sections (mobile UX).
    setMenuOpen(false);
  }, [activeId]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-cyan-400/25 border border-white/10 shadow-soft">
            <span className="text-sm font-extrabold tracking-wide">DM</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white/95">Dickens Manyama</p>
            <p className="text-xs text-slate-300">Portfolio</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="flex items-center gap-2">
              {new Array(SECTIONS.length).fill(0).map((_, idx) => (
                <SkeletonCard key={idx} className="h-9 w-20" />
              ))}
            </div>
          ) : (
            SECTIONS.map((item) => (
              <SmoothScrollLink
                key={item.id}
                href={`#${item.id}`}
                active={activeId === item.id}
              >
                {item.label}
              </SmoothScrollLink>
            ))
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="hidden rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-indigo-300/50 hover:bg-indigo-400/10 md:inline-flex"
          >
            Admin Login
          </Link>

          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition hover:bg-white/10 hover:border-white/20 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-slate-950/70 backdrop-blur-xl md:hidden"
          >
            <Container className="py-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-end">
                  <ThemeToggle />
                </div>
                {SECTIONS.map((item) => (
                  <SmoothScrollLink
                    key={item.id}
                    href={`#${item.id}`}
                    active={activeId === item.id}
                    className="w-full px-3 py-2 text-left text-sm"
                  >
                    {item.label}
                  </SmoothScrollLink>
                ))}

                <Link
                  href="/admin"
                  className="mt-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-indigo-300/50 hover:bg-indigo-400/10"
                >
                  Admin Login
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

