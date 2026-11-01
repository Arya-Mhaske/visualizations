"""Every number the Coordinate Plane box shows, worked out in Python, then checked against the JS."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/functions-graphs/_coordinate-plane-math.js'


def area(pts):
    return abs(sum(p[0] * q[1] - q[0] * p[1] for p, q in zip(pts, pts[1:] + pts[:1]))) / 2


@needs_node
class DistanceMidpointTests(SimpleTestCase):
    def test_distance_midpoint_squares(self):
        cases = [((-3, -2), (3, 2)), ((0, 0), (3, 4)), ((-4, -3), (2, 5)), ((1, 1), (1, 7)), ((5, -2), (-5, -2))]
        for a, b in cases:
            self.assertAlmostEqual(js(MATH, f'm.distance({list(a)}, {list(b)})'), math.dist(a, b), places=12)
            self.assertEqual(js(MATH, f'm.midpoint({list(a)}, {list(b)})'), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2])
            sq = js(MATH, f'm.squares({list(a)}, {list(b)})')
            dx, dy = b[0] - a[0], b[1] - a[1]
            self.assertEqual(sq, {'dx2': dx * dx, 'dy2': dy * dy, 'd2': dx * dx + dy * dy})
            self.assertAlmostEqual(math.sqrt(sq['d2']), math.dist(a, b), places=12)
        self.assertEqual(js(MATH, 'm.distance([0, 0], [3, 4])'), 5)
        self.assertEqual(round(math.dist((-3, -2), (3, 2)), 4), 7.2111)  # default view

    def test_squares_drawn_on_the_sides_have_the_right_areas(self):
        for a, b in (((-3, -2), (3, 2)), ((2, 5), (-4, -3)), ((0, 0), (3, 4))):
            corner = (b[0], a[1])
            for p, q, third in ((a, corner, b), (corner, b, a), (a, b, corner)):
                pts = js(MATH, f'm.squareOn({list(p)}, {list(q)}, {list(third)})')
                self.assertAlmostEqual(area(pts), math.dist(p, q) ** 2, places=9)
                self.assertAlmostEqual(js(MATH, f'm.polygonArea(m.squareOn({list(p)}, {list(q)}, {list(third)}))'), math.dist(p, q) ** 2, places=9)
                # the square lies on the far side of the side from the third vertex
                far = pts[2]
                side = (q[0] - p[0]) * (third[1] - p[1]) - (q[1] - p[1]) * (third[0] - p[0])
                out = (q[0] - p[0]) * (far[1] - p[1]) - (q[1] - p[1]) * (far[0] - p[0])
                if side:
                    self.assertLess(side * out, 0)


@needs_node
class CircleTests(SimpleTestCase):
    def test_equation_matches_distance(self):
        for h, k, r in ((1, -1, 4), (0, 0, 5), (-3, 2, 3)):
            for deg in (0, 40, 90, 215, 359):
                p = (h + r * math.cos(math.radians(deg)), k + r * math.sin(math.radians(deg)))
                got = js(MATH, f'm.circlePoint([{h}, {k}], {r}, {math.radians(deg)!r})')
                self.assertAlmostEqual(got[0], p[0], places=12)
                self.assertAlmostEqual(got[1], p[1], places=12)
                self.assertAlmostEqual((p[0] - h) ** 2 + (p[1] - k) ** 2, r * r, places=9)
                self.assertTrue(js(MATH, f'm.onCircle({got}, [{h}, {k}], {r}, 1e-9)'))
        self.assertLess(js(MATH, 'm.circleGap([1, 0], [0, 0], 3)'), 0)  # inside
        self.assertGreater(js(MATH, 'm.circleGap([4, 0], [0, 0], 3)'), 0)  # outside
        self.assertEqual(js(MATH, 'm.circleGap([3, 4], [0, 0], 5)'), 0)

    def test_general_form(self):
        g = js(MATH, 'm.generalCircle(-4, 6, -12)')
        self.assertEqual((g['h'], g['k'], g['r2'], g['r'], g['kind']), (2, -3, 25, 5, 'circle'))
        # x^2 + y^2 - 4x + 6y - 12 vanishes on points at distance 5 from (2, -3)
        for deg in (0, 77, 200):
            x, y = 2 + 5 * math.cos(math.radians(deg)), -3 + 5 * math.sin(math.radians(deg))
            self.assertAlmostEqual(x * x + y * y - 4 * x + 6 * y - 12, 0, places=9)
        self.assertEqual(js(MATH, 'm.generalCircle(-4, 6, 13)')['kind'], 'point')  # r^2 = 13 - 13
        self.assertEqual(js(MATH, 'm.generalCircle(-4, 6, 20)')['kind'], 'empty')  # r^2 = -7
        self.assertEqual(js(MATH, 'm.generalCircle(-4, 6, 20)')['r2'], -7)
        # centre is at -D/2, -E/2 over the whole slider range
        for D in range(-12, 13, 4):
            for E in (-12, 0, 5):
                g = js(MATH, f'm.generalCircle({D}, {E}, 0)')
                self.assertEqual((g['h'], g['k']), (-D / 2, -E / 2))


@needs_node
class SymmetryTests(SimpleTestCase):
    def test_counts_and_names(self):
        want = {0: ['y'], 1: ['origin'], 2: ['x'], 3: []}
        for i, syms in want.items():
            self.assertEqual(js(MATH, f'm.symmetries(m.CURVES[{i}])'), syms)
        self.assertEqual(js(MATH, 'm.mirrorScore(m.CURVES[0], "y")'), 41)

    def test_scores_against_python(self):
        curves = [
            (lambda x, y: y - x * x + 3, lambda t: (t, t * t - 3), (-3, 3)),
            (lambda x, y: y - x ** 3 + 3 * x, lambda t: (t, t ** 3 - 3 * t), (-2.3, 2.3)),
            (lambda x, y: x - y * y + 2, lambda t: (t * t - 2, t), (-2.6, 2.6)),
            (lambda x, y: y - x * x - x + 2, lambda t: (t, t * t + t - 2), (-3, 2.5)),
        ]
        flips = {'y': lambda p: (-p[0], p[1]), 'x': lambda p: (p[0], -p[1]), 'origin': lambda p: (-p[0], -p[1])}
        for i, (rel, at, (a, b)) in enumerate(curves):
            for name, flip in flips.items():
                ok = sum(abs(rel(*flip(at(a + (b - a) * j / 40)))) <= 1e-9 for j in range(41))
                self.assertEqual(js(MATH, f'm.mirrorScore(m.CURVES[{i}], "{name}")'), ok, (i, name))


@needs_node
class LineTests(SimpleTestCase):
    def test_perpendicular_is_shortest(self):
        m, q, Q = 0.5, 1, (2, -3)
        # brute force: smallest distance over a fine grid of points on the line
        best = min(math.dist((x / 1000, m * x / 1000 + q), Q) for x in range(-20000, 20001))
        self.assertAlmostEqual(js(MATH, f'm.pointLine(m.lineFrom({m}, {q}), {list(Q)})'), best, places=5)
        foot = js(MATH, f'm.foot(m.lineFrom({m}, {q}), {list(Q)})')
        self.assertAlmostEqual(foot[1], m * foot[0] + q, places=12)  # the foot is on the line
        self.assertAlmostEqual((Q[0] - foot[0]) * 1 + (Q[1] - foot[1]) * m, 0, places=12)  # QF is square to the line
        # hypotenuse longer than the leg for any other point
        for x in (-6, -1, foot[0] + 0.3, 5):
            self.assertGreater(js(MATH, f'm.distToPoint({m}, {q}, {x!r}, {list(Q)})'), best)
        self.assertEqual(round(best, 2), 4.47)
        self.assertAlmostEqual(js(MATH, f'm.distToPoint({m}, {q}, {foot[0]!r}, {list(Q)})'), best, places=5)


@needs_node
class PlottingTests(SimpleTestCase):
    def test_tables_and_intercepts(self):
        funcs = js(MATH, 'm.FUNCS.map(f => ({id: f.id, xInt: f.xInt, y0: f.f(0), ys: f.order.map(x => f.f(x))}))')
        expect = {
            'line': (lambda x: 2 * x - 4, [2]),
            'parabola': (lambda x: x * x - 4, [-2, 2]),
            'cubic': (lambda x: x ** 3 - 4 * x, [-2, 0, 2]),
            'abs': (lambda x: abs(x) - 2, [-2, 2]),
        }
        order = [0, -2, 2, -1, 1, -3, 3]
        for f in funcs:
            fn, roots = expect[f['id']]
            self.assertEqual(f['xInt'], roots)
            self.assertEqual(f['y0'], fn(0))
            self.assertEqual(f['ys'], [fn(x) for x in order])
            for r in roots:
                self.assertEqual(fn(r), 0)  # every listed intercept really is a zero
        # every integer x from -3 to 3 appears exactly once, so every point fits its own y window and the roots are all in the table
        self.assertEqual(sorted(order), list(range(-3, 4)))
        self.assertEqual(js(MATH, 'm.tableOf(m.FUNCS[1], 3)'), [[0, -4], [-2, 0], [2, 0]])
        self.assertEqual(js(MATH, 'm.yIntercept(m.FUNCS[2])'), 0)
        for f in funcs:
            view = js(MATH, f"m.FUNCS.find(g => g.id === '{f['id']}').view")
            self.assertTrue(all(view[0] <= y <= view[1] for y in f['ys']), f['id'])
            self.assertTrue(all(r in order for r in f['xInt']))
