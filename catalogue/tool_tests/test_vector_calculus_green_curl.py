"""Facts shown by the Green's Theorem and Curl & Divergence tools, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vector-calculus/_vector-calculus-math.js'


def shoelace(pts):
    return sum(x * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * y for i, (x, y) in enumerate(pts)) / 2


@needs_node
class GreenTests(SimpleTestCase):
    def test_tiles_add_up_to_the_rim_and_the_area_integral(self):
        # F = (−y², x), curl = 1 + 2y, region [−4, 4]²: ∬ = 64 + 0
        rim = js(MATH, 'm.rectCirculation(m.FIELDS.quad,-4,-4,4,4)')
        self.assertAlmostEqual(rim, 64.0, places=8)
        for n in range(1, 7):
            h = 8 / n
            total = js(MATH, f'(()=>{{let s=0;for(let i=0;i<{n};i++)for(let j=0;j<{n};j++)s+=m.rectCirculation(m.FIELDS.quad,-4+i*{h},-4+j*{h},-4+(i+1)*{h},-4+(j+1)*{h});return s;}})()')
            self.assertAlmostEqual(total, 64.0, places=7, msg=n)

    def test_each_tile_is_the_integral_of_the_curl(self):
        # ∬ over [x0,x1]×[y0,y1] of 1 + 2y = (x1 − x0)((y1 − y0) + (y1² − y0²))
        x0, y0, x1, y1 = -1.5, 0.5, 2.0, 3.5
        expected = (x1 - x0) * ((y1 - y0) + (y1 ** 2 - y0 ** 2))
        self.assertAlmostEqual(js(MATH, f'm.rectCirculation(m.FIELDS.quad,{x0},{y0},{x1},{y1})'), expected, places=8)

    def test_orientation(self):
        for cy in (-1, 0, 0.5, 1):
            a, b = 3, 2
            ccw = js(MATH, f'm.work(m.FIELDS.quad, m.ellipsePath([0,{cy}],{a},{b}),1,720)')
            cw = js(MATH, f'm.work(m.FIELDS.quad, m.reversed(m.ellipsePath([0,{cy}],{a},{b})),1,720)')
            self.assertAlmostEqual(ccw, math.pi * a * b * (1 + 2 * cy), places=6)
            self.assertAlmostEqual(cw, -ccw, places=9)

    def test_planimeter_reads_the_area_from_any_pivot(self):
        areas = {}
        for name in ('l', 'triangle', 'star'):
            pts = js(MATH, f'm.SHAPES.{name}.pts')
            areas[name] = shoelace(pts)
            self.assertGreater(areas[name], 0, msg=name)
            self.assertAlmostEqual(js(MATH, f'm.polyArea(m.SHAPES.{name}.pts)'), areas[name], places=9)
            for o in ((0, 0), (3.5, -3), (-4, 4), (1, 1)):
                n = len(pts)
                self.assertAlmostEqual(js(MATH, f'm.sweptFrom(m.SHAPES.{name}.pts,[{o[0]},{o[1]}],{n},0)'), areas[name], places=9, msg=(name, o))
        self.assertAlmostEqual(areas['l'], 12.0)
        self.assertAlmostEqual(areas['triangle'], 6.25)
        self.assertAlmostEqual(areas['star'], 5 * 3 * 1.3 * math.sin(math.radians(36)), places=9)

    def test_partial_trace_is_the_swept_area_so_far(self):
        # Half an edge of the triangle from the origin: a triangle with the pivot, area ½ |a × (half-way point)|
        pts = [[0.5, -2], [3.5, -1], [1.5, 2.5]]
        e = [0.5 + 0.5 * 3, -2 + 0.5 * 1]
        expected = (pts[0][0] * e[1] - pts[0][1] * e[0]) / 2
        self.assertAlmostEqual(js(MATH, 'm.sweptFrom(m.SHAPES.triangle.pts,[0,0],0,0.5)'), expected, places=12)


@needs_node
class CurlDivergenceTests(SimpleTestCase):
    def test_divergence_is_outflow_per_area(self):
        # source (x, y): div 2, so a box of side s sends out 2 s²
        for s in (0.5, 1, 2, 3):
            self.assertAlmostEqual(js(MATH, f'm.boxOutflow(m.FIELDS.source,1,1,{s})'), 2 * s * s, places=9)
            self.assertAlmostEqual(js(MATH, f'm.boxOutflow(m.FIELDS.stretch,-1,2,{s})'), s * s, places=9)
            for zero in ('swirl', 'shear', 'saddle'):
                self.assertAlmostEqual(js(MATH, f'm.boxOutflow(m.FIELDS.{zero},1,1,{s})'), 0, places=9)

    def test_divergence_of_wind_and_small_box(self):
        self.assertEqual(js(MATH, 'm.div2(m.FIELDS.wind,1,2)'), 0)
        self.assertAlmostEqual(js(MATH, 'm.boxOutflow(m.FIELDS.wind,1,2,0.01)') / 1e-4, 0, places=3)

    def test_curl_is_circulation_per_area_for_a_small_loop(self):
        R = 0.01
        for name, x, y in (('swirl', 1, 1), ('shear', 2, -1), ('wind', 1, 2), ('quad', 1, 1), ('source', 3, 3)):
            circ = js(MATH, f'm.circleCirculation(m.FIELDS.{name},[{x},{y}],{R})')
            curl = js(MATH, f'm.curl2(m.FIELDS.{name},{x},{y})')
            self.assertAlmostEqual(circ / (math.pi * R * R), curl, places=3, msg=name)

    def test_curl_of_a_gradient_and_div_of_a_rotated_gradient_are_zero(self):
        for name in ('bowl', 'saddle', 'wave', 'hill'):
            for cx, cy, R in ((1, 1, 1.5), (-2, 0, 2.5), (0.5, -3, 0.5)):
                a = js(MATH, f'm.circleCirculation(m.gradField(m.SCALARS.{name}),[{cx},{cy}],{R})')
                b = js(MATH, f'm.circleOutflow(m.streamField(m.SCALARS.{name}),[{cx},{cy}],{R})')
                self.assertAlmostEqual(a, 0, places=7, msg=name)
                self.assertAlmostEqual(b, 0, places=7, msg=name)
                self.assertEqual(js(MATH, f'm.div2(m.streamField(m.SCALARS.{name}),{cx},{cy})'), 0)

    def test_paddle_wheel_spins_at_half_the_curl(self):
        self.assertEqual(js(MATH, 'm.curl2(m.FIELDS.swirl,1,1)'), 2)
        self.assertEqual(js(MATH, 'm.curl2(m.FIELDS.shear,1,1)'), -1)
        self.assertEqual(js(MATH, 'm.curl2(m.FIELDS.source,1,1)'), 0)
