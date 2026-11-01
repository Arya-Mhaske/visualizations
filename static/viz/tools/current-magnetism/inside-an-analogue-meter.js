import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc, arrow, line, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { deflection } from './_loops-meters-math.js';

const AREA = 1e-3; // m², one turn of the coil
const PHI_MAX = Math.PI / 2; // the dial covers 90°
const state = { N: 50, I: 1.2, B: 0.1, k: 10 };
const magnetic = (s) => s.N * (s.I / 1000) * AREA * s.B * 1e6; // μN m
const phi = (s) => deflection(s.N, s.I / 1000, AREA, s.B, s.k * 1e-6);
const deg = (r) => (r * 180) / Math.PI;

const tool = createTool({
  state,
  label: 'Top: a dial with a needle that turns through the angle phi. Bottom: a graph of torque against angle. A flat coral line is the magnetic torque on the coil, which stays the same at every angle. A blue sloping line is the spring torque, k times phi. The needle stops where the lines cross.',
  setup: (stage, c) => createPlot(stage, { x: [0, 90], y: [0, 40], c, pad: 30, box: (g) => ({ x: 0, y: g.h * 0.42, w: g.w, h: g.h * 0.58 }) }),
  draw(ctx, stage, c, plot) {
    const cx = stage.w / 2;
    const cy = stage.h * 0.36;
    const R = Math.min(stage.w * 0.35, stage.h * 0.3);
    const a0 = -Math.PI / 2 - Math.PI / 4;
    arc(ctx, cx, cy, R, a0, a0 + PHI_MAX, { color: c.ink, width: 3 });
    for (let i = 0; i <= 9; i++) {
      const a = a0 + (i / 9) * PHI_MAX;
      line(ctx, cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86, cx + Math.cos(a) * R, cy + Math.sin(a) * R, { color: c.ink, width: 2 });
    }
    const f = Math.min(phi(state), PHI_MAX * 1.05);
    const a = a0 + f;
    arrow(ctx, cx, cy, cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9, { color: phi(state) > PHI_MAX ? c.a : c.b, width: 5, head: 12 });
    label(ctx, phi(state) > PHI_MAX ? 'off scale' : `φ = ${fixed(deg(phi(state)), 1)}°`, cx, cy + 20, c, { color: c.ink, size: 12 });
    plot.axes({ xLabel: 'φ (°)', yLabel: 'τ (μN m)' });
    plot.fn(() => magnetic(state), { color: c.a, domain: [0, 90] });
    plot.fn((d) => state.k * ((d * Math.PI) / 180), { color: c.b, domain: [0, 90] });
    const d = deg(phi(state));
    if (d <= 90) plot.point(d, magnetic(state), { fill: c.fillY, r: 8 });
  },
  controls: () => [
    { title: 'A moving-coil meter' },
    { key: 'I', label: 'Current, I', min: 0, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} mA` },
    { key: 'N', label: 'Turns, N', min: 20, max: 100, step: 10 },
    { key: 'B', label: 'Magnet field, B', min: 0.05, max: 0.3, step: 0.05, format: (n) => `${fixed(n, 2)} T` },
    { key: 'k', label: 'Spring constant, k', min: 5, max: 20, step: 1, format: (n) => `${n} μN m/rad` },
    { readout: [
      ['Magnetic torque, NIAB', (s) => `${sig(magnetic(s), 3)} μN m`],
      ['Deflection, φ', (s) => `${sig(deg(phi(s)), 3)}°`],
      ['Double I, φ becomes', (s) => `${sig(2 * deg(phi(s)), 3)}°`],
    ] },
  ],
  tex: (s) => `k\\varphi=NIAB\\ \\Rightarrow\\ \\varphi=\\dfrac{NIAB}{k}=${sig(deg(phi(s)), 3)}^\\circ`,
});
tool.update();
