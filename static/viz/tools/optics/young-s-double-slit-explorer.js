import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { brightAt, darkAt, fringeWidth, pathDiff, twoWave } from './_interference-math.js';

// Units: lambda in nm, d in mm, D in m, y in mm.
const state = { lam: 600, d: 0.5, D: 1, n: 3 };
const SPAN = 10;
const lamM = (s) => s.lam * 1e-9;
const beta = (s) => fringeWidth(lamM(s), s.D, s.d * 1e-3) * 1e3;
const bright = (s) => brightAt(s.n, lamM(s), s.D, s.d * 1e-3) * 1e3;
const dark = (s) => darkAt(s.n - 1, lamM(s), s.D, s.d * 1e-3) * 1e3;
const intensity = (s, y) => twoWave(pathDiff(y * 1e-3, s.d * 1e-3, s.D), lamM(s));

const tool = createTool({
  state,
  label: 'Top: the screen seen face on, a strip of bright and dark bands covering ten millimetres either side of the centre, shaded coral where it is bright. Below: a graph of the same brightness against position, with a dot on the chosen bright fringe.',
  setup: (stage, c) => createPlot(stage, { x: [-SPAN, SPAN], y: [0, 4.4], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.3, w: g.w, h: g.h * 0.7 }) }),
  draw(ctx, stage, c, plot) {
    const strip = stage.h * 0.24;
    ctx.fillStyle = c.ink;
    ctx.fillRect(0, 0, stage.w, strip);
    const cell = 3;
    for (let px = 0; px < stage.w; px += cell) {
      const y = ((px + cell / 2) / stage.w) * 2 * SPAN - SPAN;
      ctx.globalAlpha = Math.min(1, intensity(state, y) / 4);
      ctx.fillStyle = c.a;
      ctx.fillRect(px, 4, cell, strip - 8);
    }
    ctx.globalAlpha = 1;
    plot.axes({ xLabel: 'y (mm)', yLabel: 'brightness' });
    plot.fn((y) => intensity(state, y), { color: c.a });
    const yb = bright(state);
    if (Math.abs(yb) <= SPAN) plot.point(yb, 4, { fill: c.c, r: 6 });
  },
  controls: () => [
    { title: 'Change the set-up' },
    { key: 'lam', label: 'Wavelength, λ', min: 400, max: 700, step: 10, format: (n) => `${n} nm` },
    { key: 'd', label: 'Slit separation, d', min: 0.2, max: 1, step: 0.05, format: (n) => `${fixed(n, 2)} mm` },
    { key: 'D', label: 'Screen distance, D', min: 0.5, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'n', label: 'Bright fringe number, n', min: 1, max: 8, step: 1 },
    { readout: [
      ['Fringe spacing, β', (s) => `${fixed(beta(s), 2)} mm`],
      ['nth bright, y', (s) => `${fixed(bright(s), 2)} mm`],
      ['nth dark, y', (s) => `${fixed(dark(s), 2)} mm`],
      ['Fringes in window', (s) => sig((2 * SPAN) / beta(s), 3)],
    ] },
  ],
  tex: (s) => `y_n=\\dfrac{n\\lambda D}{d}=\\dfrac{${s.n}\\times${s.lam}\\times10^{-9}\\times${fixed(s.D, 1)}}{${fixed(s.d, 2)}\\times10^{-3}}=${fixed(bright(s), 2)}\\ \\text{mm}`,
});

tool.update();
