---
title: "Clinical Co-Pilot + Adversarial Eval Platform"
excerpt: "A clinical agent inside OpenEMR, plus a platform that continuously red-teams it."
collection: portfolio
layout: single
group: gauntlet
order: 2
---

### What it does
A FastAPI clinical agent with an OpenEMR module, paired with a **continuous adversarial-evaluation platform** that red-teams the deployed agent on its own.

- Each attempt is judged by **deterministic-first oracles** (canary match, tool-call audit, log scan, token counter, HTTP assertion). An LLM judge is used only for the categories that are truly semantic.
- Confirmed exploits are frozen into a versioned regression suite.
- Every attack ships with a benign twin, so a "fix" that just breaks the workflow fails instead of passing.

### Tools
Python, FastAPI, PHP (OpenEMR), Pydantic, pytest
