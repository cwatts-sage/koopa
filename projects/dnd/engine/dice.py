#!/usr/bin/env python3
"""
King Koopa's Dice Engine 🎲👑
Roll dice for D&D combat and checks.
Usage: python3 dice.py "2d6+3" or python3 dice.py attack 5 13 1d8+3
"""

import random
import sys
import re
import json


def roll_dice(notation: str) -> dict:
    """
    Roll dice from standard notation like '2d6+3', '1d20', '4d6kh3' (keep highest 3).
    Returns dict with rolls, modifier, total, and formatted string.
    """
    notation = notation.strip().lower()
    
    # Parse: NdS[kh/kl N][+/-M]
    match = re.match(r'(\d+)d(\d+)(?:(kh|kl)(\d+))?([+-]\d+)?', notation)
    if not match:
        # Maybe just a flat number
        try:
            val = int(notation)
            return {"rolls": [], "kept": [], "modifier": val, "total": val, "text": str(val)}
        except ValueError:
            return {"error": f"Invalid notation: {notation}"}
    
    num_dice = int(match.group(1))
    die_size = int(match.group(2))
    keep_mode = match.group(3)  # 'kh' or 'kl' or None
    keep_count = int(match.group(4)) if match.group(4) else None
    modifier = int(match.group(5)) if match.group(5) else 0
    
    # Roll the dice
    rolls = [random.randint(1, die_size) for _ in range(num_dice)]
    
    # Apply keep highest/lowest
    if keep_mode == 'kh' and keep_count:
        kept = sorted(rolls, reverse=True)[:keep_count]
    elif keep_mode == 'kl' and keep_count:
        kept = sorted(rolls)[:keep_count]
    else:
        kept = rolls[:]
    
    total = sum(kept) + modifier
    
    # Format string
    rolls_str = str(rolls) if len(rolls) > 1 else str(rolls[0])
    if keep_mode:
        kept_str = f" (kept: {kept})"
    else:
        kept_str = ""
    
    mod_str = f" + {modifier}" if modifier > 0 else (f" - {abs(modifier)}" if modifier < 0 else "")
    text = f"{notation}: [{', '.join(str(r) for r in rolls)}]{kept_str}{mod_str} = {total}"
    
    return {
        "rolls": rolls,
        "kept": kept,
        "modifier": modifier,
        "total": total,
        "text": text,
        "crit": rolls[0] == die_size if num_dice == 1 and die_size == 20 else None,
        "fumble": rolls[0] == 1 if num_dice == 1 and die_size == 20 else None,
    }


def roll_attack(attack_bonus: int, target_ac: int, damage_notation: str, crit_damage: str = None) -> dict:
    """
    Roll a full attack: d20 + bonus vs AC, then damage if hit.
    """
    attack = roll_dice(f"1d20+{attack_bonus}")
    natural = attack["rolls"][0]
    
    result = {
        "attack_roll": attack,
        "natural": natural,
        "target_ac": target_ac,
    }
    
    if natural == 20:
        # Critical hit!
        if crit_damage:
            damage = roll_dice(crit_damage)
        else:
            # Double the dice
            damage = roll_dice(damage_notation)
            damage2 = roll_dice(damage_notation)
            damage["total"] = damage["total"] + damage2["total"] - damage2["modifier"]
            damage["text"] += f" + CRIT {damage2['text']}"
        result["hit"] = True
        result["critical"] = True
        result["damage"] = damage
        result["text"] = f"🎲 Attack: d20+{attack_bonus} = [{natural}]+{attack_bonus} = {attack['total']} — CRITICAL HIT! 💥 Damage: {damage['text']}"
    elif natural == 1:
        result["hit"] = False
        result["critical"] = False
        result["fumble"] = True
        result["text"] = f"🎲 Attack: d20+{attack_bonus} = [{natural}]+{attack_bonus} = {attack['total']} — CRITICAL MISS! 😬"
    elif attack["total"] >= target_ac:
        damage = roll_dice(damage_notation)
        result["hit"] = True
        result["critical"] = False
        result["damage"] = damage
        result["text"] = f"🎲 Attack: d20+{attack_bonus} = [{natural}]+{attack_bonus} = {attack['total']} vs AC {target_ac} — HIT! Damage: {damage['text']}"
    else:
        result["hit"] = False
        result["critical"] = False
        result["text"] = f"🎲 Attack: d20+{attack_bonus} = [{natural}]+{attack_bonus} = {attack['total']} vs AC {target_ac} — MISS!"
    
    return result


def roll_check(modifier: int, dc: int, advantage: bool = False, disadvantage: bool = False) -> dict:
    """
    Roll an ability check or saving throw.
    """
    if advantage:
        r1 = random.randint(1, 20)
        r2 = random.randint(1, 20)
        natural = max(r1, r2)
        roll_text = f"[{r1}, {r2}] (advantage, took {natural})"
    elif disadvantage:
        r1 = random.randint(1, 20)
        r2 = random.randint(1, 20)
        natural = min(r1, r2)
        roll_text = f"[{r1}, {r2}] (disadvantage, took {natural})"
    else:
        natural = random.randint(1, 20)
        roll_text = f"[{natural}]"
    
    total = natural + modifier
    success = total >= dc
    
    mod_str = f"+{modifier}" if modifier >= 0 else str(modifier)
    result_str = "SUCCESS ✅" if success else "FAILURE ❌"
    
    return {
        "natural": natural,
        "modifier": modifier,
        "total": total,
        "dc": dc,
        "success": success,
        "text": f"🎲 Check: d20{mod_str} = {roll_text}{mod_str} = {total} vs DC {dc} — {result_str}"
    }


def roll_initiative(*combatants: tuple) -> list:
    """
    Roll initiative for multiple combatants.
    Returns sorted list (highest first).
    combatants: list of (name, dex_modifier) tuples
    """
    results = []
    for name, mod in combatants:
        roll = random.randint(1, 20)
        total = roll + mod
        results.append({
            "name": name,
            "roll": roll,
            "modifier": mod,
            "total": total,
        })
    
    # Sort by total (descending), then by modifier (descending) for ties
    results.sort(key=lambda x: (x["total"], x["modifier"]), reverse=True)
    
    text = "⚔️ **Initiative Order:**\n"
    for i, r in enumerate(results, 1):
        mod_str = f"+{r['modifier']}" if r['modifier'] >= 0 else str(r['modifier'])
        text += f"{i}. **{r['name']}** — {r['total']} (d20{mod_str} = [{r['roll']}]{mod_str})\n"
    
    return {"order": results, "text": text}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python3 dice.py 2d6+3              # Roll dice")
        print("  python3 dice.py attack 5 13 1d8+3   # Attack roll")
        print("  python3 dice.py check 3 15           # Ability check")
        print("  python3 dice.py init 'Goblin:2' 'Fighter:1' 'Wizard:-1'")
        sys.exit(0)
    
    cmd = sys.argv[1]
    
    if cmd == "attack":
        bonus = int(sys.argv[2])
        ac = int(sys.argv[3])
        dmg = sys.argv[4]
        result = roll_attack(bonus, ac, dmg)
        print(result["text"])
    elif cmd == "check":
        mod = int(sys.argv[2])
        dc = int(sys.argv[3])
        adv = "--advantage" in sys.argv
        dis = "--disadvantage" in sys.argv
        result = roll_check(mod, dc, advantage=adv, disadvantage=dis)
        print(result["text"])
    elif cmd == "init":
        combatants = []
        for c in sys.argv[2:]:
            name, mod = c.rsplit(":", 1)
            combatants.append((name, int(mod)))
        result = roll_initiative(*combatants)
        print(result["text"])
    else:
        result = roll_dice(cmd)
        if "error" in result:
            print(result["error"])
        else:
            print(f"🎲 {result['text']}")
