"""Every number the Electric Field box shows, worked out in Python, then checked against the JS."""
import json
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

LIB = 'lib/field.js'
MATH = 'tools/electrostatics/_electric-field-math.js'
K = 9e9
PAIR = '[{x:-2,y:0,q:3},{x:2,y:0,q:-2}]'


def coulomb(charges, p, k=1):
    ex = ey = 0
    for x, y, q in charges:
        dx, dy = p[0] - x, p[1] - y
        r = math.hypot(dx, dy)
        ex += k * q * dx / r ** 3
        ey += k * q * dy / r ** 3
    return ex, ey


@needs_node
class EngineTests(SimpleTestCase):
    def test_superposition(self):
        want = coulomb([(-2, 0, 3), (2, 0, -2)], (1, 3), 9)
        got = js(LIB, f'm.fieldAt({PAIR},[1,3],9)')
        self.assertAlmostEqual(got[0], want[0])
        self.assertAlmostEqual(got[1], want[1])

    def test_potential(self):
        want = 3 / math.hypot(3, 3) - 2 / math.hypot(1, 3)
        self.assertAlmostEqual(js(LIB, f'm.potentialAt({PAIR},[1,3])'), want)

    def test_line_follows_the_field_and_ends_on_the_negative(self):
        run = js(LIB, f'm.traceLine({PAIR},[-1.7,0.1],{{skip:0}})')
        self.assertEqual(run['end'], 'charge')
        self.assertEqual(run['hit'], 1)
        for a, b in zip(run['points'][5::20], run['points'][6::20]):
            ex, ey = coulomb([(-2, 0, 3), (2, 0, -2)], ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2))
            size = math.hypot(ex, ey)
            step = math.hypot(b[0] - a[0], b[1] - a[1])
            self.assertAlmostEqual(((b[0] - a[0]) * ex + (b[1] - a[1]) * ey) / (size * step), 1, places=3)

    def test_line_counts_follow_the_charges(self):
        got = js(LIB, "m.fieldLines([{x:-2,y:0,q:2},{x:2,y:0,q:-1}],{perUnit:6})")
        self.assertEqual(got['out'], 12)
        self.assertGreaterEqual(got['escaped'], 4)  # 6 lines of the +2 have nowhere to end
        self.assertLessEqual(got['into'], 8)

    def test_neutral_pair_sends_nothing_far(self):
        got = js(LIB, "m.fieldLines([{x:-1,y:0,q:1},{x:1,y:0,q:-1}],{perUnit:6})")
        self.assertEqual(got['out'], 6)
        self.assertEqual(got['into'], 6)

    def test_all_negative_lines_are_flipped(self):
        got = js(LIB, "m.fieldLines([{x:0,y:0,q:-1}],{perUnit:6}).lines.map((l) => l.flip)")
        self.assertEqual(got, [True] * 6)


@needs_node
class DelayTests(SimpleTestCase):
    def test_constants(self):
        self.assertEqual(js(MATH, 'm.SCREEN_C'), 3)
        self.assertAlmostEqual(js(MATH, 'm.delayNs(6)'), 20)

    def test_news_reaches_near_points_first(self):
        history = '[{t:-100,x:0,y:0,q:4},{t:0,x:0,y:0,q:0}]'
        self.assertEqual(js(MATH, f'm.sourceAt({history},[3,0],0.5).q'), 4)  # the ring is at 1.5 m
        self.assertEqual(js(MATH, f'm.sourceAt({history},[3,0],1.01).q'), 0)
        self.assertEqual(js(MATH, f'm.sourceAt({history},[1,0],0.5).q'), 0)


@needs_node
class LoopTests(SimpleTestCase):
    def test_static_field_gives_nothing_per_lap(self):
        for centre, R in [([0, 0.6], 2.4), ([-2, 0], 1.5), ([1, -1], 3.5), ([2.5, 0], 1)]:
            got = js(MATH, f'm.loopWork({PAIR},{json.dumps(centre)},{R})')
            self.assertAlmostEqual(got['net'], 0, places=6)
            self.assertGreater(got['help'], 0.1)

    def test_neutral_point_of_like_charges(self):
        self.assertEqual(js(LIB, 'm.fieldAt([{x:-2,y:0,q:3},{x:2,y:0,q:3}],[0,0])'), [0, 0])

    def test_null_point_is_reachable_for_every_like_slider_value(self):
        for right in (1, 2, 3):
            point = js(MATH, f'm.nullPoint(3,{right})')
            ex, ey = coulomb([(-2, 0, 3), (2, 0, right)], point, 9)
            self.assertLess(math.hypot(ex, ey), 0.02)  # the page's test for "no field here"
        self.assertIsNone(js(MATH, 'm.nullPoint(3,-2)'))
        self.assertIsNone(js(MATH, 'm.nullPoint(3,0)'))


@needs_node
class DipoleFieldTests(SimpleTestCase):
    def test_axial_is_the_two_coulomb_fields(self):
        q, a, r = 2e-9, 0.01, 0.06
        near, far = K * q / (r - a) ** 2, K * q / (r + a) ** 2
        got = js(MATH, "m.dipoleField('axial',2,1,6)")
        self.assertAlmostEqual(got['plus'] / near, 1)
        self.assertAlmostEqual(got['minus'] / far, 1)
        self.assertAlmostEqual(got['net'] / (near - far), 1)

    def test_equator_against_direct_vectors(self):
        ex, ey = coulomb([(0, 1, 2e-9), (0, -1, -2e-9)], (6, 0), K * 1e4)  # cm → the 10⁴ comes from 1/cm²
        got = js(MATH, "m.dipoleField('equator',2,1,6)")
        self.assertAlmostEqual(got['net'] / math.hypot(ex, ey), 1)

    def test_far_field_is_ncert_formula(self):
        for where in ('axial', 'equator'):
            got = js(MATH, f"m.dipoleField('{where}',2,1,40)")
            self.assertAlmostEqual(got['net'] / got['approx'], 1, places=2)

    def test_slope_settles_to_minus_three(self):
        for where in ('axial', 'equator'):
            self.assertAlmostEqual(js(MATH, f"m.dipoleSlope('{where}',0.5,40)"), -3, places=2)
            # a numerical slope of the field agrees with the formula
            r = 5
            hi = js(MATH, f"m.dipoleField('{where}',1,1,{r * 1.001}).net")
            lo = js(MATH, f"m.dipoleField('{where}',1,1,{r / 1.001}).net")
            slope = math.log(hi / lo) / (2 * math.log(1.001))
            self.assertAlmostEqual(slope, js(MATH, f"m.dipoleSlope('{where}',1,{r})"), places=3)

    def test_share_left_halves_when_r_doubles(self):
        a = js(MATH, "(() => { const d = m.dipoleField('axial',1,0.5,20); return d.net / d.plus; })()")
        b = js(MATH, "(() => { const d = m.dipoleField('axial',1,0.5,40); return d.net / d.plus; })()")
        share = lambda r: 1 - ((r - 0.5) / (r + 0.5)) ** 2
        self.assertAlmostEqual(a, share(20))
        self.assertAlmostEqual(b, share(40))
        self.assertAlmostEqual(a / b, 2, delta=0.06)  # 1.95: the a/r share is only exact far away


@needs_node
class TorqueTests(SimpleTestCase):
    def test_torque(self):
        got = js(MATH, f'm.dipoleTorque(2,4,5,{math.radians(30)})')
        self.assertAlmostEqual(got['force'], 2e-6 * 5e4)
        self.assertAlmostEqual(got['p'], 2e-6 * 0.04)
        self.assertAlmostEqual(got['torque'], 2e-6 * 0.04 * 5e4 * 0.5)
        self.assertAlmostEqual(got['torque'], got['force'] * got['arm'])
        self.assertEqual(got['net'], 0)

    def test_extremes(self):
        self.assertAlmostEqual(js(MATH, f'm.dipoleTorque(1,1,1,{math.pi / 2}).torque'), 1e-6 * 0.01 * 1e4)
        self.assertAlmostEqual(js(MATH, 'm.dipoleTorque(1,1,1,0).torque'), 0)


@needs_node
class PaperTests(SimpleTestCase):
    def test_forces_by_hand(self):
        Q, r, b = 10e-9, 0.03, 2e-3
        E = K * Q / r ** 2
        delta = b ** 3 * E / K / (2 * b)
        near, far = K * Q * delta / (r - b) ** 2, K * Q * delta / (r + b) ** 2
        got = js(MATH, f'm.paperForces({Q},{r})')
        self.assertAlmostEqual(got['net'] / (near - far), 1)
        self.assertGreater(got['near'], got['far'])

    def test_far_force_tends_to_the_dipole_limit(self):
        got = js(MATH, "[m.paperForces(1e-8,0.06).net, m.dipoleLimitForce(1e-8,0.06)]")
        self.assertAlmostEqual(got[0] / got[1], 1, delta=0.02)

    def test_sign_of_the_comb_does_not_matter(self):
        self.assertEqual(js(MATH, 'm.paperForces(1e-8,0.03).net'), js(MATH, 'm.paperForces(-1e-8,0.03).net'))

    def test_uniform_field_gives_no_net_pull(self):
        self.assertEqual(js(MATH, 'm.uniformForces(1000).net'), 0)

    def test_lift_happens_inside_the_slider_range(self):
        w = js(MATH, 'm.weight()')
        self.assertAlmostEqual(w, 1e-5)
        self.assertGreater(js(MATH, 'm.paperForces(1e-8,0.01).net'), w)
        self.assertLess(js(MATH, 'm.paperForces(1e-8,0.03).net'), w)  # the default does not lift

    def test_halving_the_gap_gives_about_32_times(self):
        got = js(MATH, '[m.paperForces(1e-8,0.03).net, m.paperForces(1e-8,0.06).net]')
        self.assertAlmostEqual(got[0] / got[1], 32, delta=3)
