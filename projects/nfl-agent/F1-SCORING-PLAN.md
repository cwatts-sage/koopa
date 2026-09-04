# F1-Style Scoring — plan + simulation results

**Requested by Chris** 2026-09-03 23:01: *"Give me a plan on how it would look to have
the pool use a point system like F1 point system."*
**Status:** ⏸️ Not built. Awaiting Geo's opinion (Chris is forwarding) + Chris's go/no-go.
**Written:** 2026-09-04

---

## The format

Each week, rank all players by correct picks (out of 16). Award by finishing position:

| Pos | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th | 10th | 11th+ |
|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|-------|
| Pts | 25 | 18 | 15 | 12 | 10 | 8 | 6 | 4 | 2 | 1 | 0 |

- **Ties:** split the pot. Two tied for 1st share 25+18=43 → 21.5 each; next player gets 15.
- **Scope:** regular season only. Per Chris (09-03 23:05), **playoffs are a separate
  weekly scoring pool**, handled independently.
- **Optional:** +1 "fastest lap" for the single highest score of the week.

---

## ⚠️ Simulation results — I need to correct my own pitch

I ran 300 simulated 18-week seasons with 10 players (skill range 52–66% per game,
16 games/week) comparing F1 vs straight cumulative.

### 1. Ties are constant, not occasional
| | rate |
|---|---|
| Weeks with **any** tie | **100%** |
| Weeks with a tie **for 1st** | **32%** |

With 10 players over 16 games, ties are guaranteed every single week. **Pot-splitting
isn't an edge case — it's core mechanics and must be implemented from day one.**

### 2. F1 is slightly WORSE at identifying the best player
Rank correlation with true skill, averaged over 300 seasons:
| scoring | correlation |
|---|---|
| Straight cumulative | **0.759** |
| F1 grid | 0.745 |

F1 ranked the field more accurately in only **39%** of seasons. Position-based scoring
discards margin — going 14/16 vs 9/16 both pay 25 if you win the week.

### 3. ❗ F1 does NOT keep the race closer — it does the opposite
This directly contradicts what I told Chris ("nobody can run away with it"):

| | F1 | Straight |
|---|---|---|
| Final margin, 1st over 2nd | **10.7%** | **3.7%** |
| Players alive after Wk 13 | 9.4 / 10 | 10.0 / 10 |

**F1 spreads the field out ~3x more than straight scoring.** A player who wins several
weeks banks 25s while everyone else collects single digits. Straight cumulative is
naturally self-compressing because everyone scores 8–12 most weeks.

**My original pitch was wrong on this point and Chris should not decide based on it.**

---

## So is F1 still worth doing?

**Yes — but for the honest reason, not the one I gave.**

F1's real value is **narrative**, not fairness or closeness:
- A week becomes a *race with a winner*, not "+9 to your total."
- Weekly wins are memorable and trash-talkable. "I won Week 3" beats "I'm on 47."
- It rewards showing up every week rather than one hot streak.

What it costs:
- Slightly less accurate at crowning the genuinely best picker.
- A **bigger** final gap, so the title may be settled before Week 18.

**If the goal is "most fun week to week" → F1.**
**If the goal is "fairest crown + tightest title race" → straight cumulative.**

A middle option worth considering: **keep straight cumulative as the season standings,
and add weekly F1 points as a parallel "Race Wins" leaderboard.** Both narratives, no
tradeoff — and it's barely more work than either alone.

---

## Implementation notes (if approved)

Scoring already computes `correct` per player per week in `scripts/score-week.js`;
F1 points are a pure post-processing step on top of that.

1. `scripts/score-week.js` — after computing per-player `correct`, rank and award F1
   points with pot-splitting. Store as `weeklyF1` alongside existing `weeklyScores`.
2. `api/standings/index.js` — sort by F1 total; keep raw correct as the displayed
   tiebreak/secondary column.
3. Storage: add `f1Points` to standings rows. Existing `totalPoints` stays as raw correct
   so nothing already recorded is lost or rewritten.
4. **Tiebreaker doc becomes moot for weekly scoring** (pot-splitting handles it), but is
   still needed for the **season-final** standings if two players finish level on F1 points.

⚠️ **Timing:** ship for Week 1 or not at all this season. If the roster grows from 6 to 10
mid-season, the grid changes shape underneath players and early weeks get scored on a
different curve than later ones.

## Open questions for Geo (Chris is forwarding)
1. Position-based scoring vs straight cumulative — more fun, or does it punish a great week?
2. If someone doesn't submit picks: zero, or still collect points for showing up?
3. With 10+ players, 11th and back earns nothing. Fair, or minimum 1 pt for submitting?

---

## ✅ Implementation feasibility — verified 2026-09-04

I checked the claim "F1 points are a pure post-processing step" rather than asserting it.

**It holds.** `scripts/score-week.js` already builds a `weekScores` map
(`rowKey -> {name, correct, total}`) at line ~186, *before* any standings writes. F1
points can be computed from that map with no changes to fetching, matching, or scoring.

**Working award function written and tested** — `projects/nfl-agent/f1-award-function.js`
(`node f1-award-function.js` to run the cases):

| case | result |
|---|---|
| 10 players, no ties | 25/18/15/12/10/8/6/4/2/1 — pot 101.0 ✅ |
| 2-way tie for 1st | 21.5 / 21.5, next gets 15 ✅ |
| 3-way tie for 1st | 19.3 each, next gets 12 ✅ |
| all 5 tied | 16.0 each ✅ |
| 12 players | 11th & 12th get 0 ✅ |
| small pool (3) | 25/18/15 ✅ |

**Pot conservation verified:** every 10-player case totals exactly 101.0 (=sum of the grid).

⚠️ **Known rounding artifact:** a 3-way tie splits 58/3 = 19.333…, stored as 19.3, so the
week totals 100.9 instead of 101.0 — a **0.1 point drift**. Harmless, but don't let it
look like a bug later. Alternative if it ever matters: store F1 points ×10 as integers.

**Remaining work if approved is small:** call `awardF1Points(weekScores)` in
`score-week.js`, persist as `weeklyF1` + `f1Points` on standings rows, and add the column
to `api/standings`. Existing `totalPoints` (raw correct) stays untouched — which is exactly
what the recommended "straight standings + parallel Race Wins board" option needs.
