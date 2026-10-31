"""Every number the Standing Waves & Music box shows, worked out in Python, then checked against the JS module."""
import cmath
import json
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/oscillations-waves/_standing-waves-math.js'
TAU = 2 * math.pi


def direct_driven(x, phase, k, L, N, q=0.85):
    """The driven string by adding up every pass of the wave as a real sine, with no phasors."""
    g = -math.log(q) / (2 * L)
    right = sum(math.exp(-g * (x + 2 * m * L)) * math.sin(phase - k * (x + 2 * m * L)) for m in range(N + 1))
    left = -sum(math.exp(-g * (2 * L - x + 2 * m * L)) * math.sin(phase - k * (2 * L - x + 2 * m * L)) for m in range(N + 1))
    return right, left


@needs_node
class ModeTests(SimpleTestCase):
    def test_frequencies(self):
        self.assertAlmostEqual(js(MATH, "m.modeFreq('string', 3, 240, 0.6)"), 3 * 240 / 1.2)
        self.assertAlmostEqual(js(MATH, "m.modeFreq('open', 2, 340, 0.6)"), 2 * 340 / 1.2)
        # closed pipe: odd multiples of v/4L only
        for n in (1, 2, 3):
            self.assertAlmostEqual(js(MATH, f"m.modeFreq('closed', {n}, 340, 0.6)"), (2 * n - 1) * 340 / 2.4)
            self.assertEqual(js(MATH, f"m.harmonicNumber('closed', {n})"), 2 * n - 1)
        self.assertEqual(round(340 / 2.4 * 3), 425)  # the default of the explorer

    def test_shape_satisfies_the_end_rules(self):
        L = 0.6
        for n in range(1, 6):
            self.assertAlmostEqual(js(MATH, f"m.shape('string', {n}, {L}, 0)"), 0, places=12)
            self.assertAlmostEqual(js(MATH, f"m.shape('string', {n}, {L}, {L})"), 0, places=12)
            self.assertAlmostEqual(abs(js(MATH, f"m.shape('open', {n}, {L}, 0)")), 1, places=12)
            self.assertAlmostEqual(abs(js(MATH, f"m.shape('open', {n}, {L}, {L})")), 1, places=12)
            self.assertAlmostEqual(js(MATH, f"m.shape('closed', {n}, {L}, 0)"), 0, places=12)
            self.assertAlmostEqual(abs(js(MATH, f"m.shape('closed', {n}, {L}, {L})")), 1, places=12)

    def test_node_and_antinode_positions(self):
        L = 0.6
        for kind in ('string', 'open', 'closed'):
            for n in range(1, 6):
                nodes = js(MATH, f"m.nodesOf('{kind}', {n}, {L})")
                anti = js(MATH, f"m.antinodesOf('{kind}', {n}, {L})")
                for x in nodes:
                    self.assertAlmostEqual(js(MATH, f"m.shape('{kind}', {n}, {L}, {x})"), 0, places=9)
                for x in anti:
                    self.assertAlmostEqual(abs(js(MATH, f"m.shape('{kind}', {n}, {L}, {x})")), 1, places=9)
        # counts: string n+1 nodes (ends included), n antinodes; closed pipe n of each
        self.assertEqual((len(js(MATH, "m.nodesOf('string', 3, 1)")), len(js(MATH, "m.antinodesOf('string', 3, 1)"))), (4, 3))
        self.assertEqual((len(js(MATH, "m.nodesOf('open', 3, 1)")), len(js(MATH, "m.antinodesOf('open', 3, 1)"))), (3, 4))
        self.assertEqual((len(js(MATH, "m.nodesOf('closed', 2, 1)")), len(js(MATH, "m.antinodesOf('closed', 2, 1)"))), (2, 2))


@needs_node
class NodeSpacingTests(SimpleTestCase):
    def test_sum_of_two_waves(self):
        a, lam = 1.0, 4.0
        k, w = TAU / lam, math.pi
        for x in (0.3, 1.7, 2.0, 5.5):
            for t in (0.0, 0.5, 1.3):
                got = js(MATH, f'm.pair({a}, {k}, {w}, {x}, {t})')
                r, l = a * math.sin(k * x - w * t), a * math.sin(k * x + w * t)
                self.assertAlmostEqual(got['sum'], r + l, places=12)
                self.assertAlmostEqual(got['sum'], 2 * a * math.sin(k * x) * math.cos(w * t), places=12)
                self.assertAlmostEqual(got['formula'], r + l, places=12)

    def test_nodes_are_half_a_wavelength_apart(self):
        for lam in (2, 3.5, 4, 8):
            nodes = js(MATH, f'm.nodePositions({TAU / lam}, 0, 10)')
            self.assertEqual(len(nodes), int(10 // (lam / 2)) + 1)
            for a, b in zip(nodes, nodes[1:]):
                self.assertAlmostEqual(b - a, lam / 2, places=12)
            for x in nodes:
                self.assertAlmostEqual(math.sin(TAU / lam * x), 0, places=9)

    def test_default_readout(self):
        # defaults: λ = 4 m, probe 3 m, t = 0.5 s, ω = π: k = π/2, sum = 2 sin(3π/2) cos(π/2) = 0
        got = js(MATH, f'm.pair(1, {math.pi / 2}, {math.pi}, 3, 0.5)')
        self.assertAlmostEqual(got['sum'], 2 * math.sin(1.5 * math.pi) * math.cos(math.pi / 2), places=12)


@needs_node
class PipeFitTests(SimpleTestCase):
    def test_closed_open_fits_at_odd_ratios(self):
        for r in range(1, 9):
            self.assertEqual(js(MATH, f"m.endTest('closed-open', {r}).fits"), r % 2 == 1, msg=f'r={r}')
            self.assertEqual(js(MATH, f"m.endTest('open-open', {r}).fits"), r % 2 == 0, msg=f'r={r}')
        self.assertEqual(js(MATH, "m.fitRatios('closed-open', 8)"), [1, 3, 5, 7])
        self.assertEqual(js(MATH, "m.fitRatios('open-open', 8)"), [2, 4, 6, 8])

    def test_open_end_swing_in_between(self):
        # at r = 2 a closed pipe's open end swings sin(π) = 0 of the most (a node: it cannot be open)
        self.assertAlmostEqual(js(MATH, "m.endTest('closed-open', 2).value"), 0, places=12)
        self.assertAlmostEqual(js(MATH, "m.endTest('closed-open', 1.5).value"), math.sin(0.75 * math.pi), places=12)
        self.assertEqual(round(math.sin(0.75 * math.pi) * 100), 71)

    def test_r_matches_quarter_waves(self):
        # ν = r·v/4L  =>  λ = 4L/r  =>  L = r λ/4
        v, L = 340.0, 0.6
        for r in (1, 3, 5):
            lam = v / (r * v / (4 * L))
            self.assertAlmostEqual(L, r * lam / 4)


@needs_node
class DrivenStringTests(SimpleTestCase):
    def test_matches_a_direct_sum_of_passes(self):
        for nu, L, N in [(200, 0.5, 10), (260, 0.5, 10), (400, 0.3, 4), (333, 0.45, 0), (150, 0.6, 7)]:
            k = TAU * nu / 200
            for x in (0.0, 0.1 * L, 0.5 * L, 0.9 * L, L):
                for phase in (0.0, 1.1, 2.9):
                    right, left = direct_driven(x, phase, k, L, N)
                    got = js(MATH, f'm.drivenParts({x}, {phase}, {{k: {k}, L: {L}, N: {N}}})')
                    self.assertAlmostEqual(got['right'], right, places=9)
                    self.assertAlmostEqual(got['left'], left, places=9)
                    self.assertAlmostEqual(got['sum'], right + left, places=9)

    def test_fixed_end_never_moves_and_driver_end_follows_the_driver(self):
        k, L = TAU * 260 / 200, 0.5
        for phase in (0.3, 1.0, 2.0, 4.0):
            self.assertAlmostEqual(js(MATH, f'm.drivenParts({L}, {phase}, {{k: {k}, L: {L}, N: 10}}).sum'), 0, places=12)
            # with many round trips the end x = 0 swings exactly like the driver, sin(phase)
            got = js(MATH, f'm.drivenParts(0, {phase}, {{k: {k}, L: {L}, N: 400}}).sum')
            self.assertAlmostEqual(got, math.sin(phase), places=9)

    def test_resonance_is_at_whole_half_wavelengths(self):
        L, v = 0.5, 200
        gains = {nu: js(MATH, f'm.swingGain({nu}, {{v: {v}, L: {L}, N: 10}})') for nu in range(50, 1001, 10)}
        for n in (1, 2, 3, 4, 5):
            nu = n * v / (2 * L)
            self.assertAlmostEqual(js(MATH, f'm.swingGain({nu}, {{v: {v}, L: {L}, N: 10}})'), 11.0, delta=1.0)
            self.assertGreater(gains[round(nu)], gains[round(nu) - 60])
            self.assertGreater(gains[round(nu)], gains[round(nu) + 60] if round(nu) + 60 in gains else 0)
        # halfway between two resonances the string hardly responds: about the driver's own swing
        self.assertLess(js(MATH, f'm.swingGain(300, {{v: {v}, L: {L}, N: 10}})'), 2.2)
        # more round trips: the resonant swing grows, the off-resonance swing does not
        r0 = js(MATH, f'm.swingGain(200, {{v: {v}, L: {L}, N: 0}})')
        r10 = js(MATH, f'm.swingGain(200, {{v: {v}, L: {L}, N: 10}})')
        self.assertLess(r0, 2.01)
        self.assertGreater(r10 / r0, 5)
        # the geometric series for q = 0.85, 11 passes: (1 − 0.85¹¹)/(1 − 0.85) = 5.6, and the peak is a little under twice that
        series = (1 - 0.85 ** 11) / 0.15
        self.assertEqual(round(series, 1), 5.6)
        self.assertLess(r10, 2 * series)

    def test_default_numbers(self):
        # L = 0.5 m, v = 200 m/s: ν₁ = 200 Hz; 2L/λ = 2νL/v
        self.assertEqual(2 * 200 * 0.5 / 200, 1.0)
        self.assertEqual(js(MATH, "m.modeFreq('string', 1, 200, 0.5)"), 200)


@needs_node
class MusicTests(SimpleTestCase):
    def test_sitar_string(self):
        T, mu, L = 80, 0.0005, 0.9
        v = math.sqrt(T / mu)
        self.assertAlmostEqual(js(MATH, f'm.stringSpeed({T}, {mu})'), v)
        self.assertAlmostEqual(js(MATH, f'm.stringFreq({T}, {mu}, {L})'), v / (2 * L))
        self.assertEqual(round(v), 400)
        self.assertEqual(round(v / (2 * L)), 222)
        # four times the tension doubles the pitch; half the length doubles it
        self.assertAlmostEqual(js(MATH, f'm.stringFreq({4 * T}, {mu}, {L})') / (v / (2 * L)), 2)
        self.assertAlmostEqual(js(MATH, f'm.stringFreq({T}, {mu}, {L / 2})') / (v / (2 * L)), 2)
        # highest curve in the plot stays inside 0–1000 Hz
        self.assertLess(math.sqrt(4 * 100 / mu) / (2 * 0.45), 1000)

    def test_notes(self):
        self.assertEqual(js(MATH, 'm.noteOf(440)'), {'name': 'A4', 'midi': 69, 'cents': 0})
        self.assertEqual(js(MATH, 'm.noteOf(261.63)')['name'], 'C4')
        self.assertEqual(js(MATH, 'm.noteOf(220)')['name'], 'A3')
        self.assertEqual(js(MATH, 'm.noteOf(222.2)')['name'], 'A3')
        self.assertEqual(js(MATH, 'm.noteOf(222.2)')['cents'], round((12 * math.log2(222.2 / 220)) * 100))
        self.assertEqual(js(MATH, 'm.noteOf(466.16)')['name'], 'A♯4')

    def test_frets_and_semitones(self):
        self.assertAlmostEqual(js(MATH, 'm.fretLength(0.9, 12)'), 0.45)
        self.assertAlmostEqual(js(MATH, 'm.fretLength(0.9, 7)'), 0.9 / 2 ** (7 / 12))
        self.assertEqual(round(0.9 / 2 ** (7 / 12), 2), 0.6)
        self.assertEqual(round(0.9 / 2 ** (5 / 12), 2), 0.67)
        self.assertAlmostEqual(js(MATH, 'm.semitones(880, 440)'), 12)


@needs_node
class ResonanceColumnTests(SimpleTestCase):
    def test_air_speed(self):
        self.assertAlmostEqual(js(MATH, 'm.airSpeed(0)'), 331.3)
        self.assertAlmostEqual(js(MATH, 'm.airSpeed(20)'), 331.3 * math.sqrt(1 + 20 / 273.15))
        self.assertEqual(round(331.3 * math.sqrt(1 + 20 / 273.15), 1), 343.2)

    def test_resonance_lengths(self):
        v, f, r = 331.3 * math.sqrt(1 + 20 / 273.15), 512, 0.02
        lam = v / f
        got = js(MATH, f'm.resonanceLengths({f}, 20, {r}, 3)')
        for i, l in enumerate(got):
            self.assertAlmostEqual(l, (2 * i + 1) * lam / 4 - 0.6 * r, places=12)
        self.assertEqual([round(l * 100, 1) for l in got], [15.6, 49.1, 82.6])
        # 256 Hz: the second resonance still fits inside the 110 cm tube
        self.assertLess(js(MATH, 'm.resonanceLengths(256, 20, 0.02, 3)')[1] * 100, 110)

    def test_loudness_peaks_at_resonance(self):
        for f in (256, 320, 384, 512):
            for l in js(MATH, f'm.resonanceLengths({f}, 20, 0.02, 2)'):
                self.assertAlmostEqual(js(MATH, f'm.loudness({l}, {f}, 20, 0.02)'), 1.0, places=9)
                self.assertLess(js(MATH, f'm.loudness({l + 0.05}, {f}, 20, 0.02)'), 0.9)
        # between two resonances the tube is quiet: (1 − q)/(1 + q) = 1/9
        mid = (js(MATH, 'm.resonanceLengths(512, 20, 0.02, 2)')[0] + js(MATH, 'm.resonanceLengths(512, 20, 0.02, 2)')[1]) / 2
        self.assertAlmostEqual(js(MATH, f'm.loudness({mid}, 512, 20, 0.02)'), 0.2 / 1.8, places=9)

    def test_speed_from_two_lengths_cancels_the_end_correction(self):
        for r in (0.01, 0.02, 0.04):
            l1, l2 = js(MATH, f'm.resonanceLengths(512, 20, {r}, 2)')
            v = 331.3 * math.sqrt(1 + 20 / 273.15)
            self.assertAlmostEqual(js(MATH, f'm.speedFromTwo(512, {l1}, {l2})'), v, places=9)
            self.assertAlmostEqual(js(MATH, f'm.endFromTwo({l1}, {l2})'), 0.6 * r, places=12)
            # one length alone is out by 4ν·e
            self.assertAlmostEqual(js(MATH, f'm.speedFromOne(512, {l1})'), v - 4 * 512 * 0.6 * r, places=9)
        self.assertEqual(round(4 * 512 * 0.012), 25)  # default r = 2 cm: 25 m/s too low

    def test_exports_json(self):
        self.assertEqual(json.loads(json.dumps(js(MATH, "m.fitRatios('closed-open', 3)"))), [1, 3])
        self.assertTrue(cmath.isclose(cmath.exp(1j * TAU), 1))
