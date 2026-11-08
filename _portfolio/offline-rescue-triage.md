---
title: "Offline Flood-Rescue Triage"
excerpt: "2nd place at a Gauntlet AI hackathon. A small model I trained reads messy rescue requests on a laptop with no internet, and readable rules, not the model, decide who gets help first."
collection: portfolio
layout: single
group: featured
order: 2
flow_caption: "How a rescue request gets triaged"
flow:
  - { t: "Rescue request", s: "post, form or CSV, any language" }
  - { t: "Small model", s: "typed fields + confidence", hot: true }
  - { t: "Rules engine", s: "decides priority, never the model", hot: true }
  - { t: "Local queue", s: "works with no signal" }
  - { t: "Cloud dashboard", s: "syncs when a link returns" }
---

**2nd place** at Gauntlet AI's 24-hour VERSUS hackathon (Nov 2026), against the rest of my cohort and Gauntlet alumni. Built with two teammates. [Source on GitHub](https://github.com/Gauntlet-Hackathon/gauntletvshackathon) · [Model training repo](https://github.com/Gauntlet-Hackathon/fastresponderSLM)

### What it does
In a flood, rescue requests arrive as messy posts and texts, often in more than one language, and the people sorting them usually don't have a reliable connection. This runs on a field laptop. A small multilingual model reads each request (English, Spanish or Vietnamese) and pulls out typed fields such as location, number of people, vulnerable people, hazards and needs, each with a calibrated confidence. A deterministic rules engine then decides the priority from those fields alone, merges duplicates, and when something important is missing it says exactly what to text back. Every decision shows the fields, the rule that fired and the versions used.

Requests are stored locally first and sync to a cloud dashboard when a connection comes back. A replay check re-runs every synced decision with the same rules version, and it found 0 mismatches.

### The model
I trained a roughly 300M-parameter multilingual encoder with a span tagger and one head per field, then calibrated each head on held-out data. Training ran overnight on Modal as an automatic loop: each run changed one thing, and a new checkpoint was promoted only if it improved on real text without hurting any field the rules depend on, stayed calibrated, and gave identical output on repeat runs. The final model is an average of the three best checkpoints. It runs on a CPU in about 38 ms per message and uses about 1.5 GB of memory.

### How it compares
Scored on 148 reviewed test requests, with the same rules engine making the decision for every system:

| System | Decision accuracy | Works offline | Time per request |
| --- | --- | --- | --- |
| Keyword rules | 0.26 | yes | instant |
| Generic small model (1.5B, not fine-tuned) | 0.51 | yes | about 20 s |
| **The model I trained** | **0.73** | **yes** | **about 38 ms** |
| Claude Opus with the full rubric | 0.91 | no | about 6.5 s |

The generic model reported high confidence on almost everything and rarely asked a follow-up question, even when a location was missing. Opus is close to the ceiling but needs a connection, which is exactly what a disaster takes away. Part of the training data was labelled by Opus, so that comparison isn't fully independent. The trained model still misses more urgent requests than Opus, so closing that gap is the next step, along with validating the decision rubric with emergency managers.

### Stack
Python, FastAPI and HTMX with SQLite on the laptop; Elixir, Phoenix LiveView and Postgres in the cloud; PyTorch, Modal and Hugging Face for the model; Fly.io for the hosted demo.
