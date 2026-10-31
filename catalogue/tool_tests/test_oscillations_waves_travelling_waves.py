"""Every number the Travelling Waves box shows, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/oscillations-waves/_travelling-waves-math.js'
TAU = 2 * math.pi

P_AIR, RHO_AIR, GAMMA = 1.013e5, 1.29, 1.4


@needs_node
class WaveTests(SimpleTestCase):
    def test_wave_height(self):
        for x, t, a, k, w, phi, s in [(1.0, 0.5, 1, 2, 3, 0.8, 1), (3.3, 1.7, 2, 1.5, 4, -1.2, 1), (2.0, 0.9, 1, 2, 3, 0, -1)]:
            self.assertAlmostEqual(js(MATH, f'm.wave({x},{t},{a},{k},{w},{phi},{s})'),
                                   a * math.sin(k * x - s * w * t + phi), places=12)

    def test_rider_keeps_constant_phase_and_moves_at_omega_over_k(self):
        for theta in (0.0, 1.57, 3.0, 6.28):
            for s, near in ((1, 0), (-1, 4)):
                for k, w in ((2, 3), (1.6, 5), (4, 1)):
                    x_start = js(MATH, f'm.riderX({theta},0,{k},{w},{s},{near})')
                    self.assertGreaterEqual(x_start, near - 1e-9)
                    self.assertLess(x_start, near + TAU / k)
                    for t in (0.0, 0.4, 1.3):
                        x = js(MATH, f'm.riderX({theta},{t},{k},{w},{s},{near})')
                        self.assertAlmostEqual(x - x_start, s * (w / k) * t, places=9)
                        phase = k * x - s * w * t
                        self.assertAlmostEqual(math.sin(phase), math.sin(theta), places=9)
                        self.assertAlmostEqual(math.cos(phase), math.cos(theta), places=9)

    def test_rider_stays_on_screen_for_a_whole_loop(self):
        # tool 1 shows x in [0, 8], lets k run 1.6–4 and ω 1–5, and loops after min(6, 4/v) seconds
        # A rightward rider starts below λ and travels at most 4 m; a leftward rider starts in [4, 4 + λ).
        for k in [1.6 + 0.1 * i for i in range(25)]:
            for w in [1 + 0.1 * i for i in range(41)]:
                v = w / k
                loop = min(6, 4 / v)
                self.assertLessEqual(v * loop, 4 + 1e-9)
                self.assertLess(TAU / k + v * loop, 8)       # right edge
                self.assertLess(4 + TAU / k, 8)              # left-mover's start
                self.assertGreaterEqual(4 - v * loop, -1e-9)  # left edge
        # and spot-check with the real module
        end = js(MATH, 'm.riderX(6.28, 1.6, 1.6, 4, 1, 0)')
        self.assertLess(end, 8)

    def test_speed_helpers(self):
        self.assertAlmostEqual(js(MATH, 'm.speedOf(2, 3)'), 1.5)
        self.assertAlmostEqual(js(MATH, 'm.wavelengthOf(2)'), math.pi)
        self.assertAlmostEqual(js(MATH, 'm.periodOf(3)'), TAU / 3)
        self.assertAlmostEqual(js(MATH, 'm.freqOf(3)'), 3 / TAU)

    def test_v_is_lambda_nu_is_omega_over_k(self):
        for lam in (1, 1.5, 2, 3, 4):
            for nu in (0.25, 0.5, 0.75, 1):
                k, w = TAU / lam, TAU * nu
                self.assertAlmostEqual(js(MATH, f'm.speedOf({k},{w})'), lam * nu, places=9)
                self.assertAlmostEqual(js(MATH, f'm.wavelengthOf({k})') / js(MATH, f'm.periodOf({w})'), lam * nu, places=9)

    def test_marked_crest_moves_one_wavelength_in_one_period(self):
        # tool 2 moves the crest from λ/4 by vu; at u = T it must be on the next crest
        for lam, nu in [(3, 0.5), (1, 1), (4, 0.25), (2.5, 0.75)]:
            k, w, v, T = TAU / lam, TAU * nu, lam * nu, 1 / nu
            x_end = lam / 4 + v * T
            self.assertAlmostEqual(x_end, lam / 4 + lam)
            self.assertAlmostEqual(math.sin(k * x_end - w * T), 1.0)
            self.assertAlmostEqual(js(MATH, f'm.wave({x_end},{T},1,{k},{w},0,1)'), 1.0, places=9)
            self.assertLessEqual(lam / 4 + lam, 8)  # stays inside the 8 m window

    def test_default_values(self):
        self.assertAlmostEqual(3 * 0.5, 1.5)
        self.assertEqual(round(1 / 0.5, 2), 2.0)


@needs_node
class StringTests(SimpleTestCase):
    def test_speed(self):
        for T, mu in [(20, 0.02), (80, 0.02), (5, 0.08), (80, 0.005)]:
            self.assertAlmostEqual(js(MATH, f'm.stringSpeed({T},{mu})'), math.sqrt(T / mu), places=9)

    def test_four_times_the_tension_doubles_the_speed(self):
        self.assertAlmostEqual(js(MATH, 'm.stringSpeed(80,0.02)') / js(MATH, 'm.stringSpeed(20,0.02)'), 2.0)
        self.assertEqual(round(math.sqrt(1000), 1), 31.6)
        self.assertEqual(round(math.sqrt(4000), 1), 63.2)
        self.assertEqual(round(2 / math.sqrt(4000) * 1000), 32)  # ms to cross 2 m at default

    def test_four_times_the_tension_and_mass_changes_nothing(self):
        self.assertAlmostEqual(js(MATH, 'm.stringSpeed(80,0.08)'), js(MATH, 'm.stringSpeed(20,0.02)'))

    def test_pulse_peak_travels_at_v(self):
        v = math.sqrt(80 / 0.02)
        tau = 0.01
        self.assertAlmostEqual(js(MATH, f'm.pulseY({0.2 + v * tau},{tau},{v},0.2,0.1)'), 1.0)
        self.assertAlmostEqual(js(MATH, f'm.pulseY(0.5,0,{v},0.2,0.1)'), math.exp(-9))

    def test_slowest_pulse_finishes_inside_the_loop(self):
        # slowest allowed string: T = 5, μ = 0.08 → 7.9 m/s; the loop is (L + 0.4)/v_min in real time
        v_min = math.sqrt(5 / 0.08)
        self.assertGreater(((2 + 0.4) / v_min) * 20, 5)   # about 6 s of animation
        self.assertLess(((2 + 0.4) / v_min) * 20, 8)


@needs_node
class SoundTests(SimpleTestCase):
    def test_newton_and_laplace(self):
        n = math.sqrt(P_AIR / RHO_AIR)
        l = math.sqrt(GAMMA * P_AIR / RHO_AIR)
        self.assertAlmostEqual(js(MATH, f'm.newtonSpeed({P_AIR},{RHO_AIR})'), n, places=9)
        self.assertAlmostEqual(js(MATH, f'm.laplaceSpeed({GAMMA},{P_AIR},{RHO_AIR})'), l, places=9)
        self.assertEqual(round(n, 1), 280.2)
        self.assertEqual(round(l, 1), 331.6)

    def test_newton_is_fifteen_percent_low(self):
        n = math.sqrt(P_AIR / RHO_AIR)
        l = math.sqrt(GAMMA * P_AIR / RHO_AIR)
        self.assertAlmostEqual(js(MATH, f'm.percentLow({GAMMA})'), (1 - n / l) * 100, places=9)
        self.assertEqual(round((1 - n / l) * 100, 1), 15.5)
        self.assertEqual(round(math.sqrt(GAMMA), 2), 1.18)  # "1.18 times" in the why text
        self.assertAlmostEqual(js(MATH, 'm.percentLow(1)'), 0)

    def test_pressure_curves(self):
        for s in (0, 0.05, 0.08, 0.14):
            self.assertAlmostEqual(js(MATH, f'm.isoP({s})'), 1 / (1 - s), places=12)
            self.assertAlmostEqual(js(MATH, f'm.adiaP({s},1.4)'), (1 - s) ** -1.4, places=12)
            self.assertGreaterEqual(js(MATH, f'm.adiaP({s},1.4)'), js(MATH, f'm.isoP({s})'))

    def test_slopes_at_the_start_are_P_and_gamma_P(self):
        h = 1e-6
        iso = (js(MATH, f'm.isoP({h})') - js(MATH, f'm.isoP({-h})')) / (2 * h)
        adia = (js(MATH, f'm.adiaP({h},1.4)') - js(MATH, f'm.adiaP({-h},1.4)')) / (2 * h)
        self.assertAlmostEqual(iso, 1.0, places=5)   # dP/dV = −P/V → slope magnitude P in units of P0
        self.assertAlmostEqual(adia, 1.4, places=5)  # magnitude γP

    def test_plot_window_holds_the_curves(self):
        # x window [0.86, 1.02], y window [0.95, 1.3]; squeeze up to 14 %, γ up to 1.7
        self.assertLess(js(MATH, 'm.adiaP(0.14,1.7)'), 1.3 + 0.2)
        self.assertEqual(round(0.86 ** -1.7, 2), 1.29)  # the top of the window: 1.29 < 1.3
        self.assertLess(0.86 ** -1.7, 1.3)
        # tangent end points
        for g in (1.0, 1.4, 1.7):
            self.assertGreater(1 + 0.06 * g, 0.95)
            self.assertGreater(1 - 0.02 * g, 0.95)
            self.assertLess(1 + 0.06 * g, 1.3)


@needs_node
class MaterialTests(SimpleTestCase):
    def speeds(self):
        return {name: js(MATH, f'm.materialSpeed(m.MATERIALS.{name})') for name in ('air', 'water', 'aluminium', 'steel')}

    def test_speeds(self):
        got = self.speeds()
        self.assertAlmostEqual(got['air'], math.sqrt(1.4 * P_AIR / RHO_AIR), places=6)
        self.assertAlmostEqual(got['water'], math.sqrt(2.2e9 / 1000), places=6)
        self.assertAlmostEqual(got['aluminium'], math.sqrt(7.0e10 / 2700), places=6)
        self.assertAlmostEqual(got['steel'], math.sqrt(2.0e11 / 7800), places=6)
        self.assertEqual(round(got['air']), 332)
        self.assertEqual(round(got['water']), 1483)
        self.assertEqual(round(got['aluminium']), 5092)
        self.assertEqual(round(got['steel']), 5064)

    def test_why_text_ratios(self):
        stiff = 2.0e11 / (1.4 * P_AIR)
        dens = 7800 / 1.29
        self.assertEqual(f'{stiff:.2e}', '1.41e+06')   # "about a million times stiffer"
        self.assertEqual(round(dens), 6047)            # "about 6000 times denser"
        ratio = js(MATH, 'm.materialSpeed(m.MATERIALS.steel) / m.materialSpeed(m.MATERIALS.air)')
        self.assertAlmostEqual(ratio, math.sqrt(stiff / dens), places=9)
        self.assertEqual(round(ratio), 15)

    def test_stiffness_wins_for_every_choice(self):
        for name, (Y, rho) in {'water': (2.2e9, 1000), 'aluminium': (7.0e10, 2700), 'steel': (2.0e11, 7800)}.items():
            self.assertGreater(Y / (1.4 * P_AIR), rho / 1.29, name)

    def test_bar_scales_hold_every_value(self):
        # stiffness bars on 10^4 … 10^12 pascals, density bars on 10^−1 … 10^4 kg/m³
        for value in (1.4 * P_AIR, 2.2e9, 7.0e10, 2.0e11):
            self.assertTrue(4 < math.log10(value) < 12)
        for value in (1.29, 1000, 2700, 7800):
            self.assertTrue(-1 < math.log10(value) < 4)

    def test_race_cycle(self):
        # animation loop (L + 15)/v_air real seconds, slowed ×20: about 7 s; steel crosses 100 m in 20 ms (0.4 s slowed)
        loop = (100 + 15) / math.sqrt(1.4 * P_AIR / RHO_AIR) * 20
        self.assertEqual(round(loop, 1), 6.9)
        self.assertEqual(round(100 / math.sqrt(2.0e11 / 7800) * 1000), 20)
