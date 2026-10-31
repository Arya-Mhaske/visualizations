"""Every number the Superposition & Reflection box shows, worked out in Python, then checked against the JS module.

The string itself is checked against an independent finite-difference solution of the wave equation
y_tt = v² y_xx (leapfrog with Courant number 1), so the "images" and "sums" are tested as physics, not as a mirror of the JS.
"""
import json
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/oscillations-waves/_superposition-math.js'
TAU = 2 * math.pi
V = 1.0
L = 10.0
DX = 0.025  # grid spacing of the finite-difference check; every 0.25 m sample point is a node


def g(u, w):
    return math.exp(-((u / w) ** 2))


def initial(xs, pulses):
    """y(x, 0) and y_t(x, 0) of Gaussian pulses {A, x, w, dir} moving at speed V."""
    y = [sum(p['A'] * g(x - p['x'], p['w']) for p in pulses) for x in xs]
    yt = [sum(p['dir'] * V * p['A'] * (2 * (x - p['x']) / p['w'] ** 2) * g(x - p['x'], p['w']) for p in pulses) for x in xs]
    return y, yt


def simulate(xmin, xmax, dx, left, right, pulses, times):
    """Leapfrog at Courant 1 (exact for the discrete wave equation). left/right: -1 fixed end, +1 free end."""
    n = round((xmax - xmin) / dx)
    xs = [xmin + i * dx for i in range(n + 1)]
    dt = dx / V
    y0, yt0 = initial(xs, pulses)

    def neighbours(y, i):
        lo = y[i - 1] if i > 0 else y[1]  # free end: mirror ghost point
        hi = y[i + 1] if i < n else y[n - 1]
        return lo, hi

    def clamp(y):
        if left < 0:
            y[0] = 0.0
        if right < 0:
            y[n] = 0.0
        return y

    y1 = clamp([0.5 * sum(neighbours(y0, i)) + dt * yt0[i] for i in range(n + 1)])
    wanted = {round(t / dt): t for t in times}
    out = {}
    prev, cur = y0, y1
    for k in range(1, max(wanted) + 1):
        if k in wanted:
            out[wanted[k]] = cur
        prev, cur = cur, clamp([sum(neighbours(cur, i)) - prev[i] for i in range(n + 1)])
    if 0 in wanted:
        out[wanted[0]] = y0
    return xs, out


def jsfield(expression):
    return js(MATH, expression)


@needs_node
class PassThroughTests(SimpleTestCase):
    PULSES = [{'A': 1.0, 'x': 1.5, 'w': 0.55, 'dir': 1}, {'A': -0.75, 'x': 8.5, 'w': 0.55, 'dir': -1}]

    def test_sum_matches_the_wave_equation(self):
        times = [0.0, 2.0, 3.5, 5.0, 7.0]
        xs, frames = simulate(-15, 25, DX, -1, -1, self.PULSES, times)
        grid = [i * 0.25 for i in range(41)]
        for t in times:
            got = jsfield(f'{json.dumps(grid)}.map((x) => m.field(x, {t}, {json.dumps(self.PULSES)}))')
            for x, y in zip(grid, got):
                i = round((x - xs[0]) / DX)
                self.assertAlmostEqual(y, frames[t][i], delta=1.5e-3, msg=f'x={x} t={t}')

    def test_pulses_come_out_unchanged(self):
        # after crossing (t = 7) pulse 1 is the same Gaussian, now at 8.5, and pulse 2 at 1.5
        for t in (5.0, 7.0):
            alone = [{**p, 'x': p['x']} for p in self.PULSES]
            for p in alone:
                at = p['x'] + p['dir'] * V * t
                got = jsfield(f'm.pulseAt({at}, {t}, {json.dumps(p)})')
                self.assertAlmostEqual(got, p['A'], places=12)

    def test_doubling_and_cancelling_at_the_meeting(self):
        same = [{'A': 1, 'x': 1.5, 'w': 0.55, 'dir': 1}, {'A': 1, 'x': 8.5, 'w': 0.55, 'dir': -1}]
        flip = [same[0], {**same[1], 'A': -1}]
        self.assertAlmostEqual(jsfield(f'm.field(5, 3.5, {json.dumps(same)})'), 2.0, places=12)
        self.assertAlmostEqual(jsfield(f'm.field(5, 3.5, {json.dumps(flip)})'), 0.0, places=12)
        # and the whole string is flat at that instant
        flat = jsfield(f'{json.dumps([i * 0.5 for i in range(21)])}.map((x) => m.field(x, 3.5, {json.dumps(flip)}))')
        self.assertLess(max(abs(y) for y in flat), 1e-12)

    def test_default_numbers(self):
        # defaults: t = 3 s, probe 5 m, pulses 1 cm each: each pulse is 0.44 cm there and the string is 0.88 cm
        each = math.exp(-(((5 - 1.5 - 3) / 0.55) ** 2))
        self.assertEqual(round(each, 2), 0.44)
        self.assertEqual(round(2 * each, 2), 0.88)
        self.assertAlmostEqual(jsfield('m.field(5, 3, [{A:1,x:1.5,w:0.55,dir:1},{A:1,x:8.5,w:0.55,dir:-1}])'), 2 * each, places=12)

    def test_cycle_length(self):
        self.assertEqual((8.5 - 1.5) / V, 7.0)


@needs_node
class InterferenceTests(SimpleTestCase):
    @staticmethod
    def brute(A1, A2, phi):
        return max(abs(A1 * math.sin(th) + A2 * math.sin(th + phi)) for th in (i * TAU / 20000 for i in range(20000)))

    def test_resultant_is_the_peak_of_the_sum(self):
        for A1, A2, phi in [(1, 1, 0), (1, 1, math.pi), (1, 0.5, 1.0), (1, 1.5, 2.3), (1, 0.25, 5.0), (1, 1, math.pi / 3)]:
            got = js(MATH, f'm.resultant({A1}, {A2}, {phi})')
            self.assertAlmostEqual(got, self.brute(A1, A2, phi), places=5)
            self.assertAlmostEqual(got, math.sqrt(A1 ** 2 + A2 ** 2 + 2 * A1 * A2 * math.cos(phi)), places=12)

    def test_equal_waves_give_two_a_cos_half_phi(self):
        for phi in (0.3, 1.0, 2.0, 3.0, 4.5):
            self.assertAlmostEqual(js(MATH, f'm.resultant(1, 1, {phi})'), abs(2 * math.cos(phi / 2)), places=12)

    def test_phase_of_the_sum(self):
        for A1, A2, phi in [(1, 1, 1.0), (1, 0.5, 2.0), (1, 1.5, 4.0)]:
            got = js(MATH, f'm.resultantPhase({A1}, {A2}, {phi})')
            R = js(MATH, f'm.resultant({A1}, {A2}, {phi})')
            for th in (0.0, 0.7, 2.1):
                self.assertAlmostEqual(A1 * math.sin(th) + A2 * math.sin(th + phi), R * math.sin(th + got), places=10)

    def test_kinds(self):
        self.assertEqual(js(MATH, 'm.kindOf(0, 1, 1)'), 'constructive')
        self.assertEqual(js(MATH, f'm.kindOf({TAU}, 1, 1)'), 'constructive')
        self.assertEqual(js(MATH, f'm.kindOf({math.pi}, 1, 1)'), 'destructive')
        self.assertEqual(js(MATH, f'm.kindOf({math.pi / 2}, 1, 1)'), 'in between')
        # unequal waves cannot cancel: the smallest the sum gets is |A1 − A2|
        self.assertAlmostEqual(js(MATH, f'm.resultant(1, 1.5, {math.pi})'), 0.5, places=12)
        self.assertEqual(js(MATH, f'm.kindOf({math.pi}, 1, 1.5)'), 'destructive')

    def test_path_difference_and_percent(self):
        lam = TAU / (math.pi / 2)
        self.assertEqual(lam, 4.0)
        self.assertAlmostEqual(js(MATH, f'm.pathDifference({math.pi}, 4)'), 2.0, places=12)
        self.assertAlmostEqual(js(MATH, f'm.pathDifference({TAU}, 4)'), 4.0, places=12)
        self.assertEqual(round(math.sqrt(2 + 2 * math.cos(math.pi / 3)) / 2 * 100), 87)
        self.assertEqual(js(MATH, f'm.wrapPhase({-math.pi / 2})'), 1.5 * math.pi)

    def test_wave_speed_on_screen(self):
        self.assertEqual((math.pi) / (math.pi / 2), 2.0)  # ω/k = 2 m/s, T = 2 s


@needs_node
class WallTests(SimpleTestCase):
    P = {'A': 1.0, 'x': 4.0, 'w': 0.55, 'dir': 1}

    def test_matches_the_wave_equation_with_a_wall(self):
        times = [3.0, 5.5, 6.0, 7.0, 8.0, 10.0, 12.0]
        for sigma in (-1, 1):
            xs, frames = simulate(-20, 10, DX, -1, sigma, [self.P], times)
            grid = [i * 0.25 for i in range(41)]
            for t in times:
                got = jsfield(f'{json.dumps(grid)}.map((x) => m.wallField(x, {t}, {json.dumps(self.P)}, {{sigma: {sigma}}}))')
                for x, y in zip(grid, got):
                    i = round((x - xs[0]) / DX)
                    self.assertAlmostEqual(y, frames[t][i], delta=1.5e-3, msg=f'sigma={sigma} x={x} t={t}')

    def test_fixed_end_never_moves(self):
        for t in [i * 0.25 for i in range(49)]:
            self.assertAlmostEqual(jsfield(f'm.wallField(10, {t}, {json.dumps(self.P)}, {{sigma: -1}})'), 0.0, places=12)

    def test_free_end_is_level_and_doubles(self):
        h = 1e-4
        for t in (4.0, 5.5, 6.0, 6.5, 8.0):
            hi = jsfield(f'm.wallField({10 + h}, {t}, {json.dumps(self.P)}, {{sigma: 1}})')
            lo = jsfield(f'm.wallField({10 - h}, {t}, {json.dumps(self.P)}, {{sigma: 1}})')
            self.assertAlmostEqual((hi - lo) / (2 * h), 0.0, places=8)
        top = jsfield(f'm.wallField(10, 6, {json.dumps(self.P)}, {{sigma: 1}})')
        self.assertAlmostEqual(top, 2.0, places=12)
        # no point of the end ever goes higher than twice the pulse
        ends = jsfield(f'{json.dumps([i * 0.05 for i in range(241)])}.map((t) => m.wallField(10, t, {json.dumps(self.P)}, {{sigma: 1}}))')
        self.assertAlmostEqual(max(ends), 2.0, places=3)

    def test_reflected_pulse_flipped_or_not(self):
        # at t = 8 the pulse that left x = 4 has gone 4 m past the wall and is back at 2·10 − (4 + 8) = 8 m
        self.assertAlmostEqual(jsfield(f'm.wallField(8, 8, {json.dumps(self.P)}, {{sigma: -1}})'), -1.0, places=12)
        self.assertAlmostEqual(jsfield(f'm.wallField(8, 8, {json.dumps(self.P)}, {{sigma: 1}})'), 1.0, places=12)

    def test_image_starts_beyond_the_wall(self):
        # image of a pulse at 4 m, wall at 10 m: sits at 16 m, so it is inside the 0–16 m picture and off the string
        self.assertAlmostEqual(jsfield(f'm.wallImage(16, 0, {json.dumps(self.P)}, {{sigma: -1}})'), -1.0, places=12)
        self.assertAlmostEqual(jsfield(f'm.wallImage(16, 0, {json.dumps(self.P)}, {{sigma: 1}})'), 1.0, places=12)

    def test_timing(self):
        self.assertEqual((10 - 4) / V, 6.0)  # reaches the wall
        self.assertEqual(2 * (10 - 4) / V, 12.0)  # and is back where it started


@needs_node
class SandboxTests(SimpleTestCase):
    PULSES = [{'A': 1.0, 'x': 2.0, 'w': 0.5, 'dir': 1}, {'A': 0.5, 'x': 8.0, 'w': 0.5, 'dir': -1}]

    def test_walled_string_matches_the_wave_equation(self):
        times = [3.0, 7.0, 9.0, 12.0, 17.0, 20.0]
        for walls in (-1, 1):
            xs, frames = simulate(0, 10, DX, walls, walls, self.PULSES, times)
            grid = [i * 0.25 for i in range(41)]
            for t in times:
                got = jsfield(f'{json.dumps(grid)}.map((x) => m.field(x, {t}, {json.dumps(self.PULSES)}, {{walls: {walls}}}))')
                for x, y in zip(grid, got):
                    self.assertAlmostEqual(y, frames[t][round(x / DX)], delta=2e-3, msg=f'walls={walls} x={x} t={t}')

    def test_ends_obey_the_rule(self):
        for t in [i * 0.7 for i in range(30)]:
            for x in (0, 10):
                self.assertAlmostEqual(jsfield(f'm.field({x}, {t}, {json.dumps(self.PULSES)}, {{walls: -1}})'), 0.0, places=9)
        h = 1e-4
        for t in [i * 0.7 for i in range(30)]:
            for x in (0, 10):
                hi = jsfield(f'm.field({x + h}, {t}, {json.dumps(self.PULSES)}, {{walls: 1}})')
                lo = jsfield(f'm.field({x - h}, {t}, {json.dumps(self.PULSES)}, {{walls: 1}})')
                self.assertAlmostEqual((hi - lo) / (2 * h), 0.0, places=5)

    def test_period_is_two_l_over_v(self):
        grid = [i * 0.5 for i in range(21)]
        for walls in (-1, 1):
            a = jsfield(f'{json.dumps(grid)}.map((x) => m.field(x, 0, {json.dumps(self.PULSES)}, {{walls: {walls}}}))')
            b = jsfield(f'{json.dumps(grid)}.map((x) => m.field(x, 20, {json.dumps(self.PULSES)}, {{walls: {walls}}}))')
            for p, q in zip(a, b):
                self.assertAlmostEqual(p, q, places=9)
        self.assertEqual(2 * L / V, 20.0)

    def test_energy(self):
        grid = [i * 0.05 for i in range(201)]
        # one Gaussian: E = v² ∫ f'(u)² du, f' = −2uA/w² · exp(−(u/w)²)
        p = {'A': 1.0, 'x': 5.0, 'w': 0.5, 'dir': 1}
        exact = sum((2 * (x - 5) / 0.25 * g(x - 5, 0.5)) ** 2 for x in [i * 1e-3 for i in range(10001)]) * 1e-3
        got = jsfield(f'm.energy({json.dumps(grid)}, 0, [{json.dumps(p)}], {{}})')
        self.assertAlmostEqual(got, exact, delta=1e-3 * exact)
        # conserved with walls, and equal to the start through every collision (the "Cancel" preset, open string)
        for walls in (-1, 1):
            start = jsfield(f'm.energy({json.dumps(grid)}, 0, {json.dumps(self.PULSES)}, {{walls: {walls}}})')
            for t in (3.0, 8.0, 13.0, 19.0):
                now = jsfield(f'm.energy({json.dumps(grid)}, {t}, {json.dumps(self.PULSES)}, {{walls: {walls}}})')
                self.assertAlmostEqual(now / start, 1.0, delta=2e-3, msg=f'walls={walls} t={t}')
        cancel = [{'A': 1, 'x': 2, 'w': 0.5, 'dir': 1}, {'A': -1, 'x': 8, 'w': 0.5, 'dir': -1}]
        e0 = jsfield(f'm.energy({json.dumps(grid)}, 0, {json.dumps(cancel)}, {{}})')
        e3 = jsfield(f'm.energy({json.dumps(grid)}, 3, {json.dumps(cancel)}, {{}})')
        self.assertAlmostEqual(e3 / e0, 1.0, delta=2e-3)
        # at that moment the string is flat but still carries all the energy
        flat = jsfield(f'{json.dumps(grid)}.map((x) => m.field(x, 3, {json.dumps(cancel)}))')
        self.assertLess(max(abs(y) for y in flat), 1e-12)

    def test_default_peak(self):
        # defaults: pulses 1 and 0.5 cm meet at 5 m when t = 3 s, so the string peaks at 1.5 cm
        self.assertAlmostEqual(jsfield(f'm.field(5, 3, {json.dumps(self.PULSES)})'), 1.5, places=12)
