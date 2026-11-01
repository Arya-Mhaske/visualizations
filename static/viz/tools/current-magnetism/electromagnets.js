import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label, line, poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { G, airField, coreField, pull } from './_sources-of-magnetic-field-math.js';

// A coil 20 cm long wound on a soft-iron rod 1.6 cm across; the pole face is the rod's end. Real magnets use a closed yoke.
const state = { N: 200, I: 1.5 };
const LENGTH = 0.2; // m
const AREA = 2e-4; // m², the pole face
const H = (s = state) => (s.N * s.I) / LENGTH;
const withCore = (s = state) => coreField(H(s));
const withAir = (s = state) => airField(H(s));
const kilos = (b) => pull(b, AREA) / G;
const SHOW_LO = -3; // log10 kg
const SHOW_HI = 2;
const massLabel = (kg) => (kg < 1 ? `${sig(kg * 1000, 3)} g` : `${sig(kg, 3)} kg`);

function bar(ctx, c, x, y, w, kg, fill, name) {
  const t = Math.max(0, Math.min(1, (Math.log10(Math.max(kg, 1e-9)) - SHOW_LO) / (SHOW_HI - SHOW_LO)));
  poly(ctx, [[x, y], [x + w * t, y], [x + w * t, y + 16], [x, y + 16]], { fill, stroke: c.ink, width: 3 });
  label(ctx, `${name}: ${massLabel(kg)}`, x, y - 10, c, { size: 11, align: 'left', patch: false });
}

const tool = createTool({
  state,
  label: 'Top left: a coil wound on an iron rod. Top right: two bars on a scale from one gram to one hundred kilograms showing how much mass the magnet could lift with and without the iron core. Bottom: field against current, with the iron core rising steeply then levelling off, and the air core almost flat at zero.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [0, 1.8], c, pad: 32, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const h1 = stage.h * 0.46;
    const cx = stage.w * 0.2;
    const coilH = h1 * 0.6;
    poly(ctx, [[cx - 7, 8], [cx + 7, 8], [cx + 7, coilH + 24], [cx - 7, coilH + 24]], { fill: c.fillC, stroke: c.ink, width: 3 });
    poly(ctx, [[cx - 20, 14], [cx + 20, 14], [cx + 20, coilH + 8], [cx - 20, coilH + 8]], { stroke: c.ink, width: 3 });
    const turns = Math.max(3, Math.min(16, Math.round(state.N / 25)));
    for (let k = 0; k < turns; k++) {
      const y = 14 + ((coilH - 6) * (k + 0.5)) / turns;
      line(ctx, cx - 20, y, cx + 20, y + 4, { color: c.a, width: 3 });
    }
    poly(ctx, [[cx - 22, coilH + 28], [cx + 22, coilH + 28], [cx + 22, coilH + 38], [cx - 22, coilH + 38]], { fill: c.fillB, stroke: c.ink, width: 3 });
    label(ctx, 'iron core', cx, 7, c, { size: 10, patch: false, bounds: stage });
    const x = stage.w * 0.4;
    const w = stage.w * 0.55;
    bar(ctx, c, x, h1 * 0.28, w, kilos(withCore()), c.fillC, 'Iron core');
    bar(ctx, c, x, h1 * 0.78, w, kilos(withAir()), c.fillA, 'Air core');
    for (const kg of [0.001, 1, 100]) {
      const px = x + (w * (Math.log10(kg) - SHOW_LO)) / (SHOW_HI - SHOW_LO);
      line(ctx, px, h1 * 0.28 + 20, px, h1 * 0.78 - 14, { color: c.grid, width: 1 });
      label(ctx, massLabel(kg), px, h1 - 4, c, { size: 10, patch: false, bounds: stage });
    }
    plot.axes({ xLabel: 'I (A)', yLabel: 'B (T)' });
    plot.fn((I) => coreField((state.N * I) / LENGTH), { color: c.c });
    plot.fn((I) => airField((state.N * I) / LENGTH), { color: c.a });
    plot.point(state.I, withCore(), { fill: c.c, r: 6 });
    plot.point(state.I, withAir(), { fill: c.a, r: 5 });
  },
  controls: () => [
    { title: 'Wind and power it' },
    { key: 'I', label: 'Current, I', min: 0.1, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} A` },
    { key: 'N', label: 'Turns, N', min: 20, max: 400, step: 10, format: (n) => `${n}` },
    { readout: [
      ['Ampere-turns, N I', (s) => `${fixed(s.N * s.I, 0)} A`],
      ['Field with iron', (s) => `${sig(withCore(s), 3)} T`],
      ['Field with air', (s) => `${sig(withAir(s) * 1e3, 3)} mT`],
      ['Iron makes it', (s) => `${sig(withCore(s) / withAir(s), 3)} × stronger`],
      ['Lifts (iron)', (s) => massLabel(kilos(withCore(s)))],
    ] },
  ],
  tex: (s) => `B_{air}=\\mu_0 n I=\\mu_0\\dfrac{N}{L}I=${sig(withAir(s) * 1e3, 3)}\\ \\text{mT},\\quad B_{iron}=${sig(withCore(s), 3)}\\ \\text{T}`,
});

tool.update();
