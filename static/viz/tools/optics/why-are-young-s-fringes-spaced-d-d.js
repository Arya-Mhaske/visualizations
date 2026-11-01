import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { fringeWidth, pathDiff, twoWave } from './_interference-math.js';

// Units: lambda in nm, d in mm, D in m, y in mm.
const state = { lam: 600, d: 0.5, D: 1, y: 1.2 };
const SPAN = 10; // screen window, +- mm
const delta = (s, y = s.y) => pathDiff(y * 1e-3, s.d * 1e-3, s.D);
const beta = (s) => fringeWidth(s.lam * 1e-9, s.D, s.d * 1e-3) * 1e3; // mm
const orders = (s) => delta(s) / (s.lam * 1e-9);

const tool = createTool({
  state,
  label: 'Top: a sketch, not to scale, of two slits on the left, a screen on the right, and two lines from the slits to a chosen point on the screen. Bottom: brightness along the screen against height in millimetres, with bright fringes evenly spaced. A dot marks the chosen point.',
  setup: (stage, c) => createPlot(stage, { x: [-SPAN, SPAN], y: [0, 4.6], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.46, w: g.w, h: g.h * 0.54 }) }),
  draw(ctx, stage, c, plot) {
    const top = stage.h * 0.4;
    const sx = 30;
    const px = stage.w - 40;
    const mid = top / 2;
    const half = top * 0.08 + state.d * top * 0.1;
    const yp = mid - (state.y / SPAN) * (top * 0.42);
    line(ctx, px, 6, px, top - 6, { color: c.ink, width: 4 });
    line(ctx, sx, 6, sx, mid - half - 6, { color: c.ink, width: 4 });
    line(ctx, sx, mid - half + 6, sx, mid + half - 6, { color: c.ink, width: 4 });
    line(ctx, sx, mid + half + 6, sx, top - 6, { color: c.ink, width: 4 });
    line(ctx, sx, mid - half, px, yp, { color: c.a, width: 2 });
    line(ctx, sx, mid + half, px, yp, { color: c.b, width: 2 });
    dot(ctx, px, yp, 6, c.c, c.ink, 2);
    arrow(ctx, stage.w * 0.5 - 40, top - 10, stage.w * 0.5 + 40, top - 10, { color: c.ink, width: 2, head: 8 });
    label(ctx, `D = ${fixed(state.D, 1)} m (not to scale)`, stage.w * 0.5, top - 24, c, { size: 10, bounds: stage, patch: false });
    label(ctx, `d = ${fixed(state.d, 2)} mm`, sx + 4, 14, c, { size: 10, align: 'left', bounds: stage, patch: false });
    plot.axes({ xLabel: 'y (mm)', yLabel: 'brightness' });
    const lam = state.lam * 1e-9;
    plot.fn((y) => twoWave(delta(state, y * 1), lam), { color: c.c });
    plot.point(state.y, twoWave(delta(state), lam), { fill: c.c, r: 6 });
    for (let n = -Math.floor(SPAN / beta(state)); n <= SPAN / beta(state); n++) plot.point(n * beta(state), 4.3, { fill: c.a, r: 3 });
  },
  controls: () => [
    { title: 'Set up the experiment' },
    { key: 'lam', label: 'Wavelength, λ', min: 400, max: 700, step: 10, format: (n) => `${n} nm` },
    { key: 'd', label: 'Slit separation, d', min: 0.2, max: 1, step: 0.05, format: (n) => `${fixed(n, 2)} mm` },
    { key: 'D', label: 'Screen distance, D', min: 0.5, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'y', label: 'Point on screen, y', min: -SPAN, max: SPAN, step: 0.1, format: (n) => `${fixed(n, 1)} mm` },
    { readout: [
      ['Path difference, Δ', (s) => `${sig(delta(s) * 1e9, 4)} nm`],
      ['Δ ÷ λ', (s) => fixed(orders(s), 2)],
      ['Fringe spacing, β', (s) => `${fixed(beta(s), 2)} mm`],
    ] },
  ],
  tex: (s) => `\\Delta\\approx\\dfrac{dy}{D}=${fixed(delta(s) * 1e9, 0)}\\ \\text{nm},\\quad \\beta=\\dfrac{\\lambda D}{d}=${fixed(beta(s), 2)}\\ \\text{mm}`,
});

tool.update();
