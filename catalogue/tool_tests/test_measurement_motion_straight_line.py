"""Every number the Motion in a Straight Line tools show, worked out in Python, then checked against the JS."""
from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/measurement-motion/_motion-in-a-straight-line-math.js'


class FactTests(SimpleTestCase):
    def test_ncert_table_2_1(self):
        x = lambda t: 0.08 * t ** 3
        rows = [(2.0, 3.92), (1.0, 3.86), (0.5, 3.845), (0.1, 3.8402), (0.01, 3.840002)]
        for dt, expected in rows:
            self.assertAlmostEqual((x(4 + dt / 2) - x(4 - dt / 2)) / dt, expected, places=5)
        self.assertAlmostEqual(0.24 * 16, 3.84)

    def test_ncert_market_example(self):
        # 2.5 km out at 5 km/h, back at 7.5 km/h: 30 + 20 min
        self.assertAlmostEqual((2.5 / 5 + 2.5 / 7.5) * 60, 50)
        self.assertAlmostEqual(5 / (50 / 60), 6)


@needs_node
class ModuleTests(SimpleTestCase):
    def test_limit_value(self):
        self.assertAlmostEqual(js(MATH, 'm.centredVelocity(4,2)'), 3.92)
        self.assertAlmostEqual(js(MATH, 'm.centredVelocity(4,0.01)'), 3.84, places=4)

    def test_uniform_motion(self):
        self.assertEqual(js(MATH, '[m.uniformX(2,1,4),m.uniformV(2,1,4)]'), [16, 6])

    def test_top_of_flight(self):
        t, h = js(MATH, '[m.topTime(19.6),m.topHeight(19.6)]')
        self.assertAlmostEqual(t, 2)
        self.assertAlmostEqual(h, 19.6)

    def test_speeding_up_is_about_v_and_a_together(self):
        got = js(MATH, '[m.speedingUp(-5,-2),m.speedingUp(5,-2),m.speedingUp(-5,2)]')
        self.assertEqual(got, [True, False, False])

    def test_round_trip(self):
        at_market = js(MATH, 'm.roundTrip(2.5,5,7.5,0.5)')
        home = js(MATH, 'm.roundTrip(2.5,5,7.5,5/6)')
        self.assertAlmostEqual(at_market['position'], 2.5)
        self.assertAlmostEqual(home['position'], 0)
        self.assertAlmostEqual(home['path'], 5)

    def test_kink_is_continuous_and_tends_to_the_corner(self):
        got = js(MATH, '[m.kinkX(2,-3,0.1,-0.05),m.kinkX(2,-3,0.1,0.05),m.kinkX(2,-3,0.1,1),m.kinkAcceleration(2,-3,0.01)]')
        self.assertAlmostEqual(got[0], -0.1)
        self.assertAlmostEqual(got[1], -0.1 + -0.5 * 0.1)
        self.assertAlmostEqual(got[2], got[1] - 3 * 0.95)
        self.assertAlmostEqual(got[3], -500)

    def test_velocity_knots(self):
        got = js(MATH, 'm.fromVelocity([0,4,4,0,-3,0],2)')
        self.assertEqual(got['xs'], [0, 4, 12, 16, 13, 10])
        self.assertEqual(got['as'], [2, 0, -2, -1.5, 1.5])
