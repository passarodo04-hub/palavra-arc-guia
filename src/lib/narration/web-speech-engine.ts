/**
 * TEMPORARY narration engine.
 *
 * Uses the browser's built-in SpeechSynthesis (free, offline, no API key,
 * no generated audio files). It exists only so the reader UI and the
 * verse-sync contract can be exercised today.
 *
 * A future real TTS implementation must live in its own file and simply
 * implement `NarrationEngine`; nothing in the reader needs to change.
 */
import {
  DEFAULT_NARRATION_RATE,
  DEFAULT_NARRATION_VOLUME,
  type NarrationEngine,
  type NarrationListener,
  type NarrationState,
  type NarrationTrack,
} from "./types";

export class WebSpeechNarrationEngine implements NarrationEngine {
  readonly id = "web-speech-preview";

  private track: NarrationTrack | null = null;
  private index = 0;
  private listeners = new Set<NarrationListener>();
  private utteranceGeneration = 0;
  private state: NarrationState = {
    status: "idle",
    currentVerse: null,
    positionSeconds: 0,
    rate: DEFAULT_NARRATION_RATE,
    volume: DEFAULT_NARRATION_VOLUME,
  };

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private emit(patch: Partial<NarrationState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l(this.state));
  }

  private elapsedBefore(index: number) {
    if (!this.track) return 0;
    return this.track.segments
      .slice(0, Math.max(0, index))
      .reduce((acc, s) => acc + s.estimatedSeconds, 0);
  }

  load(track: NarrationTrack) {
    this.cancel();
    this.track = track;
    this.index = 0;
    this.emit({
      status: this.isSupported() ? "idle" : "unsupported",
      currentVerse: null,
      positionSeconds: 0,
    });
  }

  private cancel() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    this.utteranceGeneration += 1;
    window.speechSynthesis.cancel();
  }

  private speakCurrent() {
    if (!this.track || !this.isSupported()) return;
    const seg = this.track.segments[this.index];
    if (!seg) {
      this.emit({ status: "ended", currentVerse: null, positionSeconds: 0 });
      return;
    }
    const generation = this.utteranceGeneration;
    const utt = new SpeechSynthesisUtterance(seg.text);
    utt.lang = "pt-BR";
    utt.rate = this.state.rate;
    utt.volume = this.state.volume;
    utt.onend = () => {
      if (generation !== this.utteranceGeneration) return;
      this.index += 1;
      if (!this.track || this.index >= this.track.segments.length) {
        this.emit({ status: "ended", currentVerse: null, positionSeconds: 0 });
        return;
      }
      this.emit({
        currentVerse: this.track.segments[this.index]!.verse,
        positionSeconds: this.elapsedBefore(this.index),
      });
      this.speakCurrent();
    };
    utt.onerror = () => {
      if (generation !== this.utteranceGeneration) return;
      this.emit({ status: "ended", currentVerse: null });
    };
    this.emit({
      status: "playing",
      currentVerse: seg.verse,
      positionSeconds: this.elapsedBefore(this.index),
    });
    window.speechSynthesis.speak(utt);
  }

  play(fromVerse?: number) {
    if (!this.track) return;
    if (!this.isSupported()) {
      this.emit({ status: "unsupported" });
      return;
    }
    if (fromVerse != null) {
      const i = this.track.segments.findIndex((s) => s.verse === fromVerse);
      this.index = i >= 0 ? i : 0;
    }
    this.cancel();
    this.speakCurrent();
  }

  pause() {
    if (!this.isSupported() || this.state.status !== "playing") return;
    window.speechSynthesis.pause();
    this.emit({ status: "paused" });
  }

  resume() {
    if (!this.isSupported()) return;
    if (this.state.status === "paused") {
      window.speechSynthesis.resume();
      // Some engines drop the queue while paused; restart the current verse then.
      if (!window.speechSynthesis.speaking) {
        this.speakCurrent();
        return;
      }
      this.emit({ status: "playing" });
      return;
    }
    this.play(this.state.currentVerse ?? undefined);
  }

  stop() {
    this.cancel();
    this.index = 0;
    this.emit({ status: "idle", currentVerse: null, positionSeconds: 0 });
  }

  seekRelative(seconds: number) {
    if (!this.track) return;
    const target = Math.max(0, this.elapsedBefore(this.index) + seconds);
    let acc = 0;
    let idx = 0;
    for (let i = 0; i < this.track.segments.length; i++) {
      const dur = this.track.segments[i]!.estimatedSeconds;
      if (target < acc + dur) {
        idx = i;
        break;
      }
      acc += dur;
      idx = i;
    }
    this.seekToVerse(this.track.segments[idx]!.verse);
  }

  seekToVerse(verse: number) {
    if (!this.track) return;
    const i = this.track.segments.findIndex((s) => s.verse === verse);
    if (i < 0) return;
    this.index = i;
    const wasPlaying = this.state.status === "playing" || this.state.status === "paused";
    this.cancel();
    this.emit({ currentVerse: verse, positionSeconds: this.elapsedBefore(i) });
    if (wasPlaying) this.speakCurrent();
  }

  setRate(rate: number) {
    this.emit({ rate });
    if (this.state.status === "playing") {
      this.cancel();
      this.speakCurrent();
    }
  }

  setVolume(volume: number) {
    this.emit({ volume });
    if (this.state.status === "playing") {
      this.cancel();
      this.speakCurrent();
    }
  }

  getState() {
    return this.state;
  }

  subscribe(listener: NarrationListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  destroy() {
    this.cancel();
    this.listeners.clear();
    this.track = null;
  }
}
