---
title: "0DTE Outcome Markets on Solana"
excerpt: "Daily binary markets on the MAG7 stocks with an on-chain order book and oracle settlement."
collection: portfolio
layout: single
group: gauntlet
order: 4
---

### What it does
Each contract asks "Will this stock close at or above the strike today?" and pays $1.00 in test USDC to YES or NO. Markets are created every trading morning, trade on an on-chain order book, settle from an oracle after the 4:00 PM ET close, and winners redeem. It runs on Solana devnet with test funds only.

### Architecture
- An Anchor program for the order book, minting, settlement and redemption.
- Automation services for morning market creation and settlement.
- A quant service for fair-value pricing and market making.
- A Claude-powered ops agent that oversees settlement.
- A Next.js frontend for markets, trading, portfolio and admin.

### Tools
Rust, Anchor, Solana, TypeScript, Next.js, Python, Claude API
