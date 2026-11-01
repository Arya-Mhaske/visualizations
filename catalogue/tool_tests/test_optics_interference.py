"""Every number the Interference box shows, worked out in Python, then checked against the JS."""
import cmath
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/optics/_interference-math.js'
PHASES = [0, 2.4, 4.9, 1.1, 3.7, 5.6, 0.7, 2.9, 4.2, 5.2, 1.9, 3.3]


def two_wave(delta, lam, phi=0.0):
    """Add two unit waves as complex numbers, then take |sum|^2 (no cosine formula)."""
    a = cmath.exp(1j * 0) + cmath.exp(1j * (2 * math.pi * delta / lam + phi))
    return abs(a) ** 2


@needs_node
class SourceTests(SimpleTestCase):
    def test_exact_and_small_angle_path_difference(self):
        d, D = 0.5e-3, 1.0
        for y_mm in (-10, -1.2, 0, 1.2, 7.3, 10):
            y = y_mm * 1e-3
            exact = math.hypot(D, y + d / 2) - math.hypot(D, y - d / 2)
            self.assertAlmostEqual(js(MATH, f'm.pathDiff({y!r}, {d!r}, {D!r})'), exact, places=15)
            self.assertAlmostEqual(js(MATH, f'm.pathDiffSmall({y!r}, {d!r}, {D!r})'), d * y / D, places=15)
            self.assertLess(abs(exact - d * y / D), 1e-12 + 1e-4 * abs(d * y / D))  # small-angle rule holds here
        # default y = 1.2 mm with 600 nm light: exactly one wavelength, a bright fringe
        self.assertEqual(round(0.5e-3 * 1.2e-3 / 1.0 / 600e-9, 6), 1.0)

    def test_two_wave_and_fringe_spacing(self):
        for delta in (0, 0.25, 0.5, 1.0, 1.7):
            for phi in (0, 1.1, 4.2):
                self.assertAlmostEqual(js(MATH, f'm.twoWave({delta!r}, 1, {phi!r})'), two_wave(delta, 1, phi), places=12)
        self.assertAlmostEqual(js(MATH, 'm.fringeWidth(600e-9, 1, 0.5e-3)'), 1.2e-3, places=12)  # 1.2 mm default
        lam, D, d = 550e-9, 2.0, 0.4e-3
        self.assertAlmostEqual(js(MATH, f'm.fringeWidth({lam!r}, {D!r}, {d!r})'), lam * D / d, places=12)
        # neighbouring bright fringes are one fringe width apart; dark ones lie half-way
        self.assertAlmostEqual(js(MATH, f'm.brightAt(4, {lam!r}, {D!r}, {d!r}) - m.brightAt(3, {lam!r}, {D!r}, {d!r})'), lam * D / d, places=12)
        self.assertAlmostEqual(js(MATH, f'm.darkAt(3, {lam!r}, {D!r}, {d!r})'), 3.5 * lam * D / d, places=12)
        # the default fringe 3 sits at 3.6 mm; the explorer's window holds 20 / 1.2 = 16.7 fringes
        self.assertAlmostEqual(js(MATH, 'm.brightAt(3, 600e-9, 1, 0.5e-3)') * 1e3, 3.6, places=9)

    def test_incoherent_bulbs_wash_out(self):
        self.assertEqual(js(MATH, 'm.BULB_PHASES'), PHASES)
        for n in (1, 2, 5, 12):
            want = abs(sum(cmath.exp(1j * p) for p in PHASES[:n])) / n
            self.assertAlmostEqual(js(MATH, f'm.contrast({n}, false)'), want, places=12)
            self.assertEqual(js(MATH, f'm.contrast({n}, true)'), 1)
            # the averaged pattern really has that contrast
            xs = [i / 200 for i in range(201)]
            vals = [sum(two_wave(x, 1, p) for p in PHASES[:n]) / n for x in xs]
            got = (max(vals) - min(vals)) / (max(vals) + min(vals))
            self.assertAlmostEqual(got, want, places=4)
            self.assertAlmostEqual(js(MATH, f'm.averaged(0.37, 1, {n}, false)'), sum(two_wave(0.37, 1, p) for p in PHASES[:n]) / n, places=12)
        self.assertEqual(round(js(MATH, 'm.contrast(12, false)'), 2), round(abs(sum(cmath.exp(1j * p) for p in PHASES)) / 12, 2))
        self.assertLess(js(MATH, 'm.contrast(12, false)'), 0.2)  # fringes nearly gone with all twelve


@needs_node
class ClassifyTests(SimpleTestCase):
    def test_classify(self):
        self.assertEqual(js(MATH, 'm.classify(2.05, 1)'), {'kind': 'bright', 'order': 2})
        self.assertEqual(js(MATH, 'm.classify(-3.0, 1)'), {'kind': 'bright', 'order': 3})
        self.assertEqual(js(MATH, 'm.classify(1.5, 1)'), {'kind': 'dark', 'order': 1})
        self.assertEqual(js(MATH, 'm.classify(0.5, 1)'), {'kind': 'dark', 'order': 0})
        self.assertEqual(js(MATH, 'm.classify(0.25, 1)'), {'kind': 'between', 'order': None})

    def test_default_point_and_bright_count(self):
        # default P at (8, 2.4) with d = 4: lower path minus upper path
        delta = math.hypot(8, 2.4 + 2) - math.hypot(8, 2.4 - 2)
        self.assertEqual(round(delta, 2), 1.12)
        self.assertEqual(js(MATH, 'm.classify(1.1204, 1)')['kind'], 'between')
        # |delta| <= d always (triangle inequality), so orders 0..floor(d / lam) exist
        for d in (1, 2.5, 4, 6):
            best = max(abs(math.hypot(x, y + d / 2) - math.hypot(x, y - d / 2)) for x in (0.01, 1, 5, 50) for y in (-30, -3, 0, 3, 30))
            self.assertLessEqual(best, d + 1e-9)
            self.assertEqual(js(MATH, f'm.brightCount({d!r}, 1)'), 2 * math.floor(d) + 1)


@needs_node
class FilmTests(SimpleTestCase):
    def test_film_intensity(self):
        n = 1.33
        for t in (0, 50, 120, 400, 800):
            for lam in (450, 550, 650):
                # two reflections as complex numbers: front flips (-1), back goes 2nt further
                a = -1 + cmath.exp(1j * 4 * math.pi * n * t / lam)
                self.assertAlmostEqual(js(MATH, f'm.filmIntensity({t}, {lam})'), abs(a) ** 2 / 4, places=12)
        self.assertEqual(js(MATH, 'm.filmIntensity(0, 550)'), 0)  # very thin film is dark

    def test_bright_thickness_and_strongest(self):
        self.assertEqual(round(js(MATH, 'm.brightThickness(0, 550)'), 1), round(550 / (4 * 1.33), 1))
        self.assertEqual(round(550 / (4 * 1.33), 1), 103.4)
        self.assertAlmostEqual(js(MATH, 'm.filmIntensity(m.brightThickness(2, 450), 450)'), 1, places=12)
        n = 1.33
        for t in (60, 120, 300, 700):
            want = max((('red', 650), ('green', 550), ('blue', 450)), key=lambda c: math.sin(2 * math.pi * n * t / c[1]) ** 2)[0]
            self.assertEqual(js(MATH, f'm.strongest({t}).name'), want)
        self.assertEqual(js(MATH, 'm.N_FILM'), 1.33)
        self.assertEqual([c['nm'] for c in js(MATH, 'm.CHANNELS')], [650, 550, 450])
