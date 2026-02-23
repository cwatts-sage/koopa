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

## Technical Notes
- `imsg send` requires Automation permission (AppleEvents) for node → Messages.app
- If sending hangs, check TCC.db or run `tccutil reset AppleEvents`
- George's number: +13038879556

## Origin
- Created 2026-02-23 by Toadstool 🍄 (sister instance) on behalf of Chris
- Migrated NFL Pick 'Em project from Toadstool's workspace
