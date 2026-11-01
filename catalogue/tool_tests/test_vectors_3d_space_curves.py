"""Every fact the Space Curves & Motion tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vectors-3d/_space-curves-math.js'


@needs_node
class ModuleTests(SimpleTestCase):
    def test_derivatives_match_finite_differences(self):
        h = 1e-5
        for name in ('helix', 'spiral', 'bend'):
            for t in (1.0, 2.5, 4.0):
                got = js(MATH, f'(()=>{{const c=m.CURVES.{name};return [c.r({t}),c.v({t}),c.a({t}),c.r({t}+{h}),c.r({t}-{h}),c.v({t}+{h}),c.v({t}-{h})];}})()')
                r, v, a, rp, rm, vp, vm = got
                for i in range(3):
                    self.assertAlmostEqual(v[i], (rp[i] - rm[i]) / (2 * h), places=5, msg=(name, t))
                    self.assertAlmostEqual(a[i], (vp[i] - vm[i]) / (2 * h), places=5, msg=(name, t))

    def test_helix_curvature_and_speed(self):
        # r = (3 cos t, 3 sin t, 0.4 t): speed sqrt(9.16), curvature 3/9.16
        f = js(MATH, '(()=>{const f=m.frame(m.CURVES.helix,0.9);return [m.norm(f.v),f.kappa];})()')
        self.assertAlmostEqual(f[0], math.sqrt(9.16), places=9)
        self.assertAlmostEqual(f[1], 3 / 9.16, places=9)
        self.assertAlmostEqual(js(MATH, 'm.helixKappa(3,0.4)'), 3 / 9.16, places=12)

    def test_frame_is_orthonormal_and_b_is_t_cross_n(self):
        for name in ('helix', 'spiral', 'bend'):
            out = js(MATH, f'(()=>{{const f=m.frame(m.CURVES.{name},2.2);const b=m.cross(f.T,f.N);return [m.dot(f.T,f.N),m.dot(f.T,f.B),m.dot(f.N,f.B),m.norm(f.T),m.norm(f.N),m.norm(f.B),m.norm(m.sub(b,f.B))];}})()')
            for i, expected in enumerate([0, 0, 0, 1, 1, 1, 0]):
                self.assertAlmostEqual(out[i], expected, places=9, msg=(name, i))

    def test_acceleration_splits_into_tangent_and_normal(self):
        # a_T² + a_N² = |a|², and a_N = κ v²
        for name in ('helix', 'spiral', 'bend'):
            out = js(MATH, f'(()=>{{const c=m.CURVES.{name};const p=m.accelParts(c,2.2);return [p.aT,p.aN,m.norm(c.a(2.2)),p.kappa,p.speed];}})()')
            self.assertAlmostEqual(out[0] ** 2 + out[1] ** 2, out[2] ** 2, places=9)
            self.assertAlmostEqual(out[1], out[3] * out[4] ** 2, places=9)

    def test_braking_on_helix(self):
        out = js(MATH, 'm.braking(3,0.4,6,-3)')
        self.assertAlmostEqual(out['aN'], 36 * 3 / 9.16, places=9)
        self.assertEqual(out['aT'], -3)
        self.assertAlmostEqual(out['total'], math.hypot(3, 36 * 3 / 9.16), places=9)

    def test_helix_length(self):
        self.assertAlmostEqual(js(MATH, 'm.helixLength(2,0.5,2)'), 2 * math.pi * 2 * math.sqrt(4.25), places=9)
        # unrolled: base 2πan, height 2πbn
        self.assertAlmostEqual(math.hypot(2 * math.pi * 2 * 2, 2 * math.pi * 0.5 * 2), 4 * math.pi * math.sqrt(4.25), places=9)

    def test_kepler_equal_areas(self):
        for e in (0.0, 0.3, 0.6, 0.9):
            for t0 in (0.0, 0.05, 0.4):
                dt = 0.1
                a = js(MATH, f'm.sweptArea(m.eccentricAnomaly({2 * math.pi * t0},{e}),m.eccentricAnomaly({2 * math.pi * (t0 + dt)},{e}),{e})')
                b = js(MATH, f'm.sweptArea(m.eccentricAnomaly({2 * math.pi * (t0 + 0.5)},{e}),m.eccentricAnomaly({2 * math.pi * (t0 + 0.5 + dt)},{e}),{e})')
                self.assertAlmostEqual(a, b, places=9)
                self.assertAlmostEqual(a, 0.5 * math.sqrt(1 - e * e) * 2 * math.pi * dt, places=9)

    def test_kepler_equation_and_speed(self):
        E = js(MATH, 'm.eccentricAnomaly(1.3,0.6)')
        self.assertAlmostEqual(E - 0.6 * math.sin(E), 1.3, places=12)
        # vis-viva with GM = a = 1: v² = 2/r − 1, and r = 1 − e cos E
        r = 1 - 0.6 * math.cos(E)
        self.assertAlmostEqual(js(MATH, f'm.speedAt({E},0.6)') ** 2, 2 / r - 1, places=9)

    def test_sweep_area_matches_polygon_fan(self):
        e = 0.6
        E1, E2 = 0.4, 1.9
        n = 4000
        pts = [(math.cos(E1 + (E2 - E1) * i / n) - e, math.sqrt(1 - e * e) * math.sin(E1 + (E2 - E1) * i / n)) for i in range(n + 1)]
        area = sum(0.5 * (pts[i][0] * pts[i + 1][1] - pts[i + 1][0] * pts[i][1]) for i in range(n))
        self.assertAlmostEqual(js(MATH, f'm.sweptArea({E1},{E2},{e})'), area, places=6)
