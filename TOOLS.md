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
- BlueBubbles: `channel="bluebubbles"`
- WhatsApp: `channel="whatsapp"`

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
