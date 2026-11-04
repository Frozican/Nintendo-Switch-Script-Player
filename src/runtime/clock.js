export class FrameClock {
  constructor({ fps = 60, now = () => performance.now() } = {}) {
    if (!Number.isFinite(fps) || fps <= 0) throw new RangeError("FPS must be positive");
    this.fps = fps;
    this.frameDuration = 1000 / fps;
    this.now = now;
    this.reset();
  }
  reset(startTime = this.now()) { this.startTime = startTime; this.nextFrame = 0; this.pausedAt = null; this.pausedDuration = 0; }
  pause() { if (this.pausedAt === null) this.pausedAt = this.now(); }
  resume() { if (this.pausedAt !== null) { this.pausedDuration += this.now() - this.pausedAt; this.pausedAt = null; } }
  elapsed() { const end = this.pausedAt ?? this.now(); return Math.max(0, end - this.startTime - this.pausedDuration); }
  dueFrame() { return Math.floor(this.elapsed() / this.frameDuration); }
  delayUntilNextFrame() { return Math.max(0, this.nextFrame * this.frameDuration - this.elapsed()); }
}
