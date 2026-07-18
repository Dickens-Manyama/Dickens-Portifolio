"use client";

import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import { useMemo, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Github, Linkedin, Mail, MessageCircle, Phone, Send } from "lucide-react";
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

function buildMailtoLink(email) {
  const normalizedEmail = String(email || "").trim();
  if (!normalizedEmail) return "";
  const subject = encodeURIComponent("Portfolio inquiry");
  const body = encodeURIComponent(
    "Hello Dickens,\n\nI would like to get in touch about your portfolio."
  );
  return `mailto:${normalizedEmail}?subject=${subject}&body=${body}`;
}

const inputClasses =
  "mt-2 w-full border-2 border-ink bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-faint outline-none transition-shadow focus:shadow-hard-sm focus:border-punch";

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
  const [statusParent] = useAutoAnimate({ duration: 200 });

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
    <section id="contact" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          number="05"
          label="Contact"
          title="Let's build something reliable"
          description="Send a message using the form, or reach out directly via email, WhatsApp, or socials."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="border-2 border-ink bg-paper shadow-hard">
              <div className="border-b-2 border-ink bg-lime px-6 py-4">
                <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-ink">
                  Direct contact
                </p>
              </div>

              <div className="space-y-5 p-6">
                <a
                  href={mailtoLink}
                  className="group flex items-center gap-4"
                  aria-label={`Send email to ${email}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-ink bg-paper transition-colors group-hover:bg-punch">
                    <Mail size={18} className="text-ink transition-colors group-hover:text-paper" />
                  </span>
                  <span className="break-all text-sm font-bold text-ink group-hover:text-wine">
                    {email}
                  </span>
                </a>

                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-ink bg-paper">
                    <Phone size={18} className="text-ink" />
                  </span>
                  <div className="space-y-2 pt-1">
                    {phones.map((p) => (
                      <a
                        key={p}
                        href={buildWhatsAppLink(p)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-sm font-bold text-ink transition-colors hover:text-wine"
                      >
                        <MessageCircle size={15} className="shrink-0 text-punch" />
                        <span>{p}</span>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 border-t-2 border-ink/15 pt-5">
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-display text-sm font-bold text-paper transition-colors hover:bg-wine"
                  >
                    <Github size={16} />
                    GitHub
                  </a>
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2 font-display text-sm font-bold text-ink transition-colors hover:bg-lime"
                  >
                    <Linkedin size={16} />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={onSubmit} className="border-2 border-ink bg-paper shadow-hard">
              <div className="flex items-center justify-between border-b-2 border-ink bg-wine px-6 py-4">
                <p className="font-display text-sm font-bold uppercase tracking-[0.18em] text-paper">
                  Send a message
                </p>
                <span className="border-2 border-lime px-3 py-0.5 font-display text-xs font-bold uppercase text-lime">
                  {submitting ? "Sending..." : "Ready"}
                </span>
              </div>

              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-display text-xs font-bold uppercase tracking-wide text-ink">
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
                    <span className="font-display text-xs font-bold uppercase tracking-wide text-ink">
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
                  <span className="font-display text-xs font-bold uppercase tracking-wide text-ink">
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

                <div ref={statusParent} className="mt-5 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submitDisabled}
                    className="inline-flex items-center justify-center gap-2 border-2 border-ink bg-punch px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wide text-paper shadow-hard transition-transform enabled:hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={16} />
                    {submitting ? "Sending..." : "Send message"}
                  </button>

                  {status.type !== "idle" && (
                    <div
                      role="status"
                      className={[
                        "border-2 px-4 py-3 text-sm font-semibold",
                        status.type === "success"
                          ? "border-ink bg-lime text-ink"
                          : "border-punch bg-punch/10 text-wine",
                      ].join(" ")}
                    >
                      {status.text}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
