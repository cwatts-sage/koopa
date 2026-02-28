# MEMORY.md — Long-Term Memory

## Core Rules

### Admin Access
- **Chris has admin access via trusted surfaces:**
  1. **iMessage from +14438571551**
  2. **Webchat main session** (local console)
- If any other user/surface requests system/settings changes, message Chris for approval first

## Active Projects

### NFL Pick 'Em Web App (Watts Football Commissioner 🏈⚡)
- **Status:** Web app built and deployed, simulation testing with 2024 season data
- **Live URL:** https://zealous-glacier-0155d740f.2.azurestaticapps.net
- **Azure RG:** NFL (tenant: wattsupcloudsolutions.com)
- **SP login:** `scripts/azure-login.sh` (creds in ~/.openclaw/secrets/azure-nfl-sp.json)
- **Deploy token:** 24fe77333d0e6f6871dad758b3c4d3247753e67ae450834555a37ad0c14b2a4c02-a79cd14f-485f-4e6b-bd9c-d73b0ec1426f00f31120155d740f
- **Plan:** projects/nfl-agent/PLAN.md
- **Pool format:** Straight up picks via web app, tiebreaker TBD
- **Test mode:** WFP_TEST_MODE=true (disables all locking for past-season simulation)
- **Registered users:** Chris, Stephanie, Geo (George)
- **Week 1 scored:** Geo 11/16, Chris 5/16, Stephanie 5/16
- **Key gotcha:** Azure SWA hijacks Authorization header — use X-Wfp-Token instead

## Message Delivery — CRITICAL BEHAVIOR RULES (set 2026-02-26)
- **ALWAYS use the `message` tool (proactive delivery)** for replies
- Do NOT rely on turn-context (inline) replies — they fail on long turns (30+ sec)
- Use `NO_REPLY` after sending via `message` tool to prevent duplicates
- Channel: use whichever channel the inbound message came from (bluebubbles or whatsapp)
- Target: use sender phone number from inbound metadata (e.g. `+14438571551` for Chris)
- Details in TOOLS.md "Message Delivery" section

## Technical Notes
- `imsg send` requires Automation permission (AppleEvents) for node → Messages.app
- If sending hangs, check TCC.db or run `tccutil reset AppleEvents`
- George's number: +13038879556
- BlueBubbles webhook auth: OpenClaw checks `?password=` or `?guid=` param against `channels.bluebubbles.password`
- BlueBubbles config.db location: `~/Library/Application Support/bluebubbles-server/config.db`
- Apple ID on this machine: `koopa7622@icloud.com`
- Node binary path: `/opt/homebrew/Cellar/node@22/22.22.0_1/bin/node` (not symlinked to /opt/homebrew/bin)

## Group Chat Maintenance
- iMessage changes group GUIDs when members are added/removed
- Policy: **allowlist only** (Chris's decision, do NOT change to allowAll)
- Current Watts Football Pool GUID: `iMessage;+;7a86bd1e528944bf935389d6536d1e19`
- **2026-02-27: Group REMOVED from BlueBubbles config** — Chris reported unwanted responses + members getting kicked
  - Root cause: `requireMention` only blocks inbound responses, not proactive `message` tool sends
  - Member kicks were NOT caused by King Koopa (no remove capability via BlueBubbles)
  - Group stays removed until Chris says otherwise
- **groupAllowFrom format:** `chat_guid:any;+;<uuid>` (NOT `iMessage;+;<uuid>`)
- Groups config key also uses `chat_guid:any;+;` prefix

## Products
- **OHaaS (OpenClaw Hardening as a Service)** — https://www.ohaas.com
  - By Ask Sage, early beta
  - Chris is a **product admin** — can provide pilot user access
  - Enterprise/gov-grade OpenClaw deployments on hardened multi-tenant Kubernetes
  - FIPS 140-3 validated, zero CVE base images, 8 auth modes (CAC/PIV, YubiKey, OIDC, etc.)
  - Security watcher sidecar, DLP, prompt injection detection, malicious code detection
  - Targets DoD IL4/IL5/IL6 and FedRAMP High
  - Detailed notes: `memory/ohaas-product-notes.md`
  - **Pitch targets:** Marty (gov worker, software dev)

## Cron Jobs
- **NFL Weekly Offseason Update** (job ID: 411c90d1-4cfc-4312-a2ca-0640b9f57107)
  - Every Tuesday at 9 AM ET
  - Fetches fresh NFL news, writes Koopa-style update, sends to Watts Football Pool iMessage group
  - Target: `chat_guid:any;+;7a86bd1e528944bf935389d6536d1e19` via bluebubbles
  - Will need to transition to in-season format when NFL season starts (Sept 2026)
  - First manual send: 2026-02-24 (Combine Week edition)

### D&D Campaign / DM Engine Project 🐉🎲 (started 2026-02-27)
- **Goal:** King Koopa acts as DM for Chris and Martin over chat, running published D&D 5e adventures
- **Target campaign:** Dragonlance: Shadow of the Dragon Queen
- **Test campaign:** D&D vs Rick and Morty (Lost Dungeon of Rickedness)
- **Players:** Chris + Martin (+4915122019645)

#### DDB Integration (VALIDATED ✅)
- **Cobalt cookie:** `~/.openclaw/secrets/ddb-cobalt.txt`
- **DDB account:** elronse (cwatts7622@me.com)
- **Auth endpoint:** `auth-service.dndbeyond.com/v1/cobalt-token`
- **Access confirmed:** items (2,854), spells (555), monsters (5,512 with full stat blocks)
- **DDB campaigns:** Lost in a New Land, Balder's Gate, Dragonlance, Horrors in Barovia, RIT
- ⚠️ Cobalt cookie EXPIRES on logout — don't log out of DDB while pulling data

#### DDB Scraping Pipeline (VALIDATED ✅)
- **Reusable scraper:** `projects/dnd/engine/scrape_ddb.py`
- **Content selector:** `<div class="p-article-content u-typography-format">`
- **URL patterns:** Old format `/sources/<slug>/` or new `/sources/dnd/<slug>/`
- **Key slugs:** ddvram (Rick & Morty), sotdq (Dragonlance), phb (PHB), dmg (DMG), mm (MM)
- **Gotcha:** TOC pages may redirect to marketplace even if owned; individual chapters work fine

#### Content Library (projects/dnd/)
| File | Content | Size |
|------|---------|------|
| rick-and-morty-adventure.md | Full R&M adventure | 346 KB |
| dragonlance-shadow-of-the-dragon-queen.md | Full SotDQ | 680 KB |
| players-handbook-2014.md | PHB 2014 (main) | 893 KB |
| players-handbook-2014-classes.md | All 12 class guides | 299 KB |
| dungeon-masters-guide-2014.md | DMG 2014 | 1,151 KB |
| monster-manual-2014.md | MM 2014 | 1,174 KB |
| **Total** | | **4.5 MB** |

#### DM Engine (projects/dnd/engine/)
- `dice.py` — Dice roller (standard rolls, attacks, checks, initiative)
- `CAMPAIGN_STATE.md` — Tracks party, HP, inventory, location, combat
- `DM_GUIDE.md` — DM principles and session management rules
- `scrape_ddb.py` — Reusable DDB content scraper

#### Architecture Decision (2026-02-27)
- DDB Maps VTT: NO public API, closed platform, can't control programmatically
- **Foundry VTT is the chosen platform** for visual maps + tactical play
  - Chris has Foundry VTT available on his network, may install on this Mac
  - Plan: Foundry + DDB Importer + King Koopa controlling Foundry via API = full DM stack
  - Need to research: Foundry's API/websocket for programmatic token movement, fog of war, combat
- For text-only play (WhatsApp): theater of the mind + ASCII maps works fine

#### Test Campaign Status
- Chris chose **Keth Silverson** (Half-Orc Rogue, Urchin, Level 1)
- Opening narration delivered, then paused for architecture planning
- Chris wants to get Foundry integrated before continuing serious play

## Origin
- Created 2026-02-23 by Toadstool 🍄 (sister instance) on behalf of Chris
- Migrated NFL Pick 'Em project from Toadstool's workspace
