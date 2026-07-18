"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { SECTIONS } from "@/constants/sections";
import SmoothScrollLink from "@/components/SmoothScrollLink";
import { motion, AnimatePresence } from "framer-motion";
import { useActiveSection } from "@/hooks/useActiveSection";

export default function Navbar() {
  const sectionIds = useMemo(() => SECTIONS.map((s) => s.id), []);
  const activeId = useActiveSection(sectionIds);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [activeId]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Robust scroll lock: overflow:hidden alone is ignored by iOS Safari for
  // touch scrolling, so we also fix the body in place and restore on close.
  // useLayoutEffect so the unlock happens synchronously before any deferred
  // scrollIntoView from a menu link runs.
  useLayoutEffect(() => {
    if (!menuOpen) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflow = "hidden";
    return () => {
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.width = "";
      style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div
        className={[
          "border-b-2 transition-colors duration-300",
          scrolled ? "border-ink bg-paper/95 backdrop-blur-sm" : "border-transparent bg-transparent",
        ].join(" ")}
      >
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <SmoothScrollLink href="#home" className="!px-0">
            <span className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center border-2 border-ink bg-lime font-display text-sm font-bold text-ink shadow-hard-sm">
                DM
              </span>
              <span className="hidden font-display text-sm font-bold tracking-tight text-ink sm:inline">
                Dickens Manyama
              </span>
            </span>
          </SmoothScrollLink>

          <div className="hidden items-center gap-1 lg:flex">
            {SECTIONS.map((item) => (
              <SmoothScrollLink
                key={item.id}
                href={`#${item.id}`}
                active={activeId === item.id}
                className="px-3"
              >
                {item.label}
              </SmoothScrollLink>
            ))}
            <SmoothScrollLink
              href="#contact"
              className="ml-3 !bg-none border-2 border-ink bg-punch !px-4 !py-2 !text-paper shadow-hard-sm transition-transform hover:-translate-y-0.5 hover:!text-paper"
            >
              <span className="inline-flex items-center gap-1">
                Hire me <ArrowUpRight size={15} />
              </span>
            </SmoothScrollLink>
          </div>

          <button
            type="button"
            className={[
              "h-10 w-10 items-center justify-center border-2 border-ink bg-paper text-ink shadow-hard-sm transition-transform hover:-translate-y-0.5",
              // Always visible on small screens; on desktop it appears once
              // the page is scrolled (or while the menu is open) so the
              // Admin Login entry stays reachable.
              menuOpen || scrolled ? "inline-flex" : "inline-flex lg:hidden",
            ].join(" ")}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 top-16 z-40 flex flex-col bg-paper paper-grid"
          >
            <div className="flex flex-1 flex-col justify-center gap-1 overflow-y-auto overscroll-contain px-6 py-6">
              {SECTIONS.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + idx * 0.05, duration: 0.25 }}
                >
                  <SmoothScrollLink
                    href={`#${item.id}`}
                    active={activeId === item.id}
                    onNavigate={() => setMenuOpen(false)}
                    className="group flex items-baseline gap-4 !px-0 !py-3"
                  >
                    <span className="font-display text-sm font-bold text-punch">
                      0{idx + 1}
                    </span>
                    <span className="font-display text-4xl font-bold tracking-tight text-ink transition-colors group-hover:text-wine">
                      {item.label}
                    </span>
                  </SmoothScrollLink>
                </motion.div>
              ))}
            </div>

            <div className="border-t-2 border-ink px-6 py-5">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 border-2 border-ink bg-lime px-4 py-2 font-display text-sm font-bold text-ink shadow-hard-sm"
              >
                Admin Login <ArrowUpRight size={15} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
