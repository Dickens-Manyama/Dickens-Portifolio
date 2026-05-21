/** Same-origin Next.js route — never point the browser at the Render backend for CV bytes. */
export const CV_DOWNLOAD_PROXY_PATH = "/api/cv";

export function hasUploadedCv(profile) {
  return Boolean(profile?.cvUrl || profile?.cvCacheKey || profile?.cvOriginalName);
}

/**
 * Build the public Download CV href (always same-origin /api/cv on your Vercel site).
 */
export function getCvDownloadHref(profile) {
  if (!hasUploadedCv(profile)) return "";
  const cacheKey = profile?.cvCacheKey ? `?v=${encodeURIComponent(profile.cvCacheKey)}` : "";
  return `${CV_DOWNLOAD_PROXY_PATH}${cacheKey}`;
}

export function getCvDownloadFilename(profile) {
  return profile?.cvOriginalName || "Dickens-Manyama-CV.docx";
}

/**
 * Rewrite legacy backend CV URLs (/api/profile/cv or full Render URL) to the Vercel proxy.
 */
export function normalizeCvDownloadUrl(url) {
  if (!url || typeof url !== "string") return CV_DOWNLOAD_PROXY_PATH;

  const trimmed = url.trim();
  if (!trimmed) return CV_DOWNLOAD_PROXY_PATH;

  if (trimmed.startsWith(CV_DOWNLOAD_PROXY_PATH)) return trimmed;

  try {
    const parsed = trimmed.startsWith("http")
      ? new URL(trimmed)
      : new URL(trimmed, "https://dickens-portifolio.vercel.app");

    if (parsed.pathname === "/api/profile/cv" || parsed.pathname.endsWith("/api/profile/cv")) {
      return `${CV_DOWNLOAD_PROXY_PATH}${parsed.search}`;
    }
    if (parsed.pathname === CV_DOWNLOAD_PROXY_PATH) {
      return `${CV_DOWNLOAD_PROXY_PATH}${parsed.search}`;
    }
  } catch {
    // fall through
  }

  if (trimmed.startsWith("/api/profile/cv")) {
    const query = trimmed.includes("?") ? trimmed.slice(trimmed.indexOf("?")) : "";
    return `${CV_DOWNLOAD_PROXY_PATH}${query}`;
  }

  return CV_DOWNLOAD_PROXY_PATH;
}
