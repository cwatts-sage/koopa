# D&D Campaign Project — Status & Plan
*Last updated: 2026-02-28*

## Project Goal
King Koopa acts as an AI Dungeon Master for Chris and Martin, running published D&D 5e adventures with full visual VTT support.

## Current Status: PHASE 1 COMPLETE — WAITING ON FOUNDRY INSTALL

---

## What's Done ✅

### DDB Integration
- Cobalt cookie authentication validated
- Reusable scraper built (`engine/scrape_ddb.py`)
- Can pull any owned sourcebook from DDB via chapter URLs
- Monster/spell/item API access confirmed (5,512 monsters, full stat blocks)

### Content Library (projects/dnd/)
- ✅ Player's Handbook 2014 (893 KB + 299 KB classes)
- ✅ Dungeon Master's Guide 2014 (1,151 KB)
- ✅ Monster Manual 2014 (1,174 KB)
- ✅ Dragonlance: Shadow of the Dragon Queen (680 KB)
- ✅ D&D vs Rick and Morty adventure (346 KB)
- Text only — images not downloaded (option open to add later)

### DM Engine (engine/)
- ✅ Dice roller (`dice.py`) — standard rolls, attacks, checks, initiative
- ✅ Campaign state tracker (`CAMPAIGN_STATE.md`)
- ✅ DM guide and principles (`DM_GUIDE.md`)

### Architecture Decision
- ✅ Foundry VTT chosen as visual platform (over DDB Maps VTT — no API)
- ✅ Integration plan written (`FOUNDRY_INTEGRATION_PLAN.md`)
- ✅ Custom module approach selected ("king-koopa-dm")

### GitHub Backup
- ✅ Repo: github.com/cwatts-sage/koopa.git
- ✅ Deploy key configured for auto push/pull

---

## What's Next 🔜

### Phase 2: Foundry VTT Setup (BLOCKED — waiting on Chris)
- [ ] Chris installs Foundry VTT on this Mac
- [ ] Install D&D 5e game system
- [ ] Install DDB Importer module
- [ ] Import Rick and Morty adventure as test
- [ ] Import Shadow of the Dragon Queen

### Phase 3: King Koopa Foundry Module
- [ ] Build "king-koopa-dm" module skeleton
- [ ] Implement REST API endpoints (chat, dice, tokens, combat, fog, scenes)
- [ ] Test basic connectivity: King Koopa → HTTP → Foundry
- [ ] Expand with full DM action set

### Phase 4: Test Campaign
- [ ] Run Rick and Morty with Chris (solo test)
- [ ] Validate DM quality and Foundry integration
- [ ] Iterate on any issues

### Phase 5: Full Campaign
- [ ] Invite Martin
- [ ] Run Dragonlance: Shadow of the Dragon Queen
- [ ] Levels 1-11, full adventure

---

## Key Files
| File | Purpose |
|------|---------|
| `STATUS.md` | This file — project overview & plan |
| `engine/FOUNDRY_INTEGRATION_PLAN.md` | Detailed Foundry module architecture |
| `engine/DM_GUIDE.md` | DM principles and session rules |
| `engine/CAMPAIGN_STATE.md` | Active campaign state (Rick & Morty test) |
| `engine/dice.py` | Dice roller script |
| `engine/scrape_ddb.py` | DDB content scraper |

## Key Info
- **DDB Account:** elronse (cwatts7622@me.com)
- **Cobalt cookie:** ~/.openclaw/secrets/ddb-cobalt.txt (expires on DDB logout)
- **DDB Auth:** auth-service.dndbeyond.com/v1/cobalt-token
- **Players:** Chris (+14438571551), Martin (+4915122019645)
- **Test character:** Keth Silverson (Half-Orc Rogue, Level 1)
