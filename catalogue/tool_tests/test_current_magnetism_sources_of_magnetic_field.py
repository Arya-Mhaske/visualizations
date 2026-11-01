"""Every number the Sources of Magnetic Field box shows, worked out in Python, then checked against the JS."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/current-magnetism/_sources-of-magnetic-field-math.js'
MU0 = 4e-7 * math.pi


def cross(a, b):
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]


def biot(I, pieces, at):
    """(mu0 / 4 pi) I dl x r / r^3 summed over [(p, dl)], in plain Python."""
    total = [0.0, 0.0, 0.0]
    for p, dl in pieces:
        r = [at[i] - p[i] for i in range(3)]
        d = math.sqrt(sum(v * v for v in r))
        c = cross(dl, r)
        for i in range(3):
            total[i] += 1e-7 * I * c[i] / d ** 3
    return total


def ring(R, n, x0=0.0):
    out = []
    for i in range(n):
        phi = (i + 0.5) * 2 * math.pi / n
        arc = R * 2 * math.pi / n
        out.append(([x0, R * math.cos(phi), R * math.sin(phi)], [0.0, -arc * math.sin(phi), arc * math.cos(phi)]))
    return out


@needs_node
class BiotSavartTests(SimpleTestCase):
    def test_one_piece_default(self):
        # P = (3, 4) cm, dl = 1 cm along x, I = 5 A: dB = 1e-7 I dl sin(theta) / r^2
        r = 0.05
        sin_t = 0.8
        want = 1e-7 * 5 * 0.01 * sin_t / r ** 2
        self.assertAlmostEqual(want * 1e6, 1.6, places=9)
        got = js(MATH, 'm.elementField(5, { p: [0, 0, 0], dl: [0.01, 0, 0] }, [0.03, 0.04, 0])')
        self.assertAlmostEqual(got[2], want, places=15)
        self.assertEqual((got[0], got[1]), (0, 0))  # perpendicular to both dl and r: only z
        # the other side of the wire reverses it, and along the wire it is zero
        self.assertAlmostEqual(js(MATH, 'm.elementField(5, { p: [0, 0, 0], dl: [0.01, 0, 0] }, [0.03, -0.04, 0])[2]'), -want, places=15)
        self.assertEqual(js(MATH, 'm.elementField(5, { p: [0, 0, 0], dl: [0.01, 0, 0] }, [0.05, 0, 0])[2]'), 0)
        # inverse-square: the same direction at twice the distance gives a quarter
        self.assertAlmostEqual(js(MATH, 'm.elementField(5, { p: [0, 0, 0], dl: [0.01, 0, 0] }, [0.06, 0.08, 0])[2]') * 4, want, places=15)

    def test_loop_centre_is_exact_for_any_pieces(self):
        for n in (4, 12, 48):
            got = js(MATH, f'm.sumField(5, m.pageLoopPieces(0.05, {n}), [0, 0, 0])[2]')
            self.assertAlmostEqual(got, MU0 * 5 / (2 * 0.05), places=12)
        self.assertAlmostEqual(MU0 * 5 / 0.1 * 1e6, 62.83, places=2)

    def test_loop_off_centre_converges_to_fine_sum(self):
        pieces = [(([p[0], p[1], 0], [d[0], d[1], 0])) for p, d in [
            ([0.05 * math.cos((i + 0.5) * 2 * math.pi / 2000), 0.05 * math.sin((i + 0.5) * 2 * math.pi / 2000)],
             [-0.05 * 2 * math.pi / 2000 * math.sin((i + 0.5) * 2 * math.pi / 2000), 0.05 * 2 * math.pi / 2000 * math.cos((i + 0.5) * 2 * math.pi / 2000)])
            for i in range(2000)]]
        fine = biot(5, pieces, [0.015, 0.01, 0])[2]
        self.assertAlmostEqual(js(MATH, 'm.sumField(5, m.pageLoopPieces(0.05, 720), [0.015, 0.01, 0])[2]'), fine, delta=abs(fine) * 1e-4)
        # outside the ring the field reverses
        self.assertLess(biot(5, pieces, [0.08, 0.0, 0])[2], 0)

    def test_wire_sum_matches_formula(self):
        half, r = 0.30, 0.04
        got = js(MATH, f'm.sumField(5, m.wirePieces({half}, 600), [0, {r}, 0])[2]')
        exact = MU0 * 5 / (4 * math.pi * r) * 2 * half / math.hypot(half, r)
        self.assertAlmostEqual(got, exact, delta=exact * 1e-4)
        self.assertAlmostEqual(js(MATH, f'm.finiteWire(5, {r}, {half})'), exact, delta=exact * 1e-9)  # mu0 I / 2 pi r times half / sqrt(half^2 + r^2)
        long_wire = MU0 * 5 / (2 * math.pi * r)
        self.assertLess(abs(got - long_wire) / long_wire, 0.02)  # a 60 cm wire is long at 4 cm
        # coarse pieces still land close: 30 pieces of 2 cm
        coarse = js(MATH, f'm.sumField(5, m.wirePieces({half}, 30), [0, {r}, 0])[2]')
        self.assertLess(abs(coarse - exact) / exact, 0.2)


@needs_node
class LoopAxisTests(SimpleTestCase):
    def test_axis_formula_against_sum(self):
        for R, x in ((0.05, 0.0), (0.05, 0.05), (0.05, 0.12), (0.08, 0.2)):
            want = MU0 * 5 * R * R / (2 * (x * x + R * R) ** 1.5)
            self.assertAlmostEqual(js(MATH, f'm.axisLoop(5, {R}, {x})'), want, places=15)
            direct = biot(5, ring(R, 400), [x, 0, 0])
            self.assertAlmostEqual(direct[0], want, places=12)
            self.assertLess(math.hypot(direct[1], direct[2]), 1e-12)
            for n in (2, 8, 24):
                got = js(MATH, f'm.sumField(5, m.loopPieces({R}, {n}), [{x}, 0, 0])')
                self.assertAlmostEqual(got[0], want, places=12)  # equal pieces: exact for any n
                self.assertLess(math.hypot(got[1], got[2]), 1e-12 * max(1, abs(want) * 1e6))  # the sideways parts cancel

    def test_default_numbers(self):
        # x = R = 5 cm, I = 5 A: B0 / 2^(3/2) = 35.4 % of the centre
        self.assertAlmostEqual(js(MATH, 'm.axisLoop(5, 0.05, 0.05) / m.axisLoop(5, 0.05, 0)') * 100, 100 / 2 ** 1.5, places=9)
        self.assertEqual(round(100 / 2 ** 1.5, 1), 35.4)
        self.assertAlmostEqual(js(MATH, 'm.axisLoop(5, 0.05, 0.05)') * 1e6, MU0 * 5 * 0.05 ** 2 / (2 * (2 * 0.05 ** 2) ** 1.5) * 1e6, places=9)

    def test_sideways_parts_are_radial_and_close_up(self):
        # the (y, z) part of each piece's field points along its own radius, so the parts form a regular polygon
        n, x = 8, 0.05
        parts = js(MATH, f'm.loopPieces(0.05, {n}).map((p) => m.elementField(5, p, [{x}, 0, 0]))')
        for i, b in enumerate(parts):
            phi = (i + 0.5) * 2 * math.pi / n
            self.assertAlmostEqual(math.atan2(b[2], b[1]) % (2 * math.pi), phi, places=9)
        self.assertAlmostEqual(sum(b[1] for b in parts), 0, places=15)
        self.assertAlmostEqual(sum(b[2] for b in parts), 0, places=15)
        # at x = 0 there is no sideways part at all
        centre = js(MATH, 'm.elementField(5, m.loopPieces(0.05, 8)[0], [0, 0, 0])')
        self.assertLess(math.hypot(centre[1], centre[2]), 1e-12)


@needs_node
class AmpereTests(SimpleTestCase):
    def test_default_field_and_circulation(self):
        self.assertAlmostEqual(js(MATH, 'm.longWire(10, 0.04)') * 1e6, 50.0, places=9)
        for r in (0.5, 2, 4, 6, 10):
            got = js(MATH, f'm.circulation([{{ x: 0, y: 0, I: 10, a: 0.01 }}], {r / 100})')
            inside = 10 * min(1, (r / 1.0) ** 2)  # radius of the wire is 1 cm
            self.assertAlmostEqual(got, MU0 * inside, delta=MU0 * 10 * 1e-9)

    def test_walked_part_grows_in_step_with_angle(self):
        full = MU0 * 10
        for deg in (0, 90, 180, 270, 360):
            got = js(MATH, f'm.circulation([{{ x: 0, y: 0, I: 10, a: 0.01 }}], 0.04, {math.radians(deg)!r})')
            self.assertAlmostEqual(got, full * deg / 360, delta=full * 1e-9)

    def test_return_wire_changes_the_field_not_the_total(self):
        wires = '[{ x: 0, y: 0, I: 10, a: 0.01 }, { x: 0.0625, y: 0, I: -10, a: 0 }]'
        for r in (0.5, 2, 4, 6, 10):
            enclosed = (10 * min(1, r * r) if r / 100 < 0.0625 else 0)  # the thick wire has radius 1 cm
            got = js(MATH, f'm.circulation({wires}, {r / 100})')
            self.assertAlmostEqual(got, MU0 * enclosed, delta=MU0 * 10 * 2e-4)
            self.assertAlmostEqual(js(MATH, f'm.enclosed({wires}, {r / 100})'), enclosed, places=12)
        # with the return wire the field is not the same all round the 4 cm circle
        a = js(MATH, f'm.wireFieldAt({wires}, [0.04, 0])')
        b = js(MATH, f'm.wireFieldAt({wires}, [-0.04, 0])')
        self.assertNotAlmostEqual(math.hypot(*a), math.hypot(*b), places=6)
        # the field of a thick wire grows in proportion to r inside it
        half = js(MATH, 'm.wireFieldAt([{ x: 0, y: 0, I: 10, a: 0.01 }], [0.005, 0])')
        full = js(MATH, 'm.wireFieldAt([{ x: 0, y: 0, I: 10, a: 0.01 }], [0.01, 0])')
        self.assertAlmostEqual(math.hypot(*half) * 2, math.hypot(*full), places=12)


@needs_node
class SolenoidTests(SimpleTestCase):
    N, L, R, I = 30, 0.20, 0.03, 2.0

    def python_field(self, x, y):
        pieces = []
        for k in range(self.N):
            pieces += ring(self.R, 200, -self.L / 2 + (k + 0.5) * self.L / self.N)
        return biot(self.I, pieces, [x, y, 0])

    def js_field(self, x, y, n=28):
        return js(MATH, f'm.sumField({self.I}, Array.from({{length: {self.N}}}, (_, k) => m.loopPieces({self.R}, {n}, {-self.L / 2} + (k + 0.5) * {self.L} / {self.N})).flat(), [{x}, {y}, 0])')

    def test_centre_matches_ideal_within_a_few_percent(self):
        ideal = MU0 * (self.N / self.L) * self.I
        self.assertAlmostEqual(ideal * 1e3, 0.377, places=3)  # n = 150 per metre
        centre = self.python_field(0, 0)
        self.assertAlmostEqual(centre[0], js(MATH, f'm.solenoidAxis({self.N / self.L}, {self.I}, {self.L}, {self.R}, 0)'), delta=centre[0] * 0.01)
        self.assertLess(abs(centre[0] - ideal) / ideal, 0.05)
        self.assertAlmostEqual(self.js_field(0, 0)[0], centre[0], places=12)
        # the ends: about half
        end = js(MATH, f'm.solenoidAxis({self.N / self.L}, {self.I}, {self.L}, {self.R}, {self.L / 2})')
        self.assertLess(abs(end / ideal - 0.5), 0.05)

    def test_uniform_inside_and_small_outside(self):
        centre = self.python_field(0, 0)[0]
        for x, y in ((0.04, 0.0), (0.0, 0.015), (0.05, 0.015), (-0.05, -0.015)):
            got = self.js_field(x, y)
            want = self.python_field(x, y)
            self.assertAlmostEqual(got[0], want[0], delta=abs(centre) * 0.01)
            self.assertLess(abs(want[0] - centre) / centre, 0.05)  # uniform to within 5 % over the middle half
        outside = math.hypot(*self.python_field(0.0, 0.051)[:2])
        self.assertLess(outside / centre, 0.1)  # tiny just outside the middle

    def test_one_turn_is_not_uniform(self):
        # a single loop: the field two radii off the axis point is far from the centre value
        one = [(p, dl) for p, dl in ring(self.R, 200)]
        centre = biot(self.I, one, [0, 0, 0])[0]
        near_wire = biot(self.I, one, [0, 0.027, 0])[0]
        self.assertGreater(abs(near_wire / centre), 1.3)


@needs_node
class ParallelCurrentTests(SimpleTestCase):
    def test_force_per_metre(self):
        self.assertAlmostEqual(js(MATH, 'm.parallelForce(5, 5, 0.04)'), MU0 * 25 / (2 * math.pi * 0.04), places=15)
        self.assertAlmostEqual(js(MATH, 'm.parallelForce(5, 5, 0.04)') * 1e6, 125.0, places=6)
        # the definition of the ampere
        self.assertAlmostEqual(js(MATH, 'm.parallelForce(1, 1, 1)'), 2e-7, places=20)
        # half the gap, twice the force
        self.assertAlmostEqual(js(MATH, 'm.parallelForce(5, 5, 0.02) / m.parallelForce(5, 5, 0.04)'), 2.0, places=12)

    def test_direction_from_the_cross_product(self):
        # wires on the x axis at -2 and +2 cm, currents out of the page: F = I (z x B)
        for sign, pulled in ((1, True), (-1, False)):
            wires = f'[{{ x: -0.02, y: 0, I: 5 }}, {{ x: 0.02, y: 0, I: {5 * sign} }}]'
            b_at_2 = js(MATH, f'm.wireFieldAt([{wires}[0]], [0.02, 0])')
            self.assertAlmostEqual(math.hypot(*b_at_2), MU0 * 5 / (2 * math.pi * 0.04), places=12)
            force_x = -(5 * sign) * b_at_2[1]  # (z x B)_x = -B_y
            self.assertEqual(force_x < 0, pulled)  # right wire pulled left (towards the other) when parallel
            # and the force on each wire is equal and opposite
            b_at_1 = js(MATH, f'm.wireFieldAt([{wires}[1]], [-0.02, 0])')
            force_on_1 = -5 * b_at_1[1]
            self.assertAlmostEqual(force_x, -force_on_1, places=12)


@needs_node
class ElectromagnetTests(SimpleTestCase):
    def test_core_field_and_pull(self):
        H = 200 * 1.5 / 0.2
        want = MU0 * H + 1.6 * math.tanh(500 * MU0 * H / 1.6)
        self.assertAlmostEqual(js(MATH, f'm.coreField({H!r})'), want, places=12)
        self.assertEqual(round(want, 2), 0.85)
        self.assertAlmostEqual(js(MATH, f'm.airField({H!r})'), MU0 * H, places=15)
        # the pull B^2 A / 2 mu0, in kilograms
        F = want ** 2 * 2e-4 / (2 * MU0)
        self.assertAlmostEqual(js(MATH, f'm.pull({want!r}, 2e-4)'), F, places=9)
        self.assertEqual(round(F / 9.8, 1), 5.8)

    def test_ranges_the_page_describes(self):
        # iron makes the field hundreds of times larger over the whole slider range; it saturates below 1.6 T plus mu0 H
        for N in (20, 200, 400):
            for I in (0.1, 1.5, 3.0):
                H = N * I / 0.2
                ratio = js(MATH, f'm.coreField({H!r}) / m.airField({H!r})')
                self.assertGreater(ratio, 100)
                self.assertLess(ratio, 600)
                self.assertLess(js(MATH, f'm.coreField({H!r})'), 1.6 + MU0 * H + 1e-9)
        # doubling the current at the top of the range gains far less than double
        top = js(MATH, 'm.coreField(400 * 3 / 0.2)')
        half = js(MATH, 'm.coreField(400 * 1.5 / 0.2)')
        self.assertLess(top / half, 1.3)

    def test_calculator_defaults(self):
        self.assertAlmostEqual(js(MATH, 'm.longWire(10, 0.05)') * 1e6, 40.0, places=9)  # I = 10 A, r = 5 cm
        self.assertAlmostEqual(js(MATH, 'm.solenoidInfinite(1000, 10)') * 1e3, 12.566, places=3)
        # a 5 mT solenoid at 1000 turns per metre needs about 3.98 A
        self.assertEqual(round(5e-3 / (MU0 * 1000), 2), 3.98)
        # a coil's centre field is the loop formula with x = 0, and N turns multiply it
        self.assertAlmostEqual(js(MATH, '100 * m.axisLoop(5, 0.05, 0)'), 100 * MU0 * 5 / (2 * 0.05), places=12)
        # the coil's field falls to half its centre value at x = R sqrt(2^(2/3) - 1)
        x = 0.05 * math.sqrt(2 ** (2 / 3) - 1)
        self.assertAlmostEqual(js(MATH, f'm.axisLoop(5, 0.05, {x!r}) / m.axisLoop(5, 0.05, 0)'), 0.5, places=12)
