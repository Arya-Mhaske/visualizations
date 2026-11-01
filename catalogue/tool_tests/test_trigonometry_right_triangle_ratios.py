"""Facts the Right-Triangle Ratios tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/trigonometry/_right-triangle-math.js'


def area(pts):
    return abs(sum(p[0] * q[1] - q[0] * p[1] for p, q in zip(pts, pts[1:] + pts[:1]))) / 2


@needs_node
class PythagorasTests(SimpleTestCase):
    def test_triangles_stay_congruent_all_the_way(self):
        for a, b in ((3, 4), (2, 5), (1, 6), (4, 4)):
            for t in (0, 0.25, 0.5, 0.8, 1):
                tris = js(MATH, f"m.trianglesAt({a}, {b}, {t})")
                for tri in tris:
                    R, P1, P2 = tri['R'], tri['P1'], tri['P2']
                    self.assertAlmostEqual(math.dist(R, P1), a, places=9, msg=(a, b, t))
                    self.assertAlmostEqual(math.dist(R, P2), b, places=9, msg=(a, b, t))
                    self.assertAlmostEqual(area([R, P1, P2]), a * b / 2, places=9)

    def test_ends_match_the_two_arrangements(self):
        for a, b in ((3, 4), (2, 5)):
            arr = js(MATH, f"m.arrangements({a}, {b})")
            start = js(MATH, f"m.trianglesAt({a}, {b}, 0)")
            end = js(MATH, f"m.trianglesAt({a}, {b}, 1)")
            for i in range(4):
                for key in ('R', 'P1', 'P2'):
                    for u, v in zip(start[i][key], arr['one'][i][key]):
                        self.assertAlmostEqual(u, v, places=9)
                    for u, v in zip(end[i][key], arr['two'][i][key]):
                        self.assertAlmostEqual(u, v, places=9)

    def test_the_gaps_are_c_squared_and_then_a_squared_plus_b_squared(self):
        for a, b in ((3, 4), (2, 5), (1, 6)):
            s = a + b
            arr = js(MATH, f"m.arrangements({a}, {b})")
            # all eight triangles sit inside the big square
            for key in ('one', 'two'):
                for tri in arr[key]:
                    for p in (tri['R'], tri['P1'], tri['P2']):
                        self.assertTrue(-1e-9 <= p[0] <= s + 1e-9 and -1e-9 <= p[1] <= s + 1e-9)
            gap = s * s - 4 * (a * b / 2)
            self.assertAlmostEqual(gap, a * a + b * b, places=12)
            # arrangement 1: the inner quadrilateral (a,0), (s,a), (b,s), (0,b) is a square of side c
            inner = [(a, 0), (s, a), (b, s), (0, b)]
            sides = [math.dist(inner[i], inner[(i + 1) % 4]) for i in range(4)]
            for side in sides:
                self.assertAlmostEqual(side, math.hypot(a, b), places=12)
            self.assertAlmostEqual(area(inner), a * a + b * b, places=9)

    def test_areas(self):
        got = js(MATH, "m.squareAreas(3, 4)")
        self.assertEqual((got['a2'], got['b2'], got['c2'], got['c']), (9, 16, 25, 5))


@needs_node
class SixRatiosTests(SimpleTestCase):
    def test_six_ordered_pairs(self):
        pairs = js(MATH, "m.orderedPairs()")
        self.assertEqual(len(pairs), 6)
        self.assertEqual(len({tuple(p) for p in pairs}), 6)
        names = js(MATH, "m.RATIOS")
        self.assertEqual(sorted(names.values()), sorted(['sin', 'cos', 'tan', 'cot', 'sec', 'csc']))
        for n, d in pairs:
            self.assertIn(f'{n}/{d}', names)

    def test_reciprocal_pairs(self):
        pairs = js(MATH, "m.orderedPairs()")
        names = js(MATH, "m.RATIOS")
        flips = {'sin': 'csc', 'cos': 'sec', 'tan': 'cot', 'csc': 'sin', 'sec': 'cos', 'cot': 'tan'}
        for n, d in pairs:
            self.assertEqual(names[js(MATH, f"m.reciprocalName('{n}', '{d}')")], flips[names[f'{n}/{d}']])
            for theta in (20, 35, 60):
                product = js(MATH, f"m.ratioOf('{n}', '{d}', {theta}) * m.ratioOf('{d}', '{n}', {theta})")
                self.assertAlmostEqual(product, 1.0, places=12)

    def test_values(self):
        t = math.radians(35)
        self.assertAlmostEqual(js(MATH, "m.ratioOf('opp', 'hyp', 35)"), math.sin(t), places=12)
        self.assertAlmostEqual(js(MATH, "m.ratioOf('adj', 'hyp', 35)"), math.cos(t), places=12)
        self.assertAlmostEqual(js(MATH, "m.ratioOf('opp', 'adj', 35)"), math.tan(t), places=12)
        self.assertAlmostEqual(js(MATH, "m.ratioOf('hyp', 'adj', 35)"), 1 / math.cos(t), places=12)


@needs_node
class CoSineTests(SimpleTestCase):
    def test_cos_is_sin_of_the_complement(self):
        for theta in (10, 30, 45, 62, 80):
            self.assertEqual(js(MATH, f"m.complement({theta})"), 90 - theta)
            self.assertAlmostEqual(js(MATH, f"m.fromCorner({theta}, 'B').sin"), math.cos(math.radians(theta)), places=12)
            self.assertAlmostEqual(js(MATH, f"m.fromCorner({theta}, 'B').cos"), math.sin(math.radians(theta)), places=12)
            self.assertAlmostEqual(js(MATH, f"m.fromCorner({theta}, 'A').sin"), math.sin(math.radians(theta)), places=12)


@needs_node
class GrowthTests(SimpleTestCase):
    def test_sin_and_cos_never_pass_one_but_tan_does(self):
        for theta in (1, 30, 45, 60, 89, 89.9):
            g = js(MATH, f"m.growth({theta})")
            self.assertAlmostEqual(g['sin'], math.sin(math.radians(theta)), places=12)
            self.assertLessEqual(g['sin'], 1)
            self.assertLessEqual(g['cos'], 1)
            self.assertAlmostEqual(g['tan'], math.tan(math.radians(theta)), places=9)
        self.assertGreater(js(MATH, "m.growth(89.9).tan"), 572)
        self.assertAlmostEqual(js(MATH, "m.growth(89.9).tan"), 572.957, places=2)


@needs_node
class CalculatorTests(SimpleTestCase):
    def test_sin_37(self):
        self.assertAlmostEqual(js(MATH, "m.SIN37"), 0.6018150231520483, places=12)
        self.assertEqual(round(js(MATH, "m.SIN37"), 4), 0.6018)

    def test_ruler_ratio(self):
        for hyp in range(3, 101):
            opp = round(hyp * math.sin(math.radians(37)) * 10 + 1e-9) / 10  # nearest millimetre
            self.assertAlmostEqual(js(MATH, f"m.measuredOpposite({hyp})"), opp, places=9, msg=hyp)
        # the error is never above half a millimetre over the hypotenuse
        for hyp in (3, 10, 25, 60, 100):
            ratio = js(MATH, f"m.measuredRatio({hyp})")
            self.assertLessEqual(abs(ratio - math.sin(math.radians(37))), 0.05 / hyp + 1e-9, msg=hyp)
            self.assertAlmostEqual(js(MATH, f"m.worstError({hyp})"), 0.05 / hyp, places=12)
        self.assertEqual(js(MATH, "m.measuredOpposite(10)"), 6.0)
        self.assertEqual(js(MATH, "m.measuredRatio(10)"), 0.6)
        self.assertAlmostEqual(js(MATH, "m.measuredRatio(100)"), 0.602, places=12)

    def test_the_plot_window_holds_the_ratio(self):
        # the worst case is the smallest hypotenuse (3 cm): within 0.05 / 3 of sin 37° (0.6018), so inside 0.55 to 0.65
        for hyp in (3, 4, 5, 6):
            self.assertTrue(0.55 <= js(MATH, f"m.measuredRatio({hyp})") <= 0.65, hyp)
        self.assertLess(0.6018 + 0.05 / 3, 0.65)
        self.assertGreater(0.6018 - 0.05 / 3, 0.55)


@needs_node
class SineStoryTests(SimpleTestCase):
    def test_five_words(self):
        story = js(MATH, "m.STORY")
        self.assertEqual([s['word'] for s in story], ['jyā', 'jīvā', 'jība', 'jaib', 'sinus'])

    def test_half_chord_is_the_sine(self):
        for theta in (10, 40, 75):
            self.assertAlmostEqual(js(MATH, f"m.halfChord(1, {theta})"), math.sin(math.radians(theta)), places=12)
            self.assertAlmostEqual(js(MATH, f"m.chord(2, {theta})"), 4 * math.sin(math.radians(theta)), places=12)
            # the chord really is the distance between the two ends of the arc 2θ
            R = 3
            ends = [(R * math.cos(math.radians(theta)), R * math.sin(math.radians(theta))),
                    (R * math.cos(math.radians(theta)), -R * math.sin(math.radians(theta)))]
            self.assertAlmostEqual(js(MATH, f"m.chord({R}, {theta})"), math.dist(*ends), places=12)


@needs_node
class SolveTests(SimpleTestCase):
    def test_every_case_is_a_consistent_triangle(self):
        cases = [
            ('ha', "{A: 35, c: 10, b: 0, a: 0}"), ('ha', "{A: 62, c: 7.5, b: 0, a: 0}"),
            ('la', "{A: 35, c: 0, b: 8, a: 0}"), ('la', "{A: 70, c: 0, b: 2, a: 0}"),
            ('ll', "{A: 0, c: 0, b: 8, a: 5}"), ('ll', "{A: 0, c: 0, b: 1, a: 20}"),
            ('hl', "{A: 0, c: 10, b: 0, a: 5}"), ('hl', "{A: 0, c: 3, b: 0, a: 2.5}"),
        ]
        for kind, given in cases:
            t = js(MATH, f"m.solveRight('{kind}', {given})")
            self.assertAlmostEqual(t['a'] ** 2 + t['b'] ** 2, t['c'] ** 2, places=9, msg=(kind, given))
            self.assertAlmostEqual(t['A'] + t['B'], 90, places=9)
            self.assertAlmostEqual(t['a'] / t['c'], math.sin(math.radians(t['A'])), places=9, msg=(kind, given))
            self.assertAlmostEqual(t['a'] / t['b'], math.tan(math.radians(t['A'])), places=9, msg=(kind, given))

    def test_worked_values(self):
        t = js(MATH, "m.solveRight('ha', {A: 35, c: 10, b: 0, a: 0})")
        self.assertAlmostEqual(t['a'], 10 * math.sin(math.radians(35)), places=12)
        self.assertEqual(round(t['a'], 2), 5.74)
        self.assertEqual(round(t['b'], 2), 8.19)
        t = js(MATH, "m.solveRight('ll', {A: 0, c: 0, b: 8, a: 5})")
        self.assertEqual(round(t['A'], 2), 32.01)
        self.assertEqual(round(t['c'], 3), 9.434)


@needs_node
class AccuracyTests(SimpleTestCase):
    def test_the_books_table(self):
        got = js(MATH, "m.PRECISION")
        self.assertEqual([p['sf'] for p in got], [2, 3, 4, 5])
        self.assertAlmostEqual(got[0]['half'], 0.5)
        self.assertAlmostEqual(got[1]['half'], 5 / 60)
        self.assertAlmostEqual(got[2]['half'], 0.5 / 60)
        self.assertAlmostEqual(got[3]['half'], 5 / 3600)

    def test_the_two_errors_are_of_the_same_order_at_middle_angles(self):
        for A in (30, 35, 45, 55):
            for p in js(MATH, "m.PRECISION"):
                spread = js(MATH, f"m.angleSpread({A}, {p['half']})")
                value = 50 * math.sin(math.radians(A))
                digits = js(MATH, f"m.roundingSpread({value}, {p['sf']})")
                self.assertLess(max(spread, digits) / min(spread, digits), 4.5, msg=(A, p['sf']))

    def test_values(self):
        half = math.radians(0.5)
        expected = (math.sin(math.radians(35) + half) - math.sin(math.radians(35) - half)) / (2 * math.sin(math.radians(35)))
        self.assertAlmostEqual(js(MATH, "m.angleSpread(35, 0.5)"), expected, places=12)
        self.assertAlmostEqual(js(MATH, "m.roundingSpread(28.7, 2)"), 0.5 / 28.7, places=12)
        self.assertAlmostEqual(js(MATH, "m.roundingSpread(28.7, 3)"), 0.05 / 28.7, places=12)


@needs_node
class ElevationTests(SimpleTestCase):
    def test_elevation_and_height(self):
        self.assertAlmostEqual(js(MATH, "m.elevation(28.4, 40)"), math.degrees(math.atan(28.4 / 40)), places=12)
        self.assertAlmostEqual(js(MATH, "m.heightFromAngle(40, m.elevation(28.4, 40), 1.6)"), 30.0, places=9)
        self.assertAlmostEqual(js(MATH, "m.heightFromAngle(20, 45, 0)"), 20.0, places=12)

    def test_two_sightings(self):
        for H, d1, s in ((30, 40, 20), (10, 20, 10), (50, 60, 40), (25, 33, 17)):
            a = math.degrees(math.atan(H / d1))
            b = math.degrees(math.atan(H / (d1 + s)))
            self.assertAlmostEqual(js(MATH, f"m.heightFromTwo({a}, {b}, {s})"), H, places=9)

    def test_whole_degrees_throw_the_answer_off(self):
        a = round(math.degrees(math.atan(30 / 40)))
        b = round(math.degrees(math.atan(30 / 60)))
        got = js(MATH, f"m.heightFromTwo({a}, {b}, 20)")
        self.assertGreater(abs(got - 30), 0.5)
        self.assertEqual(js(MATH, "m.nearestDegree(36.87)"), 37)


@needs_node
class RefractionTests(SimpleTestCase):
    def test_snell(self):
        for medium, n in (('water', 1.33), ('glass', 1.5), ('diamond', 2.42)):
            for alpha in (5, 20, 45, 60, 85):
                beta = js(MATH, f"m.refractAngle({alpha}, 1, m.N.{medium})")
                self.assertAlmostEqual(math.sin(math.radians(alpha)) / math.sin(math.radians(beta)), n, places=9)
                self.assertLess(beta, alpha)

    def test_angles_are_not_proportional(self):
        ratios = [a / js(MATH, f"m.refractAngle({a}, 1, 1.5)") for a in (10, 40, 80)]
        self.assertGreater(max(ratios) - min(ratios), 0.1)

    def test_the_largest_angle_in_water(self):
        self.assertAlmostEqual(js(MATH, "m.refractAngle(90, 1, 1.33)"), math.degrees(math.asin(1 / 1.33)), places=9)
        self.assertEqual(round(math.degrees(math.asin(1 / 1.33)), 1), 48.8)
        self.assertIsNone(js(MATH, "m.refractAngle(60, 1.5, 1)"))  # glass to air at 60° cannot leave


@needs_node
class WakeTests(SimpleTestCase):
    def test_half_angle(self):
        for r in (1.1, 1.3, 1.5, 2.5, 4):
            self.assertAlmostEqual(js(MATH, f"m.wakeHalfAngle({r})"), math.degrees(math.asin(1 / r)), places=12)
        self.assertAlmostEqual(js(MATH, "m.wakeHalfAngle(2)"), 30.0, places=12)
        self.assertAlmostEqual(js(MATH, "m.wakeHalfAngle(1.5)"), 41.8103, places=3)

    def test_presets(self):
        wakes = js(MATH, "m.WAKES")
        self.assertEqual(set(wakes), {'boat', 'jet', 'particle'})
        # light in water: c / 1.33
        self.assertAlmostEqual(wakes['particle']['speed'], 3e8 / 1.33, delta=0.01e8)
        for w in wakes.values():
            self.assertGreater(w['ratio'], 1)

    def test_rings_touch_the_cone(self):
        # a ring of radius r centred d behind the source is tangent to a line at half-angle φ when r / d = sin φ
        for ratio in (1.5, 2.5):
            phi = math.radians(js(MATH, f"m.wakeHalfAngle({ratio})"))
            for k in (1, 4, 8):
                self.assertAlmostEqual(k / (k * ratio), math.sin(phi), places=12)
