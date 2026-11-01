"""Facts the What is a Function? tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/functions-graphs/_what-is-a-function-math.js'


@needs_node
class OneOutputTests(SimpleTestCase):
    def test_vertical_line_counts(self):
        # the circle x^2 + y^2 = 9 meets x = 0 at y = 3 and y = -3, and touches x = 3 once
        self.assertEqual(sorted(js(MATH, "m.outputs('circle', 0)")), [-3, 3])
        self.assertEqual(js(MATH, "m.outputs('circle', 3)"), [0])
        self.assertEqual(js(MATH, "m.outputs('circle', 3.5)"), [])
        self.assertEqual(sorted(js(MATH, "m.outputs('sideways', 4)")), [-2, 2])
        self.assertEqual(js(MATH, "m.outputs('sideways', 0)"), [0])
        self.assertEqual(js(MATH, "m.outputs('sideways', -1)"), [])
        self.assertEqual(js(MATH, "m.outputs('parabola', 2)"), [2])
        self.assertEqual(js(MATH, "m.outputs('line', 4)"), [3])

    def test_which_curves_are_functions(self):
        self.assertTrue(js(MATH, "m.isFunction('line')"))
        self.assertTrue(js(MATH, "m.isFunction('parabola')"))
        self.assertFalse(js(MATH, "m.isFunction('sideways')"))
        self.assertFalse(js(MATH, "m.isFunction('circle')"))


@needs_node
class DomainTests(SimpleTestCase):
    def test_where_each_function_works(self):
        for x in (-3, -0.5, 0, 0.5, 1, 1.5, 4):
            self.assertEqual(js(MATH, f"m.RESTRICTED.sqrt.ok({x})"), x >= 0)
            self.assertEqual(js(MATH, f"m.RESTRICTED.recip.ok({x})"), x != 0)
            self.assertEqual(js(MATH, f"m.RESTRICTED.log.ok({x})"), x > 0)
            self.assertEqual(js(MATH, f"m.RESTRICTED.both.ok({x})"), x > 1)
        self.assertIsNone(js(MATH, "m.valueOf('sqrt', -1)"))
        self.assertAlmostEqual(js(MATH, "m.valueOf('log', 2)"), math.log(2), places=12)
        self.assertAlmostEqual(js(MATH, "m.valueOf('both', 5)"), 0.5, places=12)


@needs_node
class QuotientTests(SimpleTestCase):
    def test_difference_quotient_of_x_squared_is_2x_plus_h(self):
        for x in (0.5, 1, 2.5, 3):
            for h in (0.01, 0.5, 1.5, 2):
                self.assertAlmostEqual(js(MATH, f"m.quotient(m.FNS.square.f, {x}, {h})"), 2 * x + h, places=9)
                self.assertAlmostEqual(js(MATH, f"m.quotient(m.FNS.cube.f, {x}, {h})"), 3 * x * x + 3 * x * h + h * h, places=9)
                expected = (math.sqrt(x + h) - math.sqrt(x)) / h
                self.assertAlmostEqual(js(MATH, f"m.quotient(m.FNS.root.f, {x}, {h})"), expected, places=9)

    def test_quotient_approaches_the_slope(self):
        for name, slope in (('square', lambda x: 2 * x), ('cube', lambda x: 3 * x * x), ('root', lambda x: 0.5 / math.sqrt(x))):
            for x in (1, 2):
                self.assertAlmostEqual(js(MATH, f"m.quotient(m.FNS.{name}.f, {x}, 1e-6)"), slope(x), places=4)
                self.assertAlmostEqual(js(MATH, f"m.FNS.{name}.slope({x})"), slope(x), places=12)

    def test_f_of_x_plus_h_is_not_f_of_x_plus_h(self):
        for x, h in ((2, 1), (0, 1), (3, 0.5)):
            self.assertAlmostEqual(js(MATH, f"m.shiftGap(m.FNS.square.f, {x}, {h})"), 2 * x * h + h * h - h, places=12)
        # a slope-3 line is off by 2h, and f(x) = x is the only one that matches
        self.assertAlmostEqual(js(MATH, "m.shiftGap((x) => 3 * x, 2, 1.5)"), 3.0, places=12)
        self.assertEqual(js(MATH, "m.shiftGap((x) => x, 2.5, 1.5)"), 0)


@needs_node
class EqualFunctionsTests(SimpleTestCase):
    def test_which_pairs_are_equal(self):
        self.assertFalse(js(MATH, "m.sameFunction('cancel')"))
        self.assertFalse(js(MATH, "m.sameFunction('factor')"))
        self.assertTrue(js(MATH, "m.sameFunction('abs')"))
        self.assertTrue(js(MATH, "m.sameFunction('expand')"))

    def test_the_holes(self):
        self.assertIsNone(js(MATH, "(Number.isNaN(m.PAIRS.cancel.G(0)) ? null : 1)"))
        self.assertEqual(js(MATH, "m.PAIRS.cancel.F(0)"), 0)
        self.assertEqual(js(MATH, "m.PAIRS.factor.F(1)"), 2)
        self.assertIsNone(js(MATH, "(Number.isNaN(m.PAIRS.factor.G(1)) ? null : 1)"))
        for x in (-2, 0.5, 3):
            self.assertAlmostEqual(js(MATH, f"m.PAIRS.factor.G({x})"), x + 1, places=12)


@needs_node
class RelationTests(SimpleTestCase):
    def test_counts(self):
        for p in range(2, 5):
            for q in range(2, 6):
                self.assertEqual(js(MATH, f"m.cells({p}, {q})"), p * q)
                self.assertEqual(js(MATH, f"m.relationCount({p}, {q})"), 2 ** (p * q))
                self.assertEqual(js(MATH, f"m.functionCount({p}, {q})"), q ** p)

    def test_function_counts_by_brute_force(self):
        # Every subset of a 2 x 3 grid: exactly 3^2 of the 2^6 are functions
        pairs = [(a, b) for a in (1, 2) for b in (1, 2, 3)]
        total = 0
        for mask in range(1 << len(pairs)):
            ticks = [pairs[i] for i in range(len(pairs)) if mask >> i & 1]
            if all(sum(1 for t in ticks if t[0] == a) == 1 for a in (1, 2)):
                total += 1
        self.assertEqual(total, 9)
        self.assertEqual(js(MATH, "m.functionCount(2, 3)"), total)
        self.assertEqual(js(MATH, "m.relationCount(2, 3)"), 64)

    def test_is_function_relation(self):
        self.assertTrue(js(MATH, "m.isFunctionRelation([[1, 2], [2, 3], [3, 4]], 3)"))
        self.assertFalse(js(MATH, "m.isFunctionRelation([[1, 2], [1, 3], [2, 1], [3, 4]], 3)"))
        self.assertFalse(js(MATH, "m.isFunctionRelation([[1, 2], [2, 3]], 3)"))

    def test_presets(self):
        self.assertEqual(js(MATH, "m.presetTicks('less', 3, 4)").__len__(), sum(1 for a in range(1, 4) for b in range(1, 5) if a < b))
        self.assertEqual(js(MATH, "m.presetTicks('double', 3, 4)"), [[1, 2], [2, 4]])
        self.assertTrue(js(MATH, "m.isFunctionRelation(m.presetTicks('equal', 3, 4), 3)"))
        self.assertFalse(js(MATH, "m.isFunctionRelation(m.presetTicks('less', 3, 4), 3)"))


@needs_node
class MachineTests(SimpleTestCase):
    def test_tables(self):
        xs = [-3, -2, -1, 0, 1, 2, 3]
        rules = {'lin': lambda x: 2 * x - 1, 'sq': lambda x: x * x - 2, 'abs': lambda x: abs(x) - 1, 'cube': lambda x: x ** 3 / 3}
        for name, f in rules.items():
            got = js(MATH, f"m.table('{name}', {xs})")
            for (x, y), expected in zip(got, xs):
                self.assertEqual(x, expected)
                self.assertAlmostEqual(y, f(x), places=12)
        # the plot window holds every row of every table
        for name, f in rules.items():
            lo, hi = js(MATH, f"m.RULES.{name}.y")
            for x in xs:
                self.assertTrue(lo <= f(x) <= hi, (name, x))


@needs_node
class ReadGraphTests(SimpleTestCase):
    def test_domains(self):
        self.assertEqual(js(MATH, "m.domainIntervals(m.GRAPHS.bowl)"), [{'a': -2, 'b': 3, 'ca': True, 'cb': False}])
        # [-4, 0) and [0, 4] join into [-4, 4]
        self.assertEqual(js(MATH, "m.domainIntervals(m.GRAPHS.jump)"), [{'a': -4, 'b': 4, 'ca': True, 'cb': True}])
        self.assertEqual(js(MATH, "m.domainIntervals(m.GRAPHS.root)"), [{'a': -3, 'b': 6, 'ca': True, 'cb': True}])

    def test_ranges(self):
        bowl = js(MATH, "m.rangeOf(m.GRAPHS.bowl)")
        self.assertEqual((bowl['lo'], bowl['hi']), (-2, 7))
        self.assertTrue(bowl['loClosed'])
        self.assertFalse(bowl['hiClosed'])  # x = 3 is open, so 7 is never reached
        jump = js(MATH, "m.rangeOf(m.GRAPHS.jump)")
        self.assertEqual((jump['lo'], jump['hi']), (-2, 3))
        self.assertTrue(jump['loClosed'] and jump['hiClosed'])
        root = js(MATH, "m.rangeOf(m.GRAPHS.root)")
        self.assertAlmostEqual(root['lo'], -1, places=12)
        self.assertAlmostEqual(root['hi'], 2, places=12)
        self.assertTrue(root['loClosed'] and root['hiClosed'])

    def test_values_and_domain(self):
        self.assertFalse(js(MATH, "m.inDomain(m.GRAPHS.bowl, 3)"))
        self.assertTrue(js(MATH, "m.inDomain(m.GRAPHS.bowl, -2)"))
        self.assertEqual(js(MATH, "m.valueAt(m.GRAPHS.bowl, 1)"), -1)
        self.assertEqual(js(MATH, "m.valueAt(m.GRAPHS.jump, 0)"), 3)  # the closed piece owns x = 0
        self.assertEqual(js(MATH, "m.valueAt(m.GRAPHS.jump, -1)"), 1)
        self.assertIsNone(js(MATH, "m.valueAt(m.GRAPHS.root, 6.5)"))

    def test_solutions(self):
        # bowl: x^2 - 2 = 2 gives x = -2 (closed end) and x = 2
        self.assertEqual(js(MATH, "m.solutions(m.GRAPHS.bowl, 2)"), [-2, 2])
        self.assertEqual(js(MATH, "m.solutions(m.GRAPHS.bowl, 7)"), [])  # 7 would sit at the open end x = 3
        self.assertEqual(js(MATH, "m.solutions(m.GRAPHS.bowl, -2)"), [0])
        # jump: x + 2 = 2 at x = 0 is the open end of the left piece, so only the right piece counts
        self.assertEqual(js(MATH, "m.solutions(m.GRAPHS.jump, 2)"), [1])
        self.assertEqual(js(MATH, "m.solutions(m.GRAPHS.jump, 0.5)"), [-1.5, 2.5])
        got = js(MATH, "m.solutions(m.GRAPHS.root, 1)")
        self.assertEqual(len(got), 1)
        self.assertAlmostEqual(got[0], 1, places=6)  # sqrt(x + 3) - 1 = 1 at x = 1
