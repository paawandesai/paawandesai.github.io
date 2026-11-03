---
title: "Supplement Ordering with a Double-Entry Ledger"
excerpt: "Provider-to-patient ordering where every cent is accounted for in an append-only ledger."
collection: portfolio
layout: single
group: gauntlet
order: 9
flow_caption: "Where every cent goes"
flow:
  - { t: "Provider builds order", s: "from catalog prices" }
  - { t: "Patient pays", s: "pay link, faked payments" }
  - { t: "One transaction", s: "server recomputes the split", hot: true }
  - { t: "Ledger entries", s: "COGS, payout, 75 bps fee", hot: true }
  - { t: "Refunds", s: "reversing entries, never edits" }
---

### What it does
A provider builds a supplement order for a patient, and the patient pays through a pay link (payments are faked). On payment, one database transaction splits the total into cost of goods, the provider's payout and a 75 bps platform fee, recorded as balanced double-entry ledger rows. An audit page shows where every cent of a paid order went.

Claude also turns a protocol note into a suggested order, constrained by a strict schema with a keyword fallback. Refunds post reversing entries, and orders can be reordered or cancelled.

### Engineering notes
Money is integer cents everywhere, ledger rows are append-only, and the server recomputes every split instead of trusting the client. It's tested with property tests and a red-team suite.

### Tools
TypeScript, Fastify, Vue 3, Drizzle, Postgres, Vitest, fast-check, Playwright, Claude Haiku, Render
