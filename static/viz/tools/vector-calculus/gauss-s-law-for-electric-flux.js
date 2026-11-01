import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { sci } from '../../lib/format.js';
import { chargeFlux, insideSphere, EPS0, norm, dot, TAU } from './_vector-calculus-math.js';

const state = { q: 3, px: 1, R: 2.5 };
// The charge is q nC; flux in N m²/C is q / ε0 when the charge is inside.
const nC = 1e-9;
const flux = (s) => (s.q * nC * chargeFlux(1, s.px, s.R, 120)) / EPS0;
const expected = (s) => (insideSphere(s.px, s.R) ? (s.q * nC) / EPS0 : 0);
const zero = (v) => (Math.abs(v) < 1 ? 0 : v);
const show = (v) => (v === 0 ? '0' : sci(v, 3));

const tool = createTool({
  state,
  label: 'A charge and an imaginary closed sphere around the origin. Field arrows at points on the sphere are green where they leave and blue where they enter. Only a charge inside makes a net flux.',
  setup: (stage, c) => createCamera(stage, { extent: 6.4, yaw: 0.75, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const { q, px, R } = state;
    cam.axes({ size: 5.2 });
    const ring = (f) => {
      let last = f(0);
      for (let i = 1; i <= 48; i++) { const p = f(i / 48); cam.line(last, p, { color: c.grid, width: 1.5 }); last = p; }
    };
    for (let a = 0; a < 180; a += 30) ring((u) => [R * Math.sin(u * TAU) * Math.cos((a * Math.PI) / 180), R * Math.sin(u * TAU) * Math.sin((a * Math.PI) / 180), R * Math.cos(u * TAU)]);
    ring((u) => [R * Math.cos(u * TAU), R * Math.sin(u * TAU), 0]);
    for (let i = 1; i <= 5; i++) for (let j = 0; j < 8; j++) {
      const phi = (i / 6) * Math.PI;
      const th = (j / 8) * TAU + 0.2;
      const n = [Math.sin(phi) * Math.cos(th), Math.sin(phi) * Math.sin(th), Math.cos(phi)];
      const pt = [R * n[0], R * n[1], R * n[2]];
      const d = [pt[0] - px, pt[1], pt[2]];
      const r = norm(d);
      const E = d.map((v) => (q * v) / r ** 3);
      const out = dot(E, n);
      const len = Math.min(1.1, 2.2 / r ** 2) * Math.sign(q || 1);
      const e = d.map((v) => (v / r) * len);
      cam.arrow(pt, pt.map((v, k) => v + e[k]), { color: out >= 0 ? c.c : c.b, width: 3 });
    }
    cam.point([px, 0, 0], { fill: q > 0 ? c.a : q < 0 ? c.b : c.ink, r: 9 });
  },
  controls: [
    { title: 'Charge and Gaussian sphere' },
    { key: 'q', label: 'Charge q (nC)', min: -5, max: 5, step: 1 },
    { key: 'px', label: 'Charge position x (m)', min: -4, max: 4, step: 1 },
    { key: 'R', label: 'Sphere radius (m)', options: [[1.5, '1.5 m'], [2.5, '2.5 m'], [3.5, '3.5 m']] },
    { readout: [
      ['Charge inside?', (s) => (insideSphere(s.px, s.R) ? 'yes' : 'no')],
      ['Flux through the sphere', (s) => `${show(zero(flux(s)))} N m²/C`],
      ['q / ε₀', (s) => `${show((s.q * nC) / EPS0)} N m²/C`],
    ] },
  ],
  tex: () => '\\oint_S \\mathbf{E}\\cdot\\mathbf{n}\\,dS = \\dfrac{q_{\\text{enclosed}}}{\\varepsilon_0}',
});
tool.extra.orbit(tool.update);
