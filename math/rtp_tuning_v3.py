"""
RTP 調參模擬 — 尋找 96.4% 目標配置
掃描 FG 獎金池、BG 參數、觸發門檻的組合
"""
import random

SPINS = 1_000_000
BET = 30
SYMBOLS = 13
SCATTER_RATE = 0.05


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
            is_sc = (not fg_mode) and random.random() < SCATTER_RATE
            row.append({'value': None, 'isScatter': True} if is_sc
                       else {'value': random.randint(1, SYMBOLS), 'isScatter': False})
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


def calculate_payout(judgments, board):
    bet_per_row = BET / 3
    total = 0
    for j in judgments:
        if j['type'] == 'through':
            total += bet_per_row * j['mult']
    return total


def count_scatters(board):
    return sum(1 for r in range(3) for c in range(3) if board[r][c]['isScatter'])


def sim_fg(fg_syms):
    total = 0
    for _ in range(8):
        board = spin_board(fg_mode=True)
        judgments = judge_board(board)
        bonus = [random.choice(fg_syms) for _ in range(3)]
        for j in judgments:
            if j['type'] == 'through':
                sym = bonus[j['row']]
                if sym > 0:
                    total += sym
    return total


def sim_bg(bg_mult_table, bg_wall_mult, bg_miss_mult, bg_same_hit_mult, max_rounds):
    chips = BET * 50
    winnings = 0
    for _ in range(max_rounds):
        if chips <= 0:
            break
        round_bet = max(1, int(chips * 0.3))
        l = random.randint(1, SYMBOLS)
        r = random.randint(1, SYMBOLS)
        m = random.randint(1, SYMBOLS)
        if l == r:
            if m == l:
                chips += round_bet * bg_same_hit_mult
            else:
                winnings += round_bet * 1
        else:
            lo, hi = min(l, r), max(l, r)
            gap = hi - lo - 1
            if m == lo or m == hi:
                chips += round_bet * bg_wall_mult
            elif lo < m < hi:
                mult = bg_mult_table(gap)
                winnings += round_bet * mult
            else:
                chips += round_bet * bg_miss_mult
        if chips < 0:
            chips = 0
    return winnings


def run_config(scatter_threshold, fg_syms, bg_mult_fn, bg_wall, bg_miss, bg_same_hit, bg_max_rounds):
    total_bet = 0
    total_payout = 0
    scatter_lamps = 0
    triggers = 0

    for _ in range(SPINS):
        total_bet += BET
        board = spin_board()
        judgments = judge_board(board)
        payout = calculate_payout(judgments, board)
        total_payout += payout

        sc = count_scatters(board)
        lamp_delta = sc
        for j in judgments:
            if 'lampChange' in j:
                row_sc = any(board[j['row']][c]['isScatter'] for c in range(3))
                if not row_sc:
                    lamp_delta += j['lampChange']
        scatter_lamps = max(0, scatter_lamps + lamp_delta)

        if scatter_lamps >= scatter_threshold:
            scatter_lamps = 0
            triggers += 1
            if random.random() < 0.5:
                total_payout += sim_fg(fg_syms)
            else:
                total_payout += sim_bg(bg_mult_fn, bg_wall, bg_miss, bg_same_hit, bg_max_rounds)

    rtp = total_payout / total_bet * 100
    interval = SPINS / triggers if triggers > 0 else 999999
    return rtp, interval, triggers


# === Parameter configurations to test ===

def bg_mult_standard(gap):
    if gap <= 1: return 15
    if gap <= 3: return 6
    if gap <= 7: return 3
    return 1

def bg_mult_reduced(gap):
    if gap <= 1: return 8
    if gap <= 3: return 4
    if gap <= 7: return 2
    return 1

def bg_mult_low(gap):
    if gap <= 1: return 5
    if gap <= 3: return 3
    if gap <= 7: return 1.5
    return 0.5


configs = [
    # (name, threshold, fg_syms, bg_mult_fn, bg_wall, bg_miss, bg_same_hit, bg_max_rounds)
    ("A: FG降+BG原+門檻12", 12, [5, 10, 15, 30, 0, 0, 0, 0], bg_mult_standard, -2, -1, -3, 20),
    ("B: FG降+BG降賠率+門檻12", 12, [5, 10, 15, 30, 0, 0, 0, 0], bg_mult_reduced, -2, -1, -3, 12),
    ("C: FG降+BG降+加罰+門檻15", 15, [5, 10, 15, 0, 0, 0, 0, 0], bg_mult_reduced, -3, -2, -4, 10),
    ("D: FG微降+BG大降+門檻12", 12, [10, 15, 30, 50, 0, 0, 0, 0], bg_mult_low, -3, -2, -5, 8),
    ("E: FG中+BG中+門檻14", 14, [5, 10, 20, 40, 0, 0, 0, 0], bg_mult_reduced, -3, -1, -4, 10),
]

print(f"{'配置':<30} {'RTP':>7} {'觸發間隔':>8} {'觸發數':>6}")
print("-" * 60)
for name, thresh, fg, bg_fn, bg_w, bg_m, bg_sh, bg_mr in configs:
    rtp, interval, trigs = run_config(thresh, fg, bg_fn, bg_w, bg_m, bg_sh, bg_mr)
    mark = "✅" if 95.5 <= rtp <= 97.4 else "❌"
    print(f"{name:<30} {rtp:>6.2f}% {interval:>7.0f}轉 {trigs:>5} {mark}")
