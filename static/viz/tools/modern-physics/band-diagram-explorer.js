import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label } from '../../lib/draw.js';
import { fixed, texSci } from '../../lib/format.js';
import { niOf, sciText, KB_EV } from './_mp.js';
import { drawBands } from './_bands-view.js';

const state = { Eg: 1.1, T: 300 };
const logNi = (Eg, T) => Math.log10(niOf(Eg, T));

const tool = createTool({
  state,
  label: 'Left: a band diagram with the gap you set, a valence band below and a conduction band above. Beside it, a bar on a scale of powers of ten shows how many electrons per cubic centimetre have crossed. Right: a graph of the logarithm of that number against temperature, a rising curve with a coral point at the chosen temperature.',
  setup: (stage, c) => createPlot(stage, { x: [100, 1000], y: [0, 20], c, pad: 28, box: (g) => ({ x: g.w * 0.46, y: 0, w: g.w * 0.54, h: g.h }) }),
  draw(ctx, stage, c, plot) {
    const rect = { x: 36, y: 14, w: stage.w * 0.28, h: stage.h - 40 };
    drawBands(ctx, c, rect, state.Eg, 6, 0, { names: false, size: 10 });
    // log meter beside the diagram
    const mx = rect.x + rect.w + 24;
    const mh = rect.h * 0.9;
    const v = Math.max(0, Math.min(20, logNi(state.Eg, state.T)));
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(mx, rect.y + rect.h - mh, 14, mh);
    ctx.fillStyle = c.a;
    ctx.fillRect(mx, rect.y + rect.h - (mh * v) / 20, 14, (mh * v) / 20);
    ctx.strokeRect(mx, rect.y + rect.h - (mh * v) / 20, 14, (mh * v) / 20);
    label(ctx, 'log₁₀ n', mx + 7, rect.y - 2, c, { size: 9, patch: false });
    label(ctx, 'Eg', rect.x + rect.w / 2, stage.h - 10, c, { size: 10, patch: false });
    plot.axes({ xLabel: 'T (K)', yLabel: 'log₁₀ nᵢ' });
    plot.fn((T) => logNi(state.Eg, T), { color: c.b });
    plot.point(state.T, Math.max(0, logNi(state.Eg, state.T)), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Change gap and temperature' },
    { key: 'Eg', label: 'Band gap Eg', min: 0.1, max: 6, step: 0.05, format: (v) => `${fixed(v, 2)} eV` },
    { key: 'T', label: 'Temperature', min: 100, max: 1000, step: 10, format: (v) => `${v} K` },
    { readout: [
      ['kT', (s) => `${fixed(KB_EV * s.T, 4)} eV`],
      ['Eg ÷ 2kT', (s) => fixed(s.Eg / (2 * KB_EV * s.T), 1)],
      ['Electrons in conduction band', (s) => `${sciText(niOf(s.Eg, s.T))} per cm³`],
      ['Compared with Si at 300 K', (s) => `${sciText(niOf(s.Eg, s.T) / niOf(1.1, 300))} ×`],
    ] },
  ],
  tex: (s) => `n_i=N\\left(\\dfrac{T}{300}\\right)^{3/2}e^{-E_g/2kT}=${texSci(niOf(s.Eg, s.T), 2)}\\ \\text{cm}^{-3}`,
});

tool.update();
