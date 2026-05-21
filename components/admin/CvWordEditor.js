"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import CvDocumentViewer from "@/components/admin/CvDocumentViewer";

const SAVE_FORMATS = [
  { id: "docx", label: "Word (.docx)" },
  { id: "pdf", label: "PDF (.pdf)" },
  { id: "html", label: "Web (.html)" },
  { id: "txt", label: "Plain text (.txt)" },
];

function ToolbarButton({ title, onClick, active, children }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 text-slate-700 transition ${
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
      <div className="mb-1 flex items-center gap-0.5">{children}</div>
      <span className="text-center text-[10px] text-slate-500">{label}</span>
    </div>
  );
}

export default function CvWordEditor({
  open,
  mode = "edit",
  title = "CV Document",
  initialHtml = "<p></p>",
  loading = false,
  onClose,
  onSave,
}) {
  const editorRef = useRef(null);
  const [html, setHtml] = useState(initialHtml);
  const [saveFormat, setSaveFormat] = useState("docx");
  const [previewMode, setPreviewMode] = useState(mode === "view");

  useEffect(() => {
    if (open) {
      setHtml(initialHtml || "<p></p>");
      setPreviewMode(mode === "view");
    }
  }, [open, initialHtml, mode]);

  useEffect(() => {
    if (open && editorRef.current && !previewMode) {
      editorRef.current.innerHTML = html || "<p></p>";
    }
  }, [open, previewMode, html]);

  const runCommand = useCallback((command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtml(editorRef.current.innerHTML);
    }
  }, []);

  const syncHtml = useCallback(() => {
    if (editorRef.current) {
      setHtml(editorRef.current.innerHTML);
    }
  }, []);

  const handleSave = () => {
    const currentHtml = previewMode ? html : editorRef.current?.innerHTML || html;
    onSave?.(currentHtml, saveFormat);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#f3f2f1]">
      <div className="flex items-center justify-between border-b border-slate-300 bg-[#323130] px-4 py-2 text-white">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-300">Portfolio CV</p>
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode((prev) => !prev)}
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
              <ToolbarButton title="Undo" onClick={() => runCommand("undo")}>
                <Undo2 size={16} />
              </ToolbarButton>
              <ToolbarButton title="Redo" onClick={() => runCommand("redo")}>
                <Redo2 size={16} />
              </ToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup label="Font">
              <ToolbarButton title="Bold" onClick={() => runCommand("bold")}>
                <Bold size={16} />
              </ToolbarButton>
              <ToolbarButton title="Italic" onClick={() => runCommand("italic")}>
                <Italic size={16} />
              </ToolbarButton>
              <ToolbarButton title="Underline" onClick={() => runCommand("underline")}>
                <Underline size={16} />
              </ToolbarButton>
              <ToolbarButton title="Strikethrough" onClick={() => runCommand("strikeThrough")}>
                <Strikethrough size={16} />
              </ToolbarButton>
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
            </ToolbarGroup>

            <ToolbarGroup label="Lists">
              <ToolbarButton title="Bullet list" onClick={() => runCommand("insertUnorderedList")}>
                <List size={16} />
              </ToolbarButton>
              <ToolbarButton title="Numbered list" onClick={() => runCommand("insertOrderedList")}>
                <ListOrdered size={16} />
              </ToolbarButton>
            </ToolbarGroup>

            <ToolbarGroup label="Styles">
              <select
                className="h-8 rounded border border-slate-300 bg-white px-2 text-xs text-slate-700"
                defaultValue="p"
                onChange={(e) => runCommand("formatBlock", e.target.value)}
              >
                <option value="p">Normal</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
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
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 border-b border-slate-300 bg-[#faf9f8] px-4 py-2">
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className="rounded border border-[#185abd] bg-[#deecf9] px-3 py-1.5 text-xs font-semibold text-[#185abd]"
          >
            Open in editor
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-[#e5e5e5] p-6">
        {previewMode ? (
          <CvDocumentViewer html={html} />
        ) : (
          <div className="mx-auto max-w-[820px]">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={syncHtml}
              className="cv-document-page min-h-[70vh] w-full rounded-sm border border-slate-300 bg-white px-10 py-12 text-[11pt] leading-relaxed text-slate-900 shadow-[0_2px_16px_rgba(0,0,0,0.18)] outline-none focus:ring-2 focus:ring-[#185abd]/40 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:my-2 [&_ul]:list-disc"
            />
          </div>
        )}
      </div>
    </div>
  );
}
