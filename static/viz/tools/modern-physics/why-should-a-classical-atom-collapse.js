import { createTool } from '../../lib/tool.js';
import { dot, label, poly } from '../../lib/draw.js';
import { sig } from '../../lib/format.js';
import { C } from './_mp.js';

// A classical electron radiates Larmor power, so r(t) = r0 (1 - t/T)^(1/3) with T = r0^3 / (4 re^2 c).
// For r0 = 0.529 angstrom, T = 1.56e-11 s. The orbit frequency grows as r^-1.5. Real turns number ~1e5:
// the picture draws a few turns, and says so.
const RE = 2.818e-15; // classical electron radius, m
const A0 = 0.529e-10;
const F1 = 6.58e15; // orbit frequency at n = 1, Hz
const state = { n: 1, u: 0.3 };
const T = (n) => (A0 * n * n) ** 3 / (4 * RE * RE * C);
const radius = (s) => A0 * s.n * s.n * (1 - s.u) ** (1 / 3);
const freq = (s) => (F1 / s.n ** 3) * (1 - s.u) ** -0.5;
const TURNS = 8;

const tool = createTool({
  state,
  label: 'A spiral. An electron starts on a circular orbit around a central nucleus and, as time passes, spirals inwards to the nucleus. The slider sets how far through the collapse we are; the coral dot is the electron now and the spiral behind it is its path.',
  draw(ctx, stage, c) {
    const R = Math.min(stage.w, stage.h) / 2 - 14;
    const cx = stage.w / 2;
    const cy = stage.h / 2;
    const pts = [];
    const steps = 400;
    for (let i = 0; i <= steps; i++) {
      const s = (state.u * i) / steps;
      const r = R * (1 - s) ** (1 / 3);
      const th = TURNS * 2 * Math.PI * (1 - Math.sqrt(1 - s));
      pts.push([cx + r * Math.cos(th), cy - r * Math.sin(th)]);
    }
    poly(ctx, pts, { stroke: c.b, width: 2, closed: false });
    const [ex, ey] = pts[pts.length - 1];
    dot(ctx, cx, cy, 7, c.fillY, c.ink);
    dot(ctx, ex, ey, 8, c.a, c.ink);
    label(ctx, '+', cx, cy, c, { size: 11, patch: false });
    label(ctx, `drawn: ${TURNS} turns. Real: ~100 000`, stage.w / 2, 14, c, { size: 10, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Let the electron radiate' },
    { key: 'n', label: 'Starting orbit n', min: 1, max: 4, step: 1 },
    { key: 'u', label: 'Time through the collapse', min: 0, max: 0.999, step: 0.001, format: (v) => `${sig(v * 100, 3)}%` },
    { readout: [
      ['Collapse time', (s) => `${sig(T(s.n) * 1e12, 3)} ps`],
      ['Time elapsed', (s) => `${sig(s.u * T(s.n) * 1e12, 3)} ps`],
      ['Orbit radius', (s) => `${sig(radius(s) * 1e10, 3)} Å`],
      ['Light given out, ν', (s) => `${sig(freq(s) / 1e15, 3)} ×10¹⁵ Hz`],
      ['Wavelength', (s) => `${sig((C / freq(s)) * 1e9, 3)} nm`],
    ] },
  ],
  tex: (s) => `r(t)=r_0\\left(1-\\dfrac{t}{T}\\right)^{1/3},\\quad T=${sig(T(s.n) * 1e12, 3)}\\ \\text{ps}`,
});

tool.update();
