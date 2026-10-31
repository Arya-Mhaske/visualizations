"""Every number the Simple Pendulum box shows, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/oscillations-waves/_pendulum-math.js'
TAU = 2 * math.pi
G = 9.8


def exact_period(L, A, g=G, n=200000):
    """T = 4√(L/g) ∫₀^(π/2) dφ / √(1 − k² sin²φ), k = sin(A/2), by the midpoint rule."""
    k = math.sin(A / 2)
    h = (math.pi / 2) / n
    total = sum(1 / math.sqrt(1 - k * k * math.sin((i + 0.5) * h) ** 2) for i in range(n)) * h
    return 4 * math.sqrt(L / g) * total


def integrate(L, A, b=0.0, g=G, span=10.0, dt=1 / 2000):
    """Leapfrog-free independent check: classical RK4 written separately from the JS."""
    th, w, t = A, 0.0, 0.0
    f = lambda th, w: (w, -(g / L) * math.sin(th) - b * w)
    out = [(0.0, th, w)]
    for _ in range(int(span / dt)):
        a1, b1 = f(th, w)
        a2, b2 = f(th + dt / 2 * a1, w + dt / 2 * b1)
        a3, b3 = f(th + dt / 2 * a2, w + dt / 2 * b2)
        a4, b4 = f(th + dt * a3, w + dt * b3)
        th += dt / 6 * (a1 + 2 * a2 + 2 * a3 + a4)
        w += dt / 6 * (b1 + 2 * b2 + 2 * b3 + b4)
        t += dt
        out.append((t, th, w))
    return out


class FactTests(SimpleTestCase):
    def test_seconds_pendulum_length(self):
        self.assertEqual(round(G * 4 / TAU ** 2, 2), 0.99)
        self.assertEqual(round(G / math.pi ** 2, 3), 0.993)
        self.assertEqual(round(9.78 / math.pi ** 2, 3), 0.991)
        self.assertEqual(round(9.83 / math.pi ** 2, 3), 0.996)
        self.assertEqual(round(1.62 / math.pi ** 2, 3), 0.164)

    def test_small_angle_force_gap(self):
        gap = lambda deg: (math.radians(deg) - math.sin(math.radians(deg))) / math.sin(math.radians(deg))
        self.assertLess(gap(10), 0.01)
        self.assertGreater(gap(15), 0.01)
        self.assertEqual(round(100 * gap(60), 1), 20.9)
        self.assertEqual(round(100 * gap(90), 1), 57.1)

    def test_period_ratio_grows_with_angle(self):
        ratios = [exact_period(1, math.radians(d), 1) / TAU for d in (10, 60, 90, 120, 170)]
        self.assertEqual([round(r, 4) for r in ratios], [1.0019, 1.0732, 1.1803, 1.3729, 2.4394])
        self.assertEqual(ratios, sorted(ratios))

    def test_series_in_the_lab(self):
        A = math.radians(120)
        exact = exact_period(1, A, 1) / TAU
        one, two = 1 + A ** 2 / 16, 1 + A ** 2 / 16 + 11 * A ** 4 / 3072
        self.assertLess(abs(two - exact), abs(one - exact))
        self.assertLess(abs(1 - exact), 1)
        small = math.radians(60)
        self.assertLess(abs(1 + small ** 2 / 16 - exact_period(1, small, 1) / TAU), 0.005)

    def test_stopwatch_lab_defaults(self):
        T = exact_period(1, math.radians(5))
        self.assertEqual(round(T, 3), 2.008)
        shown = 20 * T + 0.2
        g = TAU ** 2 * 1 / (shown / 20) ** 2
        self.assertEqual(round(g, 2), 9.69)
        one = TAU ** 2 / (T + 0.2) ** 2
        self.assertEqual(round(100 * (one / G - 1), 1), -17.4)

    def test_damping_half_time(self):
        self.assertEqual(round(2 * math.log(2) / 0.2, 1), 6.9)
        self.assertEqual(round(2 * math.log(2) / 0.2 / (TAU * math.sqrt(2.5 / G)), 1), 2.2)


@needs_node
class ModuleTests(SimpleTestCase):
    def test_exact_period_matches_the_integral(self):
        for L, deg in ((1, 5), (0.5, 60), (2, 120), (1.3, 170)):
            A = math.radians(deg)
            self.assertAlmostEqual(js(MATH, f'm.exactPeriod({L},{A})'), exact_period(L, A), places=6)

    def test_ratio_and_series(self):
        for deg in (10, 60, 120):
            A = math.radians(deg)
            self.assertAlmostEqual(js(MATH, f'm.ratio({A})'), exact_period(1, A, 1) / TAU, places=6)
            self.assertAlmostEqual(js(MATH, f'm.seriesRatio({A},0)'), 1)
            self.assertAlmostEqual(js(MATH, f'm.seriesRatio({A},1)'), 1 + A ** 2 / 16)
            self.assertAlmostEqual(js(MATH, f'm.seriesRatio({A},2)'), 1 + A ** 2 / 16 + 11 * A ** 4 / 3072)

    def test_small_period_length_and_g(self):
        self.assertAlmostEqual(js(MATH, 'm.smallPeriod(1)'), TAU * math.sqrt(1 / G))
        self.assertAlmostEqual(js(MATH, 'm.lengthFor(2,9.8)'), G / math.pi ** 2)
        self.assertAlmostEqual(js(MATH, 'm.gFrom(m.lengthFor(2,1.62),2)'), 1.62)
        self.assertAlmostEqual(js(MATH, 'm.smallPeriod(m.lengthFor(2,9.83),9.83)'), 2)

    def test_forces(self):
        self.assertAlmostEqual(js(MATH, 'm.restoring(2,9.8,0.5)'), 2 * G * math.sin(0.5))
        self.assertAlmostEqual(js(MATH, 'm.linearForce(2,9.8,0.5)'), 2 * G * 0.5)
        self.assertAlmostEqual(js(MATH, 'm.forceGap(m.toRad(60))'), (math.pi / 3 - math.sin(math.pi / 3)) / math.sin(math.pi / 3))

    def test_stopwatch(self):
        got = js(MATH, 'm.stopwatch({L:1,A:m.toRad(5),N:20,err:0.2})')
        T = exact_period(1, math.radians(5))
        self.assertAlmostEqual(got['T'], T, places=6)
        self.assertAlmostEqual(got['shown'], 20 * T + 0.2, places=5)
        self.assertEqual(round(got['g'], 2), 9.69)
        one = js(MATH, 'm.stopwatch({L:1,A:m.toRad(5),N:1,err:0.2})')
        self.assertEqual(round(100 * one['error'], 1), -17.4)
        exact = js(MATH, 'm.stopwatch({L:1,A:m.toRad(5),N:20,err:0})')
        self.assertLess(abs(exact['error']), 0.002)
        # more swings always shrink the error from a fixed start-and-stop delay
        errs = [abs(js(MATH, f'm.stopwatch({{L:1,A:m.toRad(5),N:{n},err:0.2}}).error')) for n in (1, 5, 20, 40)]
        self.assertEqual(errs, sorted(errs, reverse=True))

    def test_integrator_matches_python_and_the_period(self):
        run = js(MATH, 'm.swing({L:1.5,A:1.0,span:6,dt:1/200})')
        ref = integrate(1.5, 1.0, span=6)
        for t in (0.5, 2.0, 5.5):
            self.assertAlmostEqual(run['theta'][round(t * 200)], ref[round(t * 2000)][1], places=6)
        self.assertAlmostEqual(js(MATH, 'm.measuredPeriod(m.swing({L:1,A:m.toRad(60),span:6}))'), exact_period(1, math.radians(60)), delta=0.003)

    def test_mass_cancels(self):
        a = js(MATH, 'm.swing({L:1,A:0.5,m:0.1,span:4}).theta.filter((_,i)=>i%100===0)')
        b = js(MATH, 'm.swing({L:1,A:0.5,m:5,span:4}).theta.filter((_,i)=>i%100===0)')
        for u, v in zip(a, b):
            self.assertAlmostEqual(u, v, places=9)

    def test_damping_envelope_and_energy(self):
        b, L, A = 0.2, 2.5, math.radians(20)
        self.assertAlmostEqual(js(MATH, f'm.halfTime({b})'), 2 * math.log(2) / b)
        self.assertAlmostEqual(js(MATH, f'm.envelope({A},{b},m.halfTime({b}))'), A / 2)
        run = js(MATH, f'm.swing({{L:{L},A:{A},b:{b},span:30,dt:1/100}})')
        ref = integrate(L, A, b=b, span=30, dt=1 / 1000)
        for t in (3.0, 12.0, 29.0):
            self.assertAlmostEqual(run['theta'][round(t * 100)], ref[round(t * 1000)][1], places=5)
        # energy per unit mass relative to the start
        for t in (3.0, 12.0, 29.0):
            _, th, w = ref[round(t * 1000)]
            frac = (0.5 * L * L * w * w + G * L * (1 - math.cos(th))) / (G * L * (1 - math.cos(A)))
            self.assertAlmostEqual(run['fraction'][round(t * 100)], frac, places=5)
        self.assertAlmostEqual(js(MATH, 'm.swing({L:1,A:0.3,span:20}).fraction.at(-1)'), 1, places=5)
        # the peak after n·halfTime is about A / 2^n
        peaks = [max(abs(x) for x in run['theta'][int(100 * (t0 - 1.7)):int(100 * (t0 + 1.7))]) for t0 in (6.93, 13.86)]
        self.assertAlmostEqual(peaks[0], A / 2, delta=0.03 * A)
        self.assertAlmostEqual(peaks[1], A / 4, delta=0.03 * A)
