import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Same-origin proxy so the browser receives a real binary DOCX (not a CORS-blocked/empty blob).
 */
export async function GET(request) {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "";

  if (!base) {
    return NextResponse.json({ message: "API URL is not configured." }, { status: 500 });
  }

  const url = new URL(request.url);
  const backendUrl = `${base.replace(/\/$/, "")}/api/profile/cv${url.search}`;

  const res = await fetch(backendUrl, { cache: "no-store" });

  if (!res.ok) {
    const text = await res.text().catch(() => "Failed to load CV.");
    return NextResponse.json({ message: text }, { status: res.status });
  }

  const buffer = await res.arrayBuffer();
  if (!buffer.byteLength) {
    return NextResponse.json({ message: "CV file is empty." }, { status: 404 });
  }

  const bytes = new Uint8Array(buffer);
  const isDocx = bytes[0] === 0x50 && bytes[1] === 0x4b;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("wordprocessingml") && !isDocx) {
    return NextResponse.json(
      { message: "CV file from server is invalid. Re-save as DOCX in admin." },
      { status: 500 }
    );
  }

  const disposition =
    res.headers.get("content-disposition") || 'attachment; filename="cv.docx"';

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType || "application/octet-stream",
      "Content-Disposition": disposition,
      "Content-Length": String(buffer.byteLength),
      "Cache-Control": "no-store",
    },
  });
}
