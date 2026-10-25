# Becky Button — portfolio

A static, dependency-free portfolio for creative technology and AI/physical-interface research prototyping roles. Open `index.html` directly, or run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then visit http://127.0.0.1:4173. The existing Vercel static-site setup is retained. This redesign is intended for review on a separate branch; merging or production deployment is a separate decision.

## Editing

- `index.html`: project narratives, navigation, native expandable details, and links.
- `styles.css`: responsive layout, color palette, focus styles, and reduced-motion support.
- `script.js`: three predefined intention examples and short, user-initiated Web Audio tones. No backend, API keys, recording, inference, analytics, or third-party JavaScript.
- `assets/`: optimized WebP copies of the original repository images; original PNGs remain untouched. SVG favicon and inline explanatory diagrams are new.

## Content provenance and items to replace

The four primary project descriptions come from Becky's supplied project accounts. Open Stitch implementation details and the supporting Puck v0 / Era Labs, Twinkle Toes, and lamp descriptions come from the previous portfolio's project data. No performance metrics, user research results, dates, or employment claims have been invented.

The shelf, wearable, lamp, guitar pedal, and Open Stitch screenshot are authentic assets from this repository. The existing source image for Open Stitch includes browser chrome; it is retained as supplied. Images are resized and encoded as WebP without changing their content.

Three projects have no supplied project photographs, videos, or source/demo URLs:

1. **Handheld note taker:** the visual is a labeled interaction sketch with predefined examples, not a working AI model or microphone interface. It does not create tasks, purchases, or calendar events. Add a device photo and an actual workflow recording when available. The Puck wearable image is not used to represent this separate project.
2. **Gongfu tea tray synthesizer:** the vessels are a labeled conceptual illustration. The optional tones are a new browser sound sketch, not a recording or reconstruction of the original instrument. Replace or supplement with actual hardware footage and explain its sensor-to-sound mapping.
3. **CMOS simulator:** the logic gate and export flow are explanatory illustrations, not a live simulator or a real KiCad output. Add screenshots, a real sample schematic, and the actual demo/source link when supplied.

Contact uses the existing public X profile and GitHub profile. No guessed email address or unverified resume is included. Replace the contact destination with a preferred public email or booking link if desired.

## Design and accessibility

The original tea shelf remains a navigable cabinet of real objects. A visible project index and editorial case-study sections communicate each project's purpose without requiring interaction. The visual reference was Era's emphasis on a clear thesis, expressive objects, and large typography, interpreted with a distinct warm paper/plum/tea palette.

Core content, anchor navigation, outbound links, and native details work without JavaScript. Interactions use native buttons and links, visible keyboard focus, pressed states, live status text, a skip link, descriptive headings/alt text, and reduced-motion preferences. Audio is quiet, finite (1.15 seconds), and starts only on activation. Mobile layouts stack project stories and keep the index in two columns.

## Review checks

- `node --check script.js`
- `git diff --check`
- Local static server returns HTTP 200.
- Browser review of the desktop design and a 390px-wide embedded viewport.
- Exercise all three intention examples, native disclosure controls, and tea tones with keyboard activation.
- Check local asset and anchor references.

Before merging, review the new first-person copy and add actual project evidence for the three illustrated primary projects when available. This site deliberately presents no fabricated impact figures.
