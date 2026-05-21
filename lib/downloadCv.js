function isDocxArrayBuffer(buffer) {
  if (!buffer || buffer.byteLength < 4) return false;
  const view = new Uint8Array(buffer);
  return view[0] === 0x50 && view[1] === 0x4b;
}

/**
 * Download CV via same-origin /api/cv proxy (real binary, Word-safe).
 */
export async function downloadCvFile(url, filename = "cv.docx") {
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    let message = `Download failed (${res.status})`;
    try {
      const json = await res.json();
      message = json?.message || message;
    } catch {
      const text = await res.text().catch(() => "");
      if (text) message = text;
    }
    throw new Error(message);
  }

  const buffer = await res.arrayBuffer();
  if (!buffer.byteLength) throw new Error("Downloaded CV file is empty.");

  const lower = filename.toLowerCase();
  if (lower.endsWith(".docx") && !isDocxArrayBuffer(buffer)) {
    throw new Error(
      "Downloaded file is not a valid Word document. Re-save your CV as DOCX in admin, then try again."
    );
  }

  const blob = new Blob([buffer], {
    type: res.headers.get("content-type") || "application/octet-stream",
  });

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
