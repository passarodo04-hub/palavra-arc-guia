import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { PageHero } from "@/components/PageHero";
import { bibleBooks, TRANSLATIONS, type Translation } from "@/lib/bible-data";
import { useTranslation } from "@/lib/translation-context";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, BookMarked, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/biblia/")({ component: BibliaPage });

function BibliaPage() {
  const [tab, setTab] = useState<"old" | "new">("old");
  const [query, setQuery] = useState("");
  const { translation, setTranslation } = useTranslation();
  const [pending, setPending] = useState<Translation | null>(null);
  const books = bibleBooks.filter(
    (b) => b.testament === tab && b.name.toLowerCase().includes(query.toLowerCase()),
  );
  const current = TRANSLATIONS.find((t) => t.id === translation)!;
  const requestSwitch = (t: Translation) => {
    if (t === translation) return;
    setPending(t);
  };
  const confirmSwitch = () => {
    if (pending) setTranslation(pending);
    setPending(null);
  };
  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHero
        title="Bíblia Sagrada"
        description={current.full}
        right={
          <TranslationSelector
            translation={translation}
            current={current}
            onSelect={requestSwitch}
          />
        }
      />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="flex gap-2 rounded-full bg-secondary p-1 w-fit">
          {(["old", "new"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm rounded-full transition ${tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}
            >
              {t === "old" ? "Antigo Testamento" : "Novo Testamento"}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtrar livro..."
          className="mt-4 w-full rounded-full bg-secondary px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
        />
        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-2">
          {books.map((b) => (
            <Link
              key={b.id}
              to="/biblia/$book"
              params={{ book: b.id }}
              className="group rounded-xl border border-border bg-card p-4 hover:border-gold/40 transition"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-base text-card-foreground">{b.name}</span>
                <span className="text-[10px] text-muted-foreground">{b.chapters} cap.</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-up"
          onClick={() => setPending(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-soft"
          >
            <div className="size-12 rounded-2xl bg-gradient-spiritual flex items-center justify-center text-gold">
              <BookMarked className="size-5" />
            </div>
            <h2 className="mt-4 font-serif text-xl text-card-foreground">
              Trocar tradução para {pending.toUpperCase()}?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta é uma tradução diferente da Bíblia. Todos os livros, capítulos e versículos
              serão exibidos em <strong>{TRANSLATIONS.find((t) => t.id === pending)?.full}</strong>.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPending(null)}
                className="flex-1 rounded-full border border-border bg-background py-2.5 text-sm font-medium text-foreground"
              >
                Não
              </button>
              <button
                onClick={confirmSwitch}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
              >
                <Check className="size-4" /> Sim, trocar
              </button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

function TranslationSelector({
  translation,
  current,
  onSelect,
}: {
  translation: Translation;
  current: (typeof TRANSLATIONS)[number];
  onSelect: (t: Translation) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 256, maxHeight: 420 });

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 12;
      const gap = 8;
      const menuHeight = Math.min(menuRef.current?.scrollHeight ?? 420, window.innerHeight - viewportPadding * 2);
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;
      const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
      const width = Math.min(288, window.innerWidth - viewportPadding * 2);
      const left = Math.min(
        Math.max(viewportPadding, rect.right - width),
        window.innerWidth - width - viewportPadding,
      );
      const maxHeight = Math.max(160, openUp ? spaceAbove - gap : spaceBelow - gap);
      const top = openUp
        ? Math.max(viewportPadding, rect.top - Math.min(menuHeight, maxHeight) - gap)
        : rect.bottom + gap;
      setPosition({ top, left, width, maxHeight });
    };
    const handlePointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Escolher tradução da Bíblia"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-hero-foreground outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-hero-accent"
      >
        <span>{current.name}</span>
        <ChevronDown className={`size-4 opacity-80 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Traduções disponíveis"
          className="fixed z-[100] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-soft animate-fade-up"
          style={position}
        >
          {TRANSLATIONS.map((t) => {
            const selected = translation === t.id;
            return (
              <button
                key={t.id}
                role="option"
                aria-selected={selected}
                type="button"
                onClick={() => {
                  setOpen(false);
                  onSelect(t.id);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  selected
                    ? "bg-gold/15 text-gold font-semibold"
                    : "text-card-foreground hover:bg-secondary"
                }`}
              >
                <span className="flex min-w-0 flex-col">
                  <span>{t.name}</span>
                  <span className="text-xs leading-snug text-muted-foreground">{t.full}</span>
                </span>
                {selected && <Check className="size-4 text-gold" aria-hidden="true" />}
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}
