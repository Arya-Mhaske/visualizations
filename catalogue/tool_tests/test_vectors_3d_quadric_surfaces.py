"""Every fact the Quadric Surfaces tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vectors-3d/_quadric-surfaces-math.js'


@needs_node
class ModuleTests(SimpleTestCase):
    def test_known_points_lie_on_each_surface(self):
        abc = [3, 2, 2.5]
        on = {
            'ellipsoid': [3, 0, 0], 'hyper1': [3, 0, 0], 'hyper2': [0, 0, 2.5],
            'paraboloid': [3, 0, 1], 'saddle': [3, 0, 1], 'cone': [3, 0, 2.5],
        }
        for kind, p in on.items():
            self.assertAlmostEqual(js(MATH, f'm.implicit("{kind}",{p},{abc})'), 0, places=12, msg=kind)

    def test_slices_lie_on_the_surface(self):
        abc = [3, 2, 2.5]
        for kind in ('ellipsoid', 'hyper1', 'hyper2', 'paraboloid', 'saddle', 'cone'):
            for axis in (0, 1, 2):
                segs = js(MATH, f'm.slice("{kind}",{axis},1,{abc},-4,4,56)')
                for p, q in segs:
                    for pt in (p, q):
                        # the contour is linear between grid points, so f is small but not exact
                        val = js(MATH, f'm.implicit("{kind}",{pt},{abc})')
                        self.assertLess(abs(val), 0.1, msg=f'{kind} axis {axis}')

    def test_trace_names(self):
        abc = [3, 2, 2.5]
        cases = [
            ('ellipsoid', 2, 1, 'an ellipse'), ('ellipsoid', 2, 2.5, 'a point'), ('ellipsoid', 2, 3, 'nothing'),
            ('hyper1', 2, 3, 'an ellipse'), ('hyper1', 0, 1, 'a hyperbola'), ('hyper1', 0, 3, 'two crossing lines'),
            ('hyper2', 2, 1, 'nothing'), ('hyper2', 2, 3, 'an ellipse'), ('hyper2', 0, 1, 'a hyperbola'),
            ('paraboloid', 2, 1, 'an ellipse'), ('paraboloid', 2, 0, 'a point'), ('paraboloid', 2, -1, 'nothing'),
            ('paraboloid', 0, 1, 'a parabola'),
            ('saddle', 2, 1, 'a hyperbola'), ('saddle', 2, 0, 'two crossing lines'), ('saddle', 1, 1, 'a parabola'),
            ('cone', 2, 0, 'a point'), ('cone', 2, 1, 'an ellipse'), ('cone', 0, 0, 'two crossing lines'),
            ('cone', 0, 1, 'a hyperbola'),
        ]
        for kind, axis, k, expected in cases:
            self.assertEqual(js(MATH, f'm.traceName("{kind}",{axis},{k},{abc})'), expected, msg=(kind, axis, k))

    def test_ellipsoid_slice_semi_axes(self):
        # z = 1 on x²/9 + y²/4 + z²/6.25 = 1: x semi-axis 3·sqrt(1 − 1/6.25)
        segs = js(MATH, 'm.slice("ellipsoid",2,1,[3,2,2.5],-4,4,200)')
        xmax = max(max(p[0], q[0]) for p, q in segs)
        self.assertAlmostEqual(xmax, 3 * math.sqrt(1 - 1 / 6.25), places=2)

    def test_straight_beams_lie_on_the_hyperboloid(self):
        # every point of every ruling satisfies (x² + y²)/a² − z²/c² = 1
        for a, c in ((2, 3), (1.5, 4)):
            for t in (0, 0.7, 2.1, 5.0):
                for sign in (1, -1):
                    for s in (-1.5, -0.4, 0, 1, 1.5):
                        p = js(MATH, f'm.ruling({a},{c},{t},{sign},{s})')
                        self.assertAlmostEqual((p[0] ** 2 + p[1] ** 2) / a ** 2 - p[2] ** 2 / c ** 2, 1, places=9)
