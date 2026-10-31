"""Every number the Angles & Arcs tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/trigonometry/_angles-arcs-math.js'
DEG = math.pi / 180


def divisors(n):
    return [d for d in range(1, n + 1) if n % d == 0]


class FactTests(SimpleTestCase):
    def test_one_radian_and_a_full_circle(self):
        self.assertEqual(round(1 / DEG, 1), 57.3)
        self.assertEqual(round(2 * math.pi, 2), 6.28)

    def test_sixty_splits_better_than_a_hundred(self):
        self.assertEqual((len(divisors(60)), len(divisors(100))), (12, 9))

    def test_sun_and_moon_ratios(self):
        self.assertEqual(round(149600000 / 384400), 389)
        self.assertEqual(round(1391400 / 3474), 401)

    def test_shares_of_the_disc_agree(self):
        r, theta = 4, 2.1
        self.assertAlmostEqual(0.5 * r * r * theta, (theta / (2 * math.pi)) * math.pi * r * r)


@needs_node
class ModuleTests(SimpleTestCase):
    def test_coterminal_angles(self):
        got = js(MATH, '[m.principal(405),m.principal(-315),m.fullTurns(405),m.fullTurns(-800),m.coterminals(405)]')
        self.assertEqual(got, [45, 45, 1, -2, [-315, 45, 405]])

    def test_dms_round_trip(self):
        self.assertAlmostEqual(js(MATH, 'm.dmsToDecimal(12,30,0)'), 12.5)
        self.assertAlmostEqual(js(MATH, 'm.dmsToDecimal(12,25,30)'), 12 + 25 / 60 + 30 / 3600)
        self.assertEqual(js(MATH, 'm.decimalToDms(22.5)'), [22, 30, 0])

    def test_arc_chord_sector(self):
        got = js(MATH, '[m.arc(5,Math.PI/3),m.chord(10,1),m.sectorArea(4,2),m.fanArea(4,2,10000)]')
        self.assertAlmostEqual(got[0], 5 * math.pi / 3)
        self.assertAlmostEqual(got[1], 20 * math.sin(0.5))
        self.assertAlmostEqual(got[2], 16)
        self.assertAlmostEqual(got[3], 16, places=4)

    def test_chord_gap_falls_below_one_percent_near_28_degrees(self):
        gap = 'x=>1-m.chord(1,x*Math.PI/180)/m.arc(1,x*Math.PI/180)'
        self.assertEqual(js(MATH, f'(g=>[g(28)<0.01,g(29)<0.01])({gap})'), [True, False])

    def test_speeds(self):
        self.assertEqual(js(MATH, '[m.speed(5,0.6),m.followerOmega(2,6,3)]'), [3, 4])

    def test_eratosthenes(self):
        self.assertAlmostEqual(js(MATH, 'm.circumference(7.2,800)'), 40000)

    def test_small_angle_diameters(self):
        got = js(MATH, '[m.smallAngleDiameter(384400,0.52),m.trueDiameter(384400,0.52)]')
        self.assertAlmostEqual(got[0], 384400 * 0.52 * DEG)
        self.assertEqual(round(got[0]), 3489)
        self.assertLess(abs(got[0] - got[1]), 1)

    def test_angle_classes(self):
        got = js(MATH, '[0,45,90,135,180,200,360].map(m.angleClass)')
        self.assertEqual(got, ['zero', 'acute', 'right', 'obtuse', 'straight', 'reflex', 'full turn'])
