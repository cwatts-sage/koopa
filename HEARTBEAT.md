# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.

## iMessage Bridge Watchdog (typing + read receipts)
- Run: `/opt/homebrew/bin/imsg status`
- If it reports "Advanced features (typing, read receipts): Not available":
  - Run `/opt/homebrew/bin/imsg launch` to re-inject the dylib
  - Verify with `imsg status` (want: "Available - IMCore bridge connected")
  - Tell Chris it dropped and was restored
- If `imsg launch` FAILS, tell Chris — do not retry in a loop
- Frequency: once per day is plenty (cheap check)
- Why: the injected dylib does NOT survive Messages.app restarting (reboot, app update,
  crash). It silently died sometime after 2026-05-30 and nobody noticed until 2026-08-28.
- Note: `imsg launch` restarts Messages.app. Harmless, but don't run it repeatedly.

## Saddle Watch for Ryan (+19402849222)
- Looking for: **R.E. Donahoe / R.E. Donaho** and **Bill Barton** saddles
- **Run:** `~/.openclaw/workspace/scripts/saddle-watch.sh` (default 15 pages, ~60s)
  - exit 0 = no hits (stay quiet) | exit 10 = HITS, script prints titles + URLs
- If hits: send listing details to Ryan via imessage at `+19402849222`
- Frequency: 1-2x per week
- **Notes / gotchas (learned 2026-08-29):**
  - `web_search` has NO provider on this box — don't bother, it errors out
  - eBay returns 403 to web_fetch (bot-blocked)
  - RanchWorldAds has NO keyword search; its `listing` field is an ad-NUMBER lookup.
    Only way is crawling Saddles category `cat_id=12` sorted newest-first — that's what the script does
  - Last full sweep 2026-08-29: 645 listings, zero matches
