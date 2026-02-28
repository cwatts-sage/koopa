# Foundry VTT Integration Plan — King Koopa DM Engine

## Architecture Overview

Foundry VTT is a **self-hosted Node.js web application** that serves a browser-based VTT to clients.
It uses **socket.io websockets** for real-time client-server communication. There is NO official REST API.

### How Foundry Works Internally
- **Server:** Node.js app (Express + socket.io) that manages game state, database (NeDB/LevelDB), and file serving
- **Client:** Browser-based JavaScript app that renders the canvas (maps, tokens, fog) and handles UI
- **Communication:** All game actions (move token, roll dice, chat messages) go through socket.io events
- **Database:** Each world stores documents (Actors, Scenes, Items, JournalEntries, etc.) in flat files under `{userData}/Data/worlds/{worldId}/data/`
- **Modules:** Plugins installed in `{userData}/Data/modules/` that hook into the client-side API via JavaScript

## Integration Approaches (Best to Worst)

### Approach 1: Custom Foundry Module (RECOMMENDED ✅)
Build a Foundry module that:
1. Exposes a **local HTTP REST API** (Express routes added to Foundry's server)
2. King Koopa calls this API to perform DM actions
3. The module executes client-side API calls on the GM's behalf

**What the module would expose:**
```
POST /api/koopa/token/move       — Move a token to x,y coordinates
POST /api/koopa/token/create     — Place a new token on the scene
POST /api/koopa/combat/start     — Start a combat encounter
POST /api/koopa/combat/next      — Advance to next turn
POST /api/koopa/combat/roll-init — Roll initiative for combatants
POST /api/koopa/fog/reveal       — Reveal fog of war for an area
POST /api/koopa/chat/send        — Send a chat message (narration, rolls)
POST /api/koopa/scene/activate   — Switch to a different scene/map
POST /api/koopa/dice/roll        — Roll dice with results shown in Foundry
GET  /api/koopa/state            — Get current game state (tokens, combat, etc.)
```

**Pros:** Full programmatic control, real-time, clean API
**Cons:** Need to build the module (JavaScript, Foundry API knowledge)

### Approach 2: Browser Automation (Playwright/Puppeteer)
Connect to Foundry's web interface as GM and automate actions via browser control.

**Pros:** Can use the existing OpenClaw browser tool, no module needed
**Cons:** Fragile, slow, can't easily read game state, breaks with UI changes

### Approach 3: Direct Database Manipulation
Read/write Foundry's world database files directly.

**Pros:** Simple, no module needed
**Cons:** Changes don't propagate to connected clients in real-time, dangerous, may corrupt data

### Approach 4: Socket.io Client
Connect directly to Foundry's socket.io server as a client, mimicking a browser.

**Pros:** Real-time, no module needed
**Cons:** Undocumented protocol, complex auth handshake, very fragile across versions

## Recommended Plan: Custom Module

### Phase 1: Basic Module Setup
1. Create module skeleton in Foundry's modules directory
2. Module registers server-side Express routes (Foundry supports this via `game.socket`)
3. Implement authentication (API key in module settings)
4. Test basic connectivity: King Koopa → HTTP → Foundry

### Phase 2: Core DM Actions
Priority order for what King Koopa needs to control:

1. **Chat Messages** — Send narration text, DM descriptions, roll results to players
2. **Dice Rolling** — Roll dice with visual results in Foundry's chat
3. **Scene Management** — Activate scenes (switch maps between rooms)
4. **Token Management** — Create, move, delete monster tokens
5. **Combat Tracker** — Start combat, roll initiative, advance turns, end combat
6. **Fog of War** — Reveal/hide areas as players explore

### Phase 3: Advanced Features
- Read player token positions to understand tactical state
- Manage HP/conditions on monster tokens
- Play ambient sounds/music
- Show journal entries to players (room descriptions)
- Handle door/wall visibility

## Key Foundry API Classes (Client-Side)

### Primary Document Types We Need:
- **Actor** — Characters and monsters (stat blocks, HP, conditions)
- **Token** (embedded in Scene) — Visual representation on the map (position, visibility)
- **Scene** — A map with tokens, walls, lights, fog
- **Combat** — Combat encounter with initiative tracker
- **Combatant** (embedded in Combat) — A participant in combat
- **ChatMessage** — Chat messages (narration, rolls, whispers)
- **JournalEntry** — Text content (room descriptions, lore)
- **Item** — Equipment, spells, features

### Key Operations:
```javascript
// Move a token
token.update({x: 500, y: 300});

// Create a chat message
ChatMessage.create({content: "The door creaks open...", type: CONST.CHAT_MESSAGE_TYPES.IC});

// Start combat
const combat = await Combat.create({});
await combat.createEmbeddedDocuments("Combatant", [{tokenId: "xxx", actorId: "yyy"}]);
await combat.rollAll(); // Roll initiative for all
await combat.startCombat();

// Activate a scene
scene.activate();

// Reveal fog
canvas.sight.refresh();
```

## DDB Importer Integration

Once Foundry is running with DDB Importer installed:
1. Use Chris's Cobalt cookie to import Shadow of the Dragon Queen
2. This creates all Scenes (maps), Actors (monsters/NPCs), Items, and Journal Entries
3. King Koopa's module can then reference these imported documents by name/ID
4. Adventure text is available both in Foundry's journals AND in our markdown files

## File Structure for the Module
```
{userData}/Data/modules/
  king-koopa-dm/
    module.json          — Module manifest
    scripts/
      api-server.js      — Express REST API routes
      dm-controller.js   — DM action implementations
      config.js          — API key, settings
    lang/
      en.json            — Localization strings
```

## Dependencies
- Foundry VTT v12+ (current stable)
- DDB Importer module (for content import)
- D&D 5e game system (dnd5e)
- Network access between King Koopa's VM and Foundry server

## Next Steps
1. Chris installs Foundry VTT on this Mac
2. Install D&D 5e system and DDB Importer module
3. Import Rick and Morty adventure as test
4. Build king-koopa-dm module with basic chat + dice capabilities
5. Test DM workflow: King Koopa sends commands → Foundry displays to players
6. Expand module with token/combat/fog control
7. Import Dragonlance and run full campaign
