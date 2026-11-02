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
My UT Austin senior design project (Sep 2024 to May 2025). I led the development of a Verilog-based hardware accelerator for the **Module-Lattice-Based Digital Signature Algorithm (ML-DSA)**. The accelerator speeds up the core operations of a signature scheme built to stay secure against quantum computers.

### Key Features
- **Subsystem Design:** Engineered critical components like a random bit generator and NTT for polynomial multiplication.  
- **Hardware-Software Integration:** Designed a C-based driver to ensure seamless interaction between systems.  
- **Scalability:** Optimized architecture for efficient large-scale cryptographic applications.  

### Tools Used
- **Hardware Languages:** Verilog  
- **Software Tools:** ModelSim, C, Python
