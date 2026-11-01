"""Facts the Tan, Cot, Sec, Csc tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/trigonometry/_tan-cot-math.js'
PI = math.pi
LO, HI = -2 * PI, 2 * PI


def f_of(kind, u):
    return {'tan': math.tan(u), 'cot': 1 / math.tan(u), 'sec': 1 / math.cos(u), 'csc': 1 / math.sin(u)}[kind]


@needs_node
class LengthTests(SimpleTestCase):
    def test_four_lengths(self):
        for theta in (-60, -30, 15, 35, 45, 60, 75):
            t = math.radians(theta)
            self.assertAlmostEqual(js(MATH, f"m.tanLen({theta})"), math.tan(t), places=12)
            self.assertAlmostEqual(js(MATH, f"m.secLen({theta})"), 1 / math.cos(t), places=12)
            self.assertAlmostEqual(js(MATH, f"m.cotLen({theta})"), 1 / math.tan(t), places=12)
            self.assertAlmostEqual(js(MATH, f"m.cscLen({theta})"), 1 / math.sin(t), places=12)

    def test_the_secant_ray_has_length_sec_and_pythagoras_holds(self):
        for theta in (-60, -20, 0, 35, 55):
            t = math.radians(theta)
            self.assertAlmostEqual(js(MATH, f"m.secantLength({theta})"), abs(1 / math.cos(t)), places=12)
            self.assertAlmostEqual(js(MATH, f"m.secantLength({theta}) ** 2"), 1 + math.tan(t) ** 2, places=12)

    def test_cot_is_tan_of_the_complement(self):
        for theta in (15, 30, 45, 60, 75):
            self.assertAlmostEqual(js(MATH, f"m.cotLen({theta})"), js(MATH, f"m.tanLen({90 - theta})"), places=12)
            self.assertAlmostEqual(js(MATH, f"m.cotLen({theta}) * m.tanLen({theta})"), 1.0, places=12)
            self.assertAlmostEqual(js(MATH, f"m.topHit({theta})")[0], 1 / math.tan(math.radians(theta)), places=12)
            self.assertEqual(js(MATH, f"m.topHit({theta})")[1], 1)

    def test_the_ray_meets_both_tangent_lines(self):
        # the point (1, tan θ) and the point (cot θ, 1) are on the same line through the origin
        for theta in (20, 35, 50, 70):
            t, k = js(MATH, f"[m.tanLen({theta}), m.cotLen({theta})]")
            self.assertAlmostEqual(t / 1, 1 / k, places=12)


@needs_node
class GraphTests(SimpleTestCase):
    SETS = [(1, 1, 0), (1.5, 2, PI / 4), (-2, 0.5, -PI / 2), (3, 1.5, PI), (0.5, 1, -PI / 4)]

    def test_asymptotes(self):
        self.assertEqual([round(x, 9) for x in js(MATH, f"m.asymptotes('tan', 1, 0, {LO}, {HI})")], [round(v, 9) for v in (-3 * PI / 2, -PI / 2, PI / 2, 3 * PI / 2)])
        self.assertEqual(len(js(MATH, f"m.asymptotes('cot', 1, 0, {LO}, {HI})")), 5)  # −2π, −π, 0, π, 2π
        for kind in ('tan', 'cot', 'sec', 'csc'):
            for A, B, C in self.SETS:
                xs = js(MATH, f"m.asymptotes('{kind}', {B}, {C}, {LO}, {HI})")
                # exactly the places where the guide trig function is zero
                for x in xs:
                    guide = math.cos(B * x + C) if kind in ('tan', 'sec') else math.sin(B * x + C)
                    self.assertAlmostEqual(guide, 0, places=9, msg=(kind, B, C, x))
                    self.assertTrue(LO - 1e-9 <= x <= HI + 1e-9)
                # evenly spaced by one period of the guide's zeros
                for a, b in zip(xs, xs[1:]):
                    self.assertAlmostEqual(b - a, PI / B, places=9)
                # nothing is missed: the count matches a brute-force count
                count = sum(1 for n in range(-40, 41) if LO - 1e-9 <= ((PI / 2 if kind in ('tan', 'sec') else 0) + n * PI - C) / B <= HI + 1e-9)
                self.assertEqual(len(xs), count, (kind, B, C))

    def test_the_curve_blows_up_at_each_asymptote(self):
        for kind in ('tan', 'cot', 'sec', 'csc'):
            for A, B, C in self.SETS[:3]:
                for x in js(MATH, f"m.asymptotes('{kind}', {B}, {C}, {LO}, {HI})"):
                    for side in (-1e-6, 1e-6):
                        self.assertGreater(abs(js(MATH, f"m.curve('{kind}', {A}, {B}, {C})({x + side})")), 1e4, (kind, x))

    def test_zeros_of_tan_and_cot(self):
        for kind in ('tan', 'cot'):
            for A, B, C in self.SETS:
                xs = js(MATH, f"m.zeros('{kind}', {B}, {C}, {LO}, {HI})")
                self.assertTrue(xs)
                for x in xs:
                    self.assertAlmostEqual(A * f_of(kind, B * x + C), 0, places=6, msg=(kind, B, C, x))
                # each zero is halfway between two asymptotes
                asym = js(MATH, f"m.asymptotes('{kind}', {B}, {C}, {LO - 5}, {HI + 5})")
                for x in xs:
                    below = max(a for a in asym if a < x)
                    above = min(a for a in asym if a > x)
                    self.assertAlmostEqual(x - below, above - x, places=9, msg=(kind, B, C, x))

    def test_quarter_points_are_at_plus_or_minus_a(self):
        for kind in ('tan', 'cot'):
            for A, B, C in self.SETS:
                pts = js(MATH, f"m.quarterPoints('{kind}', {A}, {B}, {C}, {LO}, {HI})")
                self.assertTrue(pts)
                for p in pts:
                    self.assertAlmostEqual(A * f_of(kind, B * p['x'] + C), p['y'], places=6, msg=(kind, A, B, C, p))
                    self.assertAlmostEqual(abs(p['y']), abs(A), places=12)
                # sorted left to right
                self.assertEqual([p['x'] for p in pts], sorted(p['x'] for p in pts))

    def test_vertices_of_sec_and_csc(self):
        for kind in ('sec', 'csc'):
            for A, B, C in self.SETS:
                pts = js(MATH, f"m.vertices('{kind}', {A}, {B}, {C}, {LO}, {HI})")
                self.assertTrue(pts)
                for p in pts:
                    self.assertAlmostEqual(A * f_of(kind, B * p['x'] + C), p['y'], places=6, msg=(kind, A, B, C, p))
                    # the guide is at its peak or trough there
                    guide = A * (math.cos(B * p['x'] + C) if kind == 'sec' else math.sin(B * p['x'] + C))
                    self.assertAlmostEqual(guide, p['y'], places=9)

    def test_sec_and_csc_never_enter_the_strip_between_minus_a_and_a(self):
        for kind in ('sec', 'csc'):
            for A, B, C in self.SETS:
                worst = js(MATH, f"(() => {{ const f = m.curve('{kind}', {A}, {B}, {C}); let low = Infinity; for (let i = 0; i <= 4000; i++) {{ const v = Math.abs(f({LO} + ({HI} - {LO}) * i / 4000)); if (Number.isFinite(v)) low = Math.min(low, v); }} return low; }})()")
                self.assertGreaterEqual(worst, abs(A) - 1e-9, (kind, A, B, C))

    def test_periods(self):
        for kind, base in (('tan', PI), ('cot', PI), ('sec', 2 * PI), ('csc', 2 * PI)):
            for A, B, C in self.SETS:
                P = js(MATH, f"m.period('{kind}', {B})")
                self.assertAlmostEqual(P, base / B, places=12)
                for x in (0.3, 1.1):
                    a = js(MATH, f"m.curve('{kind}', {A}, {B}, {C})({x})")
                    b = js(MATH, f"m.curve('{kind}', {A}, {B}, {C})({x} + {P})")
                    self.assertAlmostEqual(a, b, delta=1e-6 * max(1, abs(a)))

    def test_guide_functions(self):
        for A, B, C in self.SETS:
            self.assertAlmostEqual(js(MATH, f"m.guide('sec', {A}, {B}, {C})(0.7)"), A * math.cos(B * 0.7 + C), places=12)
            self.assertAlmostEqual(js(MATH, f"m.guide('csc', {A}, {B}, {C})(0.7)"), A * math.sin(B * 0.7 + C), places=12)


@needs_node
class ReciprocalTests(SimpleTestCase):
    def test_pairs(self):
        for x in (0.3, 1.0, 2.2, -1.7, 4.0):
            self.assertAlmostEqual(js(MATH, f"m.PAIRS.sin.f({x}) * m.PAIRS.sin.g({x})"), 1.0, places=12)
            self.assertAlmostEqual(js(MATH, f"m.PAIRS.cos.f({x}) * m.PAIRS.cos.g({x})"), 1.0, places=12)
            self.assertGreaterEqual(abs(js(MATH, f"m.PAIRS.sin.g({x})")), 1 - 1e-12)
            self.assertGreaterEqual(abs(js(MATH, f"m.PAIRS.cos.g({x})")), 1 - 1e-12)

    def test_they_touch_where_the_original_is_one(self):
        self.assertAlmostEqual(js(MATH, f"m.PAIRS.sin.g({PI / 2})"), 1.0, places=12)
        self.assertAlmostEqual(js(MATH, f"m.PAIRS.sin.g({-PI / 2})"), -1.0, places=12)
        self.assertAlmostEqual(js(MATH, "m.PAIRS.cos.g(0)"), 1.0, places=12)
        self.assertAlmostEqual(js(MATH, f"m.PAIRS.cos.g({PI})"), -1.0, places=12)


@needs_node
class NoAmplitudeTests(SimpleTestCase):
    def test_every_height_is_passed(self):
        for A in (0.5, 1, 3):
            last = 0
            for H in (1, 2, 4, 7, 100, 10000):
                x = js(MATH, f"m.crossing({A}, {H})")
                self.assertAlmostEqual(x, math.atan(H / A), places=12)
                self.assertAlmostEqual(js(MATH, f"m.tanAt({A}, {x})"), H, places=6)
                self.assertGreater(x, last)
                self.assertLess(x, PI / 2)
                last = x

    def test_a_is_a_stretch(self):
        for A in (0.5, 1, 3):
            self.assertAlmostEqual(js(MATH, f"m.tanAt({A}, {PI / 4})"), A, places=12)


@needs_node
class LighthouseTests(SimpleTestCase):
    def test_position(self):
        self.assertAlmostEqual(js(MATH, "m.spotPosition(200, 45)"), 200.0, places=9)
        self.assertEqual(js(MATH, "m.spotPosition(200, 0)"), 0)
        self.assertAlmostEqual(js(MATH, "m.spotPosition(150, -30)"), -150 * math.tan(math.radians(30)), places=9)

    def test_speed_is_the_slope_of_the_position(self):
        for d, rate in ((200, 10), (100, 5), (400, 30)):
            for theta in (0, 20, 45, 70):
                delta = 1e-4  # degrees
                dt = 2 * delta / rate
                slope = (d * math.tan(math.radians(theta + delta)) - d * math.tan(math.radians(theta - delta))) / dt
                self.assertAlmostEqual(js(MATH, f"m.spotSpeed({d}, {rate}, {theta})"), slope, delta=1e-4 * abs(slope), msg=(d, rate, theta))

    def test_speed_up(self):
        self.assertEqual(js(MATH, "m.speedUp(0)"), 1)
        self.assertAlmostEqual(js(MATH, "m.speedUp(60)"), 4.0, places=12)
        self.assertAlmostEqual(js(MATH, "m.speedUp(45)"), 2.0, places=12)
        self.assertAlmostEqual(js(MATH, "m.speedUp(80)"), 1 / math.cos(math.radians(80)) ** 2, places=9)
        self.assertEqual(round(js(MATH, "m.speedUp(80)"), 1), 33.2)
        self.assertAlmostEqual(js(MATH, "m.spotSpeed(200, 10, 0)"), 200 * math.radians(10), places=9)
        self.assertEqual(round(200 * math.radians(10), 2), 34.91)
        # the plot window holds the graph up to the sweep's ends
        self.assertLess(js(MATH, "m.speedUp(80)"), 40)
