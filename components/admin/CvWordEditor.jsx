"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Highlighter,
  Indent,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Outdent,
  Palette,
  Redo2,
  Strikethrough,
  Type,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import CvDocumentViewer from "@/components/admin/CvDocumentViewer";

const EMPTY_CV_HTML = "<p></p>";

const SAVE_FORMATS = [
  { id: "docx", label: "Word (.docx)" },
  { id: "pdf", label: "PDF (.pdf)" },
  { id: "html", label: "Web (.html)" },
  { id: "txt", label: "Plain text (.txt)" },
];

const FONT_FAMILIES = [
  { label: "Calibri", value: "Calibri, 'Segoe UI', sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Cambria", value: "Cambria, Georgia, serif" },
  { label: "Consolas", value: "Consolas, 'Courier New', monospace" },
];

const FONT_SIZES = [
  { label: "8", value: "1" },
  { label: "10", value: "2" },
  { label: "11", value: "3" },
  { label: "12", value: "4" },
  { label: "14", value: "5" },
  { label: "16", value: "6" },
  { label: "18", value: "7" },
  { label: "24", value: "8" },
  { label: "36", value: "9" },
];

function placeCaretAtEnd(el) {
  if (!el) return;
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function countWords(html) {
  const text = String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(" ").filter(Boolean).length;
}

/**
 * @param {{
 *   title: string;
 *   onClick: () => void;
 *   active?: boolean;
 *   disabled?: boolean;
 *   children: import("react").ReactNode;
 * }} props
 */
function ToolbarButton({ title, onClick, active = false, disabled = false, children }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 text-slate-700 transition disabled:opacity-40 ${
        active
          ? "border-[#185abd] bg-[#deecf9] text-[#185abd]"
          : "border-transparent bg-transparent hover:border-slate-300 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarGroup({ label, children }) {
  return (
    <div className="flex flex-col border-r border-slate-300/80 pr-2 last:border-r-0">
      <div className="mb-1 flex flex-wrap items-center gap-0.5">{children}</div>
      <span className="text-center text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

export default function CvWordEditor({
  open,
  mode = "edit",
  title = "CV Document",
  initialHtml = EMPTY_CV_HTML,
  loading = false,
  onClose,
  onSave,
}) {
  const editorRef = useRef(null);
  const shouldSyncDom = useRef(true);
  const pendingHtmlRef = useRef(initialHtml);
  const [html, setHtml] = useState(initialHtml);
  const [saveFormat, setSaveFormat] = useState("docx");
  const [previewMode, setPreviewMode] = useState(mode === "view");
  const [zoom, setZoom] = useState(100);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0].value);
  const [fontSize, setFontSize] = useState("3");
  const [textColor, setTextColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");

  const wordCount = useMemo(() => countWords(html), [html]);

  useEffect(() => {
    if (!open) return;
    const next = initialHtml || EMPTY_CV_HTML;
    pendingHtmlRef.current = next;
    setHtml(next);
    setPreviewMode(mode === "view");
    shouldSyncDom.current = true;
  }, [open, initialHtml, mode]);

  useEffect(() => {
    if (!open || previewMode || !editorRef.current || !shouldSyncDom.current) return;
    const el = editorRef.current;
    el.innerHTML = pendingHtmlRef.current || EMPTY_CV_HTML;
    el.setAttribute("dir", "ltr");
    el.style.direction = "ltr";
    el.style.unicodeBidi = "normal";
    el.style.textAlign = "left";
    el.style.fontFamily = fontFamily;
    shouldSyncDom.current = false;
    placeCaretAtEnd(el);
  }, [open, previewMode]);

  const runCommand = useCallback((command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtml(editorRef.current.innerHTML);
    }
  }, []);

  const syncHtml = useCallback(() => {
    if (editorRef.current) {
      const next = editorRef.current.innerHTML;
      pendingHtmlRef.current = next;
      setHtml(next);
    }
  }, []);

  const applyFontFamily = useCallback(
    (family) => {
      setFontFamily(family);
      runCommand("fontName", family);
    },
    [runCommand]
  );

  const applyFontSize = useCallback(
    (size) => {
      setFontSize(size);
      runCommand("fontSize", size);
    },
    [runCommand]
  );

  const insertLink = useCallback(() => {
    const url = window.prompt("Enter link URL (https://...)");
    if (!url) return;
    runCommand("createLink", url);
  }, [runCommand]);

  const enterEditMode = useCallback(() => {
    pendingHtmlRef.current = html;
    shouldSyncDom.current = true;
    setPreviewMode(false);
  }, [html]);

  const handleSave = () => {
    const currentHtml = previewMode ? html : editorRef.current?.innerHTML || html;
    onSave?.(currentHtml, saveFormat);
  };

  useEffect(() => {
    if (!open || previewMode) return;

    const onKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "b") {
        e.preventDefault();
        runCommand("bold");
      } else if (key === "i") {
        e.preventDefault();
        runCommand("italic");
      } else if (key === "u") {
        e.preventDefault();
        runCommand("underline");
      } else if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        runCommand("undo");
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        runCommand("redo");
      } else if (key === "s") {
        e.preventDefault();
        const currentHtml = editorRef.current?.innerHTML || html;
        onSave?.(currentHtml, saveFormat);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, previewMode, runCommand, html, saveFormat, onSave]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f3f2f1]">
      <div className="flex items-center justify-between border-b border-slate-300 bg-[#323130] px-4 py-2 text-white">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-300">Portfolio CV</p>
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-300">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <button
            type="button"
            onClick={() => {
              if (previewMode) {
                enterEditMode();
              } else {
                syncHtml();
                setPreviewMode(true);
              }
            }}
            className="rounded border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
          >
            {previewMode ? "Edit" : "Print layout"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/20"
          >
            Close
          </button>
        </div>
      </div>

      {!previewMode ? (
        <div className="border-b border-slate-300 bg-[#faf9f8] px-3 py-2 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <ToolbarGroup label="Undo">
              <ToolbarButton title="Undo (Ctrl+Z)" onClick={() => runCommand("undo")}>
                <Undo2 size={16} />
              </ToolbarButton>
              <ToolbarButton title="Redo (Ctrl+Y)" onClick={() => runCommand("redo")}>
                <Redo2 size={16} />
              </ToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup label="Font">
              <select
                aria-label="Font family"
                value={fontFamily}
                onChange={(e) => applyFontFamily(e.target.value)}
                className="h-8 max-w-[9rem] rounded border border-slate-300 bg-white px-2 text-xs text-slate-700"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.label} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Font size"
                value={fontSize}
                onChange={(e) => applyFontSize(e.target.value)}
                className="h-8 w-14 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s.label} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ToolbarButton title="Bold (Ctrl+B)" onClick={() => runCommand("bold")}>
                <Bold size={16} />
              </ToolbarButton>
              <ToolbarButton title="Italic (Ctrl+I)" onClick={() => runCommand("italic")}>
                <Italic size={16} />
              </ToolbarButton>
              <ToolbarButton title="Underline (Ctrl+U)" onClick={() => runCommand("underline")}>
                <Underline size={16} />
              </ToolbarButton>
              <ToolbarButton title="Strikethrough" onClick={() => runCommand("strikeThrough")}>
                <Strikethrough size={16} />
              </ToolbarButton>
              <label className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-transparent hover:border-slate-300 hover:bg-white" title="Text color">
                <Palette size={16} className="text-slate-700" />
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    runCommand("foreColor", e.target.value);
                  }}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <label className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-transparent hover:border-slate-300 hover:bg-white" title="Highlight">
                <Highlighter size={16} className="text-slate-700" />
                <input
                  type="color"
                  value={highlightColor}
                  onChange={(e) => {
                    setHighlightColor(e.target.value);
                    runCommand("hiliteColor", e.target.value);
                  }}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
            </ToolbarGroup>

            <ToolbarGroup label="Paragraph">
              <ToolbarButton title="Align left" onClick={() => runCommand("justifyLeft")}>
                <AlignLeft size={16} />
              </ToolbarButton>
              <ToolbarButton title="Align center" onClick={() => runCommand("justifyCenter")}>
                <AlignCenter size={16} />
              </ToolbarButton>
              <ToolbarButton title="Align right" onClick={() => runCommand("justifyRight")}>
                <AlignRight size={16} />
              </ToolbarButton>
              <ToolbarButton title="Justify" onClick={() => runCommand("justifyFull")}>
                <AlignJustify size={16} />
              </ToolbarButton>
              <ToolbarButton title="Increase indent" onClick={() => runCommand("indent")}>
                <Indent size={16} />
              </ToolbarButton>
              <ToolbarButton title="Decrease indent" onClick={() => runCommand("outdent")}>
                <Outdent size={16} />
              </ToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup label="Insert">
              <ToolbarButton title="Bullet list" onClick={() => runCommand("insertUnorderedList")}>
                <List size={16} />
              </ToolbarButton>
              <ToolbarButton title="Numbered list" onClick={() => runCommand("insertOrderedList")}>
                <ListOrdered size={16} />
              </ToolbarButton>
              <ToolbarButton title="Insert link" onClick={insertLink}>
                <Link2 size={16} />
              </ToolbarButton>
              <ToolbarButton title="Horizontal line" onClick={() => runCommand("insertHorizontalRule")}>
                <Minus size={16} />
              </ToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup label="Styles">
              <select
                className="h-8 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700"
                defaultValue="p"
                onChange={(e) => {
                  runCommand("formatBlock", e.target.value);
                  e.target.value = "p";
                }}
              >
                <option value="p">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="blockquote">Quote</option>
              </select>
              <ToolbarButton title="Clear formatting" onClick={() => runCommand("removeFormat")}>
                <Eraser size={16} />
              </ToolbarButton>
              <ToolbarButton title="Remove link" onClick={() => runCommand("unlink")}>
                <Type size={14} />
              </ToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup label="View">
              <ToolbarButton
                title="Zoom out"
                disabled={zoom <= 75}
                onClick={() => setZoom((z) => Math.max(75, z - 10))}
              >
                <ZoomOut size={16} />
              </ToolbarButton>
              <span className="min-w-[2.5rem] text-center text-xs text-slate-600">{zoom}%</span>
              <ToolbarButton
                title="Zoom in"
                disabled={zoom >= 150}
                onClick={() => setZoom((z) => Math.min(150, z + 10))}
              >
                <ZoomIn size={16} />
              </ToolbarButton>
            </ToolbarGroup>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <label className="text-xs text-slate-600">
                Save as
                <select
                  value={saveFormat}
                  onChange={(e) => setSaveFormat(e.target.value)}
                  className="ml-2 h-8 rounded border border-slate-300 bg-white px-2 text-xs text-slate-800"
                >
                  {SAVE_FORMATS.map((format) => (
                    <option key={format.id} value={format.id}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={loading}
                onClick={handleSave}
                className="rounded bg-[#185abd] px-4 py-2 text-xs font-semibold text-white hover:bg-[#106ebe] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save (Ctrl+S)"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 border-b border-slate-300 bg-[#faf9f8] px-4 py-2">
          <button
            type="button"
            onClick={enterEditMode}
            className="rounded border border-[#185abd] bg-[#deecf9] px-3 py-1.5 text-xs font-semibold text-[#185abd]"
          >
            Open in editor
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-[#e5e5e5] p-6">
        {previewMode ? (
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
            <CvDocumentViewer html={html} />
          </div>
        ) : (
          <div
            className="mx-auto max-w-[820px] transition-transform"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              dir="ltr"
              spellCheck
              onInput={syncHtml}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);
                syncHtml();
              }}
              className="cv-word-editor cv-document-page min-h-[70vh] w-full rounded-sm border border-slate-300 bg-white px-10 py-12 text-[11pt] leading-relaxed text-slate-900 shadow-[0_2px_16px_rgba(0,0,0,0.18)] outline-none focus:ring-2 focus:ring-[#185abd]/40 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
              style={{
                direction: "ltr",
                unicodeBidi: "normal",
                textAlign: "left",
                fontFamily,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
