"""Facts the Properties & Library tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/functions-graphs/_properties-library-math.js'


@needs_node
class ParityTests(SimpleTestCase):
    def test_even_odd_neither(self):
        expected = {'sq': 'even', 'cos': 'even', 'abs': 'even', 'cube': 'odd', 'sin': 'odd', 'recip': 'odd', 'mix': 'neither', 'exp': 'neither'}
        for name, kind in expected.items():
            self.assertEqual(js(MATH, f"m.parityOf(m.PARITY_FUNCS.{name}.f)"), kind, name)

    def test_the_two_moves(self):
        # x^2 sits on its mirror image, x^3 on its half-turn, and neither on the other move
        for a in (0.5, 1.5, 3):
            self.assertAlmostEqual(js(MATH, f"m.mirrorY(m.PARITY_FUNCS.sq.f)({a})"), a * a, places=12)
            self.assertAlmostEqual(js(MATH, f"m.halfTurn(m.PARITY_FUNCS.cube.f)({a})"), a ** 3, places=12)
            self.assertAlmostEqual(js(MATH, f"m.halfTurn(m.PARITY_FUNCS.sq.f)({a})"), -a * a, places=12)
            self.assertAlmostEqual(js(MATH, f"m.mirrorY(m.PARITY_FUNCS.mix.f)({a})"), a * a - a, places=12)

    def test_library_symmetry_and_domain(self):
        expected = {'id': 'odd', 'sq': 'even', 'cube': 'odd', 'root': 'neither', 'cbrt': 'odd', 'recip': 'odd', 'abs': 'even', 'floor': 'neither'}
        for name, kind in expected.items():
            self.assertEqual(js(MATH, f"m.parityOf(m.LIBRARY.{name}.f)"), kind, name)
        self.assertIsNone(js(MATH, "Number.isNaN(m.LIBRARY.root.f(-1)) ? null : 1"))
        self.assertIsNone(js(MATH, "Number.isFinite(m.LIBRARY.recip.f(0)) ? 1 : null"))
        self.assertEqual(js(MATH, "m.LIBRARY.cbrt.f(-8)"), -2)
        self.assertEqual(js(MATH, "m.LIBRARY.floor.f(-1.5)"), -2)

    def test_library_trends(self):
        for name in ('id', 'cube', 'cbrt', 'floor'):
            self.assertTrue(js(MATH, f"m.increasingOn(m.LIBRARY.{name}.f, -4, 4)"), name)
        self.assertTrue(js(MATH, "m.increasingOn(m.LIBRARY.root.f, 0, 4)"))
        for name in ('sq', 'abs'):
            self.assertTrue(js(MATH, f"m.decreasingOn(m.LIBRARY.{name}.f, -4, 0)"), name)
            self.assertTrue(js(MATH, f"m.increasingOn(m.LIBRARY.{name}.f, 0, 4)"), name)
        self.assertTrue(js(MATH, "m.decreasingOn(m.LIBRARY.recip.f, 0.1, 4)"))
        self.assertTrue(js(MATH, "m.decreasingOn(m.LIBRARY.recip.f, -4, -0.1)"))
        self.assertFalse(js(MATH, "m.increasingOn(m.LIBRARY.recip.f, -4, -0.1)"))

    def test_the_library_windows_hold_the_part_that_matters(self):
        # x = 2 sits inside every window; x^3 and 1/x leave theirs further out, which is fine (they are clipped)
        for name in ('id', 'sq', 'cube', 'root', 'cbrt', 'abs', 'floor'):
            lo, hi = js(MATH, f"m.LIBRARY.{name}.y")
            self.assertTrue(lo <= js(MATH, f"m.LIBRARY.{name}.f(2)") <= hi, name)


@needs_node
class TurningPointTests(SimpleTestCase):
    def test_cubic(self):
        got = js(MATH, "m.turningPoints(m.SHAPES.cubic)")
        self.assertEqual([t['kind'] for t in got], ['max', 'min'])
        self.assertAlmostEqual(got[0]['x'], -1, places=6)
        self.assertAlmostEqual(got[0]['y'], 2 / 3, places=6)
        self.assertAlmostEqual(got[1]['x'], 1, places=6)
        self.assertAlmostEqual(got[1]['y'], -2 / 3, places=6)

    def test_quartic(self):
        got = js(MATH, "m.turningPoints(m.SHAPES.quartic)")
        self.assertEqual([t['kind'] for t in got], ['min', 'max', 'min'])
        for t, x in zip(got, (-math.sqrt(2), 0, math.sqrt(2))):
            self.assertAlmostEqual(t['x'], x, places=6)
        self.assertAlmostEqual(got[0]['y'], -1, places=6)
        self.assertAlmostEqual(got[1]['y'], 0, places=6)

    def test_wave_and_the_steady_curve(self):
        got = js(MATH, "m.turningPoints(m.SHAPES.wave)")
        self.assertEqual([t['kind'] for t in got], ['min', 'max'])
        self.assertAlmostEqual(got[0]['x'], -math.pi / 2, places=6)
        self.assertAlmostEqual(got[1]['y'], 1, places=9)
        self.assertEqual(js(MATH, "m.turningPoints(m.SHAPES.steady)"), [])

    def test_stretches(self):
        got = js(MATH, "m.stretches(m.SHAPES.cubic)")
        self.assertEqual([s['dir'] for s in got], [1, -1, 1])
        self.assertEqual(got[0]['a'], -2.5)
        self.assertEqual(got[-1]['b'], 2.5)
        self.assertEqual([s['dir'] for s in js(MATH, "m.stretches(m.SHAPES.steady)")], [1])

    def test_slopes_match_the_curves(self):
        h = 1e-6
        for name in ('cubic', 'quartic', 'wave', 'steady'):
            for x in (-2, -0.7, 0.4, 1.9):
                got = js(MATH, f"[m.SHAPES.{name}.df({x}), (m.SHAPES.{name}.f({x}+{h}) - m.SHAPES.{name}.f({x}-{h}))/{2*h}]")
                self.assertAlmostEqual(got[0], got[1], places=5, msg=(name, x))

    def test_windows_hold_the_curves(self):
        for name in ('cubic', 'quartic', 'wave', 'steady'):
            lo, hi = js(MATH, f"m.SHAPES.{name}.span")
            ylo, yhi = js(MATH, f"m.SHAPES.{name}.y")
            for i in range(0, 41):
                x = lo + (hi - lo) * i / 40
                y = js(MATH, f"m.SHAPES.{name}.f({x})") if i % 8 == 0 else None
                if y is not None:
                    self.assertTrue(ylo <= y <= yhi, (name, x, y))


@needs_node
class FloorTests(SimpleTestCase):
    def test_floor_and_fraction(self):
        for x in (-3.5, -1.5, -1, 0, 0.25, 1.999, 2, 2.5):
            self.assertEqual(js(MATH, f"m.floor({x})"), math.floor(x))
            self.assertAlmostEqual(js(MATH, f"m.fractional({x})"), x - math.floor(x), places=12)
        self.assertEqual(js(MATH, "m.floor(-1.5)"), -2)  # not -1


@needs_node
class PiecewiseTests(SimpleTestCase):
    S = '{b1:-1,b2:2,s1:0.5,s2:-1,s3:1,J1:1,J2:0.5,own1:true,own2:false}'

    def test_values_at_the_breaks(self):
        # piece 1 ends at height 1; piece 2 starts at 2 and ends at 2 - 3 = -1; piece 3 starts at -0.5
        self.assertEqual(js(MATH, f"m.valueOfPieces(m.buildPieces({self.S}), -1)"), 1)   # b1 in the left piece
        self.assertEqual(js(MATH, f"m.valueOfPieces(m.buildPieces({self.S}), 2)"), -0.5)  # b2 in the right piece
        flipped = self.S.replace('own1:true', 'own1:false').replace('own2:false', 'own2:true')
        self.assertEqual(js(MATH, f"m.valueOfPieces(m.buildPieces({flipped}), -1)"), 2)
        self.assertEqual(js(MATH, f"m.valueOfPieces(m.buildPieces({flipped}), 2)"), -1)

    def test_every_x_has_one_value(self):
        for own1, own2 in (('true', 'true'), ('true', 'false'), ('false', 'true'), ('false', 'false')):
            s = self.S.replace('own1:true', f'own1:{own1}').replace('own2:false', f'own2:{own2}')
            vals = js(MATH, f"[-5,-3,-1,0,2,3,5].map((x) => m.valueOfPieces(m.buildPieces({s}), x))")
            self.assertTrue(all(v is not None for v in vals), (own1, own2))

    def test_joined_when_jumps_are_zero(self):
        s = '{b1:-1,b2:2,s1:0.5,s2:-1,s3:1,J1:0,J2:0,own1:true,own2:true}'
        left = js(MATH, f"m.buildPieces({s})[0].fn(-1)")
        mid = js(MATH, f"m.buildPieces({s})[1].fn(-1)")
        self.assertEqual(left, mid)
        self.assertEqual(js(MATH, f"m.buildPieces({s})[1].fn(2)"), js(MATH, f"m.buildPieces({s})[2].fn(2)"))

    def test_coefficients_describe_the_pieces(self):
        for x in (-4, -2, 0, 1, 3, 4.5):
            got = js(MATH, f"(() => {{ const p = m.buildPieces({self.S}); const k = m.coefficients({self.S}); "
                           f"const i = {x} < -1 ? 0 : {x} < 2 ? 1 : 2; return [p[i].fn({x}), k[i][0] * {x} + k[i][1]]; }})()")
            self.assertAlmostEqual(got[0], got[1], places=12)


@needs_node
class RateTests(SimpleTestCase):
    def test_average_speed(self):
        # s = t^2/2 from 1 s to 5 s: (12.5 - 0.5) / 4
        self.assertAlmostEqual(js(MATH, "m.averageRate(m.MOTIONS.speedup.s, 1, 5)"), 3.0, places=12)
        self.assertAlmostEqual(js(MATH, "m.averageRate(m.MOTIONS.brake.s, 0, 6)"), 3.0, places=12)  # 18 m in 6 s
        self.assertAlmostEqual(js(MATH, "m.averageRate(m.MOTIONS.wobble.s, 2, 4)"), (4 + 2 * math.sin(4) - 2 - 2 * math.sin(2)) / 2, places=12)
        self.assertLess(js(MATH, "m.averageRate(m.MOTIONS.wobble.s, 2, 4)"), 0)

    def test_speed_matches_the_slope_of_the_distance(self):
        h = 1e-6
        for name in ('speedup', 'brake', 'wobble'):
            for t in (0.5, 2, 5.5):
                got = js(MATH, f"[m.MOTIONS.{name}.v({t}), (m.MOTIONS.{name}.s({t}+{h}) - m.MOTIONS.{name}.s({t}-{h}))/{2*h}]")
                self.assertAlmostEqual(got[0], got[1], places=5, msg=(name, t))

    def test_the_window_holds_every_journey(self):
        for name in ('speedup', 'brake', 'wobble'):
            for t in (0, 2, 4, 6, 8):
                y = js(MATH, f"m.MOTIONS.{name}.s({t})")
                self.assertTrue(-1 <= y <= 34, (name, t, y))


@needs_node
class TaxTests(SimpleTestCase):
    def test_slab_totals(self):
        # lakh rupees, worked out slab by slab
        by_hand = {0: 0, 4: 0, 8: 0.2, 10: 0.4, 12: 0.6, 16: 1.2, 20: 2.0, 24: 3.0, 30: 4.8}
        for income, expected in by_hand.items():
            self.assertAlmostEqual(js(MATH, f"m.tax({income})"), expected, places=12, msg=income)

    def test_the_graph_is_joined_and_bends_upwards(self):
        for edge in (4, 8, 12, 16, 20, 24):
            below = js(MATH, f"m.tax({edge} - 1e-9)")
            self.assertAlmostEqual(below, js(MATH, f"m.tax({edge})"), places=6)
        rates = [js(MATH, f"m.marginalRate({x})") for x in (2, 6, 10, 14, 18, 22, 28)]
        self.assertEqual(rates, [0, 5, 10, 15, 20, 25, 30])
        self.assertEqual(js(MATH, "m.marginalRate(12)"), 15)  # at the edge, the slab that begins there

    def test_average_rate_is_below_the_marginal_rate(self):
        self.assertAlmostEqual(js(MATH, "m.averageTaxRate(10)"), 4.0, places=12)
        self.assertEqual(js(MATH, "m.averageTaxRate(0)"), 0)
        for income in (5, 9, 13, 17, 21, 27, 30):
            self.assertLess(js(MATH, f"m.averageTaxRate({income})"), js(MATH, f"m.marginalRate({income})"))

    def test_the_window_holds_the_curve(self):
        self.assertLess(js(MATH, "m.tax(30)"), 5.2)
