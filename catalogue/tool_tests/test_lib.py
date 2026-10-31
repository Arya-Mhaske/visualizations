"""The shared library: pure parts checked under Node."""
import math

from django.test import SimpleTestCase

from .helpers import js, needs_node


@needs_node
class FormatTests(SimpleTestCase):
    def test_numbers(self):
        got = js('lib/format.js', "[m.sig(57.2958,3),m.sig(0,3),m.sig(3e8,2),m.fixed(-0.0001,2),m.fixed(2.50,2),"
                                  "m.sci(0.000123,2),m.deg(57.296,1),m.withUnit(9.8,'m/s²',2),m.frac(0.75),m.sig(-1.5,2)]")
        self.assertEqual(got, ['57.3', '0', '3.0 ×10⁸', '0', '2.5', '1.2 ×10⁻⁴', '57.3°', '9.8 m/s²', {'p': 3, 'q': 4}, '−1.5'])

    def test_pi_multiples(self):
        got = js('lib/format.js', "[m.piFrac(Math.PI*3/4),m.piFrac(Math.PI),m.piFrac(-Math.PI/2),m.piFrac(0),m.piFrac(1)]")
        self.assertEqual(got, ['3π/4', 'π', '−π/2', '0', None])


@needs_node
class PlotTests(SimpleTestCase):
    def test_nice_steps_and_ticks(self):
        got = js('lib/plot.js', '[m.niceStep(10,5),m.niceStep(1,5),m.tickValues(-1,1,0.5)]')
        self.assertEqual(got, [2, 0.2, [-1, -0.5, 0, 0.5, 1]])

    def test_asymptote_splits_the_curve(self):
        pieces = js('lib/plot.js', 'm.sample(x=>1/x,-1,1,{yRange:[-10,10]}).map(p=>[p[0][0],p[p.length-1][0]])')
        self.assertEqual(len(pieces), 2)
        self.assertLess(pieces[0][1], 0)
        self.assertGreater(pieces[1][0], 0)

    def test_tangent_has_a_break_at_each_pole(self):
        count = js('lib/plot.js', 'm.sample(Math.tan,-5,5,{yRange:[-6,6]}).length')
        self.assertEqual(count, 5)  # four poles, ±π/2 and ±3π/2, make five pieces

    def test_smooth_curve_is_one_piece(self):
        self.assertEqual(js('lib/plot.js', 'm.sample(Math.sin,-6,6,{yRange:[-2,2]}).length'), 1)


@needs_node
class SimTests(SimpleTestCase):
    def test_verlet_holds_shm_energy(self):
        script = ('(()=>{let s={t:0,x:[1],v:[0]};const a=x=>[-x[0]];'
                  'for(let i=0;i<100000;i++)s=m.verletStep(s,a,0.01);return s.x[0]**2+s.v[0]**2})()')
        self.assertAlmostEqual(js('lib/sim.js', script), 1, places=3)

    def test_rk4_matches_exponential(self):
        script = '(()=>{let s={t:0,y:[1]};for(let i=0;i<100;i++)s=m.rk4Step(s,(t,y)=>y,0.01);return s.y[0]})()'
        self.assertAlmostEqual(js('lib/sim.js', script), math.e, places=8)


@needs_node
class OtherTests(SimpleTestCase):
    def test_rng_repeats_and_stays_in_range(self):
        got = js('lib/rng.js', '(()=>{const a=m.createRng(7),b=m.createRng(7);const x=[...Array(50)].map(()=>a.next());'
                               'const y=[...Array(50)].map(()=>b.next());return [x.join()===y.join(),Math.min(...x)>=0,'
                               'Math.max(...x)<1,m.createRng(3).shuffle([1,2,3,4]).sort().join()]})()')
        self.assertEqual(got, [True, True, True, '1,2,3,4'])

    def test_cross_product_is_right_handed(self):
        self.assertEqual(js('lib/vec.js', 'm.v3.cross([1,0,0],[0,1,0])'), [0, 0, 1])

    def test_camera_keeps_z_up_and_preserves_length(self):
        got = js('lib/project3d.js', 'm.rotation(0.7,0.4)([0,0,1])')
        self.assertAlmostEqual(math.hypot(*got), 1)
        self.assertEqual(got[0], 0)
        self.assertGreater(got[1], 0)

    def test_split_quad_counts(self):
        self.assertEqual(js('lib/project3d.js', 'm.splitQuad([[0,0,0],[1,0,0],[1,1,0],[0,1,0]],3).length'), 9)

    def test_drill_marks_answers(self):
        got = js('lib/drill.js', '[m.isRight({options:[1],answer:2},2),m.isRight({answer:9.8,tolerance:0.05},9.81),'
                                 'm.isRight({answer:9.8},9.81)]')
        self.assertEqual(got, [True, True, False])
