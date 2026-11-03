---
title: "Hardware Accelerator for Post-Quantum Cryptography (Senior Design)"
excerpt: "UT Austin senior design project (Sep 2024 to May 2025): a Verilog accelerator for the ML-DSA post-quantum signature algorithm."
collection: portfolio
layout: single
group: earlier
order: 2
flow_caption: "The accelerator"
flow:
  - { t: "C driver", s: "software side" }
  - { t: "Random bit generator", s: "" }
  - { t: "NTT unit", s: "polynomial multiplication", hot: true }
  - { t: "ML-DSA core", s: "signature operations", hot: true }
  - { t: "ModelSim", s: "verified in simulation" }
---

### Overview
My senior design project at UT Austin (Sep 2024 to May 2025). I led development of a Verilog hardware accelerator for ML-DSA, a digital signature scheme designed to remain secure against quantum computers. The accelerator speeds up the scheme's most expensive operations.

### My contributions
- Designed core components, including the random bit generator and the NTT unit for polynomial multiplication.
- Wrote a C driver so software can communicate with the hardware.
- Kept the architecture efficient enough to scale to larger cryptographic workloads.

### Tools
Verilog, ModelSim, C, Python
