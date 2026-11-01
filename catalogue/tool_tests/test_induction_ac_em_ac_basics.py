"""Every number the AC Basics box shows, worked out in Python, then checked against the JS."""
import cmath
import math
from pathlib import Path

from django.conf import settings
from django.test import SimpleTestCase

from .helpers import js, needs_node

LIB = 'lib/phasor.js'
MATH = 'tools/induction-ac-em/_ac-basics-math.js'
TOOLS = Path(settings.BASE_DIR) / 'static/viz/tools/induction-ac-em'
STEPS = 20000


def cycle_mean(f):
    return sum(f((k + 0.5) / STEPS * math.tau) for k in range(STEPS)) / STEPS


def integral(f, a, b, steps=STEPS):
    h = (b - a) / steps
    return sum(f(a + (k + 0.5) * h) for k in range(steps)) * h


@needs_node
class PhasorLibraryTests(SimpleTestCase):
    def test_shadows(self):
        self.assertAlmostEqual(js(LIB, 'm.height(8, Math.PI / 3)'), 8 * math.sin(math.pi / 3))
        self.assertAlmostEqual(js(LIB, 'm.project(8, Math.PI / 3)'), 4)

    def test_adding_arrows(self):
        got = js(LIB, 'm.addPhasors([{size:3,angle:0},{size:4,angle:Math.PI/2}])')
        self.assertAlmostEqual(got['size'], 5)
        self.assertAlmostEqual(got['angle'], math.atan2(4, 3))

    def test_arrows_that_cancel_have_no_direction(self):
        got = js(LIB, 'm.addPhasors([{size:3,angle:0},{size:3,angle:Math.PI}])')
        self.assertEqual(got, {'size': 0, 'angle': 0})


@needs_node
class RmsTests(SimpleTestCase):
    def test_means_of_a_sine(self):
        peak = 5
        self.assertAlmostEqual(js(MATH, f'm.meanCurrent({peak})'), 0, places=9)
        self.assertAlmostEqual(js(MATH, f'm.meanSize({peak})'), cycle_mean(lambda p: abs(peak * math.sin(p))), places=5)
        self.assertAlmostEqual(js(MATH, f'm.meanSize({peak})'), 2 * peak / math.pi, places=5)
        self.assertAlmostEqual(js(MATH, f'm.meanSquare({peak})'), 12.5, places=6)

    def test_rms_is_the_root_of_the_mean_square(self):
        for peak in (1, 3.5, 5, 6):
            want = math.sqrt(cycle_mean(lambda p: (peak * math.sin(p)) ** 2))
            self.assertAlmostEqual(js(MATH, f'm.rms({peak})'), want, places=6)

    def test_default_heat_per_cycle(self):
        # 5 A peak in 10 Ω at 50 Hz, heat added up over one cycle of 20 ms
        omega = math.tau * 50
        want = integral(lambda t: (5 * math.sin(omega * t)) ** 2 * 10, 0, 0.02)
        self.assertAlmostEqual(js(MATH, 'm.acHeat(5, 10, 0.02)'), want, places=6)
        self.assertAlmostEqual(want, 2.5, places=6)
        self.assertAlmostEqual(js(MATH, 'm.dcHeat(2, 10, 0.02)'), 0.8)

    def test_wrong_guesses(self):
        # the peak gives twice the heat, and the mean size only 8/π² of it
        self.assertAlmostEqual(js(MATH, 'm.dcHeat(5, 10, 0.02) / m.acHeat(5, 10, 0.02)'), 2)
        self.assertAlmostEqual(js(MATH, 'm.dcHeat(m.meanSize(5), 10, 0.02) / m.acHeat(5, 10, 0.02)'), 8 / math.pi ** 2, places=5)
        self.assertAlmostEqual(8 / math.pi ** 2, 0.8106, places=4)

    def test_match_survives_any_resistance(self):
        for R in (5, 10, 50):
            self.assertAlmostEqual(js(MATH, f'm.dcHeat(m.rms(5), {R}, 0.02) / m.acHeat(5, {R}, 0.02)'), 1)

    def test_shifted_curve_adds_to_the_peak_square(self):
        for p in (0.3, 1.2, 4):
            self.assertAlmostEqual(js(MATH, f'm.iSquared(5, {p}) + m.iSquaredShifted(5, {p})'), 25)

    def test_areas_balance_only_at_the_match(self):
        got = js(MATH, 'm.aroundLevel(5, 12.5)')
        self.assertAlmostEqual(got['above'], got['below'], places=6)
        got = js(MATH, 'm.aroundLevel(5, 4)')
        want = cycle_mean(lambda p: max((5 * math.sin(p)) ** 2 - 4, 0))
        self.assertAlmostEqual(got['above'], want, places=3)
        self.assertGreater(got['above'], got['below'])


@needs_node
class AddingWavesTests(SimpleTestCase):
    def test_arrows_give_the_sum_at_every_instant(self):
        for a, b, deg in ((8, 5, 60), (3, 3, 120), (7.5, 1, 175), (2, 5, 0)):
            phi = math.radians(deg)
            for p in (0, 0.7, 2.1, 3.3, 5.5):
                want = a * math.sin(p) + b * math.sin(p + phi)
                self.assertAlmostEqual(js(MATH, f'm.sumByHand({a}, {b}, {phi}, {p})'), want)
                self.assertAlmostEqual(js(MATH, f'm.sumOfArrows({a}, {b}, {phi}, {p})'), want)

    def test_peak_of_the_sum(self):
        cases = {60: math.sqrt(129), 0: 13, 180: 3}
        for deg, want in cases.items():
            self.assertAlmostEqual(js(MATH, f'm.twoWaves(8, 5, {math.radians(deg)}).size'), want)

    def test_equal_peaks_at_120_degrees_give_the_same_peak(self):
        self.assertAlmostEqual(js(MATH, f'm.twoWaves(5, 5, {math.radians(120)}).size'), 5)


@needs_node
class LagLeadTests(SimpleTestCase):
    def slope(self, f, p, h=1e-5):
        return (f(p + h) - f(p - h)) / (2 * h)

    def test_right_phases(self):
        self.assertEqual(js(MATH, "['R','L','C'].map((k) => m.PARTS[k].right)"), [0, -90, 90])
        for part in ('R', 'L', 'C'):
            right = js(MATH, f"m.PARTS.{part}.right")
            self.assertEqual(js(MATH, f"m.ruleGap('{part}', {right})"), 0)
        self.assertGreater(js(MATH, "m.ruleGap('L', 0)"), 1)
        self.assertGreater(js(MATH, "m.ruleGap('C', 0)"), 1)

    def test_inductor_rule_is_the_slope_of_the_current(self):
        for deg in (0, -90, 45):
            i = lambda p, d=deg: math.sin(p + math.radians(d))  # noqa: E731
            for p in (0.4, 2, 5):
                self.assertAlmostEqual(js(MATH, f"m.ruleCurve('L', {deg}, {p})"), self.slope(i, p), places=6)

    def test_capacitor_rule_is_the_slope_of_the_voltage(self):
        for p in (0.4, 2, 5):
            self.assertAlmostEqual(js(MATH, f"m.ruleCurve('C', 30, {p})"), self.slope(math.sin, p), places=6)

    def test_gap_is_the_biggest_miss_over_a_cycle(self):
        for part, deg, curve, target in (
            ('L', 0, lambda p: math.cos(p), lambda p: math.sin(p)),
            ('L', -60, lambda p: math.cos(p - math.pi / 3), lambda p: math.sin(p)),
            ('C', 0, lambda p: math.cos(p), lambda p: math.sin(p)),
            ('C', 150, lambda p: math.cos(p), lambda p: math.sin(p + 5 * math.pi / 6)),
            ('R', 45, lambda p: math.sin(p + math.pi / 4), lambda p: math.sin(p)),
        ):
            want = max(abs(curve(k / 3600 * math.tau) - target(k / 3600 * math.tau)) for k in range(3600))
            self.assertAlmostEqual(js(MATH, f"m.ruleGap('{part}', {deg})"), want, places=4)

    def test_peak_gap_is_a_quarter_cycle(self):
        # the tool's right phases, from the JS: i peaks 90° after v in L and 90° before it in C
        peak = lambda shift: max(range(360), key=lambda d: math.sin(math.radians(d + shift)))  # noqa: E731
        self.assertEqual(peak(0), 90)
        self.assertEqual(peak(js(MATH, 'm.PARTS.L.right')), 180)
        self.assertEqual(peak(js(MATH, 'm.PARTS.C.right')), 0)


@needs_node
class ReactanceTests(SimpleTestCase):
    def test_default_reactances(self):
        self.assertAlmostEqual(js(MATH, 'm.reactanceL(50, 0.2)'), math.tau * 50 * 0.2)
        self.assertAlmostEqual(js(MATH, 'm.reactanceL(50, 0.2)'), 62.83, places=2)
        self.assertAlmostEqual(js(MATH, 'm.reactanceC(50, 25e-6)'), 127.32, places=2)

    def test_crossover(self):
        got = js(MATH, 'm.crossoverFreq(0.2, 25e-6)')
        self.assertAlmostEqual(got, 71.18, places=2)
        self.assertAlmostEqual(js(MATH, f'm.reactanceL({got}, 0.2) / m.reactanceC({got}, 25e-6)'), 1)

    def test_hump_area_builds_the_current_swing(self):
        vm, f, L = 10, 50, 0.2
        omega = math.tau * f
        area = integral(lambda t: vm * math.sin(omega * t), 0, 1 / (2 * f))
        self.assertAlmostEqual(js(MATH, f'm.humpArea({vm}, {f})'), area, places=6)
        self.assertAlmostEqual(area / L, 2 * vm / (omega * L), places=6)
        self.assertAlmostEqual(js(MATH, f'm.peakCurrentL({vm}, {f}, {L})'), area / L / 2, places=6)

    def test_charge_moved_does_not_depend_on_frequency(self):
        vm, C = 10, 25e-6
        for f in (25, 50, 200):
            peak = js(MATH, f'm.peakCurrentC({vm}, {f}, {C})')
            charge = integral(lambda t: peak * math.sin(math.tau * f * t), 0, 1 / (2 * f))
            self.assertAlmostEqual(charge * 1e6, 500, places=4)
        self.assertAlmostEqual(js(MATH, f'm.chargeSwing({vm}, {C})') * 1e6, 500)

    def test_doubling_the_frequency(self):
        self.assertAlmostEqual(js(MATH, 'm.peakCurrentL(10, 100, 0.2) / m.peakCurrentL(10, 50, 0.2)'), 0.5)
        self.assertAlmostEqual(js(MATH, 'm.peakCurrentC(10, 100, 25e-6) / m.peakCurrentC(10, 50, 25e-6)'), 2)

    def test_plot_windows_hold_the_slider_extremes(self):
        source = (TOOLS / 'why-does-reactance-depend-on-frequency.js').read_text(encoding='utf-8')
        self.assertIn('const I_MAX = 0.35', source)
        self.assertIn('const X_MAX = 650', source)
        self.assertLess(10 / (math.tau * 25 * 0.2), 0.35)
        self.assertLess(10 * math.tau * 200 * 25e-6, 0.35)
        self.assertLess(math.tau * 200 * 0.4, 650)
        self.assertLess(1 / (math.tau * 25 * 10e-6), 650)


@needs_node
class BuilderTests(SimpleTestCase):
    CIRCUIT = "{on:{R:%s,L:%s,C:%s},R:30,L:0.2,C:100e-6,f:50,im:1}"

    def solved(self, R, L, C):
        return js(MATH, 'm.seriesCircuit(%s)' % (self.CIRCUIT % (R, L, C)))

    def test_default_against_complex_impedance(self):
        omega = math.tau * 50
        z = 30 + 1j * (omega * 0.2) + 1 / (1j * omega * 100e-6)
        got = self.solved('true', 'true', 'true')
        self.assertAlmostEqual(got['Z'], abs(z))
        self.assertAlmostEqual(got['V'], abs(z))  # 1 A peak
        self.assertAlmostEqual(got['phi'], -cmath.phase(z))  # NCERT's φ is the current's phase ahead of v
        self.assertAlmostEqual(got['XL'], 62.83, places=2)
        self.assertAlmostEqual(got['XC'], 31.83, places=2)
        self.assertAlmostEqual(math.degrees(got['phi']), -45.9, places=1)

    def test_shown_rule_for_phi(self):
        got = self.solved('true', 'true', 'true')
        self.assertAlmostEqual(math.tan(got['phi']), (got['XC'] - got['XL']) / got['R'])

    def test_one_part_can_exceed_the_source(self):
        # the Try prompt depends on this, and the default circuit already shows it
        got = self.solved('true', 'true', 'true')
        self.assertGreater(got['VL'], got['V'])

    def test_single_parts(self):
        self.assertAlmostEqual(self.solved('true', 'false', 'false')['phi'], 0)
        self.assertAlmostEqual(self.solved('false', 'true', 'false')['phi'], -math.pi / 2)
        self.assertAlmostEqual(self.solved('false', 'false', 'true')['phi'], math.pi / 2)

    def test_phase_words(self):
        self.assertEqual(js(MATH, 'm.phaseWords(0)'), 'In step')
        self.assertEqual(js(MATH, 'm.phaseWords(Math.PI / 2)'), 'Current leads by 90°')
        self.assertEqual(js(MATH, 'm.phaseWords(-Math.PI / 2)'), 'Current lags by 90°')
        self.assertEqual(js(MATH, 'm.phaseWords(null)'), 'No voltage to compare')

    def test_empty_circuit_and_perfect_cancelling(self):
        got = self.solved('false', 'false', 'false')
        self.assertEqual((got['V'], got['Z'], got['phi']), (0, 0, None))
        C = 1 / ((math.tau * 50) ** 2 * 0.2)
        got = js(MATH, f'm.seriesCircuit({{on:{{R:false,L:true,C:true}},R:30,L:0.2,C:{C},f:50,im:1}})')
        self.assertEqual((got['V'], got['Z'], got['phi']), (0, 0, None))

    def test_near_resonance_is_within_the_sliders(self):
        # the Try prompt: 35 Hz is the closest step to 1/(2π√LC) = 35.6 Hz
        f0 = 1 / (math.tau * math.sqrt(0.2 * 100e-6))
        self.assertAlmostEqual(f0, 35.59, places=2)
        got = js(MATH, 'm.seriesCircuit({on:{R:true,L:true,C:true},R:30,L:0.2,C:100e-6,f:35,im:1})')
        self.assertLess(abs(math.degrees(got['phi'])), 3)

    def test_ring_scale(self):
        for r, want in ((69.6, 80), (43.1, 50), (10, 10), (31.8, 40), (150, 150), (0, 10)):
            self.assertAlmostEqual(js(MATH, f'm.ringScale({r})'), want)


@needs_node
class MainsTests(SimpleTestCase):
    def test_peaks(self):
        self.assertAlmostEqual(js(MATH, 'm.peakOf(230)'), 230 * math.sqrt(2))
        self.assertEqual(round(230 * math.sqrt(2), 1), 325.3)
        self.assertEqual(round(2 * 230 * math.sqrt(2), 1), 650.5)
        self.assertEqual(round(120 * math.sqrt(2), 1), 169.7)
        self.assertEqual(round(100 * math.sqrt(2), 1), 141.4)

    def test_rms_of_the_peak_is_the_meter_reading(self):
        peak = js(MATH, 'm.peakOf(230)')
        self.assertAlmostEqual(math.sqrt(cycle_mean(lambda p: (peak * math.sin(p)) ** 2)), 230, places=5)

    def test_places(self):
        self.assertEqual(js(MATH, 'm.MAINS.map((p) => [p.name, p.V, p.f])'),
                         [['India', 230, 50], ['USA', 120, 60], ['Tokyo', 100, 50]])

    def test_half_the_time_above_the_meter_value(self):
        for V in (100, 230, 250):
            peak = V * math.sqrt(2)
            share = cycle_mean(lambda p: 1 if abs(peak * math.sin(p)) > V else 0)
            self.assertAlmostEqual(share, 0.5, places=3)
            self.assertAlmostEqual(js(MATH, f'm.shareAbove({peak}, {V})'), share, places=3)

    def test_time_past_a_limit(self):
        peak = 230 * math.sqrt(2)
        share = cycle_mean(lambda p: 1 if abs(peak * math.sin(p)) > 250 else 0)
        self.assertAlmostEqual(js(MATH, f'm.shareAbove({peak}, 250)'), share, places=3)
        self.assertEqual(js(MATH, f'm.shareAbove({peak}, 330)'), 0)

    def test_smallest_safe_limit_on_the_slider(self):
        self.assertEqual(math.ceil(230 * math.sqrt(2) / 10) * 10, 330)

    def test_peak_comes_at_5_ms(self):
        self.assertAlmostEqual(math.sin(math.tau * 50 * 0.005), 1)
