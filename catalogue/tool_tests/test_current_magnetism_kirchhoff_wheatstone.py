"""Every number the Kirchhoff & Wheatstone box shows, worked out in Python with exact fractions, then checked against the JS."""
import json
from fractions import Fraction as F

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/current-magnetism/_kirchhoff-math.js'
LIB = 'lib/circuit.js'
DEFAULT = {'E1': 12, 'E2': 9, 'R1': 2, 'R2': 2, 'R3': 4}


def gauss(rows):
    """Exact solution of an augmented matrix."""
    rows = [[F(v) for v in row] for row in rows]
    n = len(rows)
    for col in range(n):
        pivot = next(r for r in range(col, n) if rows[r][col] != 0)
        rows[col], rows[pivot] = rows[pivot], rows[col]
        rows[col] = [v / rows[col][col] for v in rows[col]]
        for r in range(n):
            if r != col:
                rows[r] = [a - rows[r][col] * b for a, b in zip(rows[r], rows[col])]
    return [row[n] for row in rows]


def two_loop(E1, E2, R1, R2, R3):
    """Mesh equations written by hand, with I3 = I1 + I2."""
    return gauss([[R1 + R3, R3, E1], [R3, R2 + R3, E2]])


def bridge(E, R1, R2, R3, R4, Rg):
    """Node equations at B and D, with A at E and C at 0."""
    B, D = gauss([
        [F(1, R1) + F(1, R2) + F(1, Rg), -F(1, Rg), F(E, R1)],
        [-F(1, Rg), F(1, R3) + F(1, R4) + F(1, Rg), F(E, R3)],
    ])
    return B, D, (B - D) / Rg


@needs_node
class LibraryTests(SimpleTestCase):
    def test_solve_linear(self):
        self.assertEqual(js(LIB, 'm.solveLinear([[0,2],[4,0]],[6,8])'), [2, 3])  # needs a row swap
        self.assertIsNone(js(LIB, 'm.solveLinear([[1,2],[2,4]],[1,2])'))

    def test_branch_sign_convention(self):
        # 6 V cell driving 2 Ω from node 0 round to node 0 through node 1: 3 A, and node 1 sits at 6 V
        got = js(LIB, 'm.solveCircuit(2,[{a:0,b:1,R:1e-9,E:6},{a:1,b:0,R:2}])')
        self.assertAlmostEqual(got['V'][1], 6, places=6)
        self.assertAlmostEqual(got['I'][1], 3, places=6)


@needs_node
class JunctionTests(SimpleTestCase):
    def test_rates_conserve_charge(self):
        rates = js(MATH, "m.nodeRates({view:'forced',I1:3,I2:2,I3:4},[0,0,0,0])")
        self.assertEqual(rates, [1, 3, 2, 4])

    def test_free_node_starts_with_no_out_current_and_settles_at_the_mean(self):
        s = "{view:'free',V1:9,V2:6,V3:0}"
        self.assertEqual(js(MATH, f'm.nodeCurrents({s},0)'), [4.5, 3, 0])
        self.assertEqual(js(MATH, f'm.settledPotential({s})'), 5)
        q = 5 * js(MATH, 'm.NODE_C')
        got = js(MATH, f'm.nodeCurrents({s},{q})')
        self.assertAlmostEqual(got[0] + got[1] - got[2], 0)
        self.assertEqual([round(v, 6) for v in got], [2, 0.5, 2.5])

    def test_decay_time_is_the_stated_tau(self):
        # dq/dt = (V1 + V2 + V3 − 3q/C)/R, so tau = RC/3
        self.assertAlmostEqual(js(MATH, 'm.NODE_R * m.NODE_C / 3'), js(MATH, 'm.NODE_TAU'))

    def test_pile_potential_and_electrons(self):
        self.assertAlmostEqual(js(MATH, 'm.spherePotential(1)') / 9e11, 1)
        self.assertAlmostEqual(js(MATH, 'm.electrons(1)') / 6.25e18, 1)

    def test_pile_fits_the_stage(self):
        points = js(MATH, 'm.pilePoints(40)')
        self.assertEqual(len(points), 40)
        self.assertLess(max((x * x + y * y) ** 0.5 for x, y in points), 60)
        # no two dots of radius 5 sit on top of each other
        closest = min(((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5 for i, a in enumerate(points) for b in points[:i])
        self.assertGreater(closest, 9)


@needs_node
class LoopTests(SimpleTestCase):
    def test_default_circuit(self):
        I1, I2 = two_loop(12, 9, 2, 2, 4)
        self.assertEqual((I1, I2, I1 + I2), (F(9, 5), F(3, 10), F(21, 10)))
        got = js(MATH, f'm.twoLoop({json.dumps(DEFAULT)})')
        self.assertAlmostEqual(got['I1'], 1.8)
        self.assertAlmostEqual(got['I2'], 0.3)
        self.assertAlmostEqual(got['I3'], 2.1)
        self.assertAlmostEqual(got['VT'], 8.4)

    def test_steps_of_each_loop(self):
        steps = js(MATH, f"m.loopSteps(m.loopEdges({json.dumps(DEFAULT)},'left'))")
        self.assertEqual([s['name'] for s in steps], ['E₁', 'R₁', 'R₃'])
        for got, want in zip([s['dV'] for s in steps], [12, -3.6, -8.4]):
            self.assertAlmostEqual(got, want)
        steps = js(MATH, f"m.loopSteps(m.loopEdges({json.dumps(DEFAULT)},'right'))")
        self.assertEqual([s['name'] for s in steps], ['R₃', 'R₂', 'E₂'])
        for got, want in zip([s['dV'] for s in steps], [8.4, 0.6, -9]):
            self.assertAlmostEqual(got, want)

    def test_every_loop_closes_for_many_circuits(self):
        code = """[[12,9,2,2,4],[12,1,1,10,1],[1,12,10,1,10],[7,7,3,5,2],[3,12,1,1,1]].flatMap(([E1,E2,R1,R2,R3]) =>
          ['left','right','outer'].map((loop) => {
            const edges = m.loopEdges({E1,E2,R1,R2,R3}, loop);
            const end = m.walkAt(edges, 1);
            const joined = edges.every((e, i) => i === 0 || e.a.every((v, k) => Math.abs(v - edges[i-1].b[k]) < 1e-9));
            return [m.loopSteps(edges).reduce((sum, s) => sum + s.dV, 0), end.V, end.up - end.down, joined];
          }))"""
        for total, height, gained, joined in js(MATH, code):
            self.assertAlmostEqual(total, 0)
            self.assertAlmostEqual(height, 0)
            self.assertAlmostEqual(gained, 0)
            self.assertTrue(joined)

    def test_walk_positions(self):
        s = json.dumps(DEFAULT)
        marks = js(MATH, f"m.walkMarks(m.loopEdges({s},'left'))")
        self.assertAlmostEqual(marks[-1], 1)
        self.assertEqual(marks, sorted(marks))
        spot = js(MATH, f"m.walkAt(m.loopEdges({s},'left'),{marks[1]})")  # the top of the first lift
        self.assertAlmostEqual(spot['V'], 12)
        self.assertAlmostEqual(spot['up'], 12)
        self.assertAlmostEqual(spot['down'], 0)

    def test_reversed_current_is_reachable(self):
        I1, I2 = two_loop(12, 1, 2, 2, 4)
        self.assertLess(I2, 0)  # the template asks students to find this
        self.assertLess(js(MATH, "m.twoLoop({E1:12,E2:1,R1:2,R2:2,R3:4}).I2"), 0)


@needs_node
class SolverTests(SimpleTestCase):
    def test_elimination_matches_the_exact_answer_and_the_nodal_solver(self):
        for E1, E2, R1, R2, R3 in [(12, 9, 2, 2, 4), (24, 1, 1, 20, 3), (5, -9, 2, 7, 1), (1, 24, 20, 1, 20)]:
            s = json.dumps({'E1': E1, 'E2': E2, 'R1': R1, 'R2': R2, 'R3': R3})
            I1, I2 = two_loop(E1, E2, R1, R2, R3)
            got = js(MATH, f'[m.eliminate({s}), m.twoLoop({s})]')
            for source in got:
                self.assertAlmostEqual(source['I1'], float(I1))
                self.assertAlmostEqual(source['I2'], float(I2))
                self.assertAlmostEqual(source['I3'], float(I1 + I2))
            # the outer loop the page checks at the end
            self.assertEqual(E1 - E2 - I1 * R1 + I2 * R2, 0)

    def test_worked_numbers_for_the_default(self):
        got = js(MATH, f'm.eliminate({json.dumps(DEFAULT)})')
        self.assertEqual((got['a'], got['b'], got['d']), (6, 4, 6))
        self.assertAlmostEqual(got['m'], 2 / 3)
        self.assertAlmostEqual(got['d2'], 10 / 3)
        self.assertAlmostEqual(got['f2'], 1)

    def test_i2_can_be_exactly_zero(self):
        # the Try prompt: E₂ equals the top rail with I₂ = 0, so E₂ = E₁R₃/(R₁+R₃) = 8 for E₁ = 12, R₁ = 2, R₃ = 4
        self.assertEqual(two_loop(12, 8, 2, 2, 4)[1], 0)


@needs_node
class BridgeTests(SimpleTestCase):
    def test_ncert_example(self):
        B, D, Ig = bridge(10, 100, 10, 60, 5, 15)
        self.assertEqual(round(float(Ig) * 1000, 2), 4.87)
        got = js(MATH, 'm.bridge({E:10,R1:100,R2:10,R3:60,R4:5,Rg:15})')
        self.assertAlmostEqual(got['Ig'], float(Ig))
        self.assertAlmostEqual(got['VB'], float(B))
        self.assertAlmostEqual(got['VD'], float(D))
        self.assertAlmostEqual(js(MATH, 'm.balanceR4({R1:100,R2:10,R3:60})'), 6)

    def test_default_is_off_balance(self):
        B, D, Ig = bridge(10, 20, 30, 40, 20, 50)
        self.assertGreater(abs(B - D), 1.5)  # a gap of over 15% of the drawing's height
        self.assertEqual(js(MATH, 'm.balanceR4({R1:20,R2:30,R3:40})'), 60)

    def test_balance_ignores_battery_and_meter(self):
        for E, Rg in [(10, 15), (2, 5), (20, 100)]:
            B, D, Ig = bridge(E, 20, 30, 40, 60, Rg)
            self.assertEqual(Ig, 0)
            got = js(MATH, f'm.bridge({{E:{E},R1:20,R2:30,R3:40,R4:60,Rg:{Rg}}})')
            self.assertEqual(got['Ig'], 0)  # exactly, or the readout shows rounding noise

    def test_cutting_moves_nothing_at_balance_and_something_off_balance(self):
        got = js(MATH, """['60','30'].map((R4) => {
          const s = {E:10,R1:20,R2:30,R3:40,R4:Number(R4),Rg:15};
          return m.bridge(s).VB - m.bridge({...s,cut:true}).VB; })""")
        self.assertAlmostEqual(got[0], 0)
        self.assertGreater(abs(got[1]), 0.1)
        # uncut, with the wire gone, B is a plain divider: 30/50 of 10 V
        self.assertAlmostEqual(js(MATH, 'm.bridge({E:10,R1:20,R2:30,R3:40,R4:30,Rg:15,cut:true}).VB'), 6)

    def test_balance_flag(self):
        self.assertTrue(js(MATH, 'm.isBalanced({R1:20,R2:30,R3:40,R4:60})'))
        self.assertFalse(js(MATH, 'm.isBalanced({R1:20,R2:30,R3:40,R4:59})'))

    def test_dragging_finds_the_right_r4(self):
        got = js(MATH, """(() => { const s = {E:10,R1:20,R2:30,R3:40,Rg:15};
          const R4 = m.r4ForPotential(s, m.bridge({...s,R4:60}).VD); return R4; })()""")
        self.assertAlmostEqual(got, 60, places=5)
