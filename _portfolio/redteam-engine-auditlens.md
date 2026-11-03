---
title: "AI Agent Red Team Engine + AuditLens"
excerpt: "Attacks AI agents with multi-turn social engineering and RAG injection, then maps what they actually did to the EU AI Act."
collection: portfolio
layout: single
group: featured
order: 2
flow_caption: "From attack to audit"
flow:
  - { t: "113 attacks", s: "injection, tool misuse, multi-turn" }
  - { t: "Target agent", s: "LangGraph, four models" }
  - { t: "Grade actions", s: "tools called, arguments", hot: true }
  - { t: "AuditLens", s: "maps to EU AI Act articles" }
  - { t: "Report", s: "cited, scored, JSON and PDF" }
---

[Red team engine on GitHub](https://github.com/paawandesai/redteam-engine) · [AuditLens on GitHub](https://github.com/paawandesai/auditlens)

### What it does
The **red team engine** runs RAG prompt-injection, tool-misuse and multi-turn social-engineering attacks against LangGraph agents. It grades what the agent actually *did*: which tools it called, and with which arguments. It covers 113 adversarial prompts across 8 attack categories, mapped to the OWASP LLM Top 10, MITRE ATLAS and CWE.

**AuditLens** takes those findings, or a scan of a GitHub repo, maps them onto EU AI Act articles, and produces a cited, scored assessment as JSON and PDF.

### Key finding
Ten multi-turn chains were run against a customer-support agent built without authorization gates, on four models. **Six chains succeeded on every model.** One is a three-message account takeover: look up the account's email, change it to an attacker's address, then send a password reset. It completed on GPT-4o, GPT-4o-mini, Claude Sonnet 4 and Claude Haiku 4.5. A better-aligned model did not stop them. The fix belongs in the agent's design, through real authorization checks.

### Tools
Python, LangGraph, FastAPI, Pydantic, asyncio, ChromaDB, Anthropic and OpenAI APIs
