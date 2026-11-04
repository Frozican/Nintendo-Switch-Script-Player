import { FrameClock } from "./clock.js";
import { STAS_FPS, normalizeFrame } from "../stas/schema.js";
import { frameToControllerState } from "../controller/state.js";

export class ScriptPlayer {
  constructor({ onFrame = () => {}, onFinish = () => {}, onState = () => {}, fps = STAS_FPS } = {}) {
    this.onFrame = onFrame; this.onFinish = onFinish; this.onState = onState; this.fps = fps;
    this.timer = null; this.running = false; this.paused = false; this.frames = []; this.index = 0; this.speed = 1;
    this.clock = new FrameClock({ fps });
  }
  play(frames, { speed = 1, startAt = 0 } = {}) {
    this.stop(false);
    if (!Array.isArray(frames) || frames.length === 0) throw new TypeError("No frames to play");
    if (![0.5, 1, 2, 4].includes(Number(speed))) throw new RangeError("Unsupported playback speed");
    this.frames = frames.map(normalizeFrame); this.speed = Number(speed);
    this.index = Math.max(0, Math.min(this.frames.length, Math.floor(startAt)));
    if (this.index >= this.frames.length) { this.onFinish(); return; }
    this.running = true; this.paused = false; this.clock = new FrameClock({ fps: this.fps * this.speed });
    this.onState("playing"); this.schedule();
  }
  schedule() {
    if (!this.running || this.paused) return;
    const due = this.clock.dueFrame();
    while (this.index <= due && this.index < this.frames.length) {
      const frame = this.frames[this.index];
      this.onFrame({ index: this.index, frame, state: frameToControllerState(frame), timestamp: this.clock.elapsed() });
      this.index++; this.clock.nextFrame++;
    }
    if (this.index >= this.frames.length) {
      this.running = false; this.timer = null; this.onState("finished"); this.onFinish(); return;
    }
    this.timer = setTimeout(() => this.schedule(), Math.max(1, this.clock.delayUntilNextFrame()));
  }
  pause() { if (!this.running || this.paused) return; clearTimeout(this.timer); this.timer = null; this.paused = true; this.clock.pause(); this.onState("paused"); }
  resume() { if (!this.running || !this.paused) return; this.paused = false; this.clock.resume(); this.onState("playing"); this.schedule(); }
  stop(notify = true) {
    clearTimeout(this.timer); this.timer = null;
    const wasActive = this.running || this.paused;
    this.running = false; this.paused = false; this.frames = []; this.index = 0;
    if (notify && wasActive) this.onState("stopped");
  }
}
