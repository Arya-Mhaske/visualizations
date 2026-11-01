"""Facts shown by the Vector Fields tools, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vector-calculus/_vector-calculus-math.js'
POINTS = [(1.3, 0.7), (-2.1, 1.4), (0.4, -3.2), (2.7, 2.2)]


@needs_node
class ModuleTests(SimpleTestCase):
    def test_every_field_partial_matches_a_finite_difference(self):
        names = ['swirl', 'source', 'shear', 'saddle', 'stretch', 'wind', 'cross', 'quad', 'hole']
        h = 1e-6
        for name in names:
            for x, y in POINTS:
                got = js(MATH, f'(()=>{{const F=m.FIELDS.{name};const f=F.P,g=F.Q;return [F.Px({x},{y}),F.Py({x},{y}),F.Qx({x},{y}),F.Qy({x},{y}),'
                               f'(f({x}+{h},{y})-f({x}-{h},{y}))/{2*h},(f({x},{y}+{h})-f({x},{y}-{h}))/{2*h},'
                               f'(g({x}+{h},{y})-g({x}-{h},{y}))/{2*h},(g({x},{y}+{h})-g({x},{y}-{h}))/{2*h}];}})()')
                for i in range(4):
                    self.assertAlmostEqual(got[i], got[4 + i], places=5, msg=(name, x, y, i))

    def test_scalar_partials_and_gradient_fields(self):
        h = 1e-6
        for name in ('bowl', 'saddle', 'wave', 'hill'):
            for x, y in POINTS:
                got = js(MATH, f'(()=>{{const S=m.SCALARS.{name};return [S.fx({x},{y}),S.fy({x},{y}),S.fxx({x},{y}),S.fxy({x},{y}),S.fyy({x},{y}),'
                               f'(S.f({x}+{h},{y})-S.f({x}-{h},{y}))/{2*h},(S.f({x},{y}+{h})-S.f({x},{y}-{h}))/{2*h},'
                               f'(S.fx({x}+{h},{y})-S.fx({x}-{h},{y}))/{2*h},(S.fx({x},{y}+{h})-S.fx({x},{y}-{h}))/{2*h},(S.fy({x},{y}+{h})-S.fy({x},{y}-{h}))/{2*h}];}})()')
                for a, b in ((0, 5), (1, 6), (2, 7), (3, 8), (4, 9)):
                    self.assertAlmostEqual(got[a], got[b], places=5, msg=(name, x, y, a))
                # curl of a gradient is zero: the mixed partials are the same function
                self.assertEqual(js(MATH, f'm.curl2(m.gradField(m.SCALARS.{name}),{x},{y})'), 0)

    def test_gradient_is_square_to_the_contour(self):
        for name in ('bowl', 'saddle', 'wave', 'hill'):
            for x, y in ((2, 1), (1, 2), (-3, 2), (2.5, -1.5)):
                got = js(MATH, f'(()=>{{const S=m.SCALARS.{name};const g=m.gradient(S,{x},{y});const t=m.levelTangent(S,{x},{y});'
                               f'return t?[Math.abs(m.dot(g,t))/m.norm(g)]:null;}})()')
                if got is not None:
                    self.assertLess(got[0], 0.08, msg=(name, x, y))

    def test_inverse_square_quarters_when_distance_doubles(self):
        for q in (-3, 2):
            for r in (1, 1.5, 2.5):
                a = js(MATH, f'm.norm(m.inverseSquare({q},[0,0],{r},0))')
                b = js(MATH, f'm.norm(m.inverseSquare({q},[0,0],{2 * r},0))')
                self.assertAlmostEqual(b / a, 0.25, places=12)
                self.assertAlmostEqual(a, abs(q) / r ** 2, places=12)
        # an attractive source points inward
        v = js(MATH, 'm.inverseSquare(-2,[0,0],3,0)')
        self.assertLess(v[0], 0)
