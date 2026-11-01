"""Facts the Sine & Cosine Graphs tools show, worked out in Python, then checked against the JS module."""
import datetime
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/trigonometry/_sine-cosine-math.js'
TAU = 2 * math.pi


def solve3(m):
    """Gaussian elimination on a 3 x 4 augmented matrix (independent of the JS)."""
    m = [row[:] for row in m]
    for i in range(3):
        p = max(range(i, 3), key=lambda r: abs(m[r][i]))
        m[i], m[p] = m[p], m[i]
        for r in range(3):
            if r != i:
                f = m[r][i] / m[i][i]
                m[r] = [a - f * b for a, b in zip(m[r], m[i])]
    return [m[i][3] / m[i][i] for i in range(3)]


def fit(points, period):
    w = TAU / period
    rows = [[1, math.sin(w * x), math.cos(w * x), y] for x, y in points]
    aug = [[sum(r[i] * r[j] for r in rows) for j in range(4)] for i in range(3)]
    B, a, b = solve3(aug)
    A, phi = math.hypot(a, b), math.atan2(-b, a)
    rms = math.sqrt(sum((y - (B + A * math.sin(w * x - phi))) ** 2 for x, y in points) / len(points))
    return B, A, phi, rms


@needs_node
class WaveTests(SimpleTestCase):
    CASES = [(1, 1, 0, 0), (2, 3, 0.5, 1), (-1.5, 0.5, -1, -0.5), (3, 4, math.pi / 4, 1), (0.5, 2, math.pi, -1)]

    def test_period_and_shift(self):
        for A, B, C, k in self.CASES:
            self.assertAlmostEqual(js(MATH, f"m.period({B})"), TAU / B, places=12)
            self.assertAlmostEqual(js(MATH, f"m.shift({B}, {C})"), -C / B, places=12)

    def test_five_key_points_lie_on_the_curve_and_are_a_quarter_period_apart(self):
        for A, B, C, k in self.CASES:
            pts = js(MATH, f"m.keyPoints({A}, {B}, {C}, {k})")
            self.assertEqual(len(pts), 5)
            P = TAU / B
            for i, p in enumerate(pts):
                self.assertAlmostEqual(p['x'], -C / B + i * P / 4, places=12)
                self.assertAlmostEqual(p['y'], k + A * math.sin(B * p['x'] + C), places=9, msg=(A, B, C, k, i))
            # middle, top, middle, bottom, middle
            self.assertAlmostEqual(pts[1]['y'], k + A, places=12)
            self.assertAlmostEqual(pts[3]['y'], k - A, places=12)
            self.assertEqual([round(pts[i]['y'] - k, 9) for i in (0, 2, 4)], [0, 0, 0])

    def test_the_tip_of_the_spinner_has_the_curve_height(self):
        for A, B, C, k in self.CASES:
            for x in (0, 0.7, 2.2, 5):
                dx, dy = js(MATH, f"m.tip({A}, {B}, {C}, {x})")
                self.assertAlmostEqual(dy, A * math.sin(B * x + C), places=12, msg=(A, B, C, x))
                self.assertAlmostEqual(math.hypot(dx, dy), abs(A), places=12)

    def test_cosine_is_a_shifted_sine(self):
        for x in (-3, -0.4, 0, 1.1, 4):
            self.assertAlmostEqual(js(MATH, f"m.cosAsSine({x})"), math.cos(x), places=12)

    def test_wave_function(self):
        for A, B, C, k in self.CASES:
            for x in (-2, 0, 1.3):
                self.assertAlmostEqual(js(MATH, f"m.wave({A}, {B}, {C}, {k})({x})"), k + A * math.sin(B * x + C), places=12)


@needs_node
class TransformationTests(SimpleTestCase):
    PARAMS = ["{A: 1.5, B: 2, C: 1, k: 1}", "{A: -2, B: 0.5, C: -3, k: -1.5}", "{A: 1, B: -1, C: 0.5, k: 2}", "{A: 0.5, B: 1.5, C: 0, k: 0}"]

    def test_moved_points_land_on_the_moved_curve(self):
        for base in ('sin', 'sq', 'abs', 'cube'):
            for params in self.PARAMS:
                got = js(MATH, f"(() => {{ const b = m.BASES.{base}; const p = {params}; "
                               f"return b.points.map((u) => {{ const q = m.transformPoint([u, b.f(u)], p); return [q[1], m.transformed(b.f, p)(q[0])]; }}); }})()")
                for y, on_curve in got:
                    self.assertAlmostEqual(y, on_curve, places=9, msg=(base, params))

    def test_sideways_shift_is_minus_c_over_b(self):
        # the point (0, f(0)) of x^2 moves to x = -C / B
        q = js(MATH, "m.transformPoint([0, 0], {A: 1, B: 2, C: 1, k: 0})")
        self.assertAlmostEqual(q[0], -0.5, places=12)

    def test_windows_hold_the_base_graphs(self):
        for base in ('sin', 'sq', 'abs', 'cube'):
            b = js(MATH, f"({{ view: m.BASES.{base}.view, ys: m.BASES.{base}.points.map((u) => m.BASES.{base}.f(u)) }})")
            lo, hi = b['view'][1]
            for y in b['ys']:
                self.assertTrue(lo <= y <= hi, (base, y))


@needs_node
class FitTests(SimpleTestCase):
    def test_gap(self):
        self.assertAlmostEqual(js(MATH, "m.gap(Math.sin, Math.sin, -6, 6)"), 0, places=12)
        # the difference of sin and cos has root-mean-square 1 over whole periods
        self.assertAlmostEqual(js(MATH, f"m.gap(Math.sin, Math.cos, {-TAU}, {TAU}, 4000)"), 1.0, delta=0.01)
        self.assertGreater(js(MATH, "m.gap(Math.sin, (x) => 2 * Math.sin(x), -6, 6)"), 0.5)

    def test_every_target_is_reachable_with_the_tools_sliders(self):
        def on_grid(value, step):
            return abs(value / step - round(value / step)) < 1e-9

        for t in js(MATH, "m.TARGETS"):
            self.assertTrue(on_grid(t['A'], 0.5) and t['A'] != 0, t)
            self.assertTrue(0.5 <= t['B'] <= 4 and on_grid(t['B'], 0.5), t)
            self.assertTrue(on_grid(t['C'], math.pi / 12), t)
            self.assertTrue(on_grid(t['k'], 0.5), t)
            self.assertTrue(-3 <= t['A'] <= 3 and -2 <= t['k'] <= 2 and abs(t['C']) <= math.pi + 1e-9, t)

    def test_matching_constants_give_a_zero_gap(self):
        t = js(MATH, "m.TARGETS[4]")
        self.assertLess(js(MATH, f"m.gap(m.wave({t['A']}, {t['B']}, {t['C']}, {t['k']}), m.wave({t['A']}, {t['B']}, {t['C']}, {t['k']}), {-TAU}, {TAU})"), 1e-12)
        # a negative A with C moved by π draws the same curve
        self.assertLess(js(MATH, "m.gap(m.wave(-2, 1, 0, 0), m.wave(2, 1, Math.PI, 0), -6, 6)"), 1e-9)


@needs_node
class AliasingTests(SimpleTestCase):
    def test_apparent_cycles(self):
        for cycles in (1, 3, 19, 20, 21, 30, 39, 40, 41, 60, 79, 80, 100, 120):
            expected = min(abs(cycles - 40 * n) for n in range(0, 5))
            self.assertAlmostEqual(js(MATH, f"m.apparentCycles({cycles}, 40)"), expected, places=9, msg=cycles)
        self.assertEqual(js(MATH, "m.apparentCycles(3, 40)"), 3)
        self.assertEqual(js(MATH, "m.apparentCycles(40, 40)"), 0)
        self.assertEqual(js(MATH, "m.apparentCycles(60, 40)"), 20)

    def test_the_samples_really_look_like_the_slower_wave(self):
        n = 40
        for cycles in (21, 35, 45, 60, 79, 100):
            apparent = js(MATH, f"m.apparentCycles({cycles}, {n})")
            pts = js(MATH, f"m.sampledPoints({cycles}, {n})")
            self.assertEqual(len(pts), n + 1)
            for i, (x, y) in enumerate(pts):
                self.assertAlmostEqual(x, i / n, places=12)
                # the same samples as a slower wave, up to a sign
                self.assertAlmostEqual(abs(y), abs(math.sin(TAU * apparent * i / n)), places=9, msg=(cycles, i))

    def test_the_two_sample_rule(self):
        self.assertEqual(js(MATH, "m.nyquist(40)"), 20)
        # below the limit the plotter is honest, above it the shown cycles are not the real ones
        for cycles in (5, 19):
            self.assertEqual(js(MATH, f"m.apparentCycles({cycles}, 40)"), cycles)
        for cycles in (21, 30, 39):
            self.assertNotEqual(js(MATH, f"m.apparentCycles({cycles}, 40)"), cycles)


@needs_node
class TiltTests(SimpleTestCase):
    def test_period_is_ninety_degrees(self):
        self.assertEqual(js(MATH, "m.TILT_PERIOD"), 90)
        for theta in range(0, 360, 13):
            self.assertAlmostEqual(js(MATH, f"m.tiltError({theta} + 90, 0.5, 2)"), js(MATH, f"m.tiltError({theta}, 0.5, 2)"), places=9)
        # and not 45 degrees
        self.assertNotAlmostEqual(js(MATH, "m.tiltError(10 + 45, 0.5, 2)"), js(MATH, "m.tiltError(10, 0.5, 2)"), places=3)

    def test_values(self):
        self.assertAlmostEqual(js(MATH, "m.tiltError(20, 0.5, 2)"), 0.5 + 2 * math.sin(math.radians(80)), places=12)
        self.assertEqual(round(0.5 + 2 * math.sin(math.radians(80)), 4), 2.4696)
        self.assertAlmostEqual(js(MATH, "m.tiltError(0, 0.5, 2)"), 0.5, places=12)
        # the swing is exactly b either side of a
        self.assertAlmostEqual(js(MATH, "m.tiltError(22.5, 0.5, 2)"), 2.5, places=9)
        self.assertAlmostEqual(js(MATH, "m.tiltError(67.5, 0.5, 2)"), -1.5, places=9)


@needs_node
class DaylightTests(SimpleTestCase):
    def test_days_of_the_year(self):
        days = [datetime.date(2023, month, 15).timetuple().tm_yday for month in range(1, 13)]
        self.assertEqual(js(MATH, "m.MID_DAYS"), days)

    def test_months_since(self):
        self.assertEqual(js(MATH, "m.monthsSince(1)"), 0)
        self.assertAlmostEqual(js(MATH, "m.monthsSince(366)"), 12.0, places=12)

    def test_declination(self):
        # the extremes are at the solstices, about +23.44° on 21 June and −23.44° on 21 December
        self.assertAlmostEqual(js(MATH, "m.declination(172)"), 23.44, delta=0.05)
        self.assertAlmostEqual(js(MATH, "m.declination(355)"), -23.44, delta=0.05)
        self.assertAlmostEqual(js(MATH, "m.declination(80)"), 0, delta=0.6)

    def test_daylight_formula(self):
        for lat in (8.5, 28.6, 34.1):
            for n in (15, 80, 172, 266, 355):
                d = math.radians(-23.44 * math.cos(TAU * (n + 10) / 365))
                expected = 24 / math.pi * math.acos(-math.tan(math.radians(lat)) * math.tan(d))
                self.assertAlmostEqual(js(MATH, f"m.daylight({lat}, {n})"), expected, places=9)

    def test_known_sizes(self):
        # equinox: close to 12 hours everywhere; June in Delhi: long; December in Srinagar: short
        self.assertAlmostEqual(js(MATH, "m.daylight(28.6, 80)"), 12.0, delta=0.15)
        self.assertGreater(js(MATH, "m.daylight(28.6, 172)"), 13.5)
        self.assertLess(js(MATH, "m.daylight(28.6, 355)"), 10.5)
        self.assertLess(js(MATH, "m.daylight(34.1, 355)"), 10.0)
        # near the equator the year hardly changes
        spread = js(MATH, "(() => { const v = m.MID_DAYS.map((n) => m.daylight(8.5, n)); return Math.max(...v) - Math.min(...v); })()")
        self.assertLess(spread, 1.1)

    def test_half_a_year_later_the_two_days_add_to_24(self):
        for lat in (8.5, 28.6, 34.1):
            for n in (10, 100, 200):
                self.assertAlmostEqual(js(MATH, f"m.daylight({lat}, {n}) + m.daylight({lat}, {n} + 365 / 2)"), 24.0, places=9)

    def test_further_from_the_equator_swings_more(self):
        spreads = []
        for city in ('tvm', 'maa', 'del', 'srn'):
            spreads.append(js(MATH, f"(() => {{ const v = m.dataFor('{city}').map((p) => p.y); return Math.max(...v) - Math.min(...v); }})()"))
        self.assertEqual(spreads, sorted(spreads))

    def test_cities(self):
        cities = js(MATH, "m.CITIES")
        self.assertEqual(set(cities), {'tvm', 'maa', 'del', 'srn'})
        self.assertEqual([cities[k]['lat'] for k in ('tvm', 'maa', 'del', 'srn')], [8.5, 13.1, 28.6, 34.1])
        self.assertEqual(len(js(MATH, "m.dataFor('del')")), 12)


@needs_node
class LeastSquaresTests(SimpleTestCase):
    def test_matches_an_independent_solution(self):
        for city in ('tvm', 'del', 'srn'):
            pts = js(MATH, f"m.dataFor('{city}')")
            for period in (12, 10, 14.5):
                got = js(MATH, f"m.leastSquaresSine(m.dataFor('{city}'), {period})")
                B, A, phi, rms = fit([(p['x'], p['y']) for p in pts], period)
                self.assertAlmostEqual(got['B'], B, places=9, msg=(city, period))
                self.assertAlmostEqual(got['A'], A, places=9, msg=(city, period))
                self.assertAlmostEqual(got['phi'], phi, places=9, msg=(city, period))
                self.assertAlmostEqual(got['rms'], rms, places=9, msg=(city, period))

    def test_recovers_an_exact_sine(self):
        pts = [{'x': i * 1.0 + 0.3, 'y': 12 + 2 * math.sin(TAU / 12 * (i + 0.3) - 0.7)} for i in range(12)]
        got = js(MATH, f"m.leastSquaresSine({pts}, 12)".replace("'", '"'))
        self.assertAlmostEqual(got['B'], 12, places=9)
        self.assertAlmostEqual(got['A'], 2, places=9)
        self.assertAlmostEqual(got['phi'], 0.7, places=9)
        self.assertLess(got['rms'], 1e-9)

    def test_nothing_nearby_does_better(self):
        best = js(MATH, "m.leastSquaresSine(m.dataFor('del'), 12)")
        for dA, dB, dphi in ((0.05, 0, 0), (-0.05, 0, 0), (0, 0.05, 0), (0, -0.05, 0), (0, 0, 0.05), (0, 0, -0.05)):
            worse = js(MATH, f"m.rmsError(m.dataFor('del'), {{B: {best['B'] + dB}, A: {best['A'] + dA}, phi: {best['phi'] + dphi}, w: {TAU / 12}}})")
            self.assertGreater(worse, best['rms'])

    def test_the_delhi_fit_is_a_good_one(self):
        got = js(MATH, "m.leastSquaresSine(m.dataFor('del'), 12)")
        self.assertLess(got['rms'], 0.15)
        self.assertGreater(got['A'], 1.3)
        self.assertLess(got['A'], 2.0)
        self.assertAlmostEqual(got['B'], 12.1, delta=0.3)
        # the sliders reach it
        self.assertTrue(0 <= got['A'] <= 4 and 9 <= got['B'] <= 15 and -math.pi <= got['phi'] <= math.pi)
