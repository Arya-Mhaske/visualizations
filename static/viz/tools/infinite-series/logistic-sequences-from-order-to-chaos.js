import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { logistic, logisticPeriod, boxes } from './_is.js';
import { line } from '../../lib/draw.js';

// Top: the bifurcation diagram (the long-run values of xₙ for each r). Bottom: the sequence for the chosen r.
const R0 = 2.5;
const R1 = 4;
const state = { r: 3.2, x0: 0.3 };
let cache = { w: 0, cols: null };
function bifurcation(w) {
  if (cache.w === w) return cache.cols;
  const cols = [];
  for (let i = 0; i < w; i++) {
    const r = R0 + ((R1 - R0) * i) / (w - 1);
    let x = 0.3;
    for (let k = 0; k < 300; k++) x = logistic(r, x);
    const ys = [];
    for (let k = 0; k < 60; k++) { x = logistic(r, x); ys.push(x); }
    cols.push(ys);
  }
  cache = { w, cols };
  return cols;
}
const seq = () => { const out = [state.x0]; for (let i = 0; i < 60; i++) out.push(logistic(state.r, out[i])); return out; };
const period = () => logisticPeriod(state.r, state.x0);
const [boxTop, boxBottom] = boxes(2);

createTool({
  state,
  label: 'Top: for every value of r from 2.5 to 4, the long-run values of the logistic sequence, which split in two, then four, then fill a band. Bottom: the first 60 terms of the sequence for the chosen r.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [R0, R1], y: [0, 1], c, box: boxTop }),
    bottom: createPlot(stage, { x: [0, 60], y: [0, 1], c, box: boxBottom }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    top.axes({ xLabel: 'r', yLabel: 'xₙ' });
    const w = Math.max(40, Math.round(stage.w - 52));
    bifurcation(w).forEach((ys, i) => {
      const r = R0 + ((R1 - R0) * i) / (w - 1);
      for (const y of ys) { const [px, py] = top.toPx(r, y); ctx.fillStyle = c.ink; ctx.fillRect(px, py, 1.2, 1.2); }
    });
    top.segment(state.r, 0, state.r, 1, { color: c.a, width: 3 });
    bottom.axes({ xLabel: 'n', yLabel: 'xₙ' });
    const s = seq();
    for (let i = 1; i < s.length; i++) {
      const [x1, y1] = bottom.toPx(i - 1, s[i - 1]);
      const [x2, y2] = bottom.toPx(i, s[i]);
      line(ctx, x1, y1, x2, y2, { color: c.b, width: 1.5 });
    }
    s.forEach((v, i) => { const [px, py] = bottom.toPx(i, v); ctx.fillStyle = c.a; ctx.fillRect(px - 2.5, py - 2.5, 5, 5); });
  },
  controls: [
    { title: 'Turn up r' },
    { key: 'r', label: 'Growth rate r', min: 2.5, max: 4, step: 0.005, format: (v) => v.toFixed(3) },
    { key: 'x0', label: 'Start x₁', min: 0.05, max: 0.95, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Long-run pattern', () => (period() === 0 ? { text: 'chaotic: never repeats', good: false } : { text: period() === 1 ? 'settles to one value' : `repeats every ${period()} terms`, good: true })],
      ['Fixed point 1 − 1/r', () => (1 - 1 / state.r).toFixed(4)],
      ['x₆₀', () => seq()[60].toFixed(4)],
    ] },
  ],
  tex: (s) => `x_{n+1}=${s.r.toFixed(3)}\\,x_n(1-x_n)`,
});
