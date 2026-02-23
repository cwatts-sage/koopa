# Tiebreaker Options — Decision Pending

## Background
George previously used MNF combined score (closest without going over) for the manual pool. We want to decide on a tiebreaker method before the 2026 season.

## Options

### 1. MNF Combined Score (familiar)
- Pick total combined score of Monday Night Football game
- Closest without going over wins the tiebreaker
- **UI:** One extra text field on picks page
- **Pros:** Simple, everyone knows it, easy to implement
- **Cons:** Only breaks ties, doesn't add strategy

### 2. Confidence Points (recommended)
- Rank picks by confidence (16 pts for most confident, 1 for least)
- Correct picks earn assigned points
- **UI:** Drag-to-rank or assign numbers
- **Pros:** Eliminates most ties, adds strategy, more engaging
- **Cons:** More complex UI, bigger change to the game

### 3. Most Upsets Picked Correctly
- Tiebreaker goes to whoever correctly picked more underdogs (by betting line)
- **UI:** No extra input needed
- **Pros:** Rewards boldness, automated
- **Cons:** Need a betting line data source

### 4. Head-to-Head Split
- On games where tied players disagreed, whoever got more of *those* right wins
- **UI:** No extra input needed
- **Pros:** Completely automated, fair
- **Cons:** Could still result in a tie

### 5. Submission Speed
- Earlier submission wins
- **Pros:** Zero effort
- **Cons:** Feels unfair, punishes people who wait for injury news

### 6. Decimal Points (score + prediction/1000)
- Combined score prediction makes ties nearly impossible
- **Pros:** Simple, one field
- **Cons:** Feels hacky

## Decision
**TBD** — revisit before 2026 season implementation
