"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.button
      type="button"
      initial={false}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20, pointerEvents: visible ? "auto" : "none" }}
      transition={{ duration: 0.2 }}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-4 z-50 inline-flex h-12 w-12 items-center justify-center border-2 border-ink bg-lime text-ink shadow-hard transition-transform hover:-translate-y-1"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </motion.button>
  );
}
