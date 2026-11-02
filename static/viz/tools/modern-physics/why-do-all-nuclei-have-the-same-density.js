import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot, label } from '../../lib/draw.js';
import { sig, fixed } from '../../lib/format.js';
import { radiusFm, densityKg } from './_nucleus.js';

// Top: A nucleons packed at equal spacing (a flat, 2D picture of a 3D ball). Bottom: density against A.
// If R grew like A (not A^1/3) the density would fall as 1/A².
const state = { A: 56 };
const sunflower = (k) => { const a = k * 2.399963; const r = Math.sqrt(k); return [r * Math.cos(a), r * Math.sin(a)]; };

const tool = createTool({
  state,
  label: 'Top: a cluster of dots, one per nucleon, packed with the same spacing whatever their number, so a bigger nucleus is a bigger ball. Bottom: a graph of density against mass number. A solid line stays flat at 2.3 times 10 to the 17 kilograms per cubic metre. A dashed line shows how density would fall if the radius grew in proportion to A instead.',
  setup: (stage, c) => createPlot(stage, { x: [0, 240], y: [0, 4], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.55, w: g.w, h: g.h * 0.45 }) }),
  draw(ctx, stage, c, plot) {
    const cy = stage.h * 0.27;
    const cx = stage.w / 2;
    const s = Math.min(stage.w * 0.46, stage.h * 0.24) / Math.sqrt(240); // spacing: the same for every A
    const R = s * Math.sqrt(state.A + 0.5);
    ctx.fillStyle = c.fillY;
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let k = 1; k <= state.A; k++) {
      const [x, y] = sunflower(k);
      dot(ctx, cx + x * s, cy + y * s, Math.max(1.6, s * 0.38), k % 2 ? c.a : c.b, c.ink, 1);
    }
    label(ctx, `A = ${state.A}`, 40, 14, c, { size: 11, patch: false });
    plot.axes({ xLabel: 'A', yLabel: 'ρ (10¹⁷ kg/m³)' });
    plot.fn((A) => 2.3 * (56 / Math.max(A, 1)) ** 2, { color: c.b, dash: [6, 5], width: 2, domain: [1, 240] });
    plot.fn((A) => densityKg(Math.max(A, 1)) / 1e17, { color: c.a });
    plot.point(state.A, densityKg(state.A) / 1e17, { fill: c.a, r: 7 });
    plot.text('if R ∝ A', 150, 0.35, { size: 10 });
  },
  controls: () => [
    { title: 'Grow a nucleus' },
    { key: 'A', label: 'Mass number A', min: 4, max: 238, step: 1 },
    { readout: [
      ['Radius R = R₀A^⅓', (s) => `${fixed(radiusFm(s.A), 2)} fm`],
      ['Volume ÷ one nucleon', (s) => `${fixed((radiusFm(s.A) / radiusFm(1)) ** 3, 1)}`],
      ['Density ρ', (s) => `${sig(densityKg(s.A), 3)} kg/m³`],
    ] },
  ],
  tex: (s) => `\\rho=\\dfrac{A\\,u}{\\frac{4}{3}\\pi R_0^3A}=${sig(densityKg(s.A) / 1e17, 3)}\\times10^{17}\\ \\text{kg/m}^3`,
});

tool.update();
