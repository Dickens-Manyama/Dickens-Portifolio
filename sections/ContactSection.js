"use client";

import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, MessageCircle, Phone } from "lucide-react";
import { submitContact } from "@/services/api";

function LoadingDot() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-950" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-950 [animation-delay:0.12s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-950 [animation-delay:0.24s]" />
    </span>
  );
}

function normalizePhoneForWhatsApp(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";

  // Keep the number as-is when it already includes a country code.
  if (digits.length > 10) return digits;

  // Fallback for local numbers that start with 0.
  return digits.startsWith("0") ? `255${digits.slice(1)}` : digits;
}

function buildWhatsAppLink(phone) {
  const normalized = normalizePhoneForWhatsApp(phone);
  if (!normalized) return "";

  const text = encodeURIComponent(
    "Hello Dickens, I found your portfolio and would like to get in touch."
  );
  return `https://wa.me/${normalized}?text=${text}`;
}

function buildMailtoLink(email) {
  const normalizedEmail = String(email || "").trim();
  if (!normalizedEmail) return "";

  const subject = encodeURIComponent("Portfolio inquiry");
  const body = encodeURIComponent("Hello Dickens,\n\nI would like to get in touch about your portfolio.");
  return `mailto:${normalizedEmail}?subject=${subject}&body=${body}`;
}

export function ContactSection({ profile }) {
  const email = profile?.email ?? "dickensmanyama8@gmail.com";
  const phones = profile?.phoneNumbers ?? ["0679 165 468", "0692 501 112"];
  const githubUrl = profile?.githubUrl ?? "https://github.com/Dickens-Manyama";
  const linkedInUrl =
    profile?.linkedinUrl ?? "https://www.linkedin.com/in/dickens-manyama-560450327";
  const mailtoLink = buildMailtoLink(email);

  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "idle", text: "" });

  const submitDisabled = useMemo(() => {
    return !name.trim() || !contactEmail.trim() || !message.trim() || submitting;
  }, [name, contactEmail, message, submitting]);

  async function onSubmit(e) {
    e.preventDefault();
    if (submitDisabled) return;

    setSubmitting(true);
    setStatus({ type: "idle", text: "" });

    try {
      const res = await submitContact({
        name: name.trim(),
        email: contactEmail.trim(),
        message: message.trim(),
      });
      if (!res?.success) {
        throw new Error(res?.message || "Something went wrong. Please try again.");
      }

      setStatus({ type: "success", text: res?.message ?? "Message sent successfully." });
      setName("");
      setContactEmail("");
      setMessage("");
    } catch (err) {
      const messageText = err?.data?.message || err?.message || "Something went wrong. Please try again.";
      setStatus({
        type: "error",
        text: messageText,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="py-16 md:py-20">
      <Container>
        <Reveal>
          <div>
            <p className="text-sm font-semibold tracking-wide text-indigo-300">Contact</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
              Let&apos;s build something reliable
            </h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Send a message using the form, or reach out directly via email/phone.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-soft"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white/95">Direct contact</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                  Responsive
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <a
                    href={mailtoLink}
                    target="_self"
                    className="flex items-center gap-3 transition hover:text-indigo-200"
                    aria-label={`Send email to ${email}`}
                  >
                    <Mail size={18} className="text-indigo-200" />
                    <span className="break-words text-sm font-semibold text-white/95">
                      {email}
                    </span>
                  </a>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-indigo-200" />
                    <div className="min-w-0 space-y-2">
                      {phones.map((p) => (
                        <a
                          key={p}
                          href={buildWhatsAppLink(p)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 break-words text-sm font-semibold text-white/95 transition hover:text-green-300"
                        >
                          <MessageCircle size={16} className="shrink-0 text-green-300" />
                          <span>{p}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    <Github size={18} />
                    GitHub
                  </a>
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    <Linkedin size={18} />
                    LinkedIn
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              onSubmit={onSubmit}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-soft"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white/95">Send a message</p>

                </div>
                <span className="text-xs font-semibold text-slate-200 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {submitting ? "Sending..." : "Ready"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-300">Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/40"
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-300">Email</span>
                  <input
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/40"
                    placeholder="you@example.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="text-xs font-semibold text-slate-300">Message</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/40"
                  placeholder="Write your message..."
                />
              </label>

              <div className="mt-5 flex flex-col gap-3">
                <motion.button
                  type="submit"
                  whileHover={submitDisabled ? {} : { scale: 1.01 }}
                  whileTap={submitDisabled ? {} : { scale: 0.99 }}
                  disabled={submitDisabled}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-soft transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <LoadingDot />
                      Sending
                    </>
                  ) : (
                    "Submit"
                  )}
                </motion.button>

                {status.type !== "idle" && (
                  <div
                    role="status"
                    className={[
                      "rounded-2xl border px-4 py-3 text-sm shadow-soft",
                      status.type === "success"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                        : "border-rose-400/30 bg-rose-400/10 text-rose-100",
                    ].join(" ")}
                  >
                    {status.text}
                  </div>
                )}
              </div>
            </motion.form>
          </div>
        </div>
      </Container>
    </section>
  );
}

