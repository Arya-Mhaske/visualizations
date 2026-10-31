"""Every number the Units & Measurement tools show, worked out in Python, then checked against the JS."""
import json
import math
from decimal import ROUND_HALF_EVEN, ROUND_HALF_UP, Decimal
from pathlib import Path

from django.test import SimpleTestCase

from .helpers import STATIC, js, needs_node

MATH = 'tools/measurement-motion/_units-measurement-math.js'
SUP = str.maketrans('⁻⁰¹²³⁴⁵⁶⁷⁸⁹', '-0123456789')


def sig_figs(text):
    """The NCERT rules, written independently of the JS."""
    text = text.lstrip('-')
    if '.' in text:
        return len(text.replace('.', '').lstrip('0'))
    return len(text.lstrip('0').rstrip('0'))


def parse_shown(text):
    """'1.23 ×10⁴' or '40.7' as a Decimal."""
    if ' ×10' in text:
        mantissa, power = text.split(' ×10')
        return Decimal(mantissa) * Decimal(10) ** int(power.translate(SUP))
    return Decimal(text)


def to_places(value, places, mode=ROUND_HALF_EVEN):
    return value.quantize(Decimal(1).scaleb(-places), mode)


def to_sig(value, sf, mode=ROUND_HALF_EVEN):
    return value.quantize(Decimal(1).scaleb(value.adjusted() - sf + 1), mode)


class FactTests(SimpleTestCase):
    def test_same_table_different_counts(self):
        spans = [120 / s for s in (20, 23, 17)]
        self.assertEqual([round(x, 1) for x in spans], [6.0, 5.2, 7.1])
        self.assertEqual(120 / 100, 1.2)  # metres: one answer for everyone

    def test_light_time_for_a_metre(self):
        self.assertAlmostEqual(1 / 299792458 * 1e9, 3.33564095, places=7)
        self.assertAlmostEqual(299792458 * 3.34e-9, 1.0013068, places=6)

    def test_steradian_and_radian(self):
        self.assertAlmostEqual(2 * math.pi * (1 - math.cos(math.pi)), 4 * math.pi)
        self.assertAlmostEqual(2 * math.pi * (1 - math.cos(math.radians(40))), 1.4700, places=3)
        self.assertAlmostEqual(5 * math.radians(60), 5.2360, places=4)

    def test_title_examples_of_rounding(self):
        self.assertEqual(to_places(Decimal('2.745'), 2), Decimal('2.74'))
        self.assertEqual(to_places(Decimal('2.735'), 2), Decimal('2.74'))

    def test_ties_cancel_when_rounded_to_even(self):
        ties = [Decimal(f'2.7{d}5') for d in range(10)]
        up = sum(to_places(t, 2, ROUND_HALF_UP) - t for t in ties)
        even = sum(to_places(t, 2) - t for t in ties)
        self.assertEqual(up, Decimal('0.050'))
        self.assertEqual(even, Decimal('0'))

    def test_ncert_area_example(self):
        # 16.2 ± 0.1 cm by 10.1 ± 0.1 cm: the relative errors add to about 1.6 %
        self.assertAlmostEqual((0.1 / 16.2 + 0.1 / 10.1) * 100, 1.607, places=3)
        area = 16.2 * 10.1
        self.assertAlmostEqual(area, 163.62)
        self.assertAlmostEqual((16.3 * 10.2 - area) / area, 0.0161, places=3)  # the full upper corner

    def test_orders_apart(self):
        self.assertEqual(round(math.log10(6.4e6)) - round(math.log10(5.3e-11)), 17)

    def test_hair_by_winding(self):
        self.assertAlmostEqual(50 * 0.12, 6.0)
        self.assertAlmostEqual(1 / 50, 0.02)


@needs_node
class ModuleTests(SimpleTestCase):
    def test_people_and_units(self):
        counts = js(MATH, 'm.PEOPLE.map((p) => m.unitsAcross(120, m.unitLength(p, "span")))')
        for got, size in zip(counts, (20, 23, 17)):
            self.assertAlmostEqual(got, 120 / size)
        self.assertEqual(js(MATH, 'm.PEOPLE.map((p) => m.unitsAcross(120, m.unitLength(p, "metre")))'), [1.2, 1.2, 1.2])

    def test_constants_of_nature(self):
        self.assertAlmostEqual(js(MATH, 'm.lightTimeNs(1)'), 1 / 299792458 * 1e9)
        self.assertAlmostEqual(js(MATH, 'm.lightDistance(3.34)'), 299792458 * 3.34e-9)
        self.assertEqual(js(MATH, 'm.C'), 299792458)
        self.assertEqual(js(MATH, 'm.CAESIUM_HZ'), 9192631770)
        self.assertAlmostEqual(js(MATH, 'm.artefactDrift(100)'), 50)

    def test_unit_strings_and_names(self):
        self.assertEqual(js(MATH, 'm.unitString({kg:1,m:1,s:-2})'), 'kg m s⁻²')
        self.assertEqual(js(MATH, 'm.unitString({kg:1,m:2,s:-3})'), 'kg m² s⁻³')
        self.assertEqual(js(MATH, 'm.unitString({kg:0,m:0,s:0})'), '1 (no unit)')
        self.assertEqual(js(MATH, 'm.derivedName({kg:1,m:1,s:-2}).unit'), 'newton (N)')
        self.assertEqual(js(MATH, 'm.derivedName({kg:1,m:2,s:-2}).unit'), 'joule (J)')
        self.assertEqual(js(MATH, 'm.derivedName({kg:1,m:2,s:-3}).unit'), 'watt (W)')
        self.assertIsNone(js(MATH, 'm.derivedName({kg:2,m:2,s:2})'))
        self.assertEqual(js(MATH, 'm.BASES.length'), 7)

    def test_derived_units_are_built_by_the_rules(self):
        by = js(MATH, 'Object.fromEntries(m.DERIVED.map((d) => [d.key, [d.kg, d.m, d.s]]))')
        add = lambda p, q: [a + b for a, b in zip(p, q)]
        self.assertEqual(by['speed'], [0, 1, -1])  # m / s
        self.assertEqual(by['acceleration'], add(by['speed'], [0, 0, -1]))  # v / s
        self.assertEqual(by['newton'], add([1, 0, 0], by['acceleration']))  # kg × a
        self.assertEqual(by['joule'], add(by['newton'], [0, 1, 0]))  # N × m
        self.assertEqual(by['watt'], add(by['joule'], [0, 0, -1]))  # J / s
        self.assertEqual(by['pascal'], add(by['newton'], [0, -2, 0]))  # N / m²
        self.assertEqual(by['hertz'], [0, 0, -1])  # 1 / s

    def test_radian_and_steradian(self):
        self.assertAlmostEqual(js(MATH, 'm.solidAngle(Math.PI)'), 4 * math.pi)
        self.assertAlmostEqual(js(MATH, 'm.solidAngle(Math.PI/2)'), 2 * math.pi)
        self.assertAlmostEqual(js(MATH, 'm.capArea(5, 40*Math.PI/180)'), 25 * 2 * math.pi * (1 - math.cos(math.radians(40))))
        a, b = js(MATH, '[m.capArea(2, 1)/4, m.capArea(7, 1)/49]')  # area ÷ r² does not depend on r
        self.assertAlmostEqual(a, b)
        self.assertAlmostEqual(js(MATH, 'm.arcLength(5, 60*Math.PI/180)'), 5 * math.pi / 3)

    def test_sig_figs_match_the_ncert_rules(self):
        cases = {'2.308': 4, '0.02308': 4, '23.08': 4, '0.0230': 3, '23000': 2, '23000.': 5, '2.300': 4, '100.0': 4, '305': 3, '0.5': 1, '40.50': 4}
        for text, count in cases.items():
            self.assertEqual(sig_figs(text), count, text)
            self.assertEqual(js(MATH, f'm.sigFigs({text!r})'), count, text)

    def test_sig_mask_marks_exactly_the_counted_digits(self):
        for text in ('2.308', '0.02308', '23000', '0.0230', '40.50'):
            mask = js(MATH, f'm.sigMask({text!r})')
            self.assertEqual(sum(1 for item in mask if item), sig_figs(text), text)

    def test_one_length_in_every_unit_keeps_its_figures(self):
        want = {'km': '0.00002308', 'm': '0.02308', 'cm': '2.308', 'mm': '23.08', 'µm': '23080'}
        for unit, text in want.items():
            self.assertEqual(js(MATH, f'm.readingIn(3, m.LENGTH_UNITS.find((u) => u[0] === {unit!r})[1])'), text)
        for decimals, count in ((1, 2), (2, 3), (3, 4), (4, 5)):
            for shift in (0, -2, 1):
                text = js(MATH, f'm.readingIn({decimals}, {shift})')
                self.assertEqual(sig_figs(text), count, text)
        self.assertEqual(js(MATH, '[1, 2, 3, 4].map((d) => m.readingIn(d, 0))'), ['2.3', '2.31', '2.308', '2.3081'])

    def test_rounding_is_exact_half_even(self):
        for text, places in (('2.745', 2), ('2.735', 2), ('2.725', 2), ('0.125', 2), ('10.5', 0), ('11.5', 0), ('12.34567', 3)):
            got = js(MATH, f'm.showDecimal(m.roundDecimals(m.parseDecimal({text!r}), {places}))')
            self.assertEqual(Decimal(got), to_places(Decimal(text), places), text)

    def test_round_to_significant_figures(self):
        for text, sf in (('0.0023456', 2), ('12345', 3), ('99.96', 3), ('4.5', 1), ('403.74', 4), ('0.00995', 2)):
            got = js(MATH, f'm.showSig(m.roundSig(m.parseDecimal({text!r}), {sf}))')
            self.assertEqual(parse_shown(got), to_sig(Decimal(text), sf), text)

    def test_tie_rounding_totals(self):
        self.assertEqual(js(MATH, '[m.roundUp(2745), m.roundEven(2745), m.roundUp(2735), m.roundEven(2735)]'), [275, 274, 274, 274])
        self.assertAlmostEqual(js(MATH, 'm.totalBias("up")'), 0.05)
        self.assertAlmostEqual(js(MATH, 'm.totalBias("even")'), 0)
        self.assertEqual(js(MATH, '[m.tieThousandths(4), m.tieThousandths(3)]'), [2745, 2735])

    def test_sum_and_product_rules(self):
        s = js(MATH, 'm.combine("sum", "12.5", "3.256")')
        self.assertEqual(s['exact'], '15.756')
        self.assertAlmostEqual(s['error'], 0.101)
        self.assertEqual(s['ruleText'], '15.8')
        self.assertEqual(s['ruleDecimals'], 1)
        self.assertEqual(s['errorDecimals'], 1)  # an error of 0.101 first touches the tenths
        p = js(MATH, 'm.combine("product", "12.5", "3.256")')
        self.assertEqual(p['exact'], '40.7000')
        self.assertEqual(p['sf'], 3)
        self.assertEqual(p['ruleText'], '40.7')
        self.assertAlmostEqual(p['relative'], 0.1 / 12.5 + 0.001 / 3.256)
        self.assertAlmostEqual(p['error'], p['relative'] * 40.7)
        self.assertEqual(p['errorDecimals'], 1)  # 40.7 ± 0.34: the tenths are the first doubtful digit
        self.assertEqual(p['ruleDecimals'], 1)

    def test_rules_agree_with_error_bars_for_the_default_pair(self):
        for op in ('sum', 'product'):
            for da in range(4):
                for db in range(4):
                    out = js(MATH, f'(() => {{ const a = m.measure(m.TRUE_A, {da}); const b = m.measure(m.TRUE_B, {db}); return m.combine("{op}", a, b); }})()')
                    self.assertLessEqual(abs(out['ruleDecimals'] - out['errorDecimals']), 1, (op, da, db))
                    if op == 'sum':
                        self.assertEqual(out['ruleDecimals'], out['errorDecimals'], (da, db))

    def test_measure_rounds_the_true_values(self):
        self.assertEqual(js(MATH, '[m.measure(m.TRUE_A, 1), m.measure(m.TRUE_A, 0), m.measure(m.TRUE_B, 3)]'), ['12.5', '12', '3.256'])

    def test_box_strips(self):
        got = js(MATH, 'm.box(16.2, 10.1, 0.1, 0.1)')
        self.assertAlmostEqual(got['area'], 163.62)
        self.assertAlmostEqual(got['strips']['long'], 1.01)
        self.assertAlmostEqual(got['strips']['wide'], 1.62)
        self.assertAlmostEqual(got['strips']['corner'], 0.01)
        self.assertAlmostEqual(got['error'], 2.64)
        self.assertAlmostEqual(got['simple'] * 100, 1.607, places=3)
        self.assertAlmostEqual(got['relative'] * 100, 2.64 / 163.62 * 100, places=3)
        self.assertLess(abs(got['relative'] - got['simple']), 1e-4)

    def test_orders_of_magnitude(self):
        objects = js(MATH, 'm.OBJECTS.map(([name, size]) => [name, size, m.orderOf(size)])')
        by = {name: order for name, _, order in objects}
        self.assertEqual(by['Hydrogen atom'], -10)
        self.assertEqual(by['Earth radius'], 7)
        self.assertEqual(by['Earth radius'] - by['Hydrogen atom'], 17)
        sizes = [size for _, size, _ in objects]
        self.assertEqual(sizes, sorted(sizes))
        for _, size, order in objects:
            self.assertLessEqual(abs(math.log10(size) - order), 0.5)
        self.assertEqual(len(objects), 12)

    def test_hair(self):
        self.assertAlmostEqual(js(MATH, 'm.windLength(50, 0.12)'), 6.0)
        self.assertAlmostEqual(js(MATH, 'm.ruleReading(6.0, 1)'), 6.0)
        self.assertAlmostEqual(js(MATH, 'm.diameterEstimate(50, 6)'), 0.12)
        self.assertAlmostEqual(js(MATH, 'm.diameterError(50, 1)'), 0.02)
        self.assertAlmostEqual(js(MATH, 'm.diameterError(100, 0.5)'), 0.005)
        self.assertEqual(js(MATH, 'm.ruleReading(0.12, 1)'), 0)  # a single turn vanishes on a mm ruler


@needs_node
class DrillTests(SimpleTestCase):
    def questions(self, seeds):
        rng = json.dumps((Path(STATIC) / 'lib/rng.js').as_uri())
        return js(MATH, f'await import({rng}).then((r) => [...Array({seeds})].map((_, i) => m.drillQuestion(r.createRng(i + 1))))')

    def test_every_drill_answer_is_right(self):
        kinds = set()
        for q in self.questions(300):
            prompt = q['prompt']
            if prompt.startswith('How many'):
                kinds.add('count')
                text = prompt.split('does ')[1].rsplit(' have', 1)[0]
                self.assertEqual(q['answer'], sig_figs(text), prompt)
            elif prompt.startswith('Round'):
                kinds.add('round')
                value, rest = prompt[len('Round '):].split(' to ')
                sf = int(rest.split()[0])
                for mode in (ROUND_HALF_EVEN, ROUND_HALF_UP):  # no tie: both conventions agree
                    self.assertEqual(parse_shown(q['options'][q['answer']]), to_sig(Decimal(value), sf, mode), prompt)
                self.assertEqual(len(set(q['options'])), 4, prompt)
            elif ' + ' in prompt:
                kinds.add('sum')
                a, b = prompt.split(' = ')[0].split(' + ')
                places = [len(x.split('.')[1]) if '.' in x else 0 for x in (a, b)]
                self.assertNotEqual(*places)
                for mode in (ROUND_HALF_EVEN, ROUND_HALF_UP):
                    self.assertEqual(Decimal(q['options'][q['answer']]), to_places(Decimal(a) + Decimal(b), min(places), mode), prompt)
                self.assertEqual(len(set(q['options'])), 4, prompt)
            else:
                kinds.add('product')
                a, b = prompt.split(' = ')[0].split(' × ')
                low = min(sig_figs(a), sig_figs(b))
                self.assertNotEqual(sig_figs(a), sig_figs(b))
                for mode in (ROUND_HALF_EVEN, ROUND_HALF_UP):
                    self.assertEqual(parse_shown(q['options'][q['answer']]), to_sig(Decimal(a) * Decimal(b), low, mode), prompt)
                self.assertEqual(len(set(q['options'])), 4, prompt)
        self.assertEqual(kinds, {'count', 'round', 'sum', 'product'})
