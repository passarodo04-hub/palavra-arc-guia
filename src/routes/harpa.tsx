import { createFileRoute, Link } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { hymns } from "@/lib/harpa-data";
import { useState } from "react";

export const Route = createFileRoute("/harpa")({ component: HarpaPage });

function HarpaPage() {
  const [q, setQ] = useState("");
  const filtered = hymns.filter((h) => h.title.toLowerCase().includes(q.toLowerCase()) || String(h.id).includes(q));
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-gradient-spiritual text-primary-foreground px-6 py-8">
        <h1 className="font-serif text-3xl">Harpa Cristã</h1>
        <p className="text-sm text-primary-foreground/70">Hinos para adoração</p>
      </header>
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar hino ou número..." className="w-full rounded-full bg-secondary px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-gold" />
        <ul className="mt-5 space-y-2">
          {filtered.map((h) => (
            <li key={h.id}>
              <Link to="/harpa/$id" params={{ id: String(h.id) }} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 hover:border-gold/40 transition">
                <div className="font-serif text-2xl text-gold w-12 text-center">{h.id}</div>
                <div className="font-serif text-lg text-card-foreground">{h.title}</div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <BottomNav />
    </div>
  );
}