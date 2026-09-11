import type { Translation } from "@/lib/bible-data";

/** A single narratable segment — always mapped 1:1 to a Bible verse. */
export interface NarrationSegment {
  /** Verse number inside the chapter. */
  verse: number;
  /** Exact text of the currently selected translation. Never generated. */
  text: string;
  /** Estimated duration in seconds (used before a real TTS provides timings). */
  estimatedSeconds: number;
}

export interface NarrationTrack {
  translation: Translation;
  book: string;
  chapter: number;
  segments: NarrationSegment[];
  /** Sum of all segment durations, in seconds. */
  totalSeconds: number;
}

export type NarrationStatus = "idle" | "playing" | "paused" | "ended" | "unsupported";

export interface NarrationState {
  status: NarrationStatus;
  /** Verse currently being narrated, or null when idle. */
  currentVerse: number | null;
  /** Approximate elapsed position within the chapter, in seconds. */
  positionSeconds: number;
  rate: number;
  volume: number;
}

export type NarrationListener = (state: NarrationState) => void;

/**
 * Decoupled narration contract.
 *
 * The reader only ever talks to this interface, so a future real TTS
 * (pre-rendered audio files, streaming TTS, etc.) can be plugged in by
 * providing another implementation — with no changes to the reader UI.
 */
export interface NarrationEngine {
  readonly id: string;
  isSupported(): boolean;
  load(track: NarrationTrack): void;
  /** Start (or restart) narration, optionally from a given verse. */
  play(fromVerse?: number): void;
  pause(): void;
  resume(): void;
  stop(): void;
  /** Move forward/backward by an approximate number of seconds. */
  seekRelative(seconds: number): void;
  /** Jump straight to a verse. */
  seekToVerse(verse: number): void;
  setRate(rate: number): void;
  setVolume(volume: number): void;
  getState(): NarrationState;
  subscribe(listener: NarrationListener): () => void;
  destroy(): void;
}

export const NARRATION_SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export const DEFAULT_NARRATION_RATE = 1;
export const DEFAULT_NARRATION_VOLUME = 1;

/** Rough reading pace used only until a real TTS reports real timings. */
const WORDS_PER_SECOND = 2.6;

export function estimateSeconds(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1.2, words / WORDS_PER_SECOND);
}

export function buildTrack(
  translation: Translation,
  book: string,
  chapter: number,
  verses: { verse: number; text: string }[],
): NarrationTrack {
  const segments: NarrationSegment[] = verses.map((v) => ({
    verse: v.verse,
    text: v.text,
    estimatedSeconds: estimateSeconds(v.text),
  }));
  return {
    translation,
    book,
    chapter,
    segments,
    totalSeconds: segments.reduce((acc, s) => acc + s.estimatedSeconds, 0),
  };
}
