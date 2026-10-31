"""Every number the Force Law & Energy box shows, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/oscillations-waves/_force-law-math.js'
TAU = 2 * math.pi


def period_exact(p, A):
    """T for F = −|x|^p (m = k = 1): 4 A^((1−p)/2) √((p+1)/2) ∫₀¹ du/√(1−u^(p+1)), by the Beta function."""
    n = p + 1
    integral = math.gamma(1 / n) * math.gamma(0.5) / (n * math.gamma(1 / n + 0.5))
    return 4 * A ** ((1 - p) / 2) * math.sqrt(n / 2) * integral


def building_amplitude(f, n, zeta, steps=400, cycles=60):
    """Amplitude and lag of a damped frame on a shaking base, by integrating the equation of motion."""
    k, m = 4 * math.pi ** 2 * 1e5, n * 1e5
    w0 = math.sqrt(k / m)
    w = TAU * f
    y = lambda t: math.cos(w * t)
    dy = lambda t: -w * math.sin(w * t)
    acc = lambda t, x, v: -w0 ** 2 * (x - y(t)) - 2 * zeta * w0 * (v - dy(t))
    dt = (TAU / w) / steps
    t, x, v = 0.0, 0.0, 0.0
    a = b = 0.0
    total = cycles * steps
    for i in range(total):
        k1x, k1v = v, acc(t, x, v)
        k2x, k2v = v + dt / 2 * k1v, acc(t + dt / 2, x + dt / 2 * k1x, v + dt / 2 * k1v)
        k3x, k3v = v + dt / 2 * k2v, acc(t + dt / 2, x + dt / 2 * k2x, v + dt / 2 * k2v)
        k4x, k4v = v + dt * k3v, acc(t + dt, x + dt * k3x, v + dt * k3v)
        x += dt / 6 * (k1x + 2 * k2x + 2 * k3x + k4x)
        v += dt / 6 * (k1v + 2 * k2v + 2 * k3v + k4v)
        t += dt
        if i >= total - 4 * steps:  # project the last four cycles onto cos and sin
            a += x * math.cos(w * t) * dt
            b += x * math.sin(w * t) * dt
    span = 4 * TAU / w
    a, b = 2 * a / span, 2 * b / span
    return math.hypot(a, b), math.atan2(b, a)


class FactTests(SimpleTestCase):
    def test_linear_force_period_is_two_pi_whatever_the_amplitude(self):
        for A in (0.5, 1, 2.5):
            self.assertAlmostEqual(period_exact(1, A), TAU)

    def test_other_force_laws_depend_on_amplitude(self):
        for p, ratio in ((2, 2 ** -0.5), (3, 0.5), (0.5, 2 ** 0.25)):
            self.assertAlmostEqual(period_exact(p, 2) / period_exact(p, 1), ratio)

    def test_energy_swap_in_the_defaults(self):
        k, m, A = 4, 1, 1
        w = math.sqrt(k / m)
        for t in (0, 0.3, 0.9, 1.7):
            x, v = A * math.cos(w * t), -A * w * math.sin(w * t)
            self.assertAlmostEqual(0.5 * m * v ** 2 + 0.5 * k * x ** 2, 0.5 * k * A ** 2)

    def test_reference_and_default_omega(self):
        self.assertEqual(math.sqrt(4 / 1), 2)
        self.assertEqual(math.sqrt(9 / 1), 3)
        self.assertEqual(math.sqrt(16 / 4), math.sqrt(4 / 1) * 1)
        self.assertEqual(round(TAU / 2, 2), 3.14)

    def test_building_frequencies_are_one_over_root_n(self):
        k = 4 * math.pi ** 2 * 1e5
        for n in range(1, 9):
            self.assertAlmostEqual(math.sqrt(k / (n * 1e5)) / TAU, 1 / math.sqrt(n))
        self.assertEqual(f'{k:.3g}', '3.95e+06')


@needs_node
class ModuleTests(SimpleTestCase):
    def test_force_law(self):
        self.assertEqual(js(MATH, '[m.force(2,3),m.force(2,-3),m.force(1,2),m.force(3,-2)]'), [-9, 9, -2, 8])
        self.assertAlmostEqual(js(MATH, 'm.force(0.5,4)'), -2)

    def test_periods_match_the_exact_integral(self):
        for p in (0.5, 1, 2, 3):
            for A in (0.5, 1.5, 2.5):
                self.assertAlmostEqual(js(MATH, f'm.period({p},{A})'), period_exact(p, A), delta=0.002 * period_exact(p, A))

    def test_linear_motion_is_a_cosine_and_others_are_not(self):
        self.assertLess(js(MATH, 'm.gap(1,1.5)'), 0.001)
        for p in (0.5, 2, 3):
            self.assertGreater(js(MATH, f'm.gap({p},1.5)'), 0.02)

    def test_trajectory_starts_at_rest_at_A(self):
        samples = js(MATH, 'm.trajectory(1,2,3,1/100).filter((_,i)=>i%50===0)')
        for i, value in enumerate(samples):
            self.assertAlmostEqual(value, 2 * math.cos(0.5 * i), places=5)

    def test_energy_is_constant_and_swaps(self):
        for k, m, A in ((4, 1, 1), (9, 2.5, 2), (1, 0.5, 0.5)):
            w = math.sqrt(k / m)
            for t in (0, 0.4, 1.1, 2.9):
                got = js(MATH, f'm.energies({k},{m},{A},{t})')
                x, v = A * math.cos(w * t), -A * w * math.sin(w * t)
                self.assertAlmostEqual(got['K'], 0.5 * m * v * v)
                self.assertAlmostEqual(got['U'], 0.5 * k * x * x)
                self.assertAlmostEqual(got['E'], 0.5 * k * A * A)
            self.assertAlmostEqual(js(MATH, f'm.totalEnergy({k},{A})'), 0.5 * k * A * A)

    def test_omega_and_period(self):
        self.assertEqual(js(MATH, '[m.omega(4,1),m.omega(9,1),m.omega(16,4)]'), [2, 3, 2])
        self.assertAlmostEqual(js(MATH, 'm.periodOf(4,1)'), math.pi)
        # four times k doubles omega, and doubling both k and m changes nothing
        self.assertAlmostEqual(js(MATH, 'm.omega(8,1)/m.omega(2,1)'), 2)
        self.assertAlmostEqual(js(MATH, 'm.omega(4,2)'), js(MATH, 'm.omega(2,1)'))

    def test_natural_frequency_of_the_building(self):
        got = js(MATH, '[1,2,4,8].map(m.naturalFreq)')
        for n, f0 in zip((1, 2, 4, 8), got):
            self.assertAlmostEqual(f0, 1 / math.sqrt(n))
        self.assertEqual(round(got[3], 2), 0.35)

    def test_response_at_resonance(self):
        for zeta in (0.05, 0.15, 0.4):
            expect = math.sqrt(1 + 4 * zeta ** 2) / (2 * zeta)
            self.assertAlmostEqual(js(MATH, f'm.response(0.5,4,{zeta})'), expect)
        self.assertEqual(round(js(MATH, 'm.response(0.5,4,0.05)'), 2), 10.05)
        self.assertEqual(round(js(MATH, 'm.response(0.5,4,0.4)'), 2), 1.6)

    def test_response_matches_the_equation_of_motion(self):
        for f, n, zeta in ((0.3, 2, 0.15), (0.7, 2, 0.05), (1.0, 1, 0.4), (0.6, 4, 0.05), (2.5, 3, 0.15)):
            amplitude, phase = building_amplitude(f, n, zeta)
            got, late = js(MATH, f'[m.response({f},{n},{zeta}),m.lag({f}/m.naturalFreq({n}),{zeta})]')
            self.assertAlmostEqual(got, amplitude, delta=0.01 * got + 0.005)
            self.assertAlmostEqual(late, phase, delta=0.02)

    def test_response_is_small_for_slow_shaking_and_below_one_for_fast(self):
        self.assertAlmostEqual(js(MATH, 'm.response(0.001,1,0.05)'), 1, places=3)
        self.assertLess(js(MATH, 'm.response(3,1,0.05)'), 0.2)

    def test_lag_grows_through_resonance(self):
        self.assertAlmostEqual(js(MATH, 'm.lag(0.0001,0.05)'), 0, places=3)
        self.assertAlmostEqual(js(MATH, 'm.lag(1,0.05)'), math.atan2(2 * 0.05, 4 * 0.05 ** 2))
        self.assertAlmostEqual(js(MATH, 'm.lag(20,0.05)'), math.atan2(2 * 0.05 * 20 ** 3, 1 - 400 + (2 * 0.05 * 20) ** 2))
