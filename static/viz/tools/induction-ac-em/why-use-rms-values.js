import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label, poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import {
  TAU, acHeat, aroundLevel, dcHeat, iSquared, iSquaredShifted, meanCurrent, meanSize, meanSquare, period, rms,
} from './_ac-basics-math.js';

const F = 50; // Hz
const T = period(F);
const SPAN = 40; // ms on the time axes: two whole cycles
const SNAP = 0.03; // A: a slider can't land on 3.5355…, so close enough is taken as the match
const state = { I: 2, im: 5, R: 10, shifted: false };

const phase = (ms) => (TAU * F * ms) / 1000;
const ac = (s) => acHeat(s.im, s.R, T);
const dc = (s) => dcHeat(s.I, s.R, T);
const matched = (s) => Math.abs(s.I - rms(s.im)) < 1e-9;

function snap() {
  if (Math.abs(state.I - rms(state.im)) < SNAP) state.I = rms(state.im);
}

function drawBars(ctx, stage, c) {
  const left = 12;
  const full = stage.w - 24;
  const top = stage.h * 0.75;
  const rowH = (stage.h - top) / 2;
  const scale = Math.max(ac(state) * 2, dc(state), 1e-9);
  const rows = [
    ['AC, heat per cycle', ac(state), c.fillB],
    ['Steady DC, heat per cycle', dc(state), c.fillA],
  ];
  rows.forEach(([name, value, fill], i) => {
    const y = top + rowH * i;
    const barH = Math.min(rowH - 22, 26);
    const w = Math.max(2, (value / scale) * full);
    label(ctx, `${name}: ${sig(value, 3)} J`, left, y + 9, c, { size: 11, align: 'left', bounds: stage });
    poly(ctx, [[left, y + 18], [left + w, y + 18], [left + w, y + 18 + barH], [left, y + 18 + barH]], { fill, stroke: c.ink, width: 2 });
  });
}

const tool = createTool({
  state,
  label: 'Top: an alternating current over two cycles and a steady direct current, drawn as a flat line. Middle: the heating rate of each. Bottom: two bars compare the heat each gives in one cycle. The bars match when the steady current is the peak divided by root 2.',
  setup: (stage, c) => ({
    current: createPlot(stage, { x: [0, SPAN], y: [-6.5, 6.5], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.33 }) }),
    heat: createPlot(stage, { x: [0, SPAN], y: [0, 1], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.33, w: g.w, h: g.h * 0.42 }) }),
  }),
  draw(ctx, stage, c, { current, heat }) {
    const steady = state.I;
    current.axes({ xLabel: '', yLabel: 'i (A)' });
    current.fn((t) => state.im * Math.sin(phase(t)), { color: c.b });
    current.segment(0, steady, SPAN, steady, { color: c.a, width: 3 });
    current.text('DC', SPAN, steady, { size: 11, color: c.a, align: 'right' });

    const top = Math.max(state.im * state.im, steady * steady) * state.R * 1.15;
    heat.setRange([0, SPAN], [0, top]);
    const level = steady * steady * state.R;
    const rate = (t) => iSquared(state.im, phase(t)) * state.R;
    heat.shade((t) => Math.max(rate(t), level), () => level, 0, SPAN, c.fillB);
    heat.shade(() => level, (t) => Math.min(rate(t), level), 0, SPAN, c.fillA);
    heat.axes({ xLabel: 't (ms)', yLabel: 'heat rate (W)' });
    heat.fn(rate, { color: c.b });
    if (state.shifted) {
      heat.fn((t) => iSquaredShifted(state.im, phase(t)) * state.R, { color: c.d, dash: [7, 5] });
      const whole = state.im * state.im * state.R;
      heat.segment(0, whole, SPAN, whole, { color: c.d, width: 2, dash: [3, 4] });
    }
    heat.segment(0, level, SPAN, level, { color: c.a, width: 3 });
    drawBars(ctx, stage, c);
  },
  controls: () => [
    { title: 'Match the heat' },
    { key: 'I', label: 'Steady DC, I', min: 0, max: 6, step: 0.01, format: (n) => `${fixed(n, 2)} A` },
    { row: [
      { button: 'Try the peak', ghost: true, onClick() { state.I = state.im; tool.update(); } },
      { button: 'Try the average', ghost: true, onClick() { state.I = meanSize(state.im); tool.update(); } },
    ] },
    { key: 'im', label: 'AC peak, i_m', min: 1, max: 6, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { key: 'R', label: 'Resistance, R', min: 5, max: 50, step: 5, format: (n) => `${n} Ω` },
    { key: 'shifted', label: 'Shift i² by a quarter cycle', toggle: true },
    { text: 'Frequency: 50 Hz. Heat counted over one whole cycle.' },
    { readout: [
      ['Mean of i', (s) => `${fixed(meanCurrent(s.im), 2)} A`],
      ['Mean of i²', (s) => `${sig(meanSquare(s.im), 3)} A²`],
      ['Root of that', (s) => `${sig(rms(s.im), 3)} A`],
      ['Above the DC line', (s) => `${sig(aroundLevel(s.im, s.I * s.I).above, 3)} A²`],
      ['Below the DC line', (s) => `${sig(aroundLevel(s.im, s.I * s.I).below, 3)} A²`],
      ['DC heat ÷ AC heat', (s) => (matched(s) ? { text: '1, a match', good: true } : { text: sig(dc(s) / ac(s), 3), good: false })],
    ] },
  ],
  tex: (s) => `I=\\sqrt{\\overline{i^2}}=\\dfrac{i_m}{\\sqrt2}=\\dfrac{${fixed(s.im, 1)}}{1.414}=${sig(rms(s.im), 3)}\\ \\text{A}`,
  onChange: snap,
});
