"use client";

function wrapPlainAsHtml(text) {
  const safe = String(text || "").trim();
  if (!safe) return "<p></p>";
  if (/<[a-z][\s\S]*>/i.test(safe)) return safe;
  return safe
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export default function CvDocumentViewer({ html, plainText, className = "" }) {
  const documentHtml = html || wrapPlainAsHtml(plainText);

  return (
    <div
      className={`cv-document-page mx-auto min-h-[70vh] w-full max-w-[820px] rounded-sm border border-slate-300 bg-white px-10 py-12 text-slate-900 shadow-[0_2px_16px_rgba(0,0,0,0.18)] ${className}`}
    >
      <div
        className="cv-document-body prose prose-slate max-w-none text-[11pt] leading-relaxed [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: documentHtml }}
      />
    </div>
  );
}
