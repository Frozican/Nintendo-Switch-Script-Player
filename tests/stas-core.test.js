import test from "node:test";
import assert from "node:assert/strict";
import { createFrame, normalizeFrame, validateDocument } from "../src/stas/schema.js";
import { parseStasText, serializeStas } from "../src/stas/parser.js";
import { createControllerState, isValidControllerState } from "../src/controller/state.js";
import { FrameClock } from "../src/runtime/clock.js";

test("creates a neutral controller frame", () => {
  const frame = createFrame();
  assert.deepEqual(frame.buttons, []);
  assert.deepEqual(frame.left, { x: 0, y: 0 });
  assert.deepEqual(frame.right, { x: 0, y: 0 });
  assert.equal(frame.motion, "Neutral");
});

test("normalizes stick coordinates and removes unsupported buttons", () => {
  const frame = normalizeFrame({ buttons: ["A", "INVALID", "A"], left: { x: 140, y: -140 } });
  assert.deepEqual(frame.buttons, ["A"]);
  assert.deepEqual(frame.left, { x: 100, y: -100 });
});

test("round-trips a STAS v1 document", () => {
  const source = { name: "Test", frames: [{ buttons: ["A"], left: { x: 25, y: -50 }, right: { x: 0, y: 0 }, motion: "Neutral" }] };
  const decoded = parseStasText(serializeStas(source));
  assert.equal(decoded.format, "STAS");
  assert.equal(decoded.version, 1);
  assert.equal(decoded.fps, 60);
  assert.equal(decoded.frames[0].left.x, 25);
  assert.deepEqual(decoded.frames[0].buttons, ["A"]);
});

test("rejects unsupported STAS versions and empty scripts", () => {
  assert.throws(() => validateDocument({ format: "STAS", version: 2, frames: [{}] }), /Unsupported STAS version/);
  assert.throws(() => validateDocument({ format: "STAS", version: 1, frames: [] }), /at least one frame/);
});

test("maps a frame to an immutable controller state", () => {
  const state = createControllerState({ buttons: ["B"], left: { x: 10, y: 20 }, right: { x: 0, y: 0 }, motion: "Neutral" });
  assert.equal(isValidControllerState(state), true);
  assert.equal(Object.isFrozen(state), true);
  assert.equal(Object.isFrozen(state.leftStick), true);
});

test("frame clock corrects timing against elapsed time and pauses cleanly", () => {
  let now = 0;
  const clock = new FrameClock({ fps: 60, now: () => now });
  assert.equal(clock.dueFrame(), 0);
  now = 17;
  assert.equal(clock.dueFrame(), 1);
  clock.pause();
  now = 1000;
  assert.equal(clock.elapsed(), 17);
  clock.resume();
  now = 1017;
  assert.equal(clock.elapsed(), 17);
});
