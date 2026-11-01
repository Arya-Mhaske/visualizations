"""Every number the Lines & Planes tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vectors-3d/_lines-planes-math.js'


@needs_node
class ModuleTests(SimpleTestCase):
    def test_point_to_plane(self):
        # x + 2y + 2z = 3 and Q = (3, 2, 4): 3 + 4 + 8 − 3 = 12, |n| = 3
        self.assertAlmostEqual(js(MATH, 'm.planeDist([1,2,2],3,[3,2,4])'), 4.0)
        foot = js(MATH, 'm.footOnPlane([1,2,2],3,[3,2,4])')
        self.assertAlmostEqual(foot[0] + 2 * foot[1] + 2 * foot[2], 3.0)
        self.assertAlmostEqual(math.dist(foot, [3, 2, 4]), 4.0)

    def test_skew_distance_simple(self):
        # x axis, and the line through (0, 0, 3) along y: 3 apart
        self.assertAlmostEqual(js(MATH, 'm.skewDistance([0,0,0],[1,0,0],[0,0,3],[0,1,0])'), 3.0)
        got = js(MATH, 'm.closest([0,0,0],[1,0,0],[0,0,3],[0,1,0])')
        self.assertAlmostEqual(got['dist'], 3.0)

    def test_closest_matches_formula_and_is_square_to_both(self):
        a, u, b, v = [-4, -1, 0], [1, 0.3, 0], [1, -4, 2], [0, 1, 0.2]
        cp = js(MATH, f'm.closest({a},{u},{b},{v})')
        d = js(MATH, f'm.skewDistance({a},{u},{b},{v})')
        self.assertAlmostEqual(cp['dist'], d, places=9)
        w = [q - p for p, q in zip(cp['p'], cp['q'])]
        self.assertAlmostEqual(sum(x * y for x, y in zip(w, u)), 0, places=9)
        self.assertAlmostEqual(sum(x * y for x, y in zip(w, v)), 0, places=9)
        # Brute force: nothing on a grid of feet is shorter.
        best = min(math.dist([a[i] + s * u[i] for i in range(3)], [b[i] + t * v[i] for i in range(3)])
                   for s in [i / 4 for i in range(-32, 33)] for t in [i / 4 for i in range(-32, 33)])
        self.assertGreaterEqual(best, d - 1e-9)

    def test_relation(self):
        self.assertEqual(js(MATH, 'm.relation([-3,0,0],[1,0,0],[0,-3,0],[0,1,0])'), 'meet')
        self.assertEqual(js(MATH, 'm.relation([-3,0,0],[1,0,0],[0,-3,1],[0,1,0])'), 'skew')
        self.assertEqual(js(MATH, 'm.relation([-3,0,0],[1,0,0],[0,-3,1],[1,0,0])'), 'parallel')

    def test_line_angle(self):
        # (2, 1, 2) and (−1, 2, 2): dot 4, both length 3
        self.assertAlmostEqual(js(MATH, 'm.lineAngle([2,1,2],[-1,2,2])'), math.degrees(math.acos(4 / 9)), places=9)
        self.assertAlmostEqual(js(MATH, 'm.lineAngle([1,0,0],[0,1,0])'), 90.0)
        self.assertAlmostEqual(js(MATH, 'm.lineAngle([1,2,3],[-1,-2,-3])'), 0.0, places=6)

    def test_tetrahedron_area_vectors_sum_to_zero(self):
        for dx in range(-2, 6):
            for dy in range(-2, 6):
                for dz in range(1, 7):
                    got = js(MATH, f'm.tetra([0,0,0],[4,0,0],[0,3,0],[{dx},{dy},{dz}])')
                    for v in got['total']:
                        self.assertAlmostEqual(v, 0, places=9)
                    self.assertAlmostEqual(got['volume'], 4 * 3 * dz / 6, places=9)
