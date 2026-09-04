import random
F1=[25,18,15,12,10,8,6,4,2,1]
def award(scores):
    order=sorted(set(scores.values()),reverse=True); pts={}; idx=0
    for s in order:
        tied=[n for n,v in scores.items() if v==s]
        slots=[F1[i] if i<len(F1) else 0 for i in range(idx,idx+len(tied))]
        share=sum(slots)/len(tied)
        for n in tied: pts[n]=share
        idx+=len(tied)
    return pts

f1_alive=[]; st_alive=[]; f1_lead=[]; st_lead=[]
for trial in range(300):
    random.seed(1000+trial)
    P=[f"P{i+1}" for i in range(10)]
    skill={p:random.uniform(0.52,0.66) for p in P}
    cf={p:0.0 for p in P}; cs={p:0 for p in P}
    for w in range(18):
        wk={p:sum(random.random()<skill[p] for _ in range(16)) for p in P}
        for p,v in wk.items(): cs[p]+=v
        for p,v in award(wk).items(): cf[p]+=v
        if w==12:  # after week 13, how many still mathematically/realistically alive?
            rem=18-1-w
            # F1: max 25+1 per remaining week (ignore fastest lap for simplicity -> 25)
            lead=max(cf.values()); alive=sum(1 for v in cf.values() if v+25*rem>=lead)
            f1_alive.append(alive)
            leadS=max(cs.values()); aliveS=sum(1 for v in cs.values() if v+16*rem>=leadS)
            st_alive.append(aliveS)
    # final gap between 1st and 2nd, normalized
    sf=sorted(cf.values(),reverse=True); ss=sorted(cs.values(),reverse=True)
    f1_lead.append((sf[0]-sf[1])/sf[0]*100)
    st_lead.append((ss[0]-ss[1])/ss[0]*100)

print("After Week 13, players still mathematically alive (avg of 300 seasons, 10 players):")
print(f"  F1 scoring : {sum(f1_alive)/len(f1_alive):.1f} / 10")
print(f"  Straight   : {sum(st_alive)/len(st_alive):.1f} / 10")
print()
print("Final margin of victory (1st over 2nd, % of winner's total):")
print(f"  F1 scoring : {sum(f1_lead)/len(f1_lead):.1f}%")
print(f"  Straight   : {sum(st_lead)/len(st_lead):.1f}%")
