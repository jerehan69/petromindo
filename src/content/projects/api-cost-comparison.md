---
title: "API Cost Comparison"
description: "A live tracker comparing OpenCode Go subscription vs DeepSeek Official API pricing, with usage snapshots logged over time."
date: 2026-06-26
tags: ["Google Sheets", "Pricing", "Ollama", "DeepSeek", "Kimi WebBridge"]
---

## What it does

Compares the real costs between two AI model access routes:

1. **OpenCode Go** — $10/month subscription for bundled open-source models
2. **DeepSeek Official API** — Pay-per-token access to V4 Flash and V4 Pro

The sheet logs usage snapshots over time so you can see exactly how much you're burning through each billing window.

## The live sheet

👉 **[Open the sheet](https://docs.google.com/spreadsheets/d/1s2cu53HMW7QClMiPpajXUQTQ4aGI9uWlCMwwb9_nxwQ/edit)**

### OpenCode Go tab

| Plan | First Month | Monthly (after) |
|------|:-:|:-:|
| Go | **$5** | **$10** |

Usage limits: $12 / 5 hours · $30 / week · $60 / month

Includes 12+ models (GLM-5.2, Kimi K2.7 Code, DeepSeek V4 Flash/Pro, Qwen3.7 Max, etc.) with per-token effective rates or bundled pricing drawn from the monthly pool.

### DeepSeek Official tab

| Model | Cache-miss input | Cache hit | Output |
|-------|:-:|:-:|:-:|
| deepseek-v4-flash | $0.14 / 1M | $0.0028 / 1M | $0.28 / 1M |
| deepseek-v4-pro | $0.435 / 1M | $0.003625 / 1M | $0.87 / 1M |

Both support 1M-token context and 384K max output.

## Usage log

The sheet also tracks live usage from both platforms so you can monitor burn rates:

- **OpenCode Go**: Rolling (5h), weekly, and monthly usage % with reset timers
- **DeepSeek**: Monthly token counts per model, expenses, and account balance

## How it's updated

Usage data is captured on-demand through browser automation (Kimi WebBridge) to each platform's dashboard, then logged to the sheet programmatically. No persistent background sync — just snapshots when you want them.

## Why it exists

Without tracking, it's easy to blow through API credits or subscription limits without noticing. This sheet gives a single-pane view of what you're spending across both platforms, so you can decide when to switch between Go's bundled plan and raw API access.
