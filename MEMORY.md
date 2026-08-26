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

## Message Delivery — CRITICAL BEHAVIOR RULES (updated 2026-05-30)
- **ALWAYS use the `message` tool (proactive delivery)** for replies
- Do NOT rely on turn-context (inline) replies — they fail on long turns (30+ sec)
- Use `NO_REPLY` after sending via `message` tool to prevent duplicates
- Channel: use whichever channel the inbound message came from (**imessage** or whatsapp)
- Target: use sender phone number from inbound metadata (e.g. `+14438571551` for Chris)
- Details in TOOLS.md "Message Delivery" section

## iMessage Migration (BlueBubbles REMOVED) — 2026-05-30
- **BlueBubbles support was REMOVED from OpenClaw** (confirmed in v2026.5.27 docs)
- **Now using native `imsg` bridge** via `@openclaw/imessage` plugin (enabled)
- **imsg CLI:** `/opt/homebrew/bin/imsg` v0.10.0 (installed via `brew install steipete/tap/imsg`)
- **Private API bridge:** LIVE — `imsg launch` injected dylib into Messages.app; `advanced_features: true` (reactions, replies, edits, effects, group mgmt all work)
- **SIP is disabled** on this Mac (required for imsg launch / private API)
- **Channel config:** `channels.imessage` — dmPolicy=allowlist, groupPolicy=allowlist
  - cliPath: `/opt/homebrew/bin/imsg`, dbPath: `/Users/kingkoopa/Library/Messages/chat.db`
  - allowFrom: all pool members + contacts (Chris, Steph, Geo, Marty, McKenzie, Jim, Ralph, Martin, Gabe, Alex, Ryan, Steve)
  - actions enabled: reactions, edit, unsend, reply, sendWithEffect, sendAttachment
  - group actions (rename/icon/add/remove/leave) DISABLED for safety
- **imsg chat IDs:** Chris=2, Geo=3038879556→id12, Ryan=11, Steve=13, group=3
- **Watts Football Pool group:** chat id 3, guid `any;+;7a86bd1e528944bf935389d6536d1e19`
  - **groupAllowFrom is EMPTY (group dormant)** — per Chris's standing decision to keep football group off until he re-enables (was removed for unwanted responses 2026-02-27)
- **iMessage group target format for sends:** `any;+;7a86bd1e528944bf935389d6536d1e19` (NOT the old `chat_guid:any;+;` bluebubbles format)
- **Restart method that works:** `launchctl kickstart -k gui/501/ai.openclaw.gateway` (atomic; `openclaw gateway restart` fails with 'port still busy' when run from inside the gateway)

## Upgrade Playbook (learned 2026-08-26)
- **Backup first:** commit+push workspace (`cwatts-sage/koopa`) AND the nfl webapp submodule (`cwatts-sage/NFL`, uses ssh alias `github.com-nfl`); snapshot config to `~/.openclaw/backups/openclaw.json.<ts>`
- **⚠️ NODE ENGINE GATE:** new OpenClaw versions hard-block (not warn) on old Node. 2026.7.1-2 required Node >=22.22.3; we were on 22.22.0 and `openclaw` refused to run at all after npm install.
  - **Fix:** `brew upgrade node@22` (kept us on the 22.x line — no need to jump to node@24 / repoint the LaunchAgent). Went 22.22.0_1 → 22.23.2_1.
  - node@22 is keg-only; binary lives at `/opt/homebrew/opt/node@22/bin/node` and the LaunchAgent points there.
  - Check BEFORE restarting the gateway — the running gateway keeps the old code in memory, so a bad restart is what actually kills you.
- **Restart:** `launchctl kickstart -k gui/501/ai.openclaw.gateway`
  - This restarts the gateway you're running inside, so the exec tool result is usually LOST ("missing tool result" synthetic error). That's expected — just re-check `openclaw gateway status` in a fresh call instead of assuming failure.
- **Verify:** `openclaw gateway status` (version + pid + probe ok) and `openclaw models list`

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

## Model Provider Setup (Ask Sage) — updated 2026-08-26
- **Default:** `asksage-anthropic/google-claude-opus-5` (**Claude Opus 5**, 1M ctx, reasoning ON) ⬅️ upgraded 2026-08-26
- **Fallbacks:** Opus 4.8 → Sonnet 5 → Claude 4.6 Sonnet → Gemini 2.5 Pro
- **Verified working 2026-08-26** via `POST https://api.asksage.ai/server/anthropic/v1/messages` with header `x-api-key`, body `{"model":"google-claude-opus-5",...}` — returned text + a `thinking` block (reasoning confirmed)
- **New Claude 5 family IDs on Ask Sage:** `google-claude-opus-5`, `google-claude-sonnet-5`, `google-claude-fable-5`
- **🔑 How to discover live Ask Sage model IDs:**
  `curl -s -X POST https://api.asksage.ai/server/get-models -H "x-access-tokens: $KEY" -H "Content-Type: application/json" -d '{}'`
  (94 models as of 2026-08-26; also lists gemini-3 family + image models)
- **Three providers registered** per latest Ask Sage docs (docs.asksage.ai/docs/v2/integrations/openclaw.html):
  - `asksage-anthropic` → Claude Opus 4.8, Claude Opus 4.7, Claude 4.6 Sonnet
  - `asksage-openai` → GPT 4.1, O3 Mini
  - `asksage-google` → Gemini 2.5 Pro, Gemini 2.5 Flash
- **Note:** Opus 4.8 not yet in official docs but available via Ask Sage (model ID `google-claude-48-opus`)
- **One API key** powers all three (stored in openclaw.json)
- **Migration notes:**
  - Old provider `custom-api-asksage-ai` removed (had only Opus 4.6 at 200K ctx)
  - `openclaw onboard` CLI only supports `--custom-compatibility openai|anthropic` (no google yet) — use `openclaw config patch` for Google/Gemini provider
  - `openclaw config patch` and `openclaw config unset` bypass the agent-side protected-paths safety guard (they use the trusted writer path)
  - Switch models via: `openclaw models set <provider>/<model-id>`
  - Manage fallbacks: `openclaw models fallbacks add|remove|list|clear`

## Image Generation in iMessage (PENDING Ask Sage Nano Banana launch) — 2026-05-30
- **Chris is Director of Engineering at Ask Sage.** Monday (2026-06-01) Ask Sage releases new GCP image models: **Nano Banana** and **Nano Banana Pro**.
- **Goal:** Let Koopa Troop users request images in iMessage chats ("make me X") and get them delivered as native iMessage attachments.
- **OpenClaw side is READY (verified 2026-05-30):**
  - `image_generate` tool is built-in, auto-enables when an image provider is configured
  - Async pipeline: agent requests → background task → completion sends image via `message` tool → lands as iMessage attachment
  - iMessage channel already has `sendAttachment: true` enabled ✅
  - OpenClaw docs already reference "Nano Banana 2 edits (up to 14 ref images)" via fal provider — lineage known
- **Integration paths (TBD which Ask Sage uses):**
  - Path A (cleanest): Ask Sage as Google-native image provider — `google/<model>` with `models.providers.google.baseUrl` → Ask Sage google endpoint, `:generateContent` w/ responseModalities IMAGE, or `:predict`
  - Path B: Ask Sage OpenAI-compatible `/images/generations` (DALL-E style) → point openai image provider baseUrl at Ask Sage
- **TEST RESULT 2026-05-30:** Calling existing `google-gemini-2.5-flash-image` via Ask Sage `/server/google/v1beta/...:generateContent` returned TEXT describing the image, not an actual image. So image output needs correct model ID + response modality flag — exact contract TBD.
- **4 OPEN QUESTIONS for Chris/Ask Sage source-code bot:**
  1. Exact model IDs for Nano Banana / Nano Banana Pro?
  2. Endpoint shape: Google `:generateContent` (responseModalities IMAGE)? `:predict` (Imagen-style)? or OpenAI `/images/generations`?
  3. Same base URL (`api.asksage.ai/server/google/v1beta`) or new image path?
  4. Same API key or separate image quota/credential?
- **Status: WAITING on Chris** — he's checking with his team / a bot with direct Ask Sage source access. Once answers arrive: register image model, set imageGenerationModel.primary=Nano Banana Pro (fallback Nano Banana), restart, test end-to-end to Chris's iMessage.

## Origin
- Created 2026-02-23 by Toadstool 🍄 (sister instance) on behalf of Chris
- Migrated NFL Pick 'Em project from Toadstool's workspace
