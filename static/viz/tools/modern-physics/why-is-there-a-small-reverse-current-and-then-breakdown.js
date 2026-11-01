import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createRng } from '../../lib/rng.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { LOG_T_MAX, chain, ionProb, junctionAt, multiplication, peakField, reverseCurrent } from './_p-n-junction-diode-math.js';
import { amps, coverage, drawStrip } from './_p-n-junction-diode-view.js';

const ROWS = 6;
const SHOWN = 12; // dots drawn at the n side; more are written as a count
const I_TOP = 2.4; // μA, top of the graph
const state = { Vr: 3, Vbr: 20 };
const held = (s) => Math.min(s.Vr, s.Vbr); // the diode holds V_br; the circuit takes the rest
const layer = (s) => junctionAt(LOG_T_MAX, -held(s));
const p = (s) => ionProb(held(s), s.Vbr);
const M = (s) => multiplication(held(s), s.Vbr);
const crossings = (s) => Array.from({ length: ROWS }, (_, row) => chain(createRng(row + 1).next, p(s)));
const field = (s) => peakField(layer(s).Vj);

const tool = createTool({
  state,
  label: 'Top: a reverse-biased junction strip with a wide depletion layer and a few minority carriers. Middle: six rows, each one minority carrier sweeping across the layer; green flashes mark new pairs it frees, and the dots at the right are the carriers that arrive. Bottom: reverse current in microamps against reverse voltage, flat until a vertical wall at the breakdown voltage.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 55], y: [0, I_TOP], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.64, w: g.w, h: g.h * 0.36 }),
  }),
  draw(ctx, stage, c, plot) {
    const j = layer(state);
    const box = { x: 6, y: 6, w: stage.w - 12, h: stage.h * 0.26 };
    drawStrip(ctx, c, box, { width: j.width, minority: true });
    const mid = box.x + box.w / 2;
    const edge = (box.w / 2) * coverage(j.width);
    const counts = crossings(state);
    const top = stage.h * 0.36;
    const gap = (stage.h * 0.26) / ROWS;
    counts.forEach((n, row) => {
      const y = top + gap * row;
      arrow(ctx, mid - edge, y, mid + edge, y, { color: c.a, width: 3, head: 9 });
      for (let k = 1; k < n && k < SHOWN; k++) dot(ctx, mid - edge + ((2 * edge) * k) / Math.min(n, SHOWN), y, 4, c.c, c.ink, 2);
      const arrived = Math.min(n, SHOWN);
      for (let k = 0; k < arrived; k++) dot(ctx, mid + edge + 10 + k * 8, y, 3.5, c.a, c.ink, 1.5);
      if (n > SHOWN) label(ctx, `×${n}`, mid + edge + 12 + SHOWN * 8, y, c, { size: 10, align: 'left', bounds: stage });
    });
    label(ctx, 'one minority carrier each; green = new pair freed', 6, top - 14, c, { size: 10, align: 'left', bounds: stage, patch: false });

    plot.axes({ xLabel: 'reverse V (V)', yLabel: 'I (μA)' });
    plot.fn((v) => Math.min(I_TOP, reverseCurrent(v, state.Vbr) * 1e6), { color: c.b, domain: [0, state.Vbr - 0.001] });
    plot.segment(state.Vbr, 0, state.Vbr, I_TOP, { color: c.b, width: 3 });
    plot.text('breakdown', Math.min(state.Vbr + 2, 44), I_TOP * 0.85, { size: 11, align: 'left' });
    plot.point(held(state), Math.min(I_TOP, reverseCurrent(held(state), state.Vbr) * 1e6), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Reverse-bias the diode' },
    { key: 'Vr', label: 'Reverse voltage', min: 0, max: 55, step: 0.5, format: (n) => `${fixed(n, 1)} V` },
    { key: 'Vbr', label: 'Breakdown voltage, V_br', options: [[6, '6 V'], [20, '20 V'], [50, '50 V']] },
    { readout: [
      ['Layer width', (s) => `${fixed(layer(s).width * 1e6, 2)} μm`],
      ['Field in layer', (s) => `${sig(field(s) / 1e6, 2)} MV/m`],
      ['Carriers per start, M', (s) => (Number.isFinite(M(s)) ? sig(M(s), 3) : { text: 'runaway', good: false })],
      ['Current', (s) => (Number.isFinite(M(s)) ? amps(reverseCurrent(held(s), s.Vbr)) : { text: 'set by the circuit', good: false })],
    ] },
  ],
  tex: (s) => `M=\\dfrac{1}{1-(V/V_{br})^{4}}=\\dfrac{1}{1-(${fixed(held(s), 1)}/${s.Vbr})^{4}}=${Number.isFinite(M(s)) ? sig(M(s), 3) : '\\infty'}`,
});

tool.update();
