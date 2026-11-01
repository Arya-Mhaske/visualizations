"""Facts shown by the Line Integrals tools, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vector-calculus/_vector-calculus-math.js'


def trapezoid(f, a, b, n=200000):
    h = (b - a) / n
    return h * (sum(f(a + i * h) for i in range(1, n)) + (f(a) + f(b)) / 2)


@needs_node
class ModuleTests(SimpleTestCase):
    def test_conservative_work_is_the_rise_in_height_on_every_road(self):
        # F = (2xy, x²) = ∇(x²y); A = (−3, −1), B = (3, 2): f(B) − f(A) = 18 − (−9)
        for bend in (0, 1, 2, 3, -2, -4.2):
            got = js(MATH, f'm.work(m.FIELDS.cross, m.bump([-3,-1],[3,2],{bend}))')
            self.assertAlmostEqual(got, 27.0, places=6, msg=bend)
        self.assertAlmostEqual(js(MATH, 'm.work(m.FIELDS.cross, m.segment([-3,-1],[3,2]))'), 27.0, places=6)

    def test_nonconservative_roads_disagree(self):
        a = js(MATH, 'm.work(m.FIELDS.swirl, m.segment([-3,-1],[3,2]))')
        b = js(MATH, 'm.work(m.FIELDS.swirl, m.bump([-3,-1],[3,2],2))')
        self.assertGreater(abs(a - b), 1)
        # independent check of the straight road: r = A + t(B − A), F = (−y, x)
        A, B = (-3, -1), (3, 2)
        d = (B[0] - A[0], B[1] - A[1])
        ref = trapezoid(lambda t: -(A[1] + t * d[1]) * d[0] + (A[0] + t * d[0]) * d[1], 0, 1, 20000)
        self.assertAlmostEqual(a, ref, places=6)

    def test_closed_loops(self):
        for cx, cy, size in ((0, 0, 1), (1, -1, 2.5), (-2, 2, 3)):
            self.assertAlmostEqual(js(MATH, f'm.work(m.FIELDS.cross, m.ellipsePath([{cx},{cy}],{size},{size * 0.7}),1,720)'), 0, places=7)
            self.assertAlmostEqual(js(MATH, f'm.work(m.FIELDS.saddle, m.ellipsePath([{cx},{cy}],{size},{size * 0.7}),1,720)'), 0, places=7)
            # swirl (−y, x): twice the area, 2π a b
            self.assertAlmostEqual(js(MATH, f'm.work(m.FIELDS.swirl, m.ellipsePath([{cx},{cy}],{size},{size * 0.7}),1,720)'),
                                   2 * math.pi * size * size * 0.7, places=6)

    def test_work_so_far_is_the_height_gained_so_far(self):
        for u in (0.1, 0.37, 0.5, 0.9, 1.0):
            got = js(MATH, f'(()=>{{const p=m.ellipsePath([0,1],2.5,1.75);return [m.work(m.FIELDS.cross,p,{u},720),m.FIELDS.cross.f(...p.r({u}))-m.FIELDS.cross.f(...p.r(0))];}})()')
            self.assertAlmostEqual(got[0], got[1], places=6, msg=u)

    def test_curtain_area(self):
        # Circle of radius 2.5, constant height 1.5
        self.assertAlmostEqual(js(MATH, 'm.arcIntegral(()=>1.5, m.arcPath([0,0],2.5,0,m.TAU))'), 1.5 * 2 * math.pi * 2.5, places=6)
        length = math.hypot(6, 4)
        self.assertAlmostEqual(js(MATH, 'm.pathLength(m.segment([-3,-2],[3,2]))'), length, places=9)
        # rising height 1.5 + x/3 along the line: the average of x is 0
        self.assertAlmostEqual(js(MATH, 'm.arcIntegral((x)=>1.5+x/3, m.segment([-3,-2],[3,2]))'), 1.5 * length, places=9)

    def test_reversing_flips_work_but_not_the_curtain(self):
        w = js(MATH, 'm.work(m.FIELDS.wind, m.bump([-3.5,-2],[3.5,2],2))')
        wr = js(MATH, 'm.work(m.FIELDS.wind, m.reversed(m.bump([-3.5,-2],[3.5,2],2)))')
        self.assertAlmostEqual(w, -wr, places=9)
        f = 'm.arcIntegral((x,y)=>1.5+Math.sin(x)*0.5+y/6, '
        a = js(MATH, f + 'm.bump([-3.5,-2],[3.5,2],2))')
        b = js(MATH, f + 'm.reversed(m.bump([-3.5,-2],[3.5,2],2)))')
        self.assertAlmostEqual(a, b, places=9)

    def test_hole_field_has_equal_cross_partials_but_loop_is_two_pi(self):
        for x, y in ((1, 2), (-3, 0.5), (0.2, -0.4)):
            self.assertAlmostEqual(js(MATH, f'm.FIELDS.hole.Py({x},{y})'), js(MATH, f'm.FIELDS.hole.Qx({x},{y})'), places=12)
        for R in (1, 2, 3, 4):
            self.assertAlmostEqual(js(MATH, f'm.circleCirculation(m.FIELDS.hole,[0,0],{R})'), 2 * math.pi, places=6)
        # a loop that does not go round the origin is worth zero
        self.assertAlmostEqual(js(MATH, 'm.circleCirculation(m.FIELDS.hole,[4,0],1)'), 0, places=6)
        for name in ('swirl', 'shear', 'quad'):
            self.assertNotEqual(js(MATH, f'm.curl2(m.FIELDS.{name},1,1)'), 0)

    def test_potentials(self):
        h = 1e-6
        for name in ('a', 'b', 'c'):
            for x, y in ((1, 1), (-2, 3), (0.5, -1.5)):
                got = js(MATH, f'(()=>{{const p=m.POTENTIALS.{name};const F=p.F({x},{y});return [F[0],F[1],(p.f({x}+{h},{y})-p.f({x}-{h},{y}))/{2*h},(p.f({x},{y}+{h})-p.f({x},{y}-{h}))/{2*h}];}})()')
                self.assertAlmostEqual(got[0], got[2], places=5)
                self.assertAlmostEqual(got[1], got[3], places=5)

    def test_gravity_work_only_depends_on_the_drop(self):
        G = 9.8
        for name in ('hill', 'dip', 'wavy'):
            for a, b in ((-5, 4), (-3, 0.5), (2, -4)):
                got = js(MATH, f'[m.gravityWork(m.TRACKS.{name},500,{a},{b}),m.TRACKS.{name}.h({a}),m.TRACKS.{name}.h({b})]')
                self.assertAlmostEqual(got[0], 500 * G * (got[1] - got[2]), places=3, msg=(name, a, b))

    def test_track_slopes_match_heights(self):
        h = 1e-6
        for name in ('hill', 'dip', 'wavy'):
            for x in (-4.3, -1, 0.5, 2.2, 5):
                got = js(MATH, f'[m.TRACKS.{name}.dh({x}),(m.TRACKS.{name}.h({x}+{h})-m.TRACKS.{name}.h({x}-{h}))/{2*h}]')
                self.assertAlmostEqual(got[0], got[1], places=5)
