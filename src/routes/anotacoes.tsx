import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useLocalStorage, type Note } from "@/lib/storage";
import { Mic, MicOff, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/anotacoes")({ component: NotesPage });

// Web Speech API typings
type SR = typeof window extends { SpeechRecognition: infer T }
  ? T
  : any;
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

function NotesPage() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", []);
  const [editing, setEditing] = useState<Note | null>(null);
  const [query, setQuery] = useState("");

  const save = (n: Note) => {
    const exists = notes.find((x) => x.id === n.id);
    setNotes(
      exists
        ? notes.map((x) => (x.id === n.id ? { ...n, updatedAt: Date.now() } : x))
        : [n, ...notes],
    );
    setEditing(null);
  };

  if (editing) {
    return <NoteEditor note={editing} onCancel={() => setEditing(null)} onSave={save} />;
  }

  const filtered = query.trim()
    ? notes.filter((n) => {
        const q = query.toLowerCase();
        return (
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q)
        );
      })
    : notes;

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Anotações e Estudos</h1>
        <p className="text-sm text-primary-foreground/70">Seu diário espiritual · escrito ou por voz</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar anotações…"
            className="w-full rounded-full bg-secondary pl-11 pr-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16 font-serif text-lg">
            {query ? "Nenhum resultado." : "Nenhuma anotação ainda. Toque em + para começar."}
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {filtered.map((n) => (
              <li key={n.id} className="rounded-xl border border-border bg-card p-5 hover:border-gold/40 transition">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => setEditing(n)} className="text-left flex-1">
                    <div className="font-serif text-xl">{n.title || "Sem título"}</div>
                    <div className="text-xs text-gold mt-1 flex items-center gap-2">
                      <span>{n.category || "Geral"}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{new Date(n.updatedAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.content}</p>
                  </button>
                  <button
                    onClick={() => setNotes(notes.filter((x) => x.id !== n.id))}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Excluir"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() =>
          setEditing({
            id: crypto.randomUUID(),
            title: "",
            content: "",
            category: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        }
        className="fixed bottom-24 right-6 rounded-full bg-gold size-14 flex items-center justify-center text-gold-foreground shadow-elegant hover:scale-105 transition"
        aria-label="Nova anotação"
      >
        <Plus className="size-6" />
      </button>
      <BottomNav />
    </div>
  );
}

function NoteEditor({
  note,
  onCancel,
  onSave,
}: {
  note: Note;
  onCancel: () => void;
  onSave: (n: Note) => void;
}) {
  const [draft, setDraft] = useState<Note>(note);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const finalizedRef = useRef<string>(note.content);
  const interimRef = useRef<string>("");
  const shouldRestartRef = useRef(false);

  // keep finalized in sync if user types
  useEffect(() => {
    finalizedRef.current = draft.content;
  }, [draft.content]);

  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: any) => {
      let interim = "";
      let finalChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += t;
        else interim += t;
      }
      if (finalChunk) {
        const sep = finalizedRef.current && !finalizedRef.current.endsWith(" ") ? " " : "";
        finalizedRef.current = finalizedRef.current + sep + finalChunk.trim() + " ";
      }
      interimRef.current = interim;
      setDraft((d) => ({ ...d, content: finalizedRef.current + interimRef.current }));
    };

    rec.onerror = (e: any) => {
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        setMicError("Permissão de microfone negada. Habilite nas configurações do navegador.");
        shouldRestartRef.current = false;
        setIsListening(false);
      } else if (e?.error === "no-speech") {
        // ignore
      } else {
        setMicError("Erro no reconhecimento de voz.");
      }
    };

    rec.onend = () => {
      if (shouldRestartRef.current) {
        try {
          rec.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = rec;
    return () => {
      shouldRestartRef.current = false;
      try {
        rec.stop();
      } catch {}
    };
  }, []);

  const startListening = useCallback(() => {
    setMicError(null);
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      shouldRestartRef.current = true;
      rec.start();
      setIsListening(true);
    } catch {
      // already started
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
    // commit interim
    if (interimRef.current) {
      finalizedRef.current = finalizedRef.current + interimRef.current;
      interimRef.current = "";
      setDraft((d) => ({ ...d, content: finalizedRef.current }));
    }
  }, []);

  const handleSave = () => {
    stopListening();
    onSave({ ...draft, content: draft.content.trim() });
  };

  return (
    <div className="min-h-screen bg-background pb-32 px-4 pt-6 mx-auto max-w-2xl">
      <button onClick={onCancel} className="text-sm text-muted-foreground">
        ← Voltar
      </button>
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="Título"
        className="mt-4 w-full bg-transparent font-serif text-3xl outline-none"
      />
      <input
        value={draft.category}
        onChange={(e) => setDraft({ ...draft, category: e.target.value })}
        placeholder="Categoria (pregação, estudo, oração…)"
        className="mt-2 w-full bg-transparent text-sm text-muted-foreground outline-none"
      />

      <div className="mt-6 rounded-2xl border border-border bg-card/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Conteúdo</div>
          {supported ? (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                isListening
                  ? "bg-destructive text-destructive-foreground shadow-elegant"
                  : "bg-gold text-gold-foreground hover:scale-[1.02]"
              }`}
            >
              {isListening ? (
                <>
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-current" />
                  </span>
                  <MicOff className="size-4" /> Parar gravação
                </>
              ) : (
                <>
                  <Mic className="size-4" /> Gravar voz
                </>
              )}
            </button>
          ) : (
            <span className="text-[11px] text-muted-foreground">Voz não suportada neste navegador</span>
          )}
        </div>

        {isListening && (
          <div className="mb-3 flex items-center gap-1 h-6">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="inline-block w-1 rounded-full bg-gold/70 animate-pulse"
                style={{
                  height: `${20 + ((i * 13) % 80)}%`,
                  animationDelay: `${(i % 7) * 80}ms`,
                  animationDuration: "900ms",
                }}
              />
            ))}
            <span className="ml-3 text-xs text-muted-foreground">Ouvindo em pt-BR…</span>
          </div>
        )}

        {micError && (
          <div className="mb-3 rounded-lg bg-destructive/10 text-destructive text-xs px-3 py-2">{micError}</div>
        )}

        <textarea
          value={draft.content}
          onChange={(e) => {
            finalizedRef.current = e.target.value;
            interimRef.current = "";
            setDraft({ ...draft, content: e.target.value });
          }}
          placeholder="Escreva suas anotações ou toque no microfone para ditar…"
          rows={16}
          className="w-full bg-transparent font-serif text-lg leading-relaxed outline-none resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        className="fixed bottom-24 right-6 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-elegant hover:scale-105 transition"
      >
        Salvar
      </button>
      <BottomNav />
    </div>
  );
}