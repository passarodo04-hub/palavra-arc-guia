import { useCallback, useEffect, useState } from "react";

export type SavedDevocional = {
  id: string; // verse ref as id
  verse: string;
  text: string;
  reflection: string;
  reading: string;
  savedAt: number;
};

const KEY = "palavra-plus:saved-devocionais";

function read(): SavedDevocional[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedDevocional[]) : [];
  } catch {
    return [];
  }
}

function write(list: SavedDevocional[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("saved-devocionais-changed"));
  } catch {}
}

export function useSavedDevocionais() {
  const [list, setList] = useState<SavedDevocional[]>([]);
  useEffect(() => {
    setList(read());
    const onChange = () => setList(read());
    window.addEventListener("saved-devocionais-changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("saved-devocionais-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const isSaved = useCallback((id: string) => list.some((d) => d.id === id), [list]);

  const save = useCallback((d: Omit<SavedDevocional, "savedAt">) => {
    const current = read();
    if (current.some((x) => x.id === d.id)) return false;
    write([{ ...d, savedAt: Date.now() }, ...current]);
    return true;
  }, []);

  const remove = useCallback((id: string) => {
    write(read().filter((x) => x.id !== id));
  }, []);

  return { list, isSaved, save, remove };
}