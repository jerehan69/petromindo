---
title: "Petromindo Scraper"
description: "A targeted newsfeed that scrapes Petromindo and Jakarta Post for Indonesian energy news, automatically categorized and formatted into Google Sheets."
date: 2026-06-05
tags: ["Python", "Web Scraping", "Automation", "Google Sheets", "Kimi WebBridge"]
video: "/videos/petromindo-scraper.mp4"
---

## What it does

This scraper watches **Petromindo.com** and **The Jakarta Post** — two of Indonesia's key energy/news sources — and pulls every article into a formatted Google Sheet. It runs automatically via the Kimi WebBridge browser automation tool.

Think of it as a **targeted newsfeed** for the Indonesian energy sector. Instead of checking multiple sites manually, the scraper does the rounds and dumps everything into one clean spreadsheet.

## How it works

The script uses **Kimi WebBridge** to control a real browser session. It navigates to each news site, extracts article data (titles, URLs, timestamps) through JavaScript injection, then writes everything to Google Sheets via the Sheets API.

It runs with a single command:

```
uv run python3 indo_news.py
```

Or create a new sheet each time:

```
uv run python3 indo_news.py --sheet-id <ID>
```

There's also a **spectacle mode** (`--spectacle`) that writes rows one batch at a time so you can watch the sheet fill up in real time.

## Key features

- **Multi-source** — Scrapes Petromindo + Jakarta Post (latest + regulations)
- **Auto-categorization** — Classifies articles into Oil & Gas, Coal, Minerals, Power/Renewables, Regulations, and more
- **Company detection** — Identifies 80+ Indonesian energy companies in article titles (Pertamina, PLN, Medco, etc.)
- **Country tagging** — Detects non-Indonesia country mentions for geospatial tracking
- **Keyword highlighting** — Flags articles matching key terms (LNG, gas, SKK Migas, mandates, etc.)
- **Top story sorting** — Promotes featured stories to the top with red styling
- **Formatted output** — Bold company names, colored links, frozen headers, auto-sized columns

## Tech stack

- **Python** — Core logic
- **Kimi WebBridge** — Browser automation (JavaScript injection for scraping)
- **Google Sheets API** — Data output with full formatting
- **OAuth 2.0** — Authenticated Google API access with token refresh
- **Regex** — Title cleanup, company detection, country parsing, categorization

## Why it exists

I needed a way to track Indonesian energy sector news without manually browsing multiple sites every day. The scraper runs on demand, produces a clean, sortable spreadsheet, and highlights the articles that actually matter — saving hours of manual scanning.
