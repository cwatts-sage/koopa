# Tiebreaker: still undecided — needs Chris's call

**Status:** ⏸️ NOT IMPLEMENTED. Flagged 2026-09-01, T-8 days to kickoff.
**Why it matters now:** 5 players, 16 games/week. Ties are not an edge case —
they're likely in Week 1.

---

## Current behavior (verified in code)

- `api/standings/index.js:35` sorts **purely** by `totalPoints`:
  ```js
  standings.sort((a, b) => b.totalPoints - a.totalPoints);
  standings.forEach((s, i) => { s.rank = i + 1; });
  ```
- **No tiebreaker logic exists anywhere** — not in `score-week.js`, not in
  `api/standings/`, not in `api/picks/`.
- Consequence: two players on 11 points get ranks **1 and 2 arbitrarily**,
  decided by whatever order Azure Table Storage returns rows in. Non-deterministic
  and unexplainable to the pool.
- `api/picks/index.js` does **not** accept or store any tiebreaker input today.

## What the data model already supports

Matchup rows already carry `awayScore` / `homeScore`, and `score-week.js` writes
real scores. So a **total-points tiebreaker needs no new data plumbing on the
results side** — only a way to collect each player's guess.

---

## Options

### Option A — MNF total points (classic, recommended)
Player predicts combined score of the week's last game. Closest wins; ties broken
by not-going-over, then earliest submission.
- Week 1's last game is **Broncos @ Chiefs, Mon 9/14 8:15 PM ET** — a great one.
- **Cost:** add one numeric field to the pick form + `api/picks`, one comparison in
  standings sort.
- **Pro:** universally understood, decisive, feels like a real pool.

### Option B — Earliest submission wins
Whoever submitted their card first wins the tie. `submittedAt` is **already stored**.
- **Cost:** ~2 lines in the standings sort. No UI change, no new input.
- **Pro:** zero friction, shippable today.
- **Con:** rewards speed over skill; can feel arbitrary.

### Option C — Leave ties as shared rank
Show joint 1st, no winner declared.
- **Cost:** small fix so tied players show the SAME rank (current code wrongly
  gives them different ranks).
- **Con:** unsatisfying if there's a prize or bragging rights on the line.

---

## Recommendation

**Option A** if Chris wants it done properly — it's the format everyone expects,
and Week 1 hands us a perfect MNF game for it.

**Option B** as the pragmatic fallback if we're tight on time before the 9th; it's
a couple of lines and beats non-deterministic ordering.

⚠️ **Either way, one thing should be fixed regardless:** tied players currently
receive *different* ranks based on arbitrary row order. Even under Option C that's
a bug worth correcting.

## Blocking question for Chris
Which option — and if A, should the tiebreaker be **required** or optional on the
pick form? (Required is cleaner for scoring; optional is friendlier for latecomers.)
