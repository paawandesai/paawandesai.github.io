---
title: "Prediction-Market Aggregator"
excerpt: "Finds equivalent contracts across Kalshi and Polymarket and simulates where to route an order."
collection: portfolio
layout: single
group: gauntlet
order: 3
flow_caption: "From two venues to one routing decision"
flow:
  - { t: "Kalshi + Polymarket", s: "markets, order books" }
  - { t: "Fetch every 2 min", s: "scheduler writes to Postgres" }
  - { t: "Normalize", s: "one venue-independent model" }
  - { t: "Match contracts", s: "same bet, with a contract diff", hot: true }
  - { t: "Simulate routing", s: "where an order would fill", hot: true }
---

### What it does
Pulls markets and order books from Kalshi and Polymarket and normalizes them into one venue-independent model. It classifies which contracts are economically the same bet, with a written definition and a contract diff, and simulates routing a hypothetical order with a plain-English explanation. No real orders are ever placed.

### Engineering notes
- A scheduler collects a fetch round every 2 minutes. Pages read only from the database, so serving a page makes zero venue API calls, and a test enforces that.
- Pairs come from a pinned round so the demo stays stable, and every price shows its age.

### Tools
Go, Postgres, Docker, Google Cloud Run, Cloud SQL
