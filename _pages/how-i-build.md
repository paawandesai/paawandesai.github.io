---
permalink: /how-i-build/
title: "How I Build"
author_profile: true
---

I build with a team of AI agents, each with a fixed role, a fixed model and one rule it may never break. The point is to separate the agents that write things from the agents that judge them, so nothing grades its own work. [Company Agent Layer](/portfolio/company-agent-layer/) is built this way, and it's the example below.

## The roles

| Role | Model | Does | Never |
| --- | --- | --- | --- |
| Planner | Opus 5.5 | Picks the next item and writes a one-page spec with acceptance tests | Writes code |
| Spec critic | Fable 5.1 | Checks the spec against the target and the buyer: is this the right thing, and is it the smallest version? | Approves its own suggestions |
| Builder | Opus 5.5 | Writes the tests first, then the code, in its own worktree | Edits the acceptance tests to make them pass |
| Breaker | Sonnet 5.5, fresh context | Sees only the spec and the diff, runs everything and tries to break it, including a high-effort code review | Sees the builder's reasoning |
| Scorer | Tester loop | Replays the scenario catalog against the branch build | Changes expected answers |
| Buyer panel | Fable 5.1 and Sonnet 5.5, three personas | Scores the docs, demo and product against a rubric, weekly and after each user-facing change | Sees the backlog or the code |

## The verification ladder

Each level catches what the one below it can't. The cheap checks run on every change, and the expensive ones run on a schedule.

| Level | What it checks | When | Cost |
| --- | --- | --- | --- |
| 1. Tests and CI | Unit and integration tests, an access-control negative suite, tenant isolation, lint and vulnerability scans | Every PR | Minutes of runner time |
| 2. Fleet scorecard | About 60 scenarios on a simulated company: the right consumers are warned, the wrong ones are left alone, and the comment arrives in time | Every PR that touches the indexer or server, plus nightly | About an hour of runner time |
| 3. Paired agent trials | The same task done twice by headless coding agents, once with the layer and once without. It counts the breaks that reach main and whether agents acted on alerts, and a labeling model marks each alert as useful or noise. | Weekly, starting with 20 task pairs | The biggest token cost |
| 4. New-customer simulation | A fresh agent gets only the public docs and two empty repos, and must install everything until the first useful PR comment, timed. Every place it gets stuck becomes a backlog item. | After every docs or setup change, and weekly | About an hour of one agent |
| 5. Buyer panel | Three personas, an engineering lead buying it, a security reviewer vetting it, and a staff engineer who has to live with the alerts, each score the landing page, demo and docs on a fixed rubric and list their top objections | Weekly, and after user-facing changes | Small |

## Why it works

- **No agent grades its own work.** The builder can't touch the acceptance tests, the breaker never sees the builder's reasoning, and the scorer can't change expected answers.
- **Evidence beats opinion.** Each level produces a number or a list, so a regression shows up as data instead of a feeling.
- **The buyer is in the loop from day one.** The panel and the new-customer simulation keep the product honest about what a real team would actually adopt.
