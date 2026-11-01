import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { drawPrism } from './_prism-view.js';
import { COLOURS, nAt, deviation } from './_prism-math.js';
import { fixed, sig } from '../../lib/format.js';

const state = { A: 60, i: 50, strength: 3 };
const dev = (s, nm) => deviation(s.A, nAt(nm, s.strength), s.i);

const tool = createTool({
  state,
  label: 'Top: a white ray enters a prism and leaves as seven coloured rays, red bent least and violet most. Bottom: the refractive index of the glass against wavelength, higher for violet than for red.',
  setup: (stage, c) => createPlot(stage, { x: [400, 700], y: [1.49, 1.7], c, pad: 34, box: (g) => ({ x: 0, y: g.h * 0.6, w: g.w, h: g.h * 0.4 }) }),
  draw(ctx, stage, c, plot) {
    const rays = COLOURS.map((col, k) => ({ n: nAt(col.nm, state.strength), i: state.i, color: c.spec[k], width: 3, incident: c.ink }));
    drawPrism(ctx, c, { x: 0, y: 0, w: stage.w, h: stage.h * 0.58 }, state.A, rays);
    plot.axes({ xLabel: 'λ (nm)', yLabel: 'n' });
    plot.fn((nm) => nAt(nm, state.strength), { color: c.ink, domain: [400, 700] });
    COLOURS.forEach((col, k) => plot.point(col.nm, nAt(col.nm, state.strength), { fill: c.spec[k], r: 6 }));
  },
  controls: () => [
    { title: 'White light through glass' },
    { key: 'strength', label: 'How much n depends on λ', min: 0, max: 6, step: 0.5, format: (n) => (n === 0 ? 'none' : `× ${fixed(n, 1)}`) },
    { key: 'i', label: 'Angle of incidence', min: 40, max: 70, step: 1, format: (n) => `${n}°` },
    { key: 'A', label: 'Prism angle', min: 40, max: 70, step: 5, format: (n) => `${n}°` },
    { readout: [
      ['n for red (700 nm)', (s) => fixed(nAt(700, s.strength), 4)],
      ['n for violet (410 nm)', (s) => fixed(nAt(410, s.strength), 4)],
      ['D for red', (s) => { const d = dev(s, 700); return d === null ? '—' : `${fixed(d, 2)}°`; }],
      ['D for violet', (s) => { const d = dev(s, 410); return d === null ? '—' : `${fixed(d, 2)}°`; }],
      ['Spread', (s) => `${sig(dev(s, 410) - dev(s, 700), 3)}°`],
    ] },
  ],
  tex: (s) => `n=a+\\dfrac{b}{\\lambda^2}\\quad\\Rightarrow\\quad n_{violet}>n_{red}`,
});
tool.update();
