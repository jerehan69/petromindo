---
title: "News Scraper"
description: "A targeted newsfeed that scrapes Indonesian energy news sources, automatically categorized and formatted into Google Sheets."
date: 2026-06-05
tags: ["Python", "Web Scraping", "Automation", "Google Sheets", "Kimi WebBridge"]
video: "/videos/petromindo-scraper.mp4"
---

## What it does

This scraper watches **Petromindo.com** and **The Jakarta Post** — two of Indonesia's key energy/news sources — and pulls every article into a formatted Google Sheet.

Think of it as a **targeted newsfeed** for the Indonesian energy sector. Instead of checking multiple sites manually, the scraper does the rounds and dumps everything into one clean spreadsheet.

## How it works

The script uses browser automation to navigate news sites, extracts article data through JavaScript injection, then writes everything to Google Sheets.

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

- **Multi-source** — Scrapes Petromindo + Jakarta Post
- **Auto-categorization** — Classifies articles by sector
- **Company detection** — Identifies 80+ Indonesian energy companies
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
