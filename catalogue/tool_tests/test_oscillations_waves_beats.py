"""Every number the Beats box shows, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/oscillations-waves/_beats-math.js'
TAU = 2 * math.pi


@needs_node
class WhyBeatsTests(SimpleTestCase):
    def test_sum_is_the_product_form(self):
        for a, b in ((440, 444), (440, 436), (430.5, 460)):
            for t in (0.0, 0.0371, 0.125, 0.61, 1.903):
                direct = math.sin(TAU * a * t) + math.sin(TAU * b * t)
                self.assertAlmostEqual(js(MATH, f'm.sum({a}, {b}, {t})'), direct, places=9)
                product = js(MATH, f'm.envelope({a}, {b}, {t}) * m.carrier({a}, {b}, {t})')
                self.assertAlmostEqual(product, direct, places=9)

    def test_defaults_and_rate(self):
        self.assertEqual(js(MATH, 'm.beatRate(440, 444)'), 4)
        self.assertEqual(js(MATH, 'm.beatRate(440, 436)'), 4)
        self.assertEqual(js(MATH, 'm.lag(440, 436, 1)'), -4)
        # default t = 0.125 s: half a cycle gained, the waves cancel
        self.assertAlmostEqual(js(MATH, 'm.lag(440, 444, 0.125)'), 0.5)
        self.assertAlmostEqual(js(MATH, 'm.swing(440, 444, 0.125)'), 0, places=12)
        self.assertEqual(js(MATH, 'm.stepWord(0.5)'), 'opposite')
        # the formula's slow and fast rates at the default
        self.assertEqual(((444 - 440) / 2, (444 + 440) / 2), (2, 442))

    def test_loud_at_every_whole_cycle_gained(self):
        a, b = 440, 444
        for n in range(0, 5):
            t = n / 4
            self.assertAlmostEqual(js(MATH, f'm.loudness({a}, {b}, {t})'), 1, places=12)
            self.assertAlmostEqual(js(MATH, f'm.loudness({a}, {b}, {t + 0.125})'), 0, places=12)
            self.assertEqual(js(MATH, f'm.stepWord({(b - a) * t})'), 'in step')

    def test_loudness_repeats_at_the_difference_not_half_of_it(self):
        def power(t, w=0.02):  # mean square of the true sum over 20 ms: a level an ear could follow
            steps = 400
            return sum((math.sin(TAU * 440 * (t + w * i / steps)) + math.sin(TAU * 444 * (t + w * i / steps))) ** 2
                       for i in range(steps)) / steps
        samples = [power(i / 400) for i in range(400)]  # one second, which wraps round cleanly
        middle = (max(samples) + min(samples)) / 2
        swells = sum(1 for i in range(400) if samples[i - 1] < middle <= samples[i])
        self.assertEqual(swells, 4)

    def test_loop_has_no_jump(self):
        # steps of 0.5 Hz over 2 s: every lag is a whole number of cycles
        for b in (420, 433.5, 444, 459.5):
            self.assertEqual(js(MATH, f'm.lag(440, {b}, 2)') % 1, 0)

    def test_step_word(self):
        for cycles, word in ((0, 'in step'), (1.05, 'in step'), (1.95, 'in step'), (0.3, 'sliding'), (1.45, 'opposite')):
            self.assertEqual(js(MATH, f'm.stepWord({cycles})'), word)


@needs_node
class GameTests(SimpleTestCase):
    def test_string_frequency(self):
        mu, T, L = 0.00085, 72, 0.33
        self.assertAlmostEqual(js(MATH, f'm.stringFreq({T}, {mu})'), math.sqrt(T / mu) / (2 * L))
        self.assertAlmostEqual(js(MATH, f'm.stringFreq(m.tensionFor(440, {mu}), {mu})'), 440)

    def test_every_string_can_be_tuned_with_the_slider(self):
        for seed in range(1, 301):
            got = js(MATH, f'm.gameString({seed})') if seed <= 20 else None
            if got is None:
                continue
            gap = abs(got['start'] - 440)
            self.assertTrue(3 <= gap <= 9 and gap * 2 == int(gap * 2), got)
            nu = math.sqrt(72 / got['mu']) / (2 * 0.33)
            self.assertAlmostEqual(nu, got['start'], places=8)
            T = got['mu'] * (2 * 0.33 * 440) ** 2
            self.assertTrue(68 < T < 76, T)
            # the highest pitch on the slider stays on the plot's 24 Hz scale, or close to it
            self.assertLess(abs(math.sqrt(68 / got['mu']) / 0.66 - 440), 24)
            self.assertLess(abs(math.sqrt(76 / got['mu']) / 0.66 - 440), 24)
        extremes = [(440 + d) ** 2 for d in (-9, 9)]
        for square in extremes:
            self.assertTrue(68 < 72 * 440 ** 2 / square < 76)

    def test_one_peg_press_cannot_jump_the_tuned_window(self):
        # 0.1 N near 72 N moves ν by about 0.31 Hz, less than the 0.5 Hz wide window (±0.25 Hz)
        for start in (431, 449):
            mu = 72 / (0.66 * start) ** 2
            T = mu * (0.66 * 440) ** 2
            step = math.sqrt((T + 0.1) / mu) / 0.66 - 440
            self.assertLess(step, 0.5)

    def test_two_candidates_and_moves(self):
        self.assertEqual(js(MATH, 'm.candidates(440, 5)'), [435, 445])
        self.assertEqual(js(MATH, 'm.moveWord(5, 4)'), 'closer')
        self.assertEqual(js(MATH, 'm.moveWord(5, 6)'), 'further')
        self.assertEqual(js(MATH, 'm.moveWord(5, 5)'), 'same')
        self.assertEqual(js(MATH, 'm.moveWord(0.3, 0.2)'), 'tuned')


@needs_node
class GuitarTests(SimpleTestCase):
    TRUE = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41]

    def test_true_open_strings(self):
        for i, hz in enumerate(self.TRUE):
            self.assertEqual(round(js(MATH, f'm.trueOpen({i})'), 2), hz)

    def test_true_guitar_has_no_beats(self):
        offsets = '[0, 0, 0, 0, 0, 0]'
        pegs = '[100, 100, 100, 100, 100, 100]'
        for i in range(6):
            got = js(MATH, f'm.pairBeats({i}, m.openFreqs({pegs}, {offsets}))')
            self.assertAlmostEqual(got, 0, places=9)
        self.assertAlmostEqual(js(MATH, f'm.closure(m.openFreqs({pegs}, {offsets}))'), 0, places=9)

    def test_each_fret_reaches_the_string_above(self):
        semis = [5, 5, 4, 5, 5, 5]
        for i, fret in enumerate(semis):
            above = 440 if i == 0 else 440 * 2 ** (-[5, 10, 14, 19, 24][i - 1] / 12)
            self.assertAlmostEqual(self.exact(i) * 2 ** (fret / 12), above, places=9)
            self.assertEqual(js(MATH, f'm.GUITAR[{i}].fret'), fret)

    @staticmethod
    def exact(i):
        return 440 * 2 ** (-[5, 10, 14, 19, 24, 29][i] / 12)

    def test_beats_count_a_mistuned_pair(self):
        # E₄ 10 cents sharp: its fifth fret is 440·2^(10/1200), so beats = 440(2^(1/120) − 1)
        got = js(MATH, 'm.pairBeats(0, m.openFreqs([110, 100, 100, 100, 100, 100], [0, 0, 0, 0, 0, 0]))')
        self.assertAlmostEqual(got, 440 * (2 ** (1 / 120) - 1), places=9)
        self.assertEqual(round(got, 2), 2.55)

    def test_errors_carry_down_the_chain(self):
        # every string matched exactly to a sharp E₄: all stay 10 cents sharp, and the fork pair alone beats
        peg = '[110, 110, 110, 110, 110, 110]'
        zero = '[0, 0, 0, 0, 0, 0]'
        for i in range(1, 6):
            self.assertAlmostEqual(js(MATH, f'm.pairBeats({i}, m.openFreqs({peg}, {zero}))'), 0, places=9)
        self.assertAlmostEqual(js(MATH, f'm.centsFrom(m.openFreqs({peg}, {zero})[5], m.trueOpen(5))'), 10, places=9)
        # and a chain that drifts on the way shows up in the final check
        drift = '[100, 101, 102, 103, 104, 105]'
        closure = 4 * self.exact(5) * 2 ** (5 / 1200) - self.exact(0)
        self.assertAlmostEqual(js(MATH, f'm.closure(m.openFreqs({drift}, {zero}))'), closure, places=9)

    def test_why_text_percentage(self):
        self.assertEqual(round(0.25 / 440 * 100, 2), 0.06)
        self.assertEqual(js(MATH, 'm.IN_TUNE'), 0.25)

    def test_detune_stays_inside_the_peg_range(self):
        for seed in range(1, 40):
            offsets = js(MATH, f'm.detune({seed})')
            self.assertEqual(len(offsets), 6)
            for off in offsets:
                self.assertTrue(15 <= abs(off) <= 35)
            # the widest need: matching a neighbour 35 cents the other way
            self.assertLessEqual(max(abs(o) for o in offsets) + 35, js(MATH, 'm.PEG_TRUE'))
