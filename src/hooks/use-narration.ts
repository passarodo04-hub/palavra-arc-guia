import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Translation, Verse } from "@/lib/bible-data";
import {
  buildTrack,
  DEFAULT_NARRATION_RATE,
  DEFAULT_NARRATION_VOLUME,
  type NarrationEngine,
  type NarrationState,
} from "@/lib/narration/types";
import { WebSpeechNarrationEngine } from "@/lib/narration/web-speech-engine";
import { getNarrationPosition, saveNarrationPosition } from "@/lib/narration/position";

const initialState: NarrationState = {
  status: "idle",
  currentVerse: null,
  positionSeconds: 0,
  rate: DEFAULT_NARRATION_RATE,
  volume: DEFAULT_NARRATION_VOLUME,
};

export function useNarration(opts: {
  translation: Translation;
  book: string;
  chapter: number;
  verses: Verse[] | undefined;
}) {
  const { translation, book, chapter, verses } = opts;
  const engineRef = useRef<NarrationEngine | null>(null);
  const [state, setState] = useState<NarrationState>(initialState);
  const [resumeVerse, setResumeVerse] = useState<number | null>(null);

  // Engine is created on the client only (no SSR, no autoplay).
  useEffect(() => {
    const engine = new WebSpeechNarrationEngine();
    engineRef.current = engine;
    const unsub = engine.subscribe(setState);
    return () => {
      unsub();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const track = useMemo(
    () => (verses && verses.length ? buildTrack(translation, book, chapter, verses) : null),
    [translation, book, chapter, verses],
  );

  useEffect(() => {
    if (!engineRef.current || !track) return;
    engineRef.current.load(track);
    const saved = getNarrationPosition(translation, book, chapter);
    setResumeVerse(saved?.verse ?? null);
  }, [track, translation, book, chapter]);

  // Persist position per translation/book/chapter.
  useEffect(() => {
    if (state.currentVerse == null) return;
    saveNarrationPosition({
      translation,
      book,
      chapter,
      verse: state.currentVerse,
      positionSeconds: state.positionSeconds,
    });
  }, [state.currentVerse, state.positionSeconds, translation, book, chapter]);

  const play = useCallback(
    (fromVerse?: number) => engineRef.current?.play(fromVerse ?? resumeVerse ?? undefined),
    [resumeVerse],
  );
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const resume = useCallback(() => engineRef.current?.resume(), []);
  const stop = useCallback(() => engineRef.current?.stop(), []);
  const seekRelative = useCallback((s: number) => engineRef.current?.seekRelative(s), []);
  const seekToVerse = useCallback((v: number) => engineRef.current?.seekToVerse(v), []);
  const setRate = useCallback((r: number) => engineRef.current?.setRate(r), []);
  const setVolume = useCallback((v: number) => engineRef.current?.setVolume(v), []);

  const toggle = useCallback(() => {
    if (state.status === "playing") pause();
    else if (state.status === "paused") resume();
    else play();
  }, [state.status, pause, resume, play]);

  return {
    state,
    totalSeconds: track?.totalSeconds ?? 0,
    resumeVerse,
    available: !!track,
    toggle,
    play,
    pause,
    resume,
    stop,
    seekRelative,
    seekToVerse,
    setRate,
    setVolume,
  };
}
