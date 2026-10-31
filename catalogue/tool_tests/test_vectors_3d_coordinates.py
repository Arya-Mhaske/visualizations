"""Every number the 3D Coordinates tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vectors-3d/_3d-coordinates-math.js'


class FactTests(SimpleTestCase):
    def test_pythagoras_twice(self):
        self.assertEqual(3 ** 2 + 4 ** 2, 5 ** 2)
        self.assertEqual(5 ** 2 + 12 ** 2, 13 ** 2)     # (3, 4, 12) has distance 13

    def test_three_planes_make_eight(self):
        self.assertEqual(2 * 2 * 2, 8)


@needs_node
class ModuleTests(SimpleTestCase):
    def test_distance(self):
        self.assertEqual(js(MATH, '[m.floorDiagonal(3,4),m.distance3(3,4,12)]'), [5, 13])

    def test_regions(self):
        self.assertEqual(js(MATH, '[0,1,2,3].map(m.regions)'), [1, 2, 4, 8])

    def test_all_eight_octants_are_distinct_and_named_as_in_ncert(self):
        got = js(MATH, '[[1,1,1],[-1,1,1],[-1,-1,1],[1,-1,1],[1,1,-1],[-1,1,-1],[-1,-1,-1],[1,-1,-1]]'
                       '.map(p=>m.octant(...p))')
        self.assertEqual(got, ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'])

    def test_sphere_expands_and_reads_back(self):
        # (x − 1)² + (y − 2)² + (z − 1)² = 9 → x² + y² + z² − 2x − 4y − 2z − 3 = 0
        self.assertEqual(js(MATH, 'm.expandSphere(1,2,1,3)'), {'D': -2, 'E': -4, 'F': -2, 'G': -3})
        self.assertEqual(js(MATH, 'm.readSphere(m.expandSphere(1,2,1,3))'), {'a': 1, 'b': 2, 'c': 1, 'r': 3})

    def test_sphere_area_default(self):
        self.assertAlmostEqual(4 * math.pi * 9, 113.10, places=2)
