# Nintendo Switch Script Player

A GitHub Pages-based, frame-oriented script editor. This milestone focuses on a hardware-independent STAS core and browser playback preview.

## Current features

- Frame table for controller buttons, both analog sticks and motion presets
- Touch-friendly stick coordinate editor
- STAS v1 JSON-based import/export using the `.stas` extension
- Local browser save
- Modular controller-state model and 60 FPS playback clock
- Play, pause, resume and stop for local preview
- Automated core tests using Node's built-in test runner

## Project structure

```
src/
  app.js                 Browser UI and editor event wiring
  stas/
    schema.js            STAS v1 schema, validation and normalization
    parser.js            STAS import and export
  controller/
    state.js             Normalized controller state
  runtime/
    clock.js             Drift-corrected frame clock
    player.js            Playback lifecycle and frame dispatch
tests/
  stas-core.test.js      Core tests
index.html               GitHub Pages entry point
```

## Development

Requires Node.js 20 or newer.

```sh
npm test
```

The site itself is static and can be hosted on GitHub Pages without a server.

## STAS v1

A `.stas` file is UTF-8 JSON with these top-level fields:

- `format`: `STAS`
- `version`: `1`
- `name`: script name
- `fps`: `60`
- `frames`: ordered frame objects containing `buttons`, `leftStick`, `rightStick` and `motion`

Stick coordinates are integers from -100 to 100. The parser normalizes coordinates and ignores unknown button names. Scripts are limited to 100,000 frames.

## Hardware status

**No direct USB output to a Nintendo Switch is implemented yet.** A normal GitHub Pages website cannot make a phone or PC enumerate as a USB controller simply through browser JavaScript. PC and Android USB roles and supported browser APIs must be investigated separately before promising direct cable operation. The current playback engine emits normalized controller-state objects locally; it does not send input to a console.

The playback clock schedules against elapsed time to reduce timer drift, but browser scheduling is not a hard real-time guarantee. This preview is a software milestone, not a claim of console-grade frame accuracy.
