import random, statistics
F1 = [25,18,15,12,10,8,6,4,2,1]

def award(scores):
    """scores: dict name->correct. Returns dict name->points, splitting pot on ties."""
    order = sorted(set(scores.values()), reverse=True)
    pts = {}
    idx = 0
    for s in order:
        tied = [n for n,v in scores.items() if v == s]
        slots = [F1[i] if i < len(F1) else 0 for i in range(idx, idx+len(tied))]
        share = sum(slots)/len(tied)
        for n in tied:
            pts[n] = share
        idx += len(tied)
    return pts

random.seed(7)
PLAYERS = [f"P{i+1}" for i in range(10)]
WEEKS = 18

# Model: each player has a true skill (win prob per game), 16 games/week
skill = {p: random.uniform(0.52, 0.66) for p in PLAYERS}

cum_f1 = {p:0.0 for p in PLAYERS}
cum_straight = {p:0 for p in PLAYERS}
for w in range(WEEKS):
    wk = {p: sum(random.random() < skill[p] for _ in range(16)) for p in PLAYERS}
    for p,v in wk.items(): cum_straight[p]+=v
    for p,v in award(wk).items(): cum_f1[p]+=v

def rank(d): return [k for k,_ in sorted(d.items(), key=lambda x:-x[1])]
rf1, rst = rank(cum_f1), rank(cum_straight)

print("skill (true) ranking :", [p for p,_ in sorted(skill.items(), key=lambda x:-x[1])])
print("F1 final ranking     :", rf1)
print("Straight final rank  :", rst)
print()
print(f"{'player':7} {'skill':>6} {'F1 pts':>8} {'straight':>9}")
for p in rf1:
    print(f"{p:7} {skill[p]:.3f} {cum_f1[p]:8.1f} {cum_straight[p]:9d}")

# how often do ties occur?
random.seed(11)
tie_weeks=0; total=0; multi=0
for _ in range(500):
    wk = {p: sum(random.random() < skill[p] for _ in range(16)) for p in PLAYERS}
    total+=1
    vals=list(wk.values())
    if len(set(vals))<len(vals): tie_weeks+=1
    # tie specifically for 1st
    top=max(vals)
    if vals.count(top)>1: multi+=1
print()
print(f"weeks with ANY tie      : {tie_weeks}/{total} = {100*tie_weeks/total:.0f}%")
print(f"weeks with tie for 1st  : {multi}/{total} = {100*multi/total:.0f}%")
