"""
RTP 綜合模擬 v3 — 含 Main Game + Free Game v2.0 + Bonus Game
模擬當前程式碼邏輯，驗證整體 RTP 是否在目標範圍（96.4% ± 1%）
"""
import random

SPINS = 2_000_000
BET = 30
BET_PER_ROW = BET / 3
SYMBOLS = 13
SCATTER_RATE = 0.05
SCATTER_THRESHOLD = 10

# FG symbols and probabilities (uniform)
FG_SYMS = ['+15', '+30', '+60', '+90', '+120', '+200', '+500', '—']

# JP contribution
JP_RATE = 0.05  # 5% of bet goes to JP pool


def get_pass_mult(gap):
    if gap <= 1: return 15
    if gap <= 3: return 6
    if gap <= 7: return 3
    return 1


def spin_board(fg_mode=False):
    board = []
    for r in range(3):
        row = []
        for c in range(3):
            is_scatter = (not fg_mode) and random.random() < SCATTER_RATE
            row.append({'value': random.randint(1, SYMBOLS), 'isScatter': is_scatter} if not is_scatter
                       else {'value': None, 'isScatter': True})
        board.append(row)
    return board


def judge_board(board):
    results = []
    for r in range(3):
        left, mid, right = board[r][0], board[r][1], board[r][2]
        if left['isScatter'] or mid['isScatter'] or right['isScatter']:
            results.append({'row': r, 'type': 'scatter', 'lampChange': 0})
            continue
        l, m, rv = left['value'], mid['value'], right['value']
        if l == rv:
            if m == l:
                results.append({'row': r, 'type': 'same-hit', 'lampChange': -2})
            else:
                results.append({'row': r, 'type': 'same-miss', 'lampChange': 0})
        else:
            lo, hi = min(l, rv), max(l, rv)
            gap = hi - lo - 1
            if m == lo or m == hi:
                results.append({'row': r, 'type': 'wall', 'lampChange': -1, 'gap': gap})
            elif lo < m < hi:
                results.append({'row': r, 'type': 'through', 'mult': get_pass_mult(gap), 'gap': gap})
            else:
                results.append({'row': r, 'type': 'miss', 'lampChange': 0})
    return results


def calculate_payout(judgments, bet, board):
    bet_per_row = bet / 3
    total = 0
    for j in judgments:
        if j['type'] == 'through':
            if not board[j['row']][0]['isScatter'] and not board[j['row']][1]['isScatter'] and not board[j['row']][2]['isScatter']:
                total += bet_per_row * j['mult']
    return total


def count_scatters(board):
    return sum(1 for r in range(3) for c in range(3) if board[r][c]['isScatter'])


def sim_free_game(bet):
    """Simulate 8 spins of Free Game v2.0"""
    total_score = 0
    for _ in range(8):
        board = spin_board(fg_mode=True)
        judgments = judge_board(board)
        bonus_syms = [random.choice(FG_SYMS) for _ in range(3)]
        for j in judgments:
            if j['type'] == 'through':
                sym = bonus_syms[j['row']]
                if sym.startswith('+'):
                    total_score += int(sym[1:])
    return total_score


def sim_bonus_game(bet):
    """Simulate Bonus Game with optimal strategy (always bet 30% chips)"""
    chips = bet * 50
    winnings = 0
    rounds = 0
    max_rounds = 20  # ~90s / ~4.5s per round

    while chips > 0 and rounds < max_rounds:
        rounds += 1
        round_bet = max(1, int(chips * 0.3))

        left = random.randint(1, SYMBOLS)
        right = random.randint(1, SYMBOLS)
        mid = random.randint(1, SYMBOLS)

        if left == right:
            if mid == left:  # same-hit
                chips += round_bet * (-3)
            else:  # same-gate through
                win = round_bet * 1
                winnings += win
        else:
            lo, hi = min(left, right), max(left, right)
            gap = hi - lo - 1
            if mid == lo or mid == hi:  # wall
                chips += round_bet * (-2)
            elif lo < mid < hi:  # through
                mult = get_pass_mult(gap)
                win = round_bet * mult
                winnings += win
            else:  # miss
                chips += round_bet * (-1)

        if chips < 0:
            chips = 0

    return winnings


def run_simulation():
    total_bet = 0
    total_payout = 0
    scatter_lamps = 0
    fg_triggers = 0
    fg_total_payout = 0
    bg_total_payout = 0
    main_total_payout = 0

    for i in range(SPINS):
        total_bet += BET

        board = spin_board(fg_mode=False)
        judgments = judge_board(board)
        payout = calculate_payout(judgments, BET, board)
        main_total_payout += payout
        total_payout += payout

        # Scatter lamp accumulation
        sc = count_scatters(board)
        lamp_delta = sc
        for j in judgments:
            if 'lampChange' in j:
                row_has_scatter = any(board[j['row']][c]['isScatter'] for c in range(3))
                if not row_has_scatter:
                    lamp_delta += j['lampChange']
        scatter_lamps = max(0, scatter_lamps + lamp_delta)

        # Trigger FG or BG
        if scatter_lamps >= SCATTER_THRESHOLD:
            scatter_lamps = 0
            fg_triggers += 1
            # 50/50 choice between FG and BG
            if random.random() < 0.5:
                fg_payout = sim_free_game(BET)
                fg_total_payout += fg_payout
                total_payout += fg_payout
            else:
                bg_payout = sim_bonus_game(BET)
                bg_total_payout += bg_payout
                total_payout += bg_payout

    rtp = total_payout / total_bet * 100
    main_rtp = main_total_payout / total_bet * 100
    fg_rtp = fg_total_payout / total_bet * 100
    bg_rtp = bg_total_payout / total_bet * 100

    print(f"=== RTP 綜合模擬 v3 ===")
    print(f"模擬轉數: {SPINS:,}")
    print(f"總下注: {total_bet:,.0f}")
    print(f"總派彩: {total_payout:,.0f}")
    print(f"")
    print(f"【整體 RTP】: {rtp:.2f}%")
    print(f"  - Main Game RTP: {main_rtp:.2f}%")
    print(f"  - Free Game RTP: {fg_rtp:.2f}%")
    print(f"  - Bonus Game RTP: {bg_rtp:.2f}%")
    print(f"  - JP 貢獻 (理論): {JP_RATE*100:.1f}% (未含在上方)")
    print(f"")
    print(f"FG/BG 觸發次數: {fg_triggers:,}")
    print(f"平均觸發間隔: {SPINS/fg_triggers:.1f} 轉" if fg_triggers > 0 else "未觸發")
    print(f"")
    print(f"目標 RTP: 96.4% ± 1%")
    print(f"結果: {'✅ 達標' if 95.4 <= rtp <= 97.4 else '❌ 未達標'}")


if __name__ == '__main__':
    run_simulation()
