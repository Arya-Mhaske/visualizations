"""Every number the Intrinsic & Extrinsic Semiconductors box shows, worked out in Python, then checked against the JS."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/modern-physics/_intrinsic-extrinsic-semiconductors-math.js'
NI = 1.5e16
N_SI = 5e28


def quadratic(net, ni=NI):
    """n and p from n - p = net and n p = ni^2, solved by bisection on p (no formula shared with the JS)."""
    if net < 0:  # by symmetry: swap the roles of electrons and holes (avoids subtracting two huge numbers)
        n, p = quadratic(-net, ni)
        return p, n
    lo, hi = 0.0, max(abs(net), ni) * 2 + ni
    for _ in range(300):
        p = (lo + hi) / 2
        n = p + net
        if n * p > ni * ni:
            hi = p
        else:
            lo = p
    return p + net, p


@needs_node
class DopingTests(SimpleTestCase):
    def test_one_ppm_of_arsenic(self):
        donors = N_SI * 1e-6
        self.assertEqual(donors, 5e22)  # "5 x 10^22 donors"
        self.assertAlmostEqual(js(MATH, 'm.donorsFromPpm(1)') / donors, 1, places=12)
        self.assertEqual(round(donors / NI / 1e6, 1), 3.3)  # "about 3 million to one"
        # the break-even doping where donors equal thermal electrons, in ppm
        ppm = NI / N_SI * 1e6
        self.assertAlmostEqual(js(MATH, 'm.ppmFromDonors(1.5e16)') / ppm, 1, places=12)
        self.assertEqual(round(ppm * 1e7, 1), 3.0)  # 3 x 10^-7 ppm

    def test_holes_after_doping(self):
        n, p = quadratic(5e22)
        self.assertEqual(f'{p:.2e}', '4.50e+09')  # the summary's 4.5 x 10^9
        got = js(MATH, 'm.carriers(5e22)')
        self.assertAlmostEqual(got['n'] / n, 1, places=9)
        self.assertAlmostEqual(got['p'] / p, 1, places=6)
        # n x p = ni^2 for p-type and for light doping too
        for net in (-1e22, -1e18, 1e10, 1e16, 3e19):
            n, p = quadratic(net)
            got = js(MATH, f'm.carriers({net!r})')
            self.assertAlmostEqual(got['n'] / n, 1, places=6)
            self.assertAlmostEqual(got['p'] / p, 1, places=6)
            self.assertAlmostEqual(got['n'] * got['p'] / NI ** 2, 1, places=9)

    def test_germanium_constant(self):
        self.assertEqual(js(MATH, 'm.NI_GE'), 2.4e19)
        self.assertEqual(js(MATH, 'm.NI_SI'), 1.5e16)


@needs_node
class SettleTests(SimpleTestCase):
    @staticmethod
    def rk4(nd, tau, steps=40000):
        """dp/dt = r (ni^2 - p (p + nd)) with r (a + b) = 1, integrated directly."""
        a = quadratic(nd)[1]
        r = 1 / (2 * a + nd)
        f = lambda p: r * (NI ** 2 - p * (p + nd))
        p, h = NI, tau / steps
        for _ in range(steps):
            k1 = f(p); k2 = f(p + h * k1 / 2); k3 = f(p + h * k2 / 2); k4 = f(p + h * k3)
            p += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6
        return p

    def test_closed_form_matches_the_rate_equation(self):
        for nd in (5e22, 1e20, 1e18):
            for tau in (0, 3, 8, 14):
                want = self.rk4(nd, tau)
                got = js(MATH, f'm.settle({nd!r}, {tau!r}).p')
                self.assertAlmostEqual(got / want, 1, places=6, msg=(nd, tau))

    def test_start_and_end(self):
        start = js(MATH, 'm.settle(5e22, 0)')
        self.assertAlmostEqual(start['p'] / NI, 1, places=9)
        self.assertGreater(start['np'] / NI ** 2, 3e6)  # far too many pairs at the start
        end = js(MATH, 'm.settle(5e22, 30)')
        self.assertAlmostEqual(end['np'] / NI ** 2, 1, places=4)
        self.assertEqual(f"{end['p']:.2e}", '4.50e+09')
        self.assertGreater(end['lost'] / NI, 0.999999)


@needs_node
class HopAndNeutralityTests(SimpleTestCase):
    def test_hops_equal_one_positive_charge(self):
        for k in range(6):
            for direction in (1, -1):
                got = js(MATH, f'm.hopRow({k}, {direction})')
                self.assertEqual(got['vacancy'], 5 + direction * k)
                self.assertEqual(sum(got['moved']), k)  # k electrons each stepped once
                # sum of charge x displacement: k electrons, charge -1, each moved -direction
                self.assertEqual(sum(-1 * -direction for _ in range(k)), direction * k)
                self.assertEqual(js(MATH, f'm.dipoleShift({k}, {direction})'), direction * k)
                self.assertGreaterEqual(got['vacancy'], 0)
                self.assertLess(got['vacancy'], 11)

    def test_neutrality(self):
        for kind, fixed_sign in (('n', 1), ('p', -1)):
            for d in range(1, 11):
                got = js(MATH, f"m.neutrality({d}, '{kind}')")
                self.assertEqual(got, {'fixed': fixed_sign * d, 'mobile': -fixed_sign * d, 'net': 0})
                pulled = js(MATH, f"m.neutrality({d}, '{kind}', 2)")
                self.assertEqual(pulled['net'], fixed_sign * 2)

    def test_dopants(self):
        groups = {'P': 15, 'As': 15, 'Sb': 15, 'B': 13, 'Al': 13, 'In': 13}
        for d in js(MATH, 'm.DOPANTS'):
            self.assertEqual(d['group'], groups[d['sym']])
            self.assertEqual(d['valence'], groups[d['sym']] - 10)
            self.assertEqual(js(MATH, f"m.dopeKind({d['valence']})"), 'n' if d['valence'] == 5 else 'p')
        self.assertEqual(js(MATH, 'm.dopeKind(4)'), 'none')
