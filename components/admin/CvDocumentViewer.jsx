"use client";

const EMPTY_CV_HTML = "<p></p>";
const HTML_TAG_PATTERN = /<[a-z][\s\S]*>/i;

function wrapPlainAsHtml(text) {
  const normalized = String(text || "").trim();
  if (!normalized) return EMPTY_CV_HTML;
  if (HTML_TAG_PATTERN.test(normalized)) return normalized;
  return normalized
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * @param {{
 *   html?: string;
 *   plainText?: string;
 *   className?: string;
 * }} props
 */
export default function CvDocumentViewer({ html, plainText, className = "" }) {
  const documentHtml = html || wrapPlainAsHtml(plainText);

  return (
    <div
      className={`cv-document-page mx-auto min-h-[70vh] w-full max-w-[820px] rounded-sm border border-slate-300 bg-white px-10 py-12 text-slate-900 shadow-[0_2px_16px_rgba(0,0,0,0.18)] ${className}`}
    >
      <div
        dir="ltr"
        className="cv-document-body prose prose-slate max-w-none text-[11pt] leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_hr]:my-4 [&_hr]:border-0 [&_hr]:border-t-[3px] [&_hr]:border-solid [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
        dangerouslySetInnerHTML={{ __html: documentHtml }}
      />
    </div>
  );
}
