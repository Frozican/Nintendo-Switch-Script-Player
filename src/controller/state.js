import { BUTTONS, MOTIONS, normalizeFrame } from "../stas/schema.js";

export function createControllerState(frame = null) {
  const normalized = frame ? normalizeFrame(frame) : normalizeFrame({});
  return Object.freeze({
    buttons: Object.freeze([...normalized.buttons]),
    leftStick: Object.freeze({ ...normalized.left }),
    rightStick: Object.freeze({ ...normalized.right }),
    motion: normalized.motion
  });
}
export function frameToControllerState(frame) { return createControllerState(frame); }
export function isValidControllerState(state) {
  if (!state || !Array.isArray(state.buttons) || !state.buttons.every(button => BUTTONS.includes(button))) return false;
  for (const stick of [state.leftStick, state.rightStick]) {
    if (!stick || !Number.isFinite(stick.x) || !Number.isFinite(stick.y) || stick.x < -100 || stick.x > 100 || stick.y < -100 || stick.y > 100) return false;
  }
  return MOTIONS.includes(state.motion);
}
