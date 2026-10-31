"""Every number the Conditional Probability & Bayes tools show, with exact fractions, then checked against the JS."""
from fractions import Fraction as F
from itertools import product

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/sequences-probability/_conditional-probability-bayes-math.js'
DICE = list(product(range(1, 7), repeat=2))


class FactTests(SimpleTestCase):
    def test_positive_test_is_22_over_133(self):
        p, d, f = F(1, 1000), F(99, 100), F(1, 200)
        once = p * d / (p * d + (1 - p) * f)
        self.assertEqual(once, F(22, 133))
        self.assertEqual(round(float(once) * 100, 1), 16.5)
        self.assertEqual(round(once / p), 165)      # the page says "nearly 170 times"
        twice = once * d / (once * d + (1 - once) * f)
        self.assertEqual(round(float(twice) * 100, 1), 97.5)

    def test_bolt_is_28_over_69(self):
        shares, rates = [F(25, 100), F(35, 100), F(40, 100)], [F(5, 100), F(4, 100), F(2, 100)]
        whole = sum(s * r for s, r in zip(shares, rates))
        self.assertEqual(shares[1] * rates[1] / whole, F(28, 69))
        self.assertEqual(round(float(F(28, 69)) * 100), 41)
        self.assertEqual(sum(s * r / whole for s, r in zip(shares, rates)), 1)

    def test_exclusive_events_fail_the_product_rule(self):
        a = {o for o in DICE if o[0] == 1}
        b = {o for o in DICE if o[0] == 6}
        self.assertEqual(len(a & b), 0)
        self.assertNotEqual(F(len(a & b), 36), F(len(a), 36) * F(len(b), 36))


@needs_node
class ModuleTests(SimpleTestCase):
    def test_event_counts_match_python(self):
        expected = {'sum7': 6, 'sum8plus': 15, 'first6': 6, 'first1': 6, 'firstEven': 18, 'secondEven': 18, 'doubles': 6}
        got = js(MATH, 'Object.fromEntries(Object.entries(m.EVENTS).map(([k,[,t]])=>[k,m.count(t)]))')
        self.assertEqual(got, expected)
        self.assertEqual(sum(1 for i, j in DICE if i + j >= 8), expected['sum8plus'])

    def test_independence_flags(self):
        got = js(MATH, '[["firstEven","secondEven"],["first1","first6"],["sum7","first6"]]'
                       '.map(([a,b])=>[m.independent(m.EVENTS[a][1],m.EVENTS[b][1]),m.exclusive(m.EVENTS[a][1],m.EVENTS[b][1])])')
        self.assertEqual(got, [[True, False], [False, True], [True, False]])

    def test_bayes_values(self):
        self.assertAlmostEqual(js(MATH, 'm.illGivenPositive(0.001,0.99,0.005)'), 22 / 133)
        self.assertAlmostEqual(js(MATH, 'm.posterior([.25,.35,.4],[.05,.04,.02],1)'), 28 / 69)
        self.assertAlmostEqual(js(MATH, 'm.total([.5,.3,.2],[.2,.6,.4])'), 0.36)

    def test_drawing_without_replacement(self):
        self.assertAlmostEqual(js(MATH, 'm.drawChance(5,3,"RR")'), float(F(5, 8) * F(4, 7)))
        self.assertAlmostEqual(js(MATH, 'm.drawChance(5,3,"RB")'), js(MATH, 'm.drawChance(5,3,"BR")'))
        self.assertAlmostEqual(js(MATH, '["RR","RB","BR","BB"].reduce((s,o)=>s+m.drawChance(5,3,o),0)'), 1)
