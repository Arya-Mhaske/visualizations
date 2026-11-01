"""Every number the Cross Product tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vectors-3d/_cross-product-math.js'


@needs_node
class ModuleTests(SimpleTestCase):
    def test_cross_default(self):
        # (3, 0, 1) × (1, 2, 0) = (0·0 − 1·2, 1·1 − 3·0, 3·2 − 0·1)
        self.assertEqual(js(MATH, 'm.cross([3,0,1],[1,2,0])'), [-2, 1, 6])

    def test_perpendicular_to_both_over_a_grid(self):
        vs = [[a, b, c] for a in range(-3, 4) for b in range(-3, 4) for c in range(-3, 4)]
        out = js(MATH, f'(()=>{{const vs={vs};const bad=[];for(const a of vs)for(const b of vs){{const n=m.cross(a,b);if(m.dot(a,n)!==0||m.dot(b,n)!==0)bad.push([a,b]);}}return bad.length;}})()')
        self.assertEqual(out, 0)

    def test_perpendicular_after_spin(self):
        got = js(MATH, '(()=>{const a=m.spinZ([3,0,1],1.1),b=m.spinZ([1,2,0],1.1);const n=m.cross(a,b);return [m.dot(a,n),m.dot(b,n)];})()')
        for g in got:
            self.assertAlmostEqual(g, 0, places=12)

    def test_area_is_base_times_height(self):
        for theta in (30, 60, 90, 150):
            t = math.radians(theta)
            a, b = [4, 0, 0], [3 * math.cos(t), 3 * math.sin(t), 0]
            got = js(MATH, f'm.norm(m.cross({a},{b}))')
            self.assertAlmostEqual(got, 4 * 3 * math.sin(t), places=9)
            self.assertAlmostEqual(js(MATH, f'm.areaFromSin({a},{b})'), 4 * 3 * math.sin(t), places=9)

    def test_swap_flips_the_sign(self):
        self.assertEqual(js(MATH, 'm.cross([1,2,3],[4,5,6])'), [-3, 6, -3])
        self.assertEqual(js(MATH, 'm.cross([4,5,6],[1,2,3])'), [3, -6, 3])
        self.assertEqual(js(MATH, 'm.cross([1,2,3],[1,2,3])'), [0, 0, 0])

    def test_triple_product_default(self):
        # a = (3, 0, 0), b = (1, 2, 0), c = (1, 1, 3): base 6, height 3, volume 18
        self.assertEqual(js(MATH, 'm.triple([3,0,0],[1,2,0],[1,1,3])'), 18)
        self.assertEqual(js(MATH, 'm.triple([3,0,0],[1,2,0],[1,1,-3])'), -18)
        self.assertEqual(js(MATH, 'm.norm(m.cross([3,0,0],[1,2,0]))'), 6)

    def test_torque(self):
        got = js(MATH, 'm.torque([3,0,0],[0,20,0])')
        self.assertEqual(got, [0, 0, 60])
        self.assertAlmostEqual(js(MATH, 'm.norm(m.torque([3,0,0],[20*Math.cos(Math.PI/3),20*Math.sin(Math.PI/3),0]))'),
                               3 * 20 * math.sin(math.pi / 3), places=9)
