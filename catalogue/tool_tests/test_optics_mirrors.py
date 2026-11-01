"""Every number the Mirrors box shows, worked out in Python, then checked against the JS."""
import json
import math
from fractions import Fraction as F

from django.test import SimpleTestCase

from .helpers import js, needs_node

LIB = 'lib/rays.js'
MATH = 'tools/optics/_mirrors-math.js'


def image(u, f):
    v = 1 / (F(1, 1) / F(f) - F(1, 1) / F(u))
    return v, -v / F(u)


@needs_node
class EngineTests(SimpleTestCase):
    def test_reflect(self):
        self.assertEqual(js(LIB, 'm.reflect([1,0],[-1,0])'), [-1, 0])
        got = js(LIB, 'm.reflect(m.unit([1,-1]),[0,1])')
        self.assertAlmostEqual(got[0], 2 ** -0.5)
        self.assertAlmostEqual(got[1], 2 ** -0.5)

    def test_snell(self):
        i = math.radians(30)
        got = js(LIB, f'm.refract([{math.sin(i)},{-math.cos(i)}],[0,1],1,1.5)')
        self.assertAlmostEqual(got[0], math.sin(i) / 1.5)  # n₁ sin i = n₂ sin r
        self.assertAlmostEqual(math.hypot(*got), 1)
        self.assertLess(got[1], 0)

    def test_total_internal_reflection(self):
        critical = math.asin(1 / 1.5)
        for angle, blocked in [(critical - 0.01, False), (critical + 0.01, True)]:
            got = js(LIB, f'm.refract([{math.sin(angle)},{-math.cos(angle)}],[0,1],1.5,1)')
            self.assertEqual(got is None, blocked)

    def test_circle_and_axis(self):
        self.assertEqual(js(LIB, 'm.hitCircle([-5,0],[1,0],[0,0],2)'), [3, 7])
        self.assertEqual(js(LIB, 'm.hitCircle([-5,3],[1,0],[0,0],2)'), [])
        self.assertEqual(js(LIB, 'm.axisCrossing([2,2],[-1,-1])'), 0)
        self.assertIsNone(js(LIB, 'm.axisCrossing([0,2],[1,0])'))


@needs_node
class FocusTests(SimpleTestCase):
    def test_exact_crossing_for_both_mirrors(self):
        for kind, side in [('concave', -1), ('convex', 1)]:
            for R, h in [(10, 0.2), (10, 3), (14, 8), (6, 4.8)]:
                theta = math.asin(h / R)
                got = js(MATH, f"m.exactRay('{kind}',{R},{h})")
                self.assertAlmostEqual(got['cross'], side * (R - R / (2 * math.cos(theta))))
                self.assertAlmostEqual(got['fromPole'], js(MATH, f'm.crossingFormula({R},{got["theta"]})'))

    def test_triangle_is_isosceles(self):
        for kind in ('concave', 'convex'):
            got = js(MATH, f"m.exactRay('{kind}',10,3)")
            to_c = abs(got['C'][0] - got['cross'])
            to_m = math.hypot(got['M'][0] - got['cross'], got['M'][1])
            self.assertAlmostEqual(to_c, to_m)

    def test_near_axis_gives_half_r_and_far_rays_fall_short(self):
        near = js(MATH, "m.exactRay('concave',10,0.2)")
        self.assertLess(abs(near['fromPole'] - 5), 0.005)
        far = js(MATH, "m.exactRay('concave',10,8)")
        self.assertLess(far['fromPole'], 5)
        self.assertGreater(far['fromPole'], 0)  # still in front of the mirror at the slider's limit

    def test_tool_limit_stays_on_the_mirror(self):
        got = js(MATH, "m.exactRay('concave',6,4.8)")
        self.assertGreater(got['fromPole'], 0)


@needs_node
class ImageTests(SimpleTestCase):
    def test_table_of_cases(self):
        cases = [(-15, -5, 'Real, inverted, diminished'), (-10, -5, 'Real, inverted, same size'), (-7.5, -5, 'Real, inverted, magnified'),
                 (-3, -5, 'Virtual, erect, magnified'), (-10, 5, 'Virtual, erect, diminished')]
        for u, f, words in cases:
            v, m = image(u, f)
            got = js(MATH, f'm.imageOf({u},{f})')
            self.assertAlmostEqual(got['v'], float(v))
            self.assertAlmostEqual(got['m'], float(m))
            self.assertEqual(js(MATH, f'm.describe(m.imageOf({u},{f}))'), words)

    def test_values_quoted_on_the_page(self):
        self.assertEqual(image(-15, -5), (F(-15, 2), F(-1, 2)))
        self.assertEqual(image(-10, 5), (F(10, 3), F(1, 3)))

    def test_object_at_focus(self):
        self.assertEqual(js(MATH, 'm.describe(m.imageOf(-5,-5))'), 'No image: rays leave parallel')

    def test_regions(self):
        got = [js(MATH, f'm.region({u},-5)') for u in (-15, -10, -7, -5, -3)]
        self.assertEqual(got, ['Beyond C', 'At C', 'Between C and F', 'At F', 'Between F and P'])
        self.assertEqual(js(MATH, 'm.region(-5,5)'), 'In front of a convex mirror')

    def test_every_principal_ray_passes_through_the_image(self):
        for u, h, f in [(-15, 3, -5), (-7, 2, -5), (-3, 3, -5), (-10, 3, 5), (-2, 1, 8), (-10, 3, -5), (-5, 3, -5), (-24, 5, 3)]:
            rays = js(MATH, f'm.principalRays({u},{h},{f})')
            self.assertGreaterEqual(len(rays), 3)
            for ray in rays:
                self.assertLess(ray['dir'][0], 0, ray['name'])  # always heads back to the left
            if u == f:
                # at the focus, all the rays leave parallel
                d = rays[0]['dir']
                for ray in rays:
                    self.assertAlmostEqual(ray['dir'][0] * d[1] - ray['dir'][1] * d[0], 0)
                continue
            v = float(image(u, f)[0])
            tip = (v, -v / u * h)
            for ray in rays:
                x, y = tip[0] - ray['hit'][0], tip[1] - ray['hit'][1]
                self.assertAlmostEqual(x * ray['dir'][1] - y * ray['dir'][0], 0, msg=(u, h, f, ray['name']))


@needs_node
class TriangleTests(SimpleTestCase):
    def test_both_pairs_are_similar(self):
        for u, f, h in [(-15, -5, 3), (-24, -3, 1), (-8.5, -6, 2)]:
            got = js(MATH, f'm.triangles({u},{f},{h})')
            self.assertAlmostEqual(got['poleLeft'], got['poleRight'])
            self.assertAlmostEqual(got['focusLeft'], got['focusRight'])
            self.assertAlmostEqual(got['poleRight'], got['focusRight'])

    def test_drawing_limit_keeps_the_image_on_the_stage(self):
        v, m = image(-1.4 * 6, -6)
        self.assertGreater(float(v), -27)  # the stage's left edge
        self.assertLess(abs(float(m)) * 3, 8)


@needs_node
class SignTests(SimpleTestCase):
    def test_no_signs_gets_concave_size_right_and_convex_wrong(self):
        self.assertAlmostEqual(js(MATH, 'm.unsignedV(-15,-5)'), 7.5)  # true |v| 7.5
        self.assertAlmostEqual(js(MATH, 'm.unsignedV(-3,-5)'), -7.5)  # true |v| 7.5, but the minus has no meaning
        self.assertAlmostEqual(js(MATH, 'm.unsignedV(-10,5)'), 10)  # true |v| is 10/3

    def test_no_signs_fails_in_every_case_the_toggle_can_show(self):
        cases = [(-15, -5, 'Right size, wrong side'), (-3, -5, 'Right size, wrong side'), (-15, 5, 'Wrong size'),
                 (-3, 5, 'Wrong size'), (-5, -5, 'No image here')]
        for u, f, words in cases:
            self.assertEqual(js(MATH, f'm.noSignsVerdict({u},{f})'), words)
        # every slider setting, so the toggle always has something to show
        got = js(MATH, """[...Array(43).keys()].map((i) => -1 - i / 2).flatMap((u) => [...Array(13).keys()].map((i) => 2 + i / 2)
          .flatMap((f) => [m.noSignsVerdict(u, f), m.noSignsVerdict(u, -f)]))""")
        self.assertEqual(set(got), {'Right size, wrong side', 'Wrong size', 'No image here'})


@needs_node
class RearViewTests(SimpleTestCase):
    def test_flat_field_is_just_the_eye_angle(self):
        got = js(MATH, 'm.fieldEdge(0.5,0.08,Infinity)')
        self.assertAlmostEqual(got['angle'], math.atan(0.08 / 0.5))

    def test_convex_field_adds_twice_the_rim_tilt(self):
        R, w, e = 1.2, 0.08, 0.5
        sag = R - math.sqrt(R * R - w * w)
        beta = math.atan2(w, e + sag)
        alpha = math.asin(w / R)
        got = js(MATH, f'm.fieldEdge({e},{w},{R})')
        self.assertAlmostEqual(got['angle'], beta + 2 * alpha)
        self.assertGreater(got['angle'], js(MATH, f'm.fieldEdge({e},{w},Infinity)')['angle'] * 1.5)

    def test_more_curve_shows_more(self):
        wide = js(MATH, 'm.fieldEdge(0.5,0.08,0.6).angle')
        narrow = js(MATH, 'm.fieldEdge(0.5,0.08,3).angle')
        self.assertGreater(wide, narrow)

    def test_blind_stretch_is_reachable_by_the_slider(self):
        flat = js(MATH, 'm.firstSeen(3.5,m.fieldEdge(0.5,0.08,Infinity))')
        convex = js(MATH, 'm.firstSeen(3.5,m.fieldEdge(0.5,0.08,1.2))')
        self.assertAlmostEqual(flat, (3.5 - 0.08) * 0.5 / 0.08)
        self.assertTrue(6 <= convex < flat <= 38)
        edge = 'm.fieldEdge(0.5,0.08,1.2)'
        self.assertTrue(js(MATH, f'm.isSeen([{-convex - 0.5},3.5],{edge})'))
        self.assertFalse(js(MATH, f'm.isSeen([{-convex + 0.5},3.5],{edge})'))

    def test_constants_and_page_values(self):
        self.assertEqual(js(MATH, 'm.SHAVING_R'), 40)
        # a face 15 cm from f = −20 cm: 4 times, upright, 60 cm behind
        v, m = image(-15, -20)
        self.assertEqual((v, m), (60, 4))
        self.assertEqual(js(MATH, 'm.describe(m.imageOf(-15,-20))'), 'Virtual, erect, magnified')
