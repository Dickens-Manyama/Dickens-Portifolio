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
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/35 to-transparent backdrop-blur-md" />
      <Container className="relative flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-cyan-400/25 shadow-soft">
            <span className="text-sm font-extrabold tracking-wide">DM</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white/95">Dickens Manyama</p>
            <p className="text-xs text-slate-300">Portfolio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-indigo-300/35 bg-slate-950/85 text-white shadow-soft backdrop-blur-md transition hover:border-indigo-300/60 hover:bg-indigo-400/20 hover:text-white sm:w-auto sm:gap-2 sm:px-4"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close sidebar" : "Open sidebar"}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-40 cursor-default bg-slate-950/55 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed left-4 top-4 z-50 flex h-[calc(100vh-2rem)] w-[18rem] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/95 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">Navigation</p>
                  <p className="mt-1 text-sm text-slate-300">Move through the portfolio</p>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:border-rose-300/40 hover:bg-rose-400/15 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="flex flex-col gap-2">
                  {loading ? (
                    <div className="flex flex-col gap-2">
                      {new Array(SECTIONS.length).fill(0).map((_, idx) => (
                        <SkeletonCard key={idx} className="h-12 w-full rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    SECTIONS.map((item, index) => (
                      <SmoothScrollLink
                        key={item.id}
                        href={`#${item.id}`}
                        active={activeId === item.id}
                          onNavigate={() => setMenuOpen(false)}
                        className="group w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 hover:-translate-x-1 hover:bg-white/10 hover:text-white"
                      >
                        <span className="inline-flex items-center gap-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-slate-500 transition group-hover:bg-cyan-300" />
                          {item.label}
                        </span>
                      </SmoothScrollLink>
                    ))
                  )}
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div>
                      <p className="text-xs text-slate-400">Theme</p>
                      <p className="mt-1 text-sm font-semibold text-white/90">Switch appearance</p>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 p-4">
                <Link
                  href="/admin"
                  className="mt-auto flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition duration-200 hover:border-indigo-300/40 hover:bg-indigo-400/15 hover:text-white"
                >
                  <span>Admin Login</span>
                  <span className="text-xs text-slate-400">Access</span>
                </Link>
                <p className="mt-3 text-xs text-slate-500">
                  Click outside the panel to close it.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

