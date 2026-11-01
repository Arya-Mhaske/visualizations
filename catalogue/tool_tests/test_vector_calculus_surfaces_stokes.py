"""Facts shown by the Surfaces & Flux and Stokes & Divergence tools, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vector-calculus/_vector-calculus-math.js'


@needs_node
class SurfaceTests(SimpleTestCase):
    def test_tangent_vectors_match_finite_differences(self):
        h = 1e-6
        for name in ('sphere', 'torus', 'cylinder', 'cone', 'MOBIUS', 'BAND'):
            S = f'm.SURFACES.{name}' if name.islower() else f'm.{name}'
            for u, v in ((0.7, 0.9), (2.4, 0.5), (4.0, 1.2)):
                got = js(MATH, f'(()=>{{const S={S};const a=S.r({u}+{h},{v}),b=S.r({u}-{h},{v}),c=S.r({u},{v}+{h}),d=S.r({u},{v}-{h});'
                               f'return [S.ru({u},{v}),S.rv({u},{v}),a.map((x,i)=>(x-b[i])/{2*h}),c.map((x,i)=>(x-d[i])/{2*h})];}})()')
                for i in range(3):
                    self.assertAlmostEqual(got[0][i], got[2][i], places=5, msg=(name, u, v))
                    self.assertAlmostEqual(got[1][i], got[3][i], places=5, msg=(name, u, v))

    def test_areas(self):
        self.assertAlmostEqual(js(MATH, 'm.SURFACES.sphere.area'), 4 * math.pi * 4)
        self.assertAlmostEqual(js(MATH, 'm.SURFACES.torus.area'), 4 * math.pi ** 2 * 2 * 0.8)
        self.assertAlmostEqual(js(MATH, 'm.SURFACES.cylinder.area'), 2 * math.pi * 2 * 3)
        self.assertAlmostEqual(js(MATH, 'm.SURFACES.cone.area'), math.pi * 2 * 2 * math.sqrt(2))
        for name, tol in (('sphere', 2e-3), ('torus', 2e-3), ('cylinder', 1e-9), ('cone', 1e-9)):
            exact = js(MATH, f'm.SURFACES.{name}.area')
            got = js(MATH, f'm.surfArea(m.SURFACES.{name}, 60)')
            self.assertLess(abs(got - exact) / exact, tol, msg=name)

    def test_flux_depends_on_cos_of_the_tilt(self):
        for a in (0, 30, 60, 90):
            r = math.radians(a)
            got = js(MATH, f'm.tiltFlux(3,2,{r})')
            self.assertAlmostEqual(got, 3 * 4 * math.cos(r), places=12)
        self.assertAlmostEqual(js(MATH, 'm.tiltFlux(3,2,Math.PI/2)'), 0, places=12)

    def test_sheet_mass(self):
        def mass(n):
            h = 4 / n
            s = 0
            for i in range(n):
                for j in range(n):
                    x, y = -2 + (i + 0.5) * h, -2 + (j + 0.5) * h
                    s += (2 + 0.5 * x + 0.25 * y) * math.sqrt(1 + (0.3 * x) ** 2 + (0.3 * y) ** 2) * h * h
            return s
        for n in (1, 4, 14, 60):
            self.assertAlmostEqual(js(MATH, f'm.sheetMass({n})'), mass(n), places=9)
        self.assertGreater(js(MATH, 'm.sheetArea(100)'), 16)
        self.assertLess(abs(js(MATH, 'm.sheetMass(300)') - mass(60)), 0.01)

    def test_mobius_normal_comes_back_flipped_and_the_band_does_not(self):
        start = js(MATH, 'm.unitNormal(m.MOBIUS,0,0)')
        end = js(MATH, 'm.unitNormal(m.MOBIUS,m.TAU,0)')
        self.assertAlmostEqual(sum(a * b for a, b in zip(start, end)), -1.0, places=9)
        bs = js(MATH, 'm.unitNormal(m.BAND,0,0)')
        be = js(MATH, 'm.unitNormal(m.BAND,m.TAU,0)')
        self.assertAlmostEqual(sum(a * b for a, b in zip(bs, be)), 1.0, places=9)

    def test_mobius_normal_varies_smoothly(self):
        got = js(MATH, '(()=>{let worst=1;let last=m.unitNormal(m.MOBIUS,0,0);for(let i=1;i<=400;i++){const n=m.unitNormal(m.MOBIUS,i/400*m.TAU,0);worst=Math.min(worst,m.dot(n,last));last=n;}return worst;})()')
        self.assertGreater(got, 0.999)


@needs_node
class StokesTests(SimpleTestCase):
    def test_every_net_catches_the_same_curl(self):
        for h in (0, 1.5, 3):
            for k in (-1, 0, 1):
                self.assertAlmostEqual(js(MATH, f'm.domeFlux({h},{k})'), 8 * math.pi, delta=2e-3 * 8 * math.pi, msg=(h, k))
        self.assertAlmostEqual(js(MATH, 'm.rimCirculation()'), 8 * math.pi, places=9)

    def test_dome_rim_and_slopes(self):
        for h, k in ((1.5, 0), (2, -1)):
            self.assertAlmostEqual(js(MATH, f'm.domeZ({h},{k},2,0)'), 0, places=12)
            self.assertAlmostEqual(js(MATH, f'm.domeZ({h},{k},0,2)'), 0, places=12)
            eps = 1e-6
            for x, y in ((0.4, 0.7), (-1, 0.3)):
                got = js(MATH, f'[m.domeZx({h},{k},{x},{y}),m.domeZy({h},{k},{x},{y}),(m.domeZ({h},{k},{x}+{eps},{y})-m.domeZ({h},{k},{x}-{eps},{y}))/{2*eps},(m.domeZ({h},{k},{x},{y}+{eps})-m.domeZ({h},{k},{x},{y}-{eps}))/{2*eps}]')
                self.assertAlmostEqual(got[0], got[2], places=5)
                self.assertAlmostEqual(got[1], got[3], places=5)

    def test_rim_circulation_by_python(self):
        # F = (−y + z, x, y) on the circle r = 2, z = 0: F·dr = (−y)(−2 sin t) + x(2 cos t) = 4
        n = 20000
        total = sum(4 * (2 * math.pi / n) for _ in range(n))
        self.assertAlmostEqual(total, 8 * math.pi, places=9)

    def test_outflow_equals_the_sources_inside(self):
        for R in (1, 2, 3):
            V = 4 / 3 * math.pi * R ** 3
            for c in (-2, 0, 1):
                self.assertAlmostEqual(js(MATH, f'm.sphereFlux(m.FIELDS3.source.F,[{c},0,0],{R},48)'), 3 * V, delta=2e-3 * 3 * V)
                self.assertAlmostEqual(js(MATH, f'm.sphereFlux(m.FIELDS3.squeeze.F,[{c},0,0],{R},48)'), 0, delta=2e-3 * V)
                self.assertAlmostEqual(js(MATH, f'm.sphereFlux(m.FIELDS3.side.F,[{c},0,0],{R},48)'), 2 * c * V, delta=2e-3 * V * 2 + 1e-3)

    def test_big_idea_both_sides_agree(self):
        for s in (1, 1.5, 2, 3):
            ftc, green, stokes, gauss = (js(MATH, f'm.BIG.{n}({s})') for n in ('ftc', 'green', 'stokes', 'gauss'))
            self.assertAlmostEqual(ftc[0], s ** 3, places=9)
            self.assertAlmostEqual(ftc[1], s ** 3, places=9)
            self.assertAlmostEqual(green[0], s ** 2 + s ** 3, places=7)
            self.assertAlmostEqual(green[1], s ** 2 + s ** 3, places=7)
            self.assertAlmostEqual(stokes[0], 2 * math.pi * s ** 2, places=5)
            self.assertAlmostEqual(stokes[1], 2 * math.pi * s ** 2, delta=2e-3 * 2 * math.pi * s ** 2)
            self.assertAlmostEqual(gauss[0], 3 * s ** 3, places=9)
            self.assertAlmostEqual(gauss[1], 3 * s ** 3, places=9)

    def test_gauss_law(self):
        for R in (1.5, 2.5, 3.5):
            for px in range(-4, 5):
                got = js(MATH, f'm.chargeFlux(1,{px},{R},120)')
                self.assertAlmostEqual(got, 1.0 if abs(px) < R else 0.0, delta=5e-3, msg=(R, px))
        # more charge, more flux; sign follows the charge
        self.assertAlmostEqual(js(MATH, 'm.chargeFlux(-4,1,2.5,120)'), -4.0, delta=0.02)
        self.assertAlmostEqual(js(MATH, 'm.EPS0'), 8.854e-12)
        self.assertAlmostEqual(3e-9 / 8.854e-12, 338.8, delta=0.1)
