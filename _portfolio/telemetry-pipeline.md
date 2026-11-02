---
title: "Equipment Telemetry Pipeline"
excerpt: "Ingests device telemetry through a real broker and keeps every device's state correct, whatever order data arrives in."
collection: portfolio
layout: single
group: gauntlet
order: 6
flow_caption: "From gateway to live state"
flow:
  - { t: "Site gateways", s: "equipment readings" }
  - { t: "Redpanda broker", s: "Kafka-compatible" }
  - { t: "Consumer", s: "order-independent updates", hot: true }
  - { t: "Postgres", s: "current state per device", hot: true }
  - { t: "Live web app", s: "claim new devices" }
---

### What it does
Ingests equipment telemetry from site gateways through a Kafka-compatible broker. It keeps every device's current state correct regardless of the order readings arrive in, and shows it live in a web app where unregistered devices can be claimed. One `docker-compose up` runs the whole stack.

### Tools
TypeScript, Fastify, Zod, KafkaJS, Redpanda, Postgres 16, React, Vite, Docker
