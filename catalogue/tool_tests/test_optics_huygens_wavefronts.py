"""Every number the Huygens & Wavefronts box shows, worked out in Python, then checked against the JS."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/optics/_huygens-wavefronts-math.js'
C = 3e8


def tangent_angle(i, v1, v2):
    """Refracted angle from the wavelets themselves: circle of radius v2 tau about E, and the line from B to C
    tangent to it (found by solving the right triangle numerically), not by quoting Snell's law."""
    tau = 1.0
    ab = v1 * tau / math.sin(i)  # distance along the boundary the front covers while C is reached
    ae = v2 * tau
    return math.asin(ae / ab)


@needs_node
class WaveletTests(SimpleTestCase):
    def test_scallop(self):
        for n, L, r in ((2, 10, 3), (5, 10, 3), (30, 10, 3), (5, 10, 0.5)):
            half = L / (n - 1) / 2
            want = r if half >= r else r - math.sqrt(r * r - half * half)
            self.assertAlmostEqual(js(MATH, f'm.scallop({n}, {L}, {r})'), want, places=12)
        # the default view: 5 sources, r = 3, spacing 2.5 -> scallop 0.273
        self.assertEqual(round(3 - math.sqrt(9 - 1.25 ** 2), 3), 0.273)
        self.assertLess(js(MATH, 'm.scallop(30, 10, 3)'), 0.03)
        self.assertEqual(js(MATH, 'm.sources(5, 10)'), [-5, -2.5, 0, 2.5, 5])

    def test_snell_from_wavelets(self):
        for i_deg in (5, 30, 40, 80):
            for n in (0.6, 1.0, 1.5, 2.0):
                i = math.radians(i_deg)
                v2 = 1 / n
                got = js(MATH, f'm.refractAngle({i!r}, 1, {v2!r})')
                if n * 0 + math.sin(i) / n > 1:
                    self.assertIsNone(got)
                    continue
                self.assertAlmostEqual(got, tangent_angle(i, 1, v2), places=9)
                self.assertAlmostEqual(math.sin(i) / math.sin(got), n, places=9)

    def test_reflection_and_critical_angle(self):
        for i_deg in (5, 35, 60, 80):
            i = math.radians(i_deg)
            self.assertAlmostEqual(js(MATH, f'm.reflectAngle({i!r})'), i, places=12)
        self.assertAlmostEqual(js(MATH, 'm.criticalAngle(1, 1 / 0.6)') , math.asin(0.6), places=9)
        self.assertIsNone(js(MATH, 'm.criticalAngle(1, 0.5)'))

    def test_wavelet_radius_is_zero_before_the_front_arrives(self):
        i = math.radians(40)
        self.assertEqual(js(MATH, f'm.radius(9, 0.5, {i!r}, 1, 1)'), 0)
        want = 1 * (6 - 4 * math.sin(i) / 1)
        self.assertAlmostEqual(js(MATH, f'm.radius(4, 6, {i!r}, 1, 1)'), want, places=12)


@needs_node
class DopplerTests(SimpleTestCase):
    def test_observed_wavelength(self):
        self.assertAlmostEqual(js(MATH, 'm.dopplerLambda(656.3, 0.1)'), 656.3 * 1.1, places=9)
        self.assertEqual(f'{656.3 * 1.1:.4g}', '721.9')  # the "Far galaxy" readout
        self.assertEqual(js(MATH, 'm.H_ALPHA'), 656.3)

    def test_fronts_spacing_is_the_wavelength(self):
        for beta in (0.0, 0.05, 0.2, 0.3):
            fs = js(MATH, f'm.fronts(6.5, 1, {beta!r}, 7)')
            right = [f['x'] + f['r'] for f in fs]
            left = [f['x'] - f['r'] for f in fs]
            for a, b in zip(right, right[1:]):
                self.assertAlmostEqual((a - b) / C, 1 + beta, places=9)
            for a, b in zip(left, left[1:]):
                self.assertAlmostEqual((b - a) / C, 1 - beta, places=9)  # bunched ahead
            self.assertAlmostEqual(js(MATH, f'm.spacing(1, {beta!r}) / {C}'), 1 + beta, places=12)

    def test_exact_formula_is_larger(self):
        for beta in (0.01, 0.1, 0.2, 0.3):
            z = math.sqrt((1 + beta) / (1 - beta)) - 1
            self.assertAlmostEqual(js(MATH, f'm.relativisticZ({beta!r})'), z, places=12)
            self.assertGreater(z, beta)
        self.assertEqual(round(math.sqrt(1.3 / 0.7) - 1, 3), 0.363)
        self.assertEqual([g['beta'] for g in js(MATH, 'm.GALAXIES')], [0.01, 0.05, 0.1, 0.2])
        self.assertEqual(round(0.1 * 3e5), 30000)  # 3.00e4 km/s shown for the far galaxy
