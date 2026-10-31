"""Every number the Periodic Motion and SHM boxes show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/oscillations-waves/_shm-math.js'


class FactTests(SimpleTestCase):
    def test_mains_frequency(self):
        self.assertAlmostEqual(1 / 50, 0.02)
        self.assertEqual(round(2 * math.pi * 50, 1), 314.2)

    def test_repeat_of_3_to_2(self):
        self.assertEqual(round(2 * math.pi * 2, 2), 12.57)

    def test_shm_derivatives_are_quarter_cycles_apart(self):
        A, w = 1.3, 2.1
        for t in (0.1, 0.7, 1.9):
            h = 1e-6
            x = lambda u: A * math.cos(w * u)
            velocity = (x(t + h) - x(t - h)) / (2 * h)
            self.assertAlmostEqual(velocity, A * w * math.cos(w * t + math.pi / 2), places=6)


@needs_node
class ModuleTests(SimpleTestCase):
    def test_converter(self):
        got = js(MATH, '[m.convert("f",50),m.convert("T",0.02),m.convert("w",10)]')
        self.assertAlmostEqual(got[0]['T'], 0.02)
        self.assertAlmostEqual(got[1]['f'], 50)
        self.assertAlmostEqual(got[0]['w'], 2 * math.pi * 50)
        self.assertAlmostEqual(got[2]['T'], 2 * math.pi / 10)

    def test_shm_values(self):
        got = js(MATH, '[m.x(2,3,0.5,1),m.v(2,3,0.5,1),m.a(2,3,0.5,1)]')
        self.assertAlmostEqual(got[0], 2 * math.cos(3.5))
        self.assertAlmostEqual(got[1], -6 * math.sin(3.5))
        self.assertAlmostEqual(got[2], -9 * got[0])

    def test_fit_recovers_the_start(self):
        A, phi = js(MATH, '(({A,phi})=>[A,phi])(m.fit(3,8,2))')
        self.assertAlmostEqual(A, 5)
        self.assertAlmostEqual(A * math.cos(phi), 3)
        self.assertAlmostEqual(-A * 2 * math.sin(phi), 8)
        self.assertEqual(js(MATH, 'm.fit(3,0,2).phi'), 0)

    def test_only_the_spring_has_a_proportional_to_x(self):
        ratios = js(MATH, '[0.1,0.2,0.4].map(t=>{const p=m.spring(t);return p[1]/p[0]})')
        for ratio in ratios:
            self.assertAlmostEqual(ratio, -(2 * math.pi) ** 2)
        ball = js(MATH, '[0.1,0.3,0.6].map(t=>m.ball(t)[1])')
        self.assertEqual(ball, [-8, -8, -8])
        orbit = js(MATH, '[0.1,0.3].map(t=>{const p=m.orbit(t);return p[1]/p[0]})')
        self.assertGreater(abs(orbit[0] - orbit[1]), 1)

    def test_rational_sum_closes_and_irrational_does_not(self):
        self.assertAlmostEqual(js(MATH, 'm.mismatch(1.5,m.repeatTime(2))'), 0, places=9)
        self.assertAlmostEqual(js(MATH, 'm.mismatch(5/3,m.repeatTime(3))'), 0, places=9)
        best = js(MATH, 'Math.min(...[...Array(4000).keys()].map(i=>m.mismatch(Math.SQRT2,0.5+i*0.01,120,300)))')
        self.assertGreater(best, 0.05)
