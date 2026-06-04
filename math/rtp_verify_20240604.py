"""RTP Verification Simulation — post-tuning (2026-06-04)
Parameters from commit cbbb93b:
- Main: getPassMult gap<=1:×15, gap<=3:×6, gap<=7:×3, else:×1
- Scatter rate: 5%, threshold: 12
- FG: 8 spins, symbols [+5,+10,+15,+30,+50,—], only through rows get bonus
- BG: chips=bet*50, maxRounds=15, mult 10/5/2.5/1, wall -2, same-hit -3, miss -1
- JP: 5% contribution (3% basic, 1.5% major, 0.5% grand)
"""
import random

SPINS = 2_000_000
BET = 30
SCATTER_RATE = 0.05
SCATTER_THRESHOLD = 12
FG_SYMBOLS = ['+5', '+10', '+15', '+30', '+50', '—']
JP_RATE = 0.05

def get_pass_mult(gap):
    if gap <= 1: return 15
    if gap <= 3: return 6
    if gap <= 7: return 3
    return 1

def bg_get_pass_mult(gap):
    if gap <= 1: return 10
    if gap <= 3: return 5
    if gap <= 7: return 2.5
    return 1

def spin_board(fg_mode=False):
    board = []
    for r in range(3):
        row = []
        for c in range(3):
            if not fg_mode and random.random() < SCATTER_RATE:
                row.append({'value': None, 'scatter': True})
            else:
                row.append({'value': random.randint(1, 13), 'scatter': False})
        board.append(row)
    return board

def judge_row(row):
    left, mid, right = row
    if left['scatter'] or mid['scatter'] or right['scatter']:
        return {'type': 'scatter', 'lamp': 0}
    l, m, r2 = left['value'], mid['value'], right['value']
    if l == r2:
        if m == l: return {'type': 'same-hit', 'lamp': -2}
        return {'type': 'same-miss', 'lamp': 0}
    lo, hi = min(l, r2), max(l, r2)
    gap = hi - lo - 1
    if m == lo or m == hi: return {'type': 'wall', 'lamp': -1}
    if lo < m < hi: return {'type': 'through', 'mult': get_pass_mult(gap)}
    return {'type': 'miss', 'lamp': 0}

def simulate_fg(bet):
    total = 0
    for _ in range(8):
        board = spin_board(fg_mode=True)
        bonus_syms = [random.choice(FG_SYMBOLS) for _ in range(3)]
        for r in range(3):
            j = judge_row(board[r])
            if j['type'] == 'through':
                sym = bonus_syms[r]
                if sym.startswith('+'):
                    total += int(sym[1:])
    return total

def simulate_bg(bet):
    chips = bet * 50
    winnings = 0
    pool = 10000  # large pool, won't deplete in sim
    for _ in range(15):
        if chips <= 0: break
        left = random.randint(1, 13)
        right = random.randint(1, 13)
        # Bet 30% of chips (average strategy)
        round_bet = max(1, int(chips * 0.3))
        mid = random.randint(1, 13)
        if left == right:
            if mid == left:
                chips += round_bet * (-3)
                chips = max(0, chips)
            else:
                win = round_bet * 1
                winnings += min(win, pool)
        else:
            lo, hi = min(left, right), max(left, right)
            gap = hi - lo - 1
            if mid == lo or mid == hi:
                chips += round_bet * (-2)
                chips = max(0, chips)
            elif lo < mid < hi:
                mult = bg_get_pass_mult(gap)
                win = round_bet * mult
                winnings += min(win, pool)
            else:
                chips += round_bet * (-1)
                chips = max(0, chips)
    return winnings

def run():
    total_wagered = 0
    total_returned = 0
    scatter_lamps = 0
    fg_triggers = 0
    bg_triggers = 0

    for _ in range(SPINS):
        total_wagered += BET
        bet_per_row = BET / 3
        board = spin_board()
        
        # Main game payout
        main_payout = 0
        lamp_delta = 0
        sc_count = 0
        for r in range(3):
            j = judge_row(board[r])
            if j['type'] == 'scatter':
                sc_count += 1
            elif j['type'] == 'through':
                main_payout += bet_per_row * j['mult']
            elif j['type'] == 'wall':
                lamp_delta += j['lamp']
            elif j['type'] == 'same-hit':
                lamp_delta += j['lamp']
        
        # Scatter lamps
        lamp_delta += sc_count  # each scatter +1
        scatter_lamps = max(0, scatter_lamps + lamp_delta)
        
        total_returned += main_payout
        
        # JP contribution (deducted from bet, returned as pool — net 0 for RTP in long run)
        # We count JP contribution as returned since pools eventually pay out
        total_returned += BET * JP_RATE
        
        # Trigger FG/BG
        if scatter_lamps >= SCATTER_THRESHOLD:
            scatter_lamps = 0
            # 50/50 FG vs BG choice
            if random.random() < 0.5:
                fg_triggers += 1
                fg_win = simulate_fg(BET)
                total_returned += fg_win
            else:
                bg_triggers += 1
                bg_win = simulate_bg(BET)
                total_returned += bg_win

    rtp = total_returned / total_wagered * 100
    print(f"=== RTP Verification Simulation ===")
    print(f"Spins: {SPINS:,}")
    print(f"Bet: {BET}")
    print(f"Total wagered: {total_wagered:,.0f}")
    print(f"Total returned: {total_returned:,.0f}")
    print(f"RTP: {rtp:.2f}%")
    print(f"FG triggers: {fg_triggers:,} ({fg_triggers/SPINS*100:.3f}%)")
    print(f"BG triggers: {bg_triggers:,} ({bg_triggers/SPINS*100:.3f}%)")
    print(f"Avg spins per trigger: {SPINS/(fg_triggers+bg_triggers):.0f}")

if __name__ == '__main__':
    run()
