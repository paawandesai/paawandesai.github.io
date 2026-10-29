---
title: "Alchemist's Trial"
excerpt: "A browser game where real chemistry is the magic system: write a balanced equation and the simulation decides what happens."
collection: portfolio
layout: single
group: featured
order: 4
---

[View on GitHub](https://github.com/paawandesai/realgame)

### What it does
A chemistry spell sandbox, and the first playable slice of a larger game where real skills are the magic system. You gather matter, write real chemical equations, and the simulation decides what happens: water douses fire, electricity splits water into hydrogen and oxygen, and a balanced `2H2 + O2 -> 2H2O` makes a sharp pop that lights a torch.

Age bands set the difficulty, from picture tiles read aloud for young kids to full equations for older players.

### Built for school Chromebooks
- The simulation is written in Rust and compiled to WebAssembly.
- The whole game is about 115 KB gzipped.
- It collects no personal data, only anonymous play counts.
- It deploys to Cloudflare Pages.

### Tools
Rust, WebAssembly, wasm-pack, TypeScript, Vite, Cloudflare Pages
