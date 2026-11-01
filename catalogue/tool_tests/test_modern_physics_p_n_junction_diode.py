"""Every number the p-n Junction & Diode box shows, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/modern-physics/_p-n-junction-diode-math.js'
VIEW = 'tools/modern-physics/_p-n-junction-diode-view.js'
Q, K_B, T = 1.602176634e-19, 1.380649e-23, 300
VT = K_B * T / Q
EPS = 11.7 * 8.854e-12
N = 1e22
NI = 1.5e16
V0 = 0.7
R = math.exp(V0 / VT)
IS = 4.4e-15
I_GEN = 0.3e-6


def width(vj):
    return math.sqrt(2 * EPS * vj / Q * (2 / N))


def diode(v):
    """The diode curve, written out again: ideal part everywhere, a generation term that grows with the layer width in reverse."""
    if v >= 0:
        return IS * math.expm1(v / VT)
    return (IS + I_GEN * math.sqrt((V0 - v) / V0)) * math.expm1(v / VT)


@needs_node
class LayerTests(SimpleTestCase):
    def test_thermal_voltage_and_ratio(self):
        self.assertAlmostEqual(js(MATH, 'm.VT'), VT, places=9)
        self.assertEqual(round(VT * 1000, 1), 25.9)  # the 25.9 mV in the notes
        self.assertAlmostEqual(js(MATH, 'm.RATIO') / R, 1, places=9)

    def test_width_and_field(self):
        self.assertAlmostEqual(js(MATH, 'm.W0') / width(V0), 1, places=9)
        self.assertEqual(round(width(V0) * 1e6, 2), 0.43)  # shown as 0.43 μm
        self.assertAlmostEqual(js(MATH, 'm.peakField(0.7)') / (2 * V0 / width(V0)), 1, places=9)
        # reverse bias of 5 V widens the layer by sqrt(5.7 / 0.7): the "how much wider" prompt
        wider = js(MATH, 'm.widthAt(5.7) / m.widthAt(0.7)')
        self.assertAlmostEqual(wider, math.sqrt(5.7 / 0.7), places=9)
        self.assertEqual(round(wider, 1), 2.9)
        # forward bias of 0.3 V leaves a 0.4 V barrier and a 0.32 μm layer
        self.assertEqual(round(width(0.4) * 1e6, 2), 0.32)
        self.assertEqual(round(js(MATH, 'm.junctionAt(13, 0.3).width') * 1e6, 2), 0.32)

    def test_barrier_from_doping_and_minority_share(self):
        v = VT * math.log(N * N / NI ** 2)
        self.assertAlmostEqual(js(MATH, 'm.barrierFromDoping()'), v, places=9)
        self.assertEqual(round(v, 2), 0.69)
        share = (NI / N) ** 2
        self.assertAlmostEqual(js(MATH, 'm.minorityShare()') / share, 1, places=9)
        self.assertLess(share, 1e-11)  # "about 10¹² times fewer"
        self.assertGreater(1 / share, 1e11)
        self.assertLess(abs(math.log10(share / math.exp(-V0 / VT))), 0.2)  # the same ratio as the Boltzmann factor

    def test_join_dynamics_match_the_differential_equation(self):
        # t(u) = ∫ du / (R e^(−u) − 1), summed in u by Simpson's rule, against the closed form
        def t_of(u, n=200000):
            f = lambda x: 1 / (R * math.exp(-x) - 1)
            h = u / n
            total = f(0) + f(u) + sum((4 if i % 2 else 2) * f(i * h) for i in range(1, n))
            return total * h / 3
        for u in (5, 15, 24):
            t = t_of(u)
            self.assertAlmostEqual(js(MATH, f'm.barrierAt({t!r}) / m.VT') / u, 1, places=5)
        # the presets of the tool
        self.assertEqual(round(js(MATH, 'm.junctionAt(0, 0).Vb'), 3), 0.012)
        self.assertEqual(round(js(MATH, 'm.junctionAt(6, 0).Vb'), 3), 0.343)
        self.assertEqual(round(js(MATH, 'm.junctionAt(13, 0).Vb'), 3), 0.7)
        # drift is 1 by definition, and diffusion has fallen to it at the end
        end = js(MATH, 'm.junctionAt(13, 0)')
        self.assertAlmostEqual(end['diffusion'], 1, delta=1e-4)
        self.assertGreater(js(MATH, 'm.junctionAt(0, 0).diffusion'), 1e10)
        # the plot's y range holds the first diffusion value: log10 is about 11.7
        self.assertLess(math.log10(js(MATH, 'm.junctionAt(0, 0).diffusion')), 13)

    def test_bias_sets_diffusion_over_drift(self):
        self.assertAlmostEqual(js(MATH, 'm.junctionAt(13, 0.3).diffusion') / math.exp(0.3 / VT), 1, delta=1e-3)
        self.assertAlmostEqual(js(MATH, 'm.junctionAt(13, -1).diffusion'), math.exp(-1 / VT), delta=1e-12)

    def test_electron_energy_across_the_layer(self):
        h = width(0.4) / 2
        self.assertAlmostEqual(js(MATH, f'm.electronEnergy(0, 0.4, {h!r})'), 0.2, places=9)  # half way up at the junction
        self.assertEqual(js(MATH, f'm.electronEnergy({-2 * h!r}, 0.4, {h!r})'), 0.4)
        self.assertEqual(js(MATH, f'm.electronEnergy({2 * h!r}, 0.4, {h!r})'), 0)
        self.assertAlmostEqual(js(MATH, f'm.electronEnergy({-h / 2!r}, 0.4, {h!r})'), 0.4 * (1 - 0.25 / 2), places=9)

    def test_strip_columns(self):
        w_ref = width(V0 + 5)
        self.assertAlmostEqual(js(VIEW, 'm.W_REF') / w_ref, 1, places=9)
        for vj, expected in ((0.7, 3), (5.7, 8), (0.1, 1)):
            reach = width(vj) / w_ref * 8
            self.assertEqual(sum(1 for j in range(8) if j + 0.5 <= reach + 1e-9), expected)
            self.assertEqual(js(VIEW, f'm.columnsDepleted(m.W_REF * {width(vj) / w_ref!r})'), expected)


@needs_node
class DiodeTests(SimpleTestCase):
    def test_forward_curve_numbers_in_the_text(self):
        self.assertAlmostEqual(js(MATH, 'm.forwardCurrent(0.7)') / (IS * math.expm1(0.7 / VT)), 1, places=9)
        self.assertEqual(round(diode(0.7) * 1000, 1), 2.5)  # "0.7 V gives about 2.5 mA"
        # the title's 0.7 V: 1 mA is reached at 0.68 V, within 0.03 V of it
        v1 = VT * math.log(1e-3 / IS + 1)
        self.assertEqual(round(v1, 2), 0.68)
        self.assertLess(abs(v1 - 0.7), 0.03)
        # every 60 mV multiplies the current by about ten
        self.assertEqual(round(math.exp(0.06 / VT), 0), 10)
        # each 0.1 V step multiplies it by about 48
        self.assertEqual(round(math.exp(0.1 / VT)), 48)
        self.assertLess(diode(0.78), 0.06)  # the current graph's top edge is 60 mA
        self.assertGreater(diode(0.78), 0.05)

    def test_climbers(self):
        self.assertAlmostEqual(js(MATH, 'm.ableToClimb(0.6)'), math.exp(-0.1 / VT), places=12)
        self.assertEqual(round(math.exp(-0.1 / VT), 4), 0.0209)
        self.assertEqual(js(MATH, 'm.ableToClimb(0)') < 1e-11, True)
        self.assertEqual(round(math.exp(0.3 / VT), -3), 110000)  # "Climbers vs 0 V × 110000"

    def test_diode_current_and_resistances(self):
        for v in (-14, -5, -1, -0.1, 0, 0.3, 0.5, 0.7, 0.78):
            self.assertAlmostEqual(js(MATH, f'm.diodeCurrent({v})') / diode(v) if v else 1, 1, places=9)
        self.assertEqual(js(MATH, 'm.diodeCurrent(0)'), 0)
        forward = (0.71 - 0.69) / (diode(0.71) - diode(0.69))
        reverse = (-5 - -1) / (diode(-5) - diode(-1))
        self.assertAlmostEqual(js(MATH, 'm.secantR(0.69, 0.71)'), forward, places=6)
        self.assertAlmostEqual(js(MATH, 'm.secantR(-1, -5)') / reverse, 1, places=9)
        self.assertEqual(round(forward, 1), 10.0)  # about 10 Ω
        self.assertEqual(round(reverse / 1e7, 2), 1.03)  # about 10⁷ Ω
        self.assertEqual(round(reverse / forward / 1e6, 1), 1.0)  # "× 1.0 ×10⁶"
        self.assertAlmostEqual(js(MATH, 'm.dynamicR(0.7)'), VT / (IS * math.exp(0.7 / VT)), places=6)
        self.assertEqual(round(VT / diode(0.7), 1), 10.2)
        # reverse current stays within a few μA and the graph's y range [-1.7, 0.2] μA at -14 V
        self.assertGreater(diode(-14) * 1e6, -1.7)
        self.assertEqual(round(diode(-1) * 1e6, 2), -0.47)

    def test_the_forward_resistance_is_not_the_ratio_v_over_i(self):
        self.assertGreater(0.7 / diode(0.7), 5 * VT / diode(0.7))
        self.assertEqual(round(0.7 / diode(0.7)), 277)

    def test_amps_text(self):
        self.assertEqual(js(VIEW, 'm.amps(0.0025289)'), '2.53 mA')
        self.assertEqual(js(VIEW, 'm.amps(-4.7e-7)'), '−470 nA')
        self.assertEqual(js(VIEW, 'm.amps(4.82e-10)'), '482 pA')


@needs_node
class BreakdownTests(SimpleTestCase):
    def test_multiplication(self):
        p = (19 / 20) ** 4
        self.assertAlmostEqual(js(MATH, 'm.ionProb(19, 20)'), p, places=12)
        self.assertAlmostEqual(js(MATH, 'm.multiplication(19, 20)'), 1 / (1 - p), places=9)
        self.assertEqual(round(1 / (1 - p), 2), 5.39)
        self.assertEqual(js(MATH, 'm.multiplication(20, 20)'), None)  # infinite: JSON turns it into null
        self.assertAlmostEqual(js(MATH, 'm.multiplication(5, 50)'), 1 / (1 - 1e-4), places=12)
        # at 15 V of 20 the current is still near its flat value
        flat = -diode(-15)
        self.assertAlmostEqual(js(MATH, 'm.reverseCurrent(15, 20)') / (flat / (1 - 0.75 ** 4)), 1, places=9)

    def test_current_stays_in_the_graph(self):
        self.assertLess(-diode(-20) * 1e6, 2.4)
        # the graph is clipped at 2.4 μA, so a breakdown at 20 V rises through it before the wall
        self.assertGreater(js(MATH, 'm.reverseCurrent(19, 20)') * 1e6, 2.4)
        m5 = 1 / (1 - (5 / 20) ** 4)
        self.assertAlmostEqual(js(MATH, 'm.reverseCurrent(5, 20)') / (-diode(-5) * m5), 1, places=9)
        self.assertEqual(round(-diode(-5) * m5 * 1e6, 2), 0.86)

    def test_chain_mean_is_one_over_one_minus_p(self):
        for p in (0.3, 0.5, 0.75):
            mean = js(MATH, (
                '(() => { let s = 12345; const next = () => { s = (s * 48271) % 2147483647; return s / 2147483647; };'
                f' let sum = 0; for (let i = 0; i < 40000; i++) sum += m.chain(next, {p}, 10000); return sum / 40000; }})()'))
            self.assertAlmostEqual(mean / (1 / (1 - p)), 1, delta=0.05)
        self.assertEqual(js(MATH, 'm.chain(() => 0.99, 0.5)'), 1)
        self.assertEqual(js(MATH, 'm.chain(() => 0.0, 1, 60)'), 60)  # a runaway stays finite

    def test_field_and_width_at_breakdown(self):
        vj = V0 + 50
        self.assertAlmostEqual(js(MATH, f'm.peakField({vj})') / (2 * vj / width(vj)), 1, places=9)
        self.assertEqual(round(2 * vj / width(vj) / 1e6), 28)  # MV/m at 50 V
        self.assertGreater(2 * (V0 + 6) / width(V0 + 6), 5e6)  # and the 6 V diode is not weak by comparison


def py_surface(seed, rms):
    """Mulberry32 and the sum of waves, written out again in Python."""
    mask = 0xFFFFFFFF
    state = seed & mask

    def imul(a, b):
        return (a * b) & mask

    def nxt():
        nonlocal state
        state = (state + 0x6D2B79F5) & mask
        t = state
        t = imul(t ^ (t >> 15), t | 1)
        t = (t ^ ((t + imul(t ^ (t >> 7), t | 61)) & mask)) & mask
        return ((t ^ (t >> 14)) & mask) / 4294967296

    length = 100 * rms
    waves = []
    for k in range(14):
        lam = length * 0.62 ** k
        waves.append((2 * math.pi / lam, lam ** 1.2, nxt() * 2 * math.pi))
    scale = rms / math.sqrt(sum(a * a / 2 for _, a, _ in waves))
    return lambda x: sum(a * scale * math.sin(k * x + ph) for k, a, ph in waves), length


@needs_node
class SlabTests(SimpleTestCase):
    def test_atoms_tall(self):
        for finish, rms, atoms in (('filed', 1e-5, 40000), ('ground', 1e-6, 4000), ('polished', 1e-7, 400)):
            self.assertEqual(js(MATH, f'm.POLISH.{finish}'), rms)
            self.assertEqual(round(js(MATH, f'm.atomsTall({rms})')), atoms)
            self.assertAlmostEqual(rms / 2.5e-10, atoms)
        self.assertEqual(js(MATH, 'm.ATOM_SPACING'), 2.5e-10)
        self.assertEqual(js(MATH, 'm.CONTACT_GAP'), 3e-10)

    def test_surface_matches_python(self):
        for seed, rms in ((3, 1e-6), (8, 1e-7)):
            h, length = py_surface(seed, rms)
            self.assertAlmostEqual(js(MATH, f'm.surface({seed}, {rms}).length'), length, places=12)
            for fraction in (0, 0.13, 0.5, 0.91):
                x = fraction * length
                got = js(MATH, f'm.surface({seed}, {rms}).h({x!r})')
                self.assertAlmostEqual(got / rms, h(x) / rms, places=6)

    def test_contact_share_and_gap(self):
        rms = 1e-6
        ha, length = py_surface(3, rms)
        hb, _ = py_surface(8, rms)
        samples = 100000
        total = [ha(i * length / samples) + hb(i * length / samples) for i in range(samples)]
        top = max(total)
        gaps = sorted(top - v for v in total)
        touching = sum(1 for g in gaps if g <= 3e-10) / samples
        press = 'm.pressTogether(1e-6)'
        self.assertAlmostEqual(js(MATH, f'm.contactShare({press})'), touching, delta=2 / samples)
        self.assertLess(touching, 0.001)  # "0.033%": far under 1% even at the best finish tried below
        self.assertEqual(round(touching * 100, 3), 0.033)
        self.assertAlmostEqual(js(MATH, f'm.medianGap({press})') / gaps[samples // 2], 1, delta=1e-6)
        self.assertEqual(round(gaps[samples // 2] / 2.5e-10, -2), 7100)  # "A typical gap 7100 atoms"
        # pushing the slabs in by one bump size makes about a sixth of the surface touch, which is far more than any real slab could be squashed
        squashed = sum(1 for g in gaps if g <= 3e-10 + rms) / samples
        self.assertAlmostEqual(js(MATH, f'm.contactShare({press}, 1e-6)'), squashed, delta=2 / samples)
        self.assertGreater(squashed, 0.1)
        self.assertLess(squashed, 0.25)
        # the contact patch is tens of nanometres wide, as the note says
        near = [i for i in range(samples) if top - total[i] <= 3e-10]
        span = (max(near) - min(near)) * length / samples
        self.assertGreater(span, 20e-9)
        self.assertLess(span, 50e-9)

    def test_every_finish_stays_under_one_percent(self):
        for finish in ('filed', 'ground', 'polished'):
            self.assertLess(js(MATH, f'm.contactShare(m.pressTogether(m.POLISH.{finish}))'), 0.01)
        # even the 6-bump squash of the slider's end is only the whole surface when the bumps are crushed flat
        self.assertGreater(js(MATH, 'm.contactShare(m.pressTogether(1e-6), 6e-6)'), 0.99)
