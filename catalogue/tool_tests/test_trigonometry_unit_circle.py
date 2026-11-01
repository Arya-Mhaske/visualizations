"""Facts the Unit Circle tools show, worked out in Python, then checked against the JS module."""
import math
import re

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/trigonometry/_unit-circle-math.js'
SPECIAL = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360]


def parse(text):
    """Read an exact value such as '−√3/2' or '2√3/3' as a float, without trusting the JS number beside it."""
    t = text.replace('−', '-')
    sign = -1 if t.startswith('-') else 1
    t = t.lstrip('-')
    top, _, bottom = t.partition('/')

    def part(s):
        m = re.fullmatch(r'(\d*)√(\d+)', s)
        if m:
            return (int(m.group(1)) if m.group(1) else 1) * math.sqrt(int(m.group(2)))
        return float(s)

    return sign * part(top) / (part(bottom) if bottom else 1)


@needs_node
class PointTests(SimpleTestCase):
    def test_normalise_and_turns(self):
        for theta in (-720, -400, -90, 0, 45, 359, 360, 400, 720):
            self.assertEqual(js(MATH, f"m.normalise({theta})"), theta % 360)
            self.assertEqual(js(MATH, f"m.turns({theta})"), theta // 360)

    def test_points_and_exact_zeros(self):
        for theta in range(0, 361, 5):
            x, y = js(MATH, f"m.pointAt({theta}, 2)")
            self.assertAlmostEqual(x, 2 * math.cos(math.radians(theta)), places=12)
            self.assertAlmostEqual(y, 2 * math.sin(math.radians(theta)), places=12)
        # rounding noise is cleared, so an axis prints as exactly zero
        self.assertEqual(js(MATH, "m.pointAt(90)")[0], 0)
        self.assertEqual(js(MATH, "m.pointAt(180)")[1], 0)
        self.assertEqual(js(MATH, "m.pointAt(270)")[0], 0)


@needs_node
class QuadrantTests(SimpleTestCase):
    def test_quadrants(self):
        expected = {0: 0, 30: 1, 89: 1, 90: 0, 91: 2, 150: 2, 180: 0, 200: 3, 270: 0, 300: 4, 359: 4, 360: 0, -30: 4, 390: 1}
        for theta, q in expected.items():
            self.assertEqual(js(MATH, f"m.quadrant({theta})"), q, theta)

    def test_the_astc_rule_matches_the_real_signs(self):
        for theta in range(1, 360):
            if theta % 90 == 0:
                continue
            pos = js(MATH, f"m.positives({theta})")
            self.assertEqual(pos['sin'], math.sin(math.radians(theta)) > 0, theta)
            self.assertEqual(pos['cos'], math.cos(math.radians(theta)) > 0, theta)
            self.assertEqual(pos['tan'], math.tan(math.radians(theta)) > 0, theta)

    def test_astc_words(self):
        self.assertEqual(js(MATH, "m.ASTC"), {'1': 'All', '2': 'Sin', '3': 'Tan', '4': 'Cos'})

    def test_reference_angles(self):
        expected = {0: 0, 30: 30, 90: 90, 120: 60, 150: 30, 180: 0, 210: 30, 225: 45, 270: 90, 300: 60, 330: 30, 360: 0, 400: 40, -30: 30}
        for theta, ref in expected.items():
            self.assertEqual(js(MATH, f"m.referenceAngle({theta})"), ref, theta)

    def test_reference_angle_gives_the_size_of_the_values(self):
        for theta in range(0, 360, 7):
            ref = js(MATH, f"m.referenceAngle({theta})")
            self.assertAlmostEqual(abs(math.sin(math.radians(theta))), math.sin(math.radians(ref)), places=12, msg=theta)
            self.assertAlmostEqual(abs(math.cos(math.radians(theta))), math.cos(math.radians(ref)), places=12, msg=theta)


@needs_node
class ExactValueTests(SimpleTestCase):
    def test_every_exact_value_matches_the_real_function(self):
        for theta in SPECIAL:
            got = js(MATH, f"m.exact({theta})")
            t = math.radians(theta)
            real = {
                'sin': math.sin(t), 'cos': math.cos(t),
                'tan': math.tan(t) if abs(math.cos(t)) > 1e-9 else None,
                'cot': 1 / math.tan(t) if abs(math.sin(t)) > 1e-9 and abs(math.cos(t)) > 1e-9 else (0.0 if abs(math.cos(t)) < 1e-9 else None),
                'sec': 1 / math.cos(t) if abs(math.cos(t)) > 1e-9 else None,
                'csc': 1 / math.sin(t) if abs(math.sin(t)) > 1e-9 else None,
            }
            for name, value in real.items():
                if value is None:
                    self.assertIsNone(got[name], (theta, name))
                else:
                    self.assertIsNotNone(got[name], (theta, name))
                    text, number = got[name]
                    self.assertAlmostEqual(parse(text), value, places=9, msg=(theta, name, text))
                    self.assertAlmostEqual(number, value, places=9, msg=(theta, name))

    def test_known_entries(self):
        self.assertEqual(js(MATH, "m.exact(30).sin[0]"), '1/2')
        self.assertEqual(js(MATH, "m.exact(150).sin[0]"), '1/2')
        self.assertEqual(js(MATH, "m.exact(120).cos[0]"), '−1/2')
        self.assertEqual(js(MATH, "m.exact(225).tan[0]"), '1')
        self.assertEqual(js(MATH, "m.exact(300).sin[0]"), '−√3/2')
        self.assertEqual(js(MATH, "m.exact(60).csc[0]"), '2√3/3')
        self.assertEqual(js(MATH, "m.exact(90).sin[0]"), '1')
        self.assertEqual(js(MATH, "m.exact(270).sin[0]"), '−1')
        self.assertEqual(js(MATH, "m.exact(180).cos[0]"), '−1')

    def test_undefined_values(self):
        for theta in (90, 270):
            self.assertIsNone(js(MATH, f"m.exact({theta}).tan"))
            self.assertIsNone(js(MATH, f"m.exact({theta}).sec"))
        for theta in (0, 180, 360):
            self.assertIsNone(js(MATH, f"m.exact({theta}).cot"))
            self.assertIsNone(js(MATH, f"m.exact({theta}).csc"))

    def test_only_special_angles(self):
        # a 20° angle has no exact value in this table
        got = js(MATH, "(() => { try { m.exact(20); return 'ok'; } catch (e) { return 'error'; } })()")
        self.assertEqual(got, 'error')

    def test_tex(self):
        self.assertEqual(js(MATH, "m.texOf('1/2')"), '\\dfrac{1}{2}')
        self.assertEqual(js(MATH, "m.texOf('−√3/2')"), '-\\dfrac{\\sqrt{3}}{2}')
        self.assertEqual(js(MATH, "m.texOf('2√3/3')"), '\\dfrac{2\\sqrt{3}}{3}')
        self.assertEqual(js(MATH, "m.texOf('√2')"), '\\sqrt{2}')
        self.assertEqual(js(MATH, "m.texOf('0')"), '0')


@needs_node
class HalvesTests(SimpleTestCase):
    def test_the_two_shapes(self):
        # half of an equilateral triangle of side 2: the other leg is sqrt(4 - 1)
        half = js(MATH, "m.HALVES.equilateral")
        self.assertAlmostEqual(half['legs']['long'], math.sqrt(4 - 1), places=12)
        self.assertEqual((half['legs']['short'], half['hyp']), (1, 2))
        square = js(MATH, "m.HALVES.square")
        self.assertAlmostEqual(square['hyp'], math.hypot(1, 1), places=12)

    def test_the_sides_give_the_exact_values(self):
        for angle in (30, 45, 60):
            sides = js(MATH, f"m.SIDES_AT[{angle}]")
            opp, adj, hyp = sides['opp'][1], sides['adj'][1], sides['hyp'][1]
            self.assertAlmostEqual(opp ** 2 + adj ** 2, hyp ** 2, places=12)
            self.assertAlmostEqual(opp / hyp, math.sin(math.radians(angle)), places=12)
            self.assertAlmostEqual(adj / hyp, math.cos(math.radians(angle)), places=12)
            self.assertAlmostEqual(parse(sides['opp'][0]), opp, places=12)
            self.assertAlmostEqual(parse(sides['adj'][0]), adj, places=12)
            self.assertAlmostEqual(parse(sides['hyp'][0]), hyp, places=12)
            self.assertAlmostEqual(parse(js(MATH, f"m.exact({angle}).sin[0]")), opp / hyp, places=12)
        self.assertEqual(js(MATH, "m.sinFrom(m.HALVES.equilateral, 1)"), 0.5)


@needs_node
class IdentityTests(SimpleTestCase):
    def test_squares_sum_to_one(self):
        for theta in range(0, 361, 7):
            s = js(MATH, f"m.squares({theta})")
            self.assertAlmostEqual(s['sin2'] + s['cos2'], 1.0, places=12)
            self.assertAlmostEqual(s['sin2'], math.sin(math.radians(theta)) ** 2, places=12)

    def test_x_values_give_two_points(self):
        self.assertEqual(js(MATH, "m.pointsAtX(0)"), [1, -1])
        self.assertEqual(js(MATH, "m.pointsAtX(1)"), [0])
        self.assertEqual(js(MATH, "m.pointsAtX(-1)"), [0])
        self.assertEqual(js(MATH, "m.pointsAtX(1.2)"), [])
        got = js(MATH, "m.pointsAtX(0.6)")
        self.assertAlmostEqual(got[0], 0.8, places=12)
        self.assertAlmostEqual(got[1], -0.8, places=12)
        for x in (-0.95, -0.3, 0.45, 0.9):
            ys = js(MATH, f"m.pointsAtX({x})")
            self.assertEqual(len(ys), 2)
            for y in ys:
                self.assertAlmostEqual(x * x + y * y, 1.0, places=12)


@needs_node
class CalculatorTests(SimpleTestCase):
    def test_the_classic_mistake(self):
        self.assertAlmostEqual(js(MATH, "m.evaluate('sin', 30, 'rad')"), math.sin(30), places=12)
        self.assertEqual(round(math.sin(30), 3), -0.988)
        self.assertAlmostEqual(js(MATH, "m.evaluate('sin', 30, 'deg')"), 0.5, places=12)
        self.assertAlmostEqual(js(MATH, "m.usedAngle(30, 'rad')"), math.degrees(30) % 360, places=9)
        self.assertEqual(round(math.degrees(30) % 360, 1), 278.9)
        self.assertEqual(js(MATH, "m.usedAngle(30, 'deg')"), 30)

    def test_the_angle_used_gives_the_same_value(self):
        for fn, f in (('sin', math.sin), ('cos', math.cos)):
            for n in (1, 5, 30, 100, 360):
                used = js(MATH, f"m.usedAngle({n}, 'rad')")
                self.assertAlmostEqual(f(math.radians(used)), f(n), places=9, msg=(fn, n))

    def test_tan_near_ninety(self):
        self.assertAlmostEqual(js(MATH, "m.evaluate('tan', 89.9, 'deg')"), math.tan(math.radians(89.9)), places=6)
        self.assertEqual(round(math.tan(math.radians(89.9)), 2), 572.96)
