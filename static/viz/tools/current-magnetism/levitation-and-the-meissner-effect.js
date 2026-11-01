import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { lift, floatHeight, G_ACC } from './_magnetism-matter-math.js';

const state = { m: 1, M: 10 }; // A m², grams
const weight = (s) => (s.M / 1000) * G_ACC;
const hEq = (s) => floatHeight(s.m, s.M / 1000) * 1000; // mm
const H_MAX = 80; // mm

const tool = createTool({
  state,
  label: 'Top: a small magnet floating above a flat superconductor, with its field lines pushed aside. Bottom: a graph of the upward magnetic force divided by the weight, against height. The magnet floats where the curve crosses 1.',
  setup: (stage, c) => createPlot(stage, { x: [0, H_MAX], y: [0, 4], c, pad: 30, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const top = stage.h * 0.46;
    const slabY = top - 22;
    ctx.fillStyle = c.fillB;
    ctx.fillRect(14, slabY, stage.w - 28, 22);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(14, slabY, stage.w - 28, 22);
    label(ctx, 'superconductor (below Tc)', stage.w / 2, slabY + 11, c, { color: c.ink, size: 11, patch: false });
    const pxPerMm = (slabY - 24) / H_MAX;
    const h = Math.min(hEq(state), H_MAX);
    const cx = stage.w / 2;
    const my = slabY - h * pxPerMm - 22;
    ctx.fillStyle = c.fillA;
    ctx.fillRect(cx - 30, my, 60, 22);
    ctx.fillStyle = c.fillC;
    ctx.fillRect(cx, my, 30, 22);
    ctx.strokeRect(cx - 30, my, 60, 22);
    // field lines bending round the magnet and not entering the slab
    for (const side of [-1, 1]) {
      for (const k of [1, 2]) {
        ctx.beginPath();
        const w = 40 + k * 26;
        ctx.moveTo(cx + side * 12, my + 22);
        ctx.quadraticCurveTo(cx + side * w, slabY - 2, cx + side * (w + 20), slabY - 3);
        ctx.strokeStyle = c.grid;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    arrow(ctx, cx + 56, my + 11, cx + 56, my - 22, { color: c.c, width: 4, head: 10 });
    arrow(ctx, cx - 56, my + 11, cx - 56, my + 44, { color: c.a, width: 4, head: 10 });
    label(ctx, 'lift', cx + 56, my - 34, c, { color: c.c, size: 11, patch: false });
    label(ctx, 'weight', cx - 56, my + 58, c, { color: c.a, size: 11, patch: false });
    label(ctx, `floats ${fixed(hEq(state), 1)} mm up`, cx, 12, c, { color: c.ink, size: 12 });
    plot.axes({ xLabel: 'h (mm)', yLabel: 'lift / weight' });
    plot.segment(0, 1, H_MAX, 1, { color: c.a, dash: [6, 5] });
    plot.fn((mm) => lift(state.m, mm / 1000) / weight(state), { color: c.c, domain: [2, H_MAX] });
    if (hEq(state) <= H_MAX) plot.point(hEq(state), 1, { fill: c.fillY, r: 8 });
  },
  controls: () => [
    { title: 'A magnet over a superconductor' },
    { key: 'm', label: 'Magnetic moment, m', min: 0.2, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} A m²` },
    { key: 'M', label: 'Mass, M', min: 2, max: 30, step: 1, format: (n) => `${n} g` },
    { readout: [
      ['Weight', (s) => `${sig(weight(s) * 1000, 3)} mN`],
      ['Floats at', (s) => `${sig(hEq(s), 3)} mm`],
      ['Lift at that height', (s) => `${sig(lift(s.m, hEq(s) / 1000) * 1000, 3)} mN`],
    ] },
  ],
  tex: (s) => `\\dfrac{3\\mu_0m^2}{32\\pi h^4}=Mg\\ \\Rightarrow\\ h=${sig(hEq(s), 3)}\\ \\text{mm}`,
});
tool.update();
