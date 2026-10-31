"""Every number the What is a Wave? box shows, worked out in Python, then checked against the JS module."""
import math
from collections import deque

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/oscillations-waves/_wave-basics-math.js'
TAU = 2 * math.pi


def gauss(x, t, A, v, w, x0):
    return A * math.exp(-(((x - x0 - v * t) / w) ** 2))


@needs_node
class PulseTests(SimpleTestCase):
    P = {'A': 0.02, 'v': 1.5, 'w': 0.7, 'x0': 1.5}

    def test_pulse_height_and_peak_travels_at_v(self):
        for x, t in [(3.0, 1.0), (4.0, 2.0), (1.5, 0.0)]:
            got = js(MATH, f'm.pulse({x}, {t}, {self.P})')
            self.assertAlmostEqual(got, gauss(x, t, **self.P), places=12)
        self.assertAlmostEqual(js(MATH, f'm.pulse({1.5 + 1.5 * 2}, 2, {self.P})'), 0.02, places=12)

    def test_velocity_is_the_time_derivative(self):
        h = 1e-6
        for x, t in [(3.0, 1.0), (2.2, 0.3), (5.0, 2.5)]:
            numeric = (gauss(x, t + h, **self.P) - gauss(x, t - h, **self.P)) / (2 * h)
            self.assertAlmostEqual(js(MATH, f'm.pulseVel({x}, {t}, {self.P})'), numeric, places=6)

    def test_energy_centre_is_the_pulse_centre(self):
        xs = [i * 0.25 for i in range(41)]
        for t in (0.5, 1.0, 2.0, 3.0):
            h = 1e-6
            top = bottom = 0.0
            for x in xs:
                e = ((gauss(x, t + h, **self.P) - gauss(x, t - h, **self.P)) / (2 * h)) ** 2
                top += x * e
                bottom += e
            self.assertAlmostEqual(top / bottom, 1.5 + 1.5 * t, places=2)
            self.assertAlmostEqual(js(MATH, f'm.energyCentre({xs}, {t}, {self.P})'), 1.5 + 1.5 * t, places=2)

    def test_peak_energy_scale_used_for_the_bars(self):
        # largest |u e^{-u²}| is e^{-1/2}/√2, so the bar scale constant 0.4289 holds
        self.assertEqual(round(math.exp(-0.5) / math.sqrt(2), 4), 0.4289)


@needs_node
class SlinkyTests(SimpleTestCase):
    def test_shift_and_density(self):
        A, lam, T = 0.3, 4.0, 2.0
        for x0, t in [(1.0, 0.0), (2.5, 0.4), (7.25, 1.3)]:
            self.assertAlmostEqual(js(MATH, f'm.shift({x0}, {t}, {A}, {lam}, {T})'),
                                   A * math.sin(TAU * (x0 / lam - t / T)), places=12)
            h = 1e-6
            s = lambda x: x + A * math.sin(TAU * (x / lam - t / T))
            self.assertAlmostEqual(js(MATH, f'm.densityRatio({x0}, {t}, {A}, {lam}, {T})'),
                                   1 / ((s(x0 + h) - s(x0 - h)) / (2 * h)), places=6)

    def test_extremes(self):
        A, lam = 0.3, 4.0
        k = TAU / lam
        self.assertAlmostEqual(js(MATH, f'm.maxCompression({A}, {lam})'), 1 / (1 - A * k), places=12)
        self.assertAlmostEqual(js(MATH, f'm.maxRarefaction({A}, {lam})'), 1 / (1 + A * k), places=12)
        self.assertEqual(round(1 / (1 - A * k), 2), 1.89)
        self.assertEqual(round(1 / (1 + A * k), 2), 0.68)

    def test_controls_never_let_coils_cross(self):
        # slider limits: λ ≥ 3 and A ≤ 0.4, and the clamp keeps A·k ≤ 0.9
        self.assertLess(0.4 * TAU / 3, 0.9)
        for lam in (3, 3.5, 4, 5, 6):
            cap = math.floor(0.9 * lam / TAU * 20) / 20
            self.assertGreaterEqual(cap, 0.1)
            self.assertLessEqual(cap * TAU / lam, 0.9)

    def test_default_speed_is_two_metres_a_second(self):
        self.assertEqual(4.0 / 2.0, 2.0)


@needs_node
class VacuumTests(SimpleTestCase):
    def points(self, n):
        return js(MATH, f'm.airLayout({n}, 7)')

    @staticmethod
    def hops(points, reach):
        """Independent breadth-first search: bell side is x ≤ reach, glass side is x ≥ 1 − reach."""
        depth = {i: 1 for i, (x, _) in enumerate(points) if x <= reach}
        queue = deque(depth)
        while queue:
            i = queue.popleft()
            for j, (x, y) in enumerate(points):
                if j not in depth and math.hypot(x - points[i][0], y - points[i][1]) <= reach:
                    depth[j] = depth[i] + 1
                    queue.append(j)
        ends = [d + 1 for i, d in depth.items() if points[i][0] >= 1 - reach]
        return min(ends) if ends else None

    def test_layout_is_nested(self):
        big, small = self.points(140), self.points(70)
        self.assertEqual(big[:70], small)
        self.assertTrue(all(0 <= x < 1 and 0 <= y < 1 for x, y in big))

    def test_relay_matches_python_for_every_pressure(self):
        full = self.points(140)
        for pct in range(0, 101, 5):
            pts = full[:round(140 * pct / 100)]
            got = js(MATH, f'm.relay({pts}, 0.15).hops')
            self.assertEqual(got, self.hops(pts, 0.15), pct)

    def test_story_the_slider_tells(self):
        full = self.points(140)
        hops = {pct: self.hops(full[:round(1.4 * pct)], 0.15) for pct in range(0, 101, 5)}
        self.assertIsNotNone(hops[100])
        self.assertIsNone(hops[0])
        self.assertIsNone(hops[30])
        # once broken, removing more air never repairs it
        broken = False
        for pct in range(100, -1, -5):
            if hops[pct] is None:
                broken = True
            self.assertFalse(broken and hops[pct] is not None, pct)

    def test_constants(self):
        self.assertEqual(js(MATH, 'm.FULL'), 140)
        self.assertEqual(js(MATH, 'm.REACH'), 0.15)


@needs_node
class StadiumTests(SimpleTestCase):
    def test_standing_window(self):
        d, s = 0.2, 1.0
        for i in (0, 5, 23):
            for t in (i * d - 0.01, i * d, i * d + 0.5, i * d + s - 0.01, i * d + s):
                self.assertEqual(js(MATH, f'm.standing({i}, {t}, {d}, {s})'), i * d <= t < i * d + s)

    def test_how_many_stand_at_once(self):
        # in mid-row, stand/delay people are up together
        for d, s in [(0.2, 1.0), (0.1, 1.0), (0.5, 1.0), (0.25, 0.5)]:
            t = 11 * d + 0.0001
            expected = sum(1 for i in range(24) if i * d <= t < i * d + s)
            self.assertEqual(js(MATH, f'm.standingCount(24, {t}, {d}, {s})'), expected)
            self.assertEqual(expected, round(s / d))

    def test_speed_and_crossing_time(self):
        self.assertEqual(0.5 / 0.2, 2.5)
        self.assertEqual(round(23 * 0.2, 2), 4.6)
        self.assertEqual(round(23 * 0.2 + 1 + 1, 2), 6.6)  # default cycle: cross, stand, one second rest
