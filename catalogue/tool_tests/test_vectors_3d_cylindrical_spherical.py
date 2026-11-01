"""Every fact the Cylindrical & Spherical Coordinates tools show, worked out in Python, then checked against the JS module."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node

MATH = 'tools/vectors-3d/_cylindrical-spherical-math.js'


@needs_node
class ModuleTests(SimpleTestCase):
    def test_default_point(self):
        # (2, 3, 4): r = sqrt(13), ρ = sqrt(29), θ = atan2(3, 2), φ = acos(4 / sqrt(29))
        cy = js(MATH, 'm.toCylindrical(2,3,4)')
        self.assertAlmostEqual(cy['r'], math.sqrt(13), places=12)
        self.assertAlmostEqual(cy['theta'], math.atan2(3, 2), places=12)
        sp = js(MATH, 'm.toSpherical(2,3,4)')
        self.assertAlmostEqual(sp['rho'], math.sqrt(29), places=12)
        self.assertAlmostEqual(sp['phi'], math.acos(4 / math.sqrt(29)), places=12)

    def test_round_trip_over_a_grid(self):
        for x in range(-4, 5):
            for y in range(-4, 5):
                for z in range(-4, 5):
                    if (x, y, z) == (0, 0, 0):
                        continue
                    sp = js(MATH, f'm.toSpherical({x},{y},{z})')
                    back = js(MATH, f'm.fromSpherical({sp["rho"]},{sp["theta"]},{sp["phi"]})')
                    for g, e in zip(back, (x, y, z)):
                        self.assertAlmostEqual(g, e, places=9)
                    cy = js(MATH, f'm.toCylindrical({x},{y},{z})')
                    back = js(MATH, f'm.fromCylindrical({cy["r"]},{cy["theta"]},{cy["z"]})')
                    for g, e in zip(back, (x, y, z)):
                        self.assertAlmostEqual(g, e, places=9)
                    self.assertGreaterEqual(sp['phi'], 0)
                    self.assertLessEqual(sp['phi'], math.pi)

    def test_surfaces_are_one_equation(self):
        # on the cylinder x² + y² = 9, r = 3 for every θ and z; on the sphere ρ = 2 for every θ and φ
        for theta in range(0, 360, 35):
            for z in (-3, 0, 1.5):
                p = js(MATH, f'm.fromCylindrical(3,{math.radians(theta)},{z})')
                self.assertAlmostEqual(p[0] ** 2 + p[1] ** 2, 9, places=9)
        for phi in range(0, 181, 30):
            p = js(MATH, f'm.fromSpherical(2,{math.radians(45)},{math.radians(phi)})')
            self.assertAlmostEqual(sum(v * v for v in p), 4, places=9)

    def test_ring_radius_never_negative(self):
        for phi in range(0, 181, 5):
            self.assertGreaterEqual(math.sin(math.radians(phi)), 0)
        self.assertAlmostEqual(js(MATH, 'm.fromSpherical(1,0,Math.PI)')[2], -1)

    def test_latitude_and_pune(self):
        self.assertEqual(js(MATH, 'm.phiFromLatitude(18.5204)'), 90 - 18.5204)
        self.assertEqual(js(MATH, 'm.thetaFromLongitude(-30)'), 330)
        self.assertAlmostEqual(js(MATH, 'm.thetaFromLongitude(73.8567)'), 73.8567, places=9)
        # Pune on a globe of 6371 km: height is ρ cos φ = ρ sin(latitude)
        p = js(MATH, 'm.fromSpherical(6371, m.rad(73.8567), m.rad(m.phiFromLatitude(18.5204)))')
        self.assertAlmostEqual(p[2], 6371 * math.sin(math.radians(18.5204)), places=6)
        self.assertAlmostEqual(math.hypot(p[0], p[1]), 6371 * math.cos(math.radians(18.5204)), places=6)
        self.assertAlmostEqual(math.sqrt(sum(v * v for v in p)), 6371, places=6)
