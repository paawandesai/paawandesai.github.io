---
title: "AI Call Center Agent"
excerpt: "Answers, books, verifies callers and hands off life-safety calls, measured on 100 held-out real calls."
collection: portfolio
layout: single
group: gauntlet
order: 1
---

### What it does
A chat agent for the inbound line of a home-services company. It answers fee, hours, membership and warranty questions from the company knowledge base and books visits against the scheduling database. It verifies callers before discussing their own appointments, invoices or renewals, and it hands everything else to a person with a summary.

### Safety and measurement
- Gas, carbon monoxide, fire, electrical hazards and medical emergencies always get a fixed script and a human handoff, never a model answer. Two independent checks look for them: fixed rules on every message, plus a separate AI safety classifier.
- On 100 held-out calls the agent contained 66 correctly (95% CI 56–75%), inside the 60–75% target. When it kept a call, it was right 66 times in 68.
- Card numbers a caller types are masked in handoff records and never stored.

### Tools
TypeScript, Next.js, Postgres, Claude (Haiku), Railway
