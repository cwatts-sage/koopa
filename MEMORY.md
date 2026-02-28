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
- **Goal:** King Koopa as AI DM for Chris + Martin, running 5e adventures with Foundry VTT
- **Status:** Phase 1 complete — waiting on Chris to install Foundry VTT on this Mac
- **Full status & plan:** `projects/dnd/STATUS.md`
- **GitHub backup:** github.com/cwatts-sage/koopa.git (deploy key at ~/.ssh/kingkoopa-deploy)

## Origin
- Created 2026-02-23 by Toadstool 🍄 (sister instance) on behalf of Chris
- Migrated NFL Pick 'Em project from Toadstool's workspace
