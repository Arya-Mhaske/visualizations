"""Every number the Current & Drift box shows, worked out in Python, then checked against the JS module."""
import math
import random

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/current-magnetism/_current-drift-math.js'
E, M, N = 1.6e-19, 9.1e-31, 8.5e28
RHO = 1.7e-8


@needs_node
class DriftTests(SimpleTestCase):
    def test_ncert_example(self):
        v = 1.5 / (N * E * 1e-7)
        self.assertAlmostEqual(js(MATH, 'm.driftSpeed(1.5)'), v)
        self.assertEqual(round(v * 1000, 1), 1.1)
        self.assertEqual(round(N * E * 1e-7), 1360)  # the neA readout

    def test_calculator_materials(self):
        # free electrons per m³ from density, molar mass and valence
        avogadro = 6.02e23
        self.assertAlmostEqual(2700 / 0.02698 * avogadro * 3 / 1.8e29, 1, delta=0.01)
        self.assertAlmostEqual(10490 / 0.10787 * avogadro / 5.9e28, 1, delta=0.01)
        self.assertEqual(js(MATH, 'm.MATERIALS.aluminium.n'), 1.8e29)
        self.assertEqual(js(MATH, 'm.MATERIALS.silver.n'), 5.9e28)
        # the fastest slider setting fits the 12 mm drawing
        fastest = js(MATH, 'm.driftSpeed(10, m.MATERIALS.silver.n, 1e-7)')
        self.assertAlmostEqual(fastest, 10 / (5.9e28 * E * 1e-7))
        self.assertEqual(round(fastest * 1000, 1), 10.6)
        self.assertLess(fastest, 12e-3)
        # doubling the area halves the speed; aluminium is slower than copper
        self.assertAlmostEqual(js(MATH, 'm.driftSpeed(1.5, 8.5e28, 2e-7)'), 1.5 / (N * E * 2e-7))
        self.assertLess(js(MATH, 'm.driftSpeed(1.5, m.MATERIALS.aluminium.n)'), js(MATH, 'm.driftSpeed(1.5)'))

    def test_electrons_per_second_and_time_per_metre(self):
        self.assertAlmostEqual(js(MATH, 'm.electronsPerSecond(1.5)') / (1.5 / E), 1)
        self.assertEqual(round(1.5 / E / 1e18, 1), 9.4)
        self.assertEqual(round(1 / (1.5 / (N * E * 1e-7)) / 60, 1), 15.1)

    def test_bulb_times(self):
        v = 1.5 / (N * E * 1e-7)
        self.assertAlmostEqual(js(MATH, 'm.crossingTime(10, m.SIGNAL_SPEED)'), 5e-8)
        self.assertEqual(round(10 / v / 3600, 1), 2.5)
        self.assertEqual(round(100 / v / 3600), 25)
        self.assertEqual(round(1e5 / v / 1e7), 9)  # jitter ÷ drift, about 9 × 10⁷
        self.assertEqual(round(1.4 / v, -2), 1300)  # walking ÷ drift
        self.assertEqual(round(2e8 / v / 1e11, 1), 1.8)

    def test_scale_covers_every_bar(self):
        low = 1e-6
        self.assertGreater(0.1 / (N * E * 1e-7), low)
        self.assertLessEqual(js(MATH, 'm.LIGHT_SPEED'), 1e9)

    def test_pipes(self):
        self.assertEqual(js(MATH, 'm.MARBLES'), 12)
        full = js(MATH, 'm.pipeFull(0.6)')
        self.assertEqual(len(full), 12)
        self.assertAlmostEqual(full[-1] - 11, 0.6)
        self.assertEqual(js(MATH, 'm.pipeEmpty(0.6)'), [0.6])


@needs_node
class OhmTests(SimpleTestCase):
    def test_copper_values_from_the_lead_text(self):
        tau = M / (N * E * E * RHO)
        self.assertAlmostEqual(js(MATH, 'm.relaxationTime(m.RHO_COPPER)'), tau)
        self.assertEqual(round(tau * 1e14, 1), 2.5)
        # E = 0.25 V/m, τ = 2.5 × 10⁻¹⁴ s, the default
        v = E * 0.25 * 2.5e-14 / M
        self.assertAlmostEqual(js(MATH, 'm.drudeDrift(0.25, 2.5e-14)'), v)
        self.assertEqual(round(v * 1000, 1), 1.1)
        self.assertAlmostEqual(js(MATH, f'm.currentDensity({v})'), N * E * v)
        self.assertAlmostEqual(js(MATH, 'm.accel(0.25)') * 1e-15 * 1000, E * 0.25 / M * 1e-12)
        self.assertEqual(round(E * 0.25 / M * 1e-12, 3), 0.044)

    def test_collision_times_have_mean_tau(self):
        times = js(MATH, 'm.flights(5, 1, 20000)')
        self.assertAlmostEqual(times[-1] / len(times), 1, delta=0.05)

    def test_sawtooth(self):
        hits = [1.0, 2.5, 3.0]
        js_hits = '[1, 2.5, 3]'
        self.assertAlmostEqual(js(MATH, f'm.speedAt({js_hits}, 2, 0.5)'), 1.0)
        self.assertAlmostEqual(js(MATH, f'm.speedAt({js_hits}, 2, 2.0)'), 2.0)
        self.assertAlmostEqual(js(MATH, f'm.speedAt({js_hits}, 2, 2.75)'), 0.5)
        gaps = [1.0, 1.5, 0.5, 1.0]
        self.assertEqual(sum(gaps), hits[-1] + 1)
        self.assertAlmostEqual(js(MATH, f'm.distanceAt({js_hits}, 2, 4)'), sum(g * g for g in gaps))

    def test_mean_is_a_tau_with_random_gaps(self):
        # independently: mean t²/2 over mean t for exponential gaps
        rng = random.Random(4)
        gaps = [rng.expovariate(1) for _ in range(200000)]
        self.assertAlmostEqual(sum(g * g / 2 for g in gaps) / sum(gaps), 1, delta=0.03)
        for tau in (1.5e-14, 2.5e-14, 4e-14):
            got = js(MATH, f'm.meanDrift(11, 300, 1, {tau}, 1000e-15, 200e-15)')
            self.assertAlmostEqual(got / tau, 1, delta=0.06, msg=f'tau={tau}')

    def test_fixed_gaps_would_give_half(self):
        tau = 1.0
        hits = '[' + ','.join(str(i) for i in range(1, 1001)) + ']'
        self.assertAlmostEqual(js(MATH, f'm.distanceAt({hits}, 1, 1000)') / 1000, tau / 2)

    def test_start_from_rest_reads_low(self):
        # the reason the tool lets the swarm settle: 1 − τ/T at T = 16τ is 6% low
        unsettled = js(MATH, 'm.meanDrift(11, 4000, 1, 1, 16)')
        self.assertAlmostEqual(unsettled, 1 - 1 / 16, delta=0.03)

    def test_speed_scales_with_field_at_fixed_collisions(self):
        one = js(MATH, 'm.meanDrift(11, 50, 1, 1, 30, 5)')
        two = js(MATH, 'm.meanDrift(11, 50, 2, 1, 30, 5)')
        self.assertAlmostEqual(two / one, 2)

    def test_plot_windows(self):
        self.assertLess(N * E * (E * 0.5 * 4e-14 / M) / 1e7, 5)  # j stays on its 0–5 axis
        self.assertEqual(round(M and 1000e-15 / 4e-14), 25)
        self.assertGreaterEqual(200e-15 / 4e-14, 5)  # settle covers 5τ at the largest τ


@needs_node
class ScalarTests(SimpleTestCase):
    def test_vector_sum(self):
        self.assertAlmostEqual(js(MATH, 'm.vectorSum(3, 0, 2, 0)'), 5)
        self.assertAlmostEqual(js(MATH, f'm.vectorSum(3, 0, 3, {math.pi})'), 0)
        self.assertAlmostEqual(js(MATH, f'm.vectorSum(3, 0, 2, {math.pi / 2})'), math.sqrt(13))
        # the default: wires at 2.6 and 3.9 rad
        expected = math.sqrt(9 + 4 + 12 * math.cos(1.3))
        self.assertAlmostEqual(js(MATH, 'm.vectorSum(3, 2.6, 2, 3.9)'), expected)
        self.assertEqual(round(expected), 4)
        self.assertEqual(round(math.degrees(1.3)), 74)

    def test_one_dot_per_coulomb(self):
        for I in (0.5, 2, 3, 4.5):
            for t in (1, 7.3, 40):
                arrived = len(js(MATH, f'm.arrivals({I}, {t})'))
                self.assertEqual(arrived, js(MATH, f'm.countBy({I}, {t})'), msg=f'{I} {t}')
                self.assertLessEqual(abs(arrived - I * t), 1)
        self.assertEqual(js(MATH, 'm.countBy(3, 8)') + js(MATH, 'm.countBy(2, 8)'), 40)  # the default count in

    def test_out_matches_in_after_the_transit(self):
        lag = 2.5
        self.assertEqual(js(MATH, f'm.countBy(3, {10 - lag})'), js(MATH, 'm.countBy(3, 7.5)'))
        self.assertEqual(js(MATH, 'm.countBy(3, 0)'), 0)


@needs_node
class OhmsLawTests(SimpleTestCase):
    def diode(self, V):
        return 1e-9 * (math.exp(V / (1.5 * 0.02585)) - 1)

    def test_resistor_is_constant(self):
        for V in (-1, -0.3, 0.1, 0.3, 0.66):
            I = js(MATH, f"m.deviceCurrent('resistor', {V})")
            self.assertAlmostEqual(I, V / 50)
            self.assertAlmostEqual(js(MATH, f'm.ratioR({V}, {I})'), 50)

    def test_diode_values(self):
        for V in (-1, -0.5, 0.1, 0.3, 0.6, 0.66):
            self.assertAlmostEqual(js(MATH, f"m.deviceCurrent('diode', {V})") / self.diode(V), 1, places=9)
        # it stays on the graph's 25 mA axis at the slider's top
        self.assertLess(self.diode(0.66) * 1000, 25)
        self.assertGreater(self.diode(0.66) * 1000, 20)
        # R changes hugely, and direction matters
        self.assertGreater((0.3 / self.diode(0.3)) / (0.6 / self.diode(0.6)), 1000)
        self.assertAlmostEqual(self.diode(-0.5), -1e-9, delta=1e-12)
        self.assertEqual(round(1.5 * 25.85), 39)  # the note's 39 mV

    def test_doubling_v_on_the_diode(self):
        ratio = self.diode(0.6) / self.diode(0.3)
        self.assertGreater(ratio, 2000)
        self.assertEqual(0.3 / 50 * 1000, 6)  # the default reading


@needs_node
class HeatTests(SimpleTestCase):
    def test_default_wire(self):
        L, A, I = 1, 1e-6, 10
        R = RHO * L / A
        P = I * I * R
        self.assertAlmostEqual(js(MATH, 'm.wireResistance(1, 1e-6)'), R)
        self.assertEqual(round(R, 3), 0.017)
        self.assertEqual(round(P, 1), 1.7)
        C = 8960 * L * A * 385
        self.assertAlmostEqual(js(MATH, 'm.heatCapacity(1, 1e-6)'), C)
        rise = P * 30 / C
        self.assertAlmostEqual(js(MATH, 'm.tempRise(10, 1, 1e-6, 30)'), rise)
        self.assertEqual(round(rise, 1), 14.8)

    def test_collisions_add_up_to_i_squared_r(self):
        tau = M / (N * E * E * RHO)
        for I, A in ((10, 1e-6), (1, 4e-6), (20, 5e-7), (7, 2e-6)):
            field = I / A * RHO
            per = M * (E * field * tau / M) ** 2
            rate = N * A / tau
            self.assertAlmostEqual(js(MATH, f'm.energyPerCollision(m.wireField({I}, {A}), {tau})') / per, 1)
            self.assertAlmostEqual(js(MATH, f'm.collisionRate(1, {A}, {tau})') / rate, 1)
            self.assertAlmostEqual(per * rate / (I * I * RHO / A), 1, places=9)

    def test_mean_energy_handed_over(self):
        # mean of ½m(at)² for exponential flights is m(aτ)²
        rng = random.Random(9)
        gaps = [rng.expovariate(1) for _ in range(400000)]
        self.assertAlmostEqual(sum(0.5 * g * g for g in gaps) / len(gaps), 1, delta=0.02)

    def test_why_text_more_than_1e36(self):
        tau = M / (N * E * E * RHO)
        self.assertGreater(N * 0.5e-6 / tau, 1e36)  # thinnest wire on the slider
        self.assertEqual(round(M * (E * 0.17 * tau / M) ** 2 / E * 1e18, 1), 3.1)

    def test_heating_goes_as_the_square(self):
        self.assertAlmostEqual(js(MATH, 'm.tempRise(20, 1, 1e-6, 10) / m.tempRise(10, 1, 1e-6, 10)'), 4)
        self.assertAlmostEqual(js(MATH, 'm.tempRise(20, 1, 5e-7, 10) / m.tempRise(20, 1, 2e-6, 10)'), 16)
