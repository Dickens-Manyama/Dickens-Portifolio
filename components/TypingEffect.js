"use client";

import { useEffect, useMemo, useState } from "react";

export default function TypingEffect({ words = [], typingSpeed = 55, deletingSpeed = 35, pauseMs = 900 }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("typing"); // typing | deleting | waiting

  const currentWord = words[wordIndex] ?? "";

  const memoWords = useMemo(() => words, [words]);

  useEffect(() => {
    if (!memoWords.length) return;

    let timeoutId;

    if (phase === "typing") {
      timeoutId = setTimeout(() => {
        const next = currentWord.slice(0, text.length + 1);
        setText(next);
        if (next.length === currentWord.length) setPhase("waiting");
      }, typingSpeed);
    } else if (phase === "waiting") {
      timeoutId = setTimeout(() => setPhase("deleting"), pauseMs);
    } else if (phase === "deleting") {
      timeoutId = setTimeout(() => {
        const next = currentWord.slice(0, Math.max(0, text.length - 1));
        setText(next);
        if (next.length === 0) {
          setPhase("typing");
          setWordIndex((i) => (i + 1) % memoWords.length);
        }
      }, deletingSpeed);
    }

    return () => clearTimeout(timeoutId);
  }, [phase, typingSpeed, deletingSpeed, pauseMs, currentWord, memoWords.length, text.length]);

  return (
    <span aria-label={currentWord} className="inline-flex items-center">
      <span className="whitespace-nowrap">{text}</span>
      <span className="ml-1 inline-block h-4 w-1 animate-pulse rounded-full bg-indigo-300/80" aria-hidden="true" />
    </span>
  );
}

