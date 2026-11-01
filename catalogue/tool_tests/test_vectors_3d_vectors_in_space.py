"""Every number the Vectors in Space tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vectors-3d/_vectors-in-space-math.js'


@needs_node
class ModuleTests(SimpleTestCase):
    def test_direction_cosines_square_to_one_for_many_vectors(self):
        vs = [[a, b, c] for a in range(-5, 6) for b in range(-5, 6) for c in range(-5, 6) if (a, b, c) != (0, 0, 0)]
        got = js(MATH, f'{vs}.map(v=>m.cosSquareSum(v))')
        for total in got:
            self.assertAlmostEqual(total, 1.0, places=12)

    def test_direction_cosines_default(self):
        r = math.sqrt(50)
        got = js(MATH, 'm.dirCosines([3,4,5])')
        for g, e in zip(got, [3 / r, 4 / r, 5 / r]):
            self.assertAlmostEqual(g, e, places=12)
        self.assertAlmostEqual(js(MATH, 'm.angleDeg(0)'), 90)
        self.assertIsNone(js(MATH, 'm.dirCosines([0,0,0])'))

    def test_projection_default(self):
        # a = (3, 4, 2), b = (5, 1, 0): a·b = 19, |b|² = 26
        self.assertEqual(js(MATH, 'm.dot([3,4,2],[5,1,0])'), 19)
        got = js(MATH, 'm.vectorProjection([3,4,2],[5,1,0])')
        for g, e in zip(got, [19 / 26 * 5, 19 / 26, 0]):
            self.assertAlmostEqual(g, e, places=12)
        self.assertAlmostEqual(js(MATH, 'm.scalarProjection([3,4,2],[5,1,0])'), 19 / math.sqrt(26), places=12)
        self.assertAlmostEqual(js(MATH, 'm.dot(m.perpendicular([3,4,2],[5,1,0]),[5,1,0])'), 0, places=12)

    def test_section_formula(self):
        self.assertEqual(js(MATH, 'm.internal([-3,-2,1],[5,4,5],1,3)'), [-1, -0.5, 2])
        self.assertEqual(js(MATH, 'm.external([-2,-1,1],[2,2,3],3,1)'), [4, 3.5, 4])
        self.assertIsNone(js(MATH, 'm.external([0,0,0],[1,1,1],2,2)'))
        # The slip: weights swapped, so the nearer end gets the smaller weight.
        self.assertEqual(js(MATH, 'm.swapped([-3,-2,1],[5,4,5],1,3)'), [3, 2.5, 4])

    def test_internal_point_divides_in_ratio(self):
        p, q = [-3, -2, 1], [5, 4, 5]
        r = js(MATH, f'm.internal({p},{q},2,3)')
        pr = math.dist(p, r)
        rq = math.dist(r, q)
        self.assertAlmostEqual(pr / rq, 2 / 3, places=12)

    def test_collinear(self):
        got = js(MATH, 'm.collinear([-2,-1,0],[2,1,2],[4,2,3])')
        self.assertTrue(got['yes'])
        self.assertAlmostEqual(got['lambda'], 4 / 6, places=12)
        self.assertFalse(js(MATH, 'm.collinear([-2,-1,0],[2,1,2],[4,2,4])')['yes'])
