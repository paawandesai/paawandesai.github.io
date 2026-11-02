---
title: "Live Interpreter Workbench"
excerpt: "Interprets live speech two ways, realtime speech-to-speech and a cascaded pipeline, and measures both."
collection: portfolio
layout: single
group: gauntlet
order: 8
flow_caption: "Two ways to interpret, measured side by side"
flow:
  - { t: "Live speech", s: "browser mic" }
  - { t: "Realtime", s: "speech-to-speech over WebRTC", hot: true }
  - { t: "Cascade", s: "speech-to-text, translate, speech", hot: true }
  - { t: "Measure both", s: "written comparison + numbers" }
---

### What it does
A browser workbench that interprets live speech and compares approaches side by side:
- **Realtime:** OpenAI's realtime speech-to-speech models over WebRTC.
- **Cascade:** streaming speech-to-text, then translation, then text-to-speech on the server, with swappable providers for each stage.

It comes with a written comparison and the evaluation numbers behind it.

### Tools
C#, .NET 10, WebRTC, OpenAI Realtime API, AWS
