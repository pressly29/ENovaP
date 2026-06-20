# EvPNova

A white-label trading platform built on top of Deriv's open-source trading app, extended with a custom prediction-market signal engine.

🔗 **Live:** [evpnova.com](https://evpnova.com)

## What this is

EvPNova combines:

- A **trading frontend** forked from [binary-com/deriv-app](https://github.com/binary-com/deriv-app), covering synthetic and real-time market trading
- A **prediction-market signal engine** focused on Polymarket, using semantic signal matching against free public data sources — NOAA, USGS, NASA FIRMS, and Manifold
- **Automated alerting** via Telegram, with a dry-run resolver for testing trade logic before it goes live

> This project is a fork of Deriv's open-source platform, extended with original prediction-market tooling. It is not affiliated with or endorsed by Deriv / Binary.com.

## Stack

TypeScript · React · Node.js · Docker · Netlify/Vercel deployment · DigitalOcean (signal engine + alerting)

## Status

Active personal project (`dev` branch). Deployed to a DigitalOcean VPS with a working Telegram alert system and dry-run resolver.

## Setup

This repo inherits its build tooling from the upstream Deriv monorepo (Lerna/NX, Node ≥16). See `docs/` for package-level setup details if you're working with the trading-platform packages directly.

---

📫 Questions or interested in the signal-matching approach? Reach me at [presslyelviss@gmail.com](mailto:presslyelviss@gmail.com)
