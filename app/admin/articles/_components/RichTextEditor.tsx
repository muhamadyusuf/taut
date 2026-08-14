"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link2,
  Link2Off,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

type Mode = "visual" | "html";

// document.execCommand masih jadi cara paling ringkas untuk WYSIWYG tanpa
// dependency tambahan, dan didukung semua browser modern.
function exec(command: string, arg?: string) {
  document.execCommand(command, false, arg);
}

const BLOCK_OPTIONS = [
  { label: "Paragraf", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Heading 4", value: "h4" },
  { label: "Preformat", value: "pre" },
];

export default function RichTextEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("visual");
  const [block, setBlock] = useState("p");
  const [active, setActive] = useState<Record<string, boolean>>({});

  // Sinkronkan value dari luar hanya bila berbeda, supaya kursor tidak melompat
  useEffect(() => {
    const el = editorRef.current;
    if (mode !== "visual" || !el) return;
    if (el.innerHTML !== value) el.innerHTML = value;
  }, [value, mode]);

  const emit = useCallback(() => {
    const el = editorRef.current;
    if (el) onChange(el.innerHTML);
  }, [onChange]);

  // Perbarui status tombol toolbar mengikuti posisi kursor
  const syncToolbar = useCallback(() => {
    if (mode !== "visual") return;
    try {
      setActive({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
      });
      const current = document.queryCommandValue("formatBlock").toLowerCase();
      setBlock(
        BLOCK_OPTIONS.some((o) => o.value === current) ? current : "p"
      );
    } catch {
      // queryCommandState bisa melempar saat seleksi berada di luar editor
    }
  }, [mode]);

  useEffect(() => {
    document.addEventListener("selectionchange", syncToolbar);
    return () => document.removeEventListener("selectionchange", syncToolbar);
  }, [syncToolbar]);

  const run = (command: string, arg?: string) => {
    editorRef.current?.focus();
    exec(command, arg);
    emit();
    syncToolbar();
  };

  const handleLink = () => {
    const url = window.prompt("Masukkan URL tujuan:", "https://");
    if (!url) return;
    run("createLink", url);
  };

  const handleImage = () => {
    const url = window.prompt("Masukkan URL gambar:", "https://");
    if (!url) return;
    run("insertImage", url);
  };

  // Tempel sebagai teks polos agar format dari Word/web lain tidak ikut terbawa
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    exec("insertText", text);
    emit();
  };

  const plainText = value.replace(/<[^>]*>/g, " ");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Tab Visual / HTML — sama seperti tab "Visual" & "Teks" di WordPress */}
      <div className="flex items-center justify-between border-b border-border bg-muted px-3 pt-2">
        <div className="flex gap-1">
          {(["visual", "html"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                mode === m
                  ? "bg-card text-foreground border border-b-white border-border -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "visual" ? "Visual" : "HTML"}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-subtle pb-2">
          {wordCount} kata
        </span>
      </div>

      {mode === "visual" ? (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/70 px-3 py-2">
            <select
              value={block}
              onChange={(e) => run("formatBlock", `<${e.target.value}>`)}
              className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {BLOCK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <Divider />

            <ToolButton icon={Bold} label="Tebal" onClick={() => run("bold")} active={active.bold} />
            <ToolButton icon={Italic} label="Miring" onClick={() => run("italic")} active={active.italic} />
            <ToolButton icon={Underline} label="Garis bawah" onClick={() => run("underline")} active={active.underline} />
            <ToolButton icon={Strikethrough} label="Coret" onClick={() => run("strikeThrough")} active={active.strikeThrough} />

            <Divider />

            <ToolButton icon={List} label="Daftar butir" onClick={() => run("insertUnorderedList")} active={active.insertUnorderedList} />
            <ToolButton icon={ListOrdered} label="Daftar angka" onClick={() => run("insertOrderedList")} active={active.insertOrderedList} />
            <ToolButton icon={Quote} label="Kutipan" onClick={() => run("formatBlock", "<blockquote>")} />
            <ToolButton icon={Code2} label="Blok kode" onClick={() => run("formatBlock", "<pre>")} />

            <Divider />

            <ToolButton icon={AlignLeft} label="Rata kiri" onClick={() => run("justifyLeft")} active={active.justifyLeft} />
            <ToolButton icon={AlignCenter} label="Rata tengah" onClick={() => run("justifyCenter")} active={active.justifyCenter} />
            <ToolButton icon={AlignRight} label="Rata kanan" onClick={() => run("justifyRight")} active={active.justifyRight} />

            <Divider />

            <ToolButton icon={Link2} label="Sisipkan tautan" onClick={handleLink} />
            <ToolButton icon={Link2Off} label="Hapus tautan" onClick={() => run("unlink")} />
            <ToolButton icon={ImageIcon} label="Sisipkan gambar" onClick={handleImage} />
            <ToolButton icon={Minus} label="Garis pemisah" onClick={() => run("insertHorizontalRule")} />

            <Divider />

            <ToolButton icon={Eraser} label="Bersihkan format" onClick={() => run("removeFormat")} />
            <ToolButton icon={Undo2} label="Urungkan" onClick={() => run("undo")} />
            <ToolButton icon={Redo2} label="Ulangi" onClick={() => run("redo")} />
          </div>

          {/* Area tulis */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emit}
            onBlur={emit}
            onPaste={handlePaste}
            onKeyUp={syncToolbar}
            onMouseUp={syncToolbar}
            data-placeholder="Mulai tulis artikel di sini…"
            className="article-content min-h-[420px] px-6 py-5 text-[15px] leading-relaxed text-foreground focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-subtle"
          />
        </>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full min-h-[480px] px-5 py-4 font-mono text-[13px] leading-relaxed text-foreground focus:outline-none resize-y"
          placeholder="<p>Tulis HTML di sini…</p>"
        />
      )}
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border-strong" />;
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // onMouseDown mencegah editor kehilangan seleksi saat tombol diklik
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
        active
          ? "bg-brand text-brand-contrast"
          : "text-muted-foreground hover:bg-border hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
