---
title: "Company Agent Layer"
excerpt: "Warns the right teams, down to the field, before a pull request breaks a service that depends on it."
collection: portfolio
layout: single
group: featured
order: 1
---

**Status:** in active development (Oct 2026). Indexer v0.2.0 published.

### The problem
Coding agents now write a large share of the code at many companies, and they change APIs, events and database columns faster than people can track who depends on what. Breaks show up after merge, in another team's service.

### What it does
Company Agent Layer indexes the API, event and database contracts across a company's repos and builds a graph of which service uses which. When a pull request would break something, it comments on the PR with the specific teams it affects, at field level, so a team only hears about the columns or fields it actually reads. It works alongside Claude Code, Codex and Cursor, and adds organization-level identity, policy and audit.

### How it's evaluated
- A simulated 14-repo company with about six months of history is scored every hour. It keeps committing changes on its own between replays, the way a real company would.
- On the latest full replay, 45 of 58 scenarios passed, nothing regressed, and the median time from push to PR comment was about 14 seconds. The other 13 are tracked as known gaps.
- Recent work: usage-aware routing, Postgres renames reported as one rename instead of a drop plus an add, and data controls (server-side logout, device revoke, one-step company deletion and 90-day event retention).
- A second review caught a trick that could have pointed event cleanup at another company's data, and it was fixed before merge.

It's built with the agent workflow described on [How I build](/how-i-build/).
