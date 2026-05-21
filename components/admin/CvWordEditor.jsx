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

function enableRichTextCommands() {
  try {
    document.execCommand("styleWithCss", false, "true");
    document.execCommand("defaultParagraphSeparator", false, "p");
  } catch {
    // ignore unsupported browsers
  }
}

function wrapSelectionWithStyle(styleText, placeholder = "&#8203;") {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  const selected = range.toString();
  const html = selected
    ? `<span style="${styleText}">${selected}</span>`
    : `<span style="${styleText}">${placeholder}</span>`;
  document.execCommand("insertHTML", false, html);
}

const CV_LINE_CHAR = "\u2501";
const CV_LINE_REPEAT = 54;
const CV_LINE_CLASS = "cv-divider-line";

function rgbStringToHex(color) {
  const value = String(color || "").trim();
  if (!value) return "#185abd";
  if (value.startsWith("#")) return value.length === 4 ? value : value.slice(0, 7);
  const match = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) return "#185abd";
  return (
    "#" +
    [match[1], match[2], match[3]]
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")
  );
}

function isDividerParagraph(p) {
  if (!p || p.tagName !== "P") return false;
  if (p.classList.contains(CV_LINE_CLASS) || p.getAttribute("data-cv-line") === "1") return true;
  const text = (p.textContent || "").replace(/\u200B/g, "").trim();
  if (!text) return false;
  return [...text].every((ch) => ch === CV_LINE_CHAR || ch === "\u00a0" || ch === " ");
}

function getDividerFromNode(node, root) {
  if (!node || !root) return null;
  const el =
    node.nodeType === Node.TEXT_NODE
      ? node.parentElement
      : node instanceof Element
        ? node
        : null;
  if (!el || !root.contains(el)) return null;
  if (el.tagName === "HR") return el;
  const p = el.closest("p");
  if (p && isDividerParagraph(p)) return p;
  return null;
}

function getDividerFromSelection(root) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  return getDividerFromNode(sel.anchorNode, root);
}

function applyLineColorToDivider(divider, color) {
  if (divider.tagName === "HR") {
    divider.style.border = "none";
    divider.style.borderTop = `3px solid ${color}`;
    divider.style.margin = "14px 0";
    divider.style.backgroundColor = "transparent";
    return;
  }
  let span = divider.querySelector("span");
  if (!span) {
    span = document.createElement("span");
    span.style.fontSize = "9pt";
    span.textContent = CV_LINE_CHAR.repeat(CV_LINE_REPEAT);
    divider.innerHTML = "";
    divider.appendChild(span);
  }
  span.style.color = color;
  divider.style.textAlign = "center";
  divider.style.margin = "14px 0";
  divider.classList.add(CV_LINE_CLASS);
  divider.setAttribute("data-cv-line", "1");
}

function removeDivider(divider, editorEl) {
  const parent = divider.parentNode;
  if (!parent) return;
  const after = divider.nextElementSibling;
  const before = divider.previousElementSibling;
  divider.remove();
  const focusTarget =
    after instanceof HTMLElement
      ? after
      : before instanceof HTMLElement
        ? before
        : null;
  if (focusTarget) {
    placeCaretAtEnd(focusTarget);
  } else {
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    editorEl?.appendChild(p);
    placeCaretAtEnd(p);
  }
}

function handleListBackspace(e, editorEl, syncHtml) {
  if (e.key !== "Backspace" || !editorEl) return false;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const anchor = sel.anchorNode;
  const element =
    anchor?.nodeType === Node.TEXT_NODE
      ? anchor.parentElement
      : anchor instanceof Element
        ? anchor
        : null;
  const li = element?.closest("li");
  if (!li) return false;
  const text = (li.textContent || "").replace(/\u200B/g, "").trim();
  if (text.length > 0) return false;
  e.preventDefault();
  const list = li.parentElement;
  li.remove();
  if (list && list.children.length === 0) {
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    list.replaceWith(p);
  }
  syncHtml();
  return true;
}

function handleDividerKeys(e, editorEl, syncHtml) {
  if (!editorEl || (e.key !== "Backspace" && e.key !== "Delete")) return false;
  const divider = getDividerFromSelection(editorEl);
  if (!divider) return false;
  e.preventDefault();
  removeDivider(divider, editorEl);
  syncHtml();
  return true;
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
  defaultSaveName = "Dickens-Manyama-CV",
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
  const [lineColor, setLineColor] = useState("#185abd");

  const wordCount = useMemo(() => countWords(html), [html]);

  const defaultBaseName = useMemo(() => {
    const safe = String(defaultSaveName || "Dickens-Manyama-CV").trim() || "Dickens-Manyama-CV";
    return safe.replace(/\.[^.]+$/, "");
  }, [defaultSaveName]);

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
    enableRichTextCommands();
    placeCaretAtEnd(el);
  }, [open, previewMode]);

  const syncHtml = useCallback(() => {
    if (editorRef.current) {
      const next = editorRef.current.innerHTML;
      pendingHtmlRef.current = next;
      setHtml(next);
    }
  }, []);

  const runCommand = useCallback(
    (command, value = null) => {
      editorRef.current?.focus();
      enableRichTextCommands();
      document.execCommand(command, false, value);
      syncHtml();
    },
    [syncHtml]
  );

  const applyTextColor = useCallback(
    (color) => {
      setTextColor(color);
      editorRef.current?.focus();
      enableRichTextCommands();
      const selected = window.getSelection()?.toString() || "";
      if (selected) {
        wrapSelectionWithStyle(`color:${color}`);
      } else {
        document.execCommand("foreColor", false, color);
      }
      syncHtml();
    },
    [syncHtml]
  );

  const applyHighlightColor = useCallback(
    (color) => {
      setHighlightColor(color);
      editorRef.current?.focus();
      enableRichTextCommands();
      const selected = window.getSelection()?.toString() || "";
      if (selected) {
        wrapSelectionWithStyle(`background-color:${color}`);
      } else {
        document.execCommand("backColor", false, color);
      }
      syncHtml();
    },
    [syncHtml]
  );

  const removeListFormatting = useCallback(() => {
    const root = editorRef.current;
    if (!root) return;
    root.querySelectorAll("ul, ol").forEach((list) => {
      const parent = list.parentNode;
      if (!parent) return;
      [...list.querySelectorAll("li")].forEach((li) => {
        const p = document.createElement("p");
        p.innerHTML = li.innerHTML || "<br>";
        parent.insertBefore(p, list);
      });
      list.remove();
    });
    syncHtml();
  }, [syncHtml]);

  const applyFontFamily = useCallback(
    (family) => {
      setFontFamily(family);
      editorRef.current?.focus();
      enableRichTextCommands();
      const selected = window.getSelection()?.toString() || "";
      if (selected) {
        wrapSelectionWithStyle(`font-family:${family}`);
      } else {
        document.execCommand("fontName", false, family);
      }
      syncHtml();
    },
    [syncHtml]
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

  const applyLineColor = useCallback(
    (color) => {
      setLineColor(color);
      const root = editorRef.current;
      if (!root) return;
      const divider = getDividerFromSelection(root);
      if (divider) {
        applyLineColorToDivider(divider, color);
        syncHtml();
      }
    },
    [syncHtml]
  );

  const syncLineColorFromSelection = useCallback(() => {
    const divider = getDividerFromSelection(editorRef.current);
    if (!divider) return;
    if (divider.tagName === "HR") {
      const border = divider.style.borderTopColor || window.getComputedStyle(divider).borderTopColor;
      setLineColor(rgbStringToHex(border));
      return;
    }
    const span = divider.querySelector("span");
    const color = span?.style?.color || (span ? window.getComputedStyle(span).color : "");
    if (color) setLineColor(rgbStringToHex(color));
  }, []);

  const insertColoredLine = useCallback(() => {
    editorRef.current?.focus();
    enableRichTextCommands();
    const lineChar = CV_LINE_CHAR.repeat(CV_LINE_REPEAT);
    const lineHtml = `<p class="${CV_LINE_CLASS}" data-cv-line="1" style="text-align:center;margin:14px 0;"><span style="color:${lineColor};font-size:9pt;">${lineChar}</span></p><p><br></p>`;
    document.execCommand("insertHTML", false, lineHtml);
    syncHtml();
  }, [lineColor, syncHtml]);

  const promptAndSave = useCallback(() => {
    if (!previewMode) syncHtml();
    const currentHtml = previewMode ? html : editorRef.current?.innerHTML || html;
    const ext = saveFormat === "doc" ? "docx" : saveFormat;
    const input = window.prompt(
      `Enter CV file name (saved as .${ext} for Download CV on your site):`,
      defaultBaseName
    );
    if (input === null) return;
    const fileBase = input.trim().replace(/\.[^.]+$/, "") || defaultBaseName;
    onSave?.(currentHtml, saveFormat, fileBase);
  }, [previewMode, syncHtml, html, saveFormat, defaultBaseName, onSave]);

  const enterEditMode = useCallback(() => {
    pendingHtmlRef.current = html;
    shouldSyncDom.current = true;
    setPreviewMode(false);
  }, [html]);

  const handleSave = () => {
    promptAndSave();
  };

  const handleEditorKeyDown = useCallback(
    (e) => {
      if (handleDividerKeys(e, editorRef.current, syncHtml)) return;
      if (handleListBackspace(e, editorRef.current, syncHtml)) return;
    },
    [syncHtml]
  );

  useEffect(() => {
    if (!open || previewMode) return;

    const onKeyDown = (e) => {
      if (handleDividerKeys(e, editorRef.current, syncHtml)) return;
      if (handleListBackspace(e, editorRef.current, syncHtml)) return;
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
        promptAndSave();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, previewMode, runCommand, promptAndSave]);

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
                  onChange={(e) => applyTextColor(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <label className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-transparent hover:border-slate-300 hover:bg-white" title="Highlight">
                <Highlighter size={16} className="text-slate-700" />
                <input
                  type="color"
                  value={highlightColor}
                  onChange={(e) => applyHighlightColor(e.target.value)}
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
              <ToolbarButton title="Remove list" onClick={removeListFormatting}>
                <Outdent size={16} />
              </ToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup label="Line">
              <label
                className="relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-transparent hover:border-slate-300 hover:bg-white"
                title="Line colour"
              >
                <Minus size={16} className="text-slate-700" style={{ color: lineColor }} />
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => applyLineColor(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </label>
              <ToolbarButton title="Insert coloured line" onClick={insertColoredLine}>
                <Minus size={16} style={{ color: lineColor }} />
              </ToolbarButton>
              <ToolbarButton
                title="Remove line (click line first, or Backspace)"
                onClick={() => {
                  const root = editorRef.current;
                  const divider = getDividerFromSelection(root);
                  if (!divider) return;
                  removeDivider(divider, root);
                  syncHtml();
                }}
              >
                <Eraser size={14} />
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
              <span className="text-[10px] text-slate-500">Use Word (.docx) for best MS Word styling</span>
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
              onKeyDown={handleEditorKeyDown}
              onMouseUp={syncLineColorFromSelection}
              onKeyUp={syncLineColorFromSelection}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text/plain");
                document.execCommand("insertText", false, text);
                syncHtml();
              }}
              className="cv-word-editor cv-document-page min-h-[70vh] w-full rounded-sm border border-slate-300 bg-white px-10 py-12 text-[11pt] leading-relaxed text-slate-900 shadow-[0_2px_16px_rgba(0,0,0,0.18)] outline-none focus:ring-2 focus:ring-[#185abd]/40 [&_.cv-divider-line]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_hr]:my-3 [&_hr]:border-0 [&_hr]:border-t-[3px] [&_hr]:border-solid [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
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
