"use client";

import { useMemo, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Github, Linkedin, Mail, MessageCircle, Send } from "lucide-react";
import { submitContact } from "@/services/api";

function normalizePhoneForWhatsApp(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length > 10) return digits;
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

const inputClasses =
  "mt-2 w-full rounded-md border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-colors focus:border-teal-300";

export function ContactSection({ profile }) {
  const email = profile?.email ?? "dickensmanyama8@gmail.com";
  const phones = profile?.phoneNumbers ?? ["0679 165 468", "0692 501 112"];
  const githubUrl = profile?.githubUrl ?? "https://github.com/Dickens-Manyama";
  const linkedInUrl =
    profile?.linkedinUrl ?? "https://www.linkedin.com/in/dickens-manyama-560450327";

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
      const messageText =
        err?.data?.message || err?.message || "Something went wrong. Please try again.";
      setStatus({ type: "error", text: messageText });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24">
      <SectionHeading label="Contact" />

      <h3 className="text-2xl font-bold tracking-tight text-slate-200 sm:text-3xl">
        Get in touch
      </h3>
      <p className="mt-4 max-w-md leading-relaxed text-slate-400">
        Whether you have a project in mind, a question, or just want to say hi — my inbox is
        always open.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-teal-300"
        >
          <Mail size={16} />
          {email}
        </a>
        {phones[0] ? (
          <a
            href={buildWhatsAppLink(phones[0])}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-teal-300"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        ) : null}
        <a
          href={githubUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-teal-300"
        >
          <Github size={16} />
          GitHub
        </a>
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-teal-300"
        >
          <Linkedin size={16} />
          LinkedIn
        </a>
      </div>

      <form onSubmit={onSubmit} className="mt-10 max-w-xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </span>
            <input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClasses}
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Message
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className={`${inputClasses} resize-none`}
            placeholder="Write your message..."
          />
        </label>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="submit"
            disabled={submitDisabled}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-300/30 bg-teal-400/10 px-6 py-3 text-sm font-semibold text-teal-300 transition-colors enabled:hover:bg-teal-400/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={15} />
            {submitting ? "Sending..." : "Send message"}
          </button>

          {status.type !== "idle" && (
            <div
              role="status"
              className={[
                "rounded-md border px-4 py-3 text-sm font-medium",
                status.type === "success"
                  ? "border-teal-300/30 bg-teal-400/10 text-teal-300"
                  : "border-rose-400/30 bg-rose-400/10 text-rose-300",
              ].join(" ")}
            >
              {status.text}
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
