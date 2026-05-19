import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useLocalStorage, type Note } from "@/lib/storage";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/anotacoes")({ component: NotesPage });

function NotesPage() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", []);
  const [editing, setEditing] = useState<Note | null>(null);
  const save = (n: Note) => {
    const exists = notes.find((x) => x.id === n.id);
    setNotes(exists ? notes.map((x) => (x.id === n.id ? { ...n, updatedAt: Date.now() } : x)) : [n, ...notes]);
    setEditing(null);
  };
  if (editing) {
    return (
      <div className="min-h-screen bg-background pb-24 px-4 pt-6 mx-auto max-w-2xl">
        <button onClick={() => setEditing(null)} className="text-sm text-muted-foreground">← Voltar</button>
        <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Título" className="mt-4 w-full bg-transparent font-serif text-3xl outline-none" />
        <input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Categoria (pregação, estudo...)" className="mt-2 w-full bg-transparent text-sm text-muted-foreground outline-none" />
        <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="Escreva suas anotações..." rows={20} className="mt-6 w-full bg-transparent font-serif text-lg leading-relaxed outline-none resize-none" />
        <button onClick={() => save(editing)} className="fixed bottom-24 right-6 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground shadow-elegant">Salvar</button>
        <BottomNav />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Anotações e Estudos</h1>
        <p className="text-sm text-primary-foreground/70">Seu diário espiritual</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {notes.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 font-serif text-lg">Nenhuma anotação ainda. Toque em + para começar.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => setEditing(n)} className="text-left flex-1">
                    <div className="font-serif text-xl">{n.title || "Sem título"}</div>
                    <div className="text-xs text-gold mt-1">{n.category || "Geral"}</div>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.content}</p>
                  </button>
                  <button onClick={() => setNotes(notes.filter((x) => x.id !== n.id))} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={() => setEditing({ id: crypto.randomUUID(), title: "", content: "", category: "", createdAt: Date.now(), updatedAt: Date.now() })} className="fixed bottom-24 right-6 rounded-full bg-gold size-14 flex items-center justify-center text-gold-foreground shadow-elegant hover:scale-105 transition">
        <Plus className="size-6" />
      </button>
      <BottomNav />
    </div>
  );
}