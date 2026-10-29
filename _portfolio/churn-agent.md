---
title: "Subscriber Churn Agent"
excerpt: "Scores subscribers for cancellation risk nightly and lets a deterministic policy decide what may be sent."
collection: portfolio
layout: single
group: gauntlet
order: 10
---

### What it does
A nightly job that scores active subscribers for cancellation risk, explains why, and proposes one retention action from a fixed menu. Every proposal passes through a **deterministic policy layer** before anything can be sent. A review console lets people approve actions, handle adverse-event reports and edit policy without code.

It runs on synthetic data in dry-run mode, with failure drills documented.

### Tools
Python, uv, a calibrated risk model, Claude, Render
