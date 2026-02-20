# Murasaki

Murasaki is a browser-based, gesture-controlled audiovisual experience.
It combines real-time hand tracking, procedural particle systems, cinematic post-processing, and reactive procedural audio.

Live domain: `https://murasaki.nohell.dev/`

## Features

- Real-time hand tracking with MediaPipe Hands.
- Gesture-driven particle techniques rendered with Three.js.
- Bloom post-processing and controlled screenshake.
- Procedural deep drone audio with technique-based sound profiles.
- Click-to-toggle camera panel modes.
- Mobile-friendly camera panel sizing.
- SEO/OG metadata for production sharing.
- Console fingerprint/easter egg (`nohell()`).

## Gesture Map

| Gesture | Detection | Technique Label |
|---|---|---|
| Pinch | Thumb tip + index tip close | Secret Technique - Hollow Purple |
| Middle finger only | Middle up, index/ring/pinky down | Fuck You |
| Open hand (4 fingers up) | Index + middle + ring + pinky up | Domain Expansion - Malevolent Shrine |
| Index + middle up | Ring down | Domain Expansion - Infinite Void |
| Index only | Middle down | Reverse Cursed Technique - Red |
| No recognized pose | Fallback state | Awaiting Hand Gesture |

## Camera Panel Modes

Click the camera panel to cycle view state:

`camera -> skeleton -> hidden -> ...`

Default mode on load: `skeleton` (overlay only).

Mode behavior:

- `camera`: slightly opaque camera feed + skeleton overlay.
- `skeleton`: no camera video, only tracking overlay.
- `hidden`: camera video and skeleton overlay both hidden.

## Audio Behavior

- Audio unlocks on first user interaction (tap/click/key press), per browser autoplay rules.
- Idle/neutral state is near-silent.
- Active gestures ramp into stronger layered sound design.
- Technique switches trigger short impact accents (low boom + noise burst).

## Tech Stack

- `Three.js` for rendering and particles.
- `EffectComposer` + `UnrealBloomPass` for post-processing.
- `MediaPipe Hands` for gesture tracking.
- Web Audio API for procedural synthesis.
- Static hosting via Vercel (`vercel.json`).

## Local Development

### Requirements

- Modern Chromium/Firefox/Safari browser.
- Webcam access.
- Serve over `http://localhost` or `https` (camera APIs may fail on plain file URLs).

### Run

Option 1:

```bash
npx serve .
```

Option 2:

```bash
python -m http.server 4173
```

Then open:

- `http://localhost:3000` (for `serve`)
- or `http://localhost:4173` (for Python)

## Deployment

The project is configured as a static site:

- `vercel.json` uses `@vercel/static`.
- No backend services required.

## SEO / Metadata

`index.html` includes:

- Canonical URL for `murasaki.nohell.dev`
- Open Graph + Twitter card tags
- JSON-LD (`WebApplication`)
- `og-image.svg` preview asset

## Signature

- Source fingerprint markers include `nohell`.
- Open DevTools Console and run:

```js
nohell()
```

## Privacy Notes

- Hand tracking runs in-browser.
- No server-side video processing in this project.
- Third-party client-side libraries are loaded from CDN.
