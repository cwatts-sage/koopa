# NFL Group Chat Agent — Plan

## Overview
A spawned sub-agent that posts NFL news and manages a family pick 'em pool in an iMessage group chat.

## Status: 🟡 Sketching / Pre-season

## Prerequisites
- [x] Add Toadstool's iCloud account to the NFL family group chat
- [x] Confirm group chat_guid: `iMessage;+;03dcb4ab0e984d19971e0b180aee7260`
- [x] Group name: **Watts Football Pool 2025-2026** (imsg chat ID: 6)
- [x] Decide on persona name: Watts Football Commissioner 🏈⚡
- [x] Define pool rules: Straight up picks
- [x] Poll group for team preferences (see teams.md)
- [x] Build pick tracking system (pool-manager.sh — tested and working)
- [ ] Set up news feed (tested sub-agent web search approach — works well)
- [ ] Set up cron job for weekly delivery (holding until closer to season)
- [ ] Identify all group members by name
- [x] Build web app scaffold (Azure Functions + Static Web App + Table Storage)
- [ ] Deploy to Azure (waiting on credentials)
- [ ] Build DM pick intake flow as fallback (parse incoming DMs, call pool-manager.sh)
- [ ] Build matchup auto-population from schedule source
- [ ] Build formatted group chat posting (matchups, results, standings)

## Architecture
- **Runs on:** This OpenClaw instance (no separate VM/iCloud needed)
- **Delivery:** Isolated cron jobs → message tool → group chat via BlueBubbles
- **Identity:** Same iMessage number, but posts will have a distinct voice/signature

## Features (Phased)

### Phase 1 — NFL News Bot (Now → Preseason)
- Daily or weekly cron job fetching NFL headlines
- Sources: ESPN RSS, NFL.com, maybe r/nfl highlights
- Posts formatted summary to the group chat
- Offseason focus: draft, free agency, trades, camp news
- Tailored to teams the family follows (poll on join)

### Phase 2 — Preseason Dry Run (August)
- Run mock pick 'em weeks using preseason games
- Test the full flow: matchup posting → DM picks → results → standings
- Iron out any issues before it counts
- Get everyone comfortable with the process

### Phase 3 — Pick 'Em Pool (Regular Season)
- Weekly picks tracking (file-based in workspace)
- Reminders: "Submit your picks by Thursday 8PM!"
- Results posting: who won, updated standings
- Season leaderboard

### Phase 4 — Game Day Extras (Nice to Have)
- Injury report summaries before games
- Score updates (if feasible without API costs)
- Trash talk generator 😄

## Cron Schedule Ideas
- **Offseason:** 1x/week (Monday morning NFL roundup)
- **Regular season:** 
  - Monday: Weekend results + standings
  - Wednesday: Pick reminder
  - Thursday: Injury reports + last call for picks
  - Sunday: Game day hype

## Data Storage
```
projects/nfl-agent/
├── PLAN.md          (this file)
├── pool/
│   ├── standings.json
│   ├── picks-week-XX.json
│   └── rules.md
└── feeds.md         (RSS sources and config)
```

## Persona
- **Name:** Watts Football Commissioner (WFC)
- **Signature:** 🏈⚡
- **Vibe:** Official but fun, family-friendly trash talk encouraged
- **RULE: NFL ONLY** — Do not engage in any conversation outside of NFL/football topics in the group chat. If someone asks about anything else, politely redirect to football.

## Pool Rules
- **Format:** Straight up picks (pick the winner, no spread)

## Pick Submission Flow
1. **WFC posts matchups** to group chat (midweek)
2. **Members DM picks privately** to Toadstool (keeps picks secret)
3. **Deadline** before first game of the week (TBD — Thursday night?)
4. **After all games played**, WFC posts results + updated standings to group

## Decided
- **News delivery method:** Sub-agent spawned via cron, uses web_search, sends via `imsg send --chat-id 6`
- **Team preferences:** See teams.md (Cowboys, Broncos, Chiefs, Bills)
- **BlueBubbles message tool:** Broken for group sends ("aborted"), use `imsg send` instead
- **Status:** Planning phase only — no active cron jobs yet, revisit closer to preseason (August 2026)

## Open Questions
- Deadline day/time for picks?
- Who are all the pool members by name? (have numbers, need names)
- Does George want to still "run" it with the bot as his assistant, or should the bot fully automate?
- What time/day for weekly news roundup?
