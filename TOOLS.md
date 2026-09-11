# TOOLS.md - Local Notes

## Message Delivery (MUST FOLLOW)

**Always use the `message` tool for replies.** Do NOT rely on turn-context (inline) replies.

```
message(action="send", channel="<CHANNEL>", target="<sender_id>", message="...")
```

After sending via `message` tool, respond with ONLY: `NO_REPLY`

**Why:** The inline reply path is tied to the inbound request lifecycle. On long turns (30+ seconds of tool execution), the reply context expires and messages are silently dropped. The `message` tool uses proactive delivery which works independently.

**Target mapping:**
- Chris: `+14438571551`
- George: `+13038879556`

**Channel selection:**
- Use whichever channel the inbound message came from (check inbound metadata)
- iMessage: `channel="imessage"` (native imsg bridge — BlueBubbles REMOVED 2026-05-30)
- WhatsApp: `channel="whatsapp"`

**iMessage (imsg) notes:**
- Backend: `/opt/homebrew/bin/imsg` v0.14.2 (steipete/tap/imsg)
- Group send target format: `any;+;7a86bd1e528944bf935389d6536d1e19` (NOT old bluebubbles `chat_guid:` prefix)

### ⚠️ CLI fallback: use `send-rich`, NOT `send` (verified 2026-09-11)

If the `message` tool is unavailable (not always in the policy-filtered toolset):

```
imsg chats                          # find numeric chat id
imsg group --chat-id <id>           # get the guid
imsg send-rich --chat 'iMessage;-;+14438571551' --text "..."
imsg history --chat-id <id> --limit 1   # ALWAYS verify delivery
```

- ❌ `imsg send --chat-id +1443...` → "Unknown chat id". `--chat-id` wants the
  **numeric** id from `imsg chats`, not a phone number.
- ❌ `imsg send --chat-id 2 --text ...` → **HANGS indefinitely** (AppleScript
  path), gets SIGKILLed, and the message does **NOT** deliver.
- ✅ `imsg send-rich --chat '<guid>' --text ...` → "queued", exit 0, delivers in
  seconds. Routes through the IMCore bridge (needs `imsg launch` + SIP disabled;
  check with `imsg status`).
- **Never report a send as successful without checking `imsg history`.** A killed
  or hung send looks like it might have worked and did not.

**Known chat ids:** Chris = `2` (`iMessage;-;+14438571551`) · George = `12`
(`+13038879556`) · Watts Football Pool group = `3`
(`7a86bd1e528944bf935389d6536d1e19`)
- Private API (reactions/replies/effects) requires `imsg launch` (dylib injection; SIP disabled). Re-run `imsg launch` if Messages.app restarts.
- Restart gateway with: `launchctl kickstart -k gui/501/ai.openclaw.gateway` (NOT `openclaw gateway restart` — fails port-busy from inside)

**Formatting Tips:**
- iMessage: Standard markdown works, keep messages under 10,000 chars
- WhatsApp: No headers — use **bold** or CAPS for emphasis
- Keep messages concise

---

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
