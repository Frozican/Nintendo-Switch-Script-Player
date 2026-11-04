import { STAS_FORMAT, STAS_VERSION, STAS_FPS, normalizeFrame, validateDocument } from "./schema.js";

export function parseStasText(text) {
  if (typeof text !== "string") throw new TypeError("STAS input must be text");
  let raw;
  try { raw = JSON.parse(text); }
  catch { throw new SyntaxError("The selected file is not valid JSON-based STAS data"); }
  if (!raw.format && Array.isArray(raw.frames)) raw = { ...raw, format: STAS_FORMAT, version: STAS_VERSION, fps: raw.fps ?? STAS_FPS };
  return validateDocument(raw);
}

export function serializeStas(script) {
  if (!script || !Array.isArray(script.frames) || script.frames.length === 0) throw new TypeError("Cannot export an empty script");
  const document = validateDocument({ format: STAS_FORMAT, version: STAS_VERSION, name: script.name, fps: STAS_FPS, frames: script.frames.map(normalizeFrame) });
  return JSON.stringify({
    format: document.format, version: document.version, name: document.name, fps: document.fps,
    frames: document.frames.map((frame, index) => ({ frame: index, buttons: frame.buttons, leftStick: frame.left, rightStick: frame.right, motion: frame.motion }))
  }, null, 2);
}
