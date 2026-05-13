"use client";

import { motion } from "framer-motion";

export default function BackgroundBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/35 via-violet-500/25 to-cyan-400/20 blur-3xl"
        animate={{ x: ["-20%", "15%", "-20%"], y: ["0%", "-10%", "0%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/25 via-indigo-500/20 to-violet-500/15 blur-3xl"
        animate={{ x: ["0%", "12%", "0%"], y: ["0%", "-8%", "0%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-16 right-0 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/25 via-indigo-500/20 to-cyan-400/15 blur-3xl"
        animate={{ x: ["0%", "-10%", "0%"], y: ["0%", "10%", "0%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

