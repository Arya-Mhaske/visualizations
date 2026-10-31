import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { C, CAESIUM_HZ, PLANCK, artefactDrift, lightDistance, lightTimeNs } from './_units-measurement-math.js';

const state = { view: 'kg', years: 90, ns: 3.34 };
const ONE_METRE_NS = lightTimeNs(1);
let tool = null;

tool = createTool({
  state,
  label: 'Either a graph of an artefact kilogram drifting away from its copies while constants stay flat, or a light pulse crossing a distance that is set by time.',
  setup: (stage, c) => createPlot(stage, { x: [0, 140], y: [-5, 80], c }),
  draw(ctx, stage, c, plot) {
    if (state.view === 'kg') {
      plot.setRange([0, 140], [-5, 80]);
      plot.axes({ xLabel: 'years since 1889', yLabel: 'drift (µg)' });
      plot.fn((t) => artefactDrift(t), { color: c.a, domain: [0, 140] });
      plot.fn(() => 0, { color: c.c, domain: [0, 140] });
      plot.point(state.years, artefactDrift(state.years), { fill: c.a });
      plot.point(state.years, 0, { fill: c.c });
      plot.text('artefact kilogram', 4, 72, { color: c.a, align: 'left' });
      plot.text('h, c, caesium: no drift', 4, 14, { color: c.c, align: 'left' });
      return;
    }
    const y = stage.h * 0.5;
    const x0 = 24;
    const x1 = stage.w - 24;
    const metres = lightDistance(state.ns);
    const reach = Math.min(1, metres / 6);
    line(ctx, x0, y, x1, y, { color: c.ink, width: 3 });
    for (let m = 0; m <= 6; m++) {
      const x = x0 + ((x1 - x0) * m) / 6;
      line(ctx, x, y - 8, x, y + 8, { color: c.ink, width: 2 });
      label(ctx, `${m} m`, x, y + 24, c, { bounds: stage, size: 11 });
    }
    arrow(ctx, x0, y - 30, x0 + (x1 - x0) * reach, y - 30, { color: c.b, width: 5, head: 14 });
    dot(ctx, x0 + (x1 - x0) * reach, y, 9, c.a, c.ink);
    label(ctx, `light for ${fixed(state.ns, 2)} ns`, (x0 + x1) / 2, y - 60, c, { bounds: stage, size: 13 });
    label(ctx, `reaches ${sig(metres, 5)} m`, (x0 + x1) / 2, y + 60, c, { bounds: stage, size: 13 });
  },
  controls: [
    { title: 'Two ways to define a unit' },
    { key: 'view', label: 'Unit', options: [['kg', 'Kilogram'], ['m', 'Metre']] },
    { key: 'years', label: 'Years since 1889', min: 0, max: 140, step: 1, format: (v) => `${v} yr` },
    { key: 'ns', label: 'Light travels for', min: 0.5, max: 20, step: 0.01, format: (v) => `${fixed(v, 2)} ns` },
    { row: [{ button: 'Time for exactly 1 m', onClick: () => { state.view = 'm'; state.ns = Number(ONE_METRE_NS.toFixed(2)); tool.update(); } }] },
    { readout: [
      ['Artefact has drifted (illustrative)', (s) => `${fixed(artefactDrift(s.years), 1)} µg`],
      ['Light covers', (s) => `${sig(lightDistance(s.ns), 5)} m`],
      ['Time for 1 m', () => `${sig(ONE_METRE_NS, 5)} ns`],
      ['c (exact)', () => `${C} m/s`],
      ['h (exact)', () => PLANCK],
      ['Caesium frequency (exact)', () => `${CAESIUM_HZ} Hz`],
    ] },
  ],
  tex: (s) => (s.view === 'kg'
    ? `\\text{drift} = ${fixed(artefactDrift(s.years), 1)}\\ \\mu\\text{g}\\ \\text{(artefact)}\\quad 0\\ \\text{(constants)}`
    : `d = c\\,t = ${C}\\ \\text{m/s} \\times ${fixed(s.ns, 2)}\\ \\text{ns} = ${sig(lightDistance(s.ns), 5)}\\ \\text{m}`),
});
