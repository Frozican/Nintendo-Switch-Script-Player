export const STAS_FORMAT = "STAS";
export const STAS_VERSION = 1;
export const STAS_FPS = 60;
export const BUTTONS = Object.freeze(["A","B","X","Y","L","R","PLUS","MINUS"]);
export const MOTIONS = Object.freeze(["Neutral","Tilt Up","Tilt Down","Tilt Left","Tilt Right","Rotate X+","Rotate X−","Rotate Y+","Rotate Y−","Rotate Z+","Rotate Z−","Shake"]);

export function createFrame(previous = null) {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? ("frame-" + Date.now() + "-" + Math.random().toString(36).slice(2)),
    buttons: [],
    left: previous ? { ...previous.left } : { x: 0, y: 0 },
    right: previous ? { ...previous.right } : { x: 0, y: 0 },
    motion: "Neutral"
  };
}

export function normalizeStick(value, label = "stick") {
  if (!value || typeof value !== "object") throw new TypeError("Invalid " + label);
  const x = Number(value.x), y = Number(value.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError("Invalid coordinates for " + label);
  return { x: Math.max(-100, Math.min(100, Math.round(x))), y: Math.max(-100, Math.min(100, Math.round(y))) };
}

export function normalizeFrame(frame, index = 0) {
  if (!frame || typeof frame !== "object") throw new TypeError("Frame " + index + " must be an object");
  const sourceButtons = Array.isArray(frame.buttons) ? frame.buttons : [];
  return {
    id: String(frame.id ?? ("imported-" + index)),
    buttons: [...new Set(sourceButtons.filter(button => BUTTONS.includes(button)))],
    left: normalizeStick(frame.leftStick ?? frame.left ?? { x: 0, y: 0 }, "left stick"),
    right: normalizeStick(frame.rightStick ?? frame.right ?? { x: 0, y: 0 }, "right stick"),
    motion: MOTIONS.includes(frame.motion) ? frame.motion : "Neutral"
  };
}

export function validateDocument(document) {
  if (!document || typeof document !== "object" || Array.isArray(document)) throw new TypeError("STAS document must be an object");
  if (document.format !== STAS_FORMAT) throw new TypeError("Unsupported script format (expected STAS)");
  if (document.version !== STAS_VERSION) throw new TypeError("Unsupported STAS version: " + document.version);
  if (!Array.isArray(document.frames) || document.frames.length === 0) throw new TypeError("A STAS script must contain at least one frame");
  if (document.frames.length > 100000) throw new RangeError("Script exceeds the 100,000-frame safety limit");
  const fps = Number(document.fps ?? STAS_FPS);
  if (fps !== STAS_FPS) throw new TypeError("Unsupported frame rate: " + fps + "; expected 60 FPS");
  return { format: STAS_FORMAT, version: STAS_VERSION, name: String(document.name ?? "Untitled Script").slice(0, 120), fps: STAS_FPS, frames: document.frames.map(normalizeFrame) };
}
