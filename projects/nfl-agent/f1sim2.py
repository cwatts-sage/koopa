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

def spearman(a,b):
    n=len(a); ra={v:i for i,v in enumerate(a)}; rb={v:i for i,v in enumerate(b)}
    d2=sum((ra[k]-rb[k])**2 for k in ra)
    return 1-6*d2/(n*(n*n-1))

f1_acc=[]; st_acc=[]
for trial in range(300):
    random.seed(trial)
    P=[f"P{i+1}" for i in range(10)]
    skill={p:random.uniform(0.52,0.66) for p in P}
    truth=[p for p,_ in sorted(skill.items(),key=lambda x:-x[1])]
    cf={p:0.0 for p in P}; cs={p:0 for p in P}
    for w in range(18):
        wk={p:sum(random.random()<skill[p] for _ in range(16)) for p in P}
        for p,v in wk.items(): cs[p]+=v
        for p,v in award(wk).items(): cf[p]+=v
    f1_acc.append(spearman(truth,[p for p,_ in sorted(cf.items(),key=lambda x:-x[1])]))
    st_acc.append(spearman(truth,[p for p,_ in sorted(cs.items(),key=lambda x:-x[1])]))

print(f"300 simulated 18-week seasons, 10 players")
print(f"  F1 scoring   — avg rank correlation w/ true skill: {sum(f1_acc)/len(f1_acc):.3f}")
print(f"  Straight     — avg rank correlation w/ true skill: {sum(st_acc)/len(st_acc):.3f}")
print()
better=sum(1 for a,b in zip(f1_acc,st_acc) if a>b)
print(f"  F1 identified the better player more accurately in {better}/300 seasons ({100*better/300:.0f}%)")
