---
title: "Quantum-Seeded Monte Carlo Pricer"
excerpt: "A serverless option pricer seeded by quantum entropy that can replay any job bit-for-bit."
collection: portfolio
layout: single
group: gauntlet
order: 5
flow_caption: "One pricing job"
flow:
  - { t: "Quantum entropy", s: "one seed block per job", hot: true }
  - { t: "Derive shard seeds", s: "independent per worker" }
  - { t: "SQS + Lambda", s: "fan out simulations" }
  - { t: "Aggregate", s: "price + 95% interval" }
  - { t: "Replay", s: "bit-for-bit from the seed", hot: true }
---

### What it does
A serverless, Terraform-managed Monte Carlo service that prices a European call option. Every job is seeded from one block of quantum entropy. It fans out across SQS-driven Lambda workers with independently derived shard seeds, aggregates to a price with a 95% confidence interval, and can **replay** any job from its stored seed to recompute the identical float64 result.

### Tools
Python, AWS Lambda, SQS, SSM, Terraform
