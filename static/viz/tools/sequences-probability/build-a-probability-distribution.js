import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { EXPERIMENTS, fr } from './_rv.js';

// Count outcomes one at a time. P(X = x) = (outcomes with value x) / (all outcomes). Only the full count gives Σp = 1.
const state = { exp: 'sum', pct: 40 };
const exp = (s) => EXPERIMENTS[s.exp];
const counted = (s) => Math.round((s.pct / 100) * exp(s).outcomes.length);
const values = (s) => [...new Set(exp(s).outcomes.map((o) => o.x))].sort((a, b) => a - b);
const countFor = (s, x) => exp(s).outcomes.slice(0, counted(s)).filter((o) => o.x === x).length;
const total = (s) => exp(s).outcomes.length;

const tool = createTool({
  state,
  label: 'Top: a grid of every outcome of the experiment, each cell showing its value of X. Cells you have counted so far are shaded coral. Bottom: a bar chart of probability for each value of X, growing as more outcomes are counted, reaching a total height of 1 only when every outcome has been counted.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 12.5], y: [0, 0.5], c, pad: 26, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  draw(ctx, stage, c, plot) {
    const e = exp(state);
    const cols = e.cols;
    const rows = Math.ceil(e.outcomes.length / cols);
    const cw = Math.min((stage.w - 24) / cols, 44);
    const ch = Math.min((stage.h * 0.46 - 12) / rows, 30);
    const x0 = (stage.w - cw * cols) / 2;
    const n = counted(state);
    e.outcomes.forEach((o, i) => {
      const x = x0 + (i % cols) * cw;
      const y = 6 + Math.floor(i / cols) * ch;
      ctx.fillStyle = i < n ? c.fillA : c.paper;
      ctx.fillRect(x, y, cw, ch);
      ctx.strokeStyle = c.grid;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cw, ch);
      label(ctx, `${o.x}`, x + cw / 2, y + ch / 2, c, { size: Math.min(12, ch * 0.5), patch: false });
    });
    const vs = values(state);
    const top = Math.max(0.2, Math.ceil((Math.max(...vs.map((v) => e.outcomes.filter((o) => o.x === v).length)) / total(state)) * 10) / 10 + 0.1);
    plot.setRange([vs[0] - 0.7, vs[vs.length - 1] + 0.7], [0, top]);
    plot.axes({ xLabel: 'x', yLabel: 'P(X = x)' });
    vs.forEach((v) => plot.segment(v, 0, v, countFor(state, v) / total(state), { color: c.a, width: 10 }));
  },
  controls: () => [
    { title: 'Count the outcomes' },
    { key: 'exp', label: 'Experiment', options: Object.entries(EXPERIMENTS).map(([k, v]) => [k, v.name]) },
    { key: 'pct', label: 'Counted so far', min: 0, max: 100, step: 1, format: (v) => `${counted({ ...state, pct: v })} of ${total(state)}` },
    { readout: [
      ['Σ pᵢ so far', (s) => `${counted(s)}/${total(s)} = ${fixed(counted(s) / total(s), 3)}`],
      ['Complete?', (s) => ({ text: counted(s) === total(s) ? 'yes: Σp = 1' : 'no: some outcomes not counted', good: counted(s) === total(s) })],
      ['E(X)', (s) => (counted(s) === total(s) ? fr(values(s).reduce((a, x) => a + (x * countFor(s, x)) / total(s), 0)) : '—')],
    ] },
  ],
  tex: (s) => `\\sum p_i=\\dfrac{${counted(s)}}{${total(s)}}${counted(s) === total(s) ? '=1' : ''}`,
});

tool.update();
