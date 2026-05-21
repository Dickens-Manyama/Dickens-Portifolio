/**
 * Download CV as a real binary file (avoids cross-origin <a download> saving HTML errors as .docx).
 */
export async function downloadCvFile(url, filename = "cv.docx") {
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Download failed (${res.status})`);
  }

  const blob = await res.blob();
  if (!blob.size) throw new Error("Downloaded CV file is empty.");

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
