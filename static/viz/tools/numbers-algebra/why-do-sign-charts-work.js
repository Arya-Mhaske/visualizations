import { createTool } from '../../lib/tool.js';
import { numberLine } from '../../lib/numline.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { CHARTS, chartSign, criticals, factorSign, regions } from './_inequalities-math.js';

const state = { which: 0, t: 0, want: 1 };
const R = 8;
const chart = (s = state) => CHARTS[s.which];
const mark = (v) => (v > 0 ? '+' : v < 0 ? '−' : '0');

createTool({
  state,
  label: 'A number line with the critical points of the expression, the places where one factor is zero. One row per factor shows where that factor is positive or negative. A factor changes sign only at its own zero, so the product can change sign only at a critical point. A test point slides along the line, and the bottom row shows the sign of the whole expression, shaded where it matches the question.',
  draw(ctx, stage, c) {
    const ch = chart();
    const rows = ch.factors.length + 1;
    const rowH = (stage.h - 56) / (rows + 0.4);
    const nl = numberLine(ctx, stage, c, { lo: -R, hi: R, y: stage.h - 26, step: 2 });
    nl.axis();
    const edge = (x) => nl.px(Math.max(-R, Math.min(R, x)));
    const drawRow = (y, signAt, name, bold) => {
      const pts = [-R, ...criticals(ch).map((p) => p.r).filter((r) => r > -R && r < R), R];
      for (let i = 0; i < pts.length - 1; i++) {
        const mid = (pts[i] + pts[i + 1]) / 2;
        const sg = signAt(mid);
        const good = bold && sg === state.want;
        poly(ctx, [[edge(pts[i]), y], [edge(pts[i + 1]), y], [edge(pts[i + 1]), y + rowH * 0.7], [edge(pts[i]), y + rowH * 0.7]], { fill: good ? c.fillC : sg > 0 ? c.fillB : c.fillA, stroke: c.ink, width: bold ? 3 : 2 });
        label(ctx, mark(sg), (edge(pts[i]) + edge(pts[i + 1])) / 2, y + rowH * 0.35, c, { size: bold ? 16 : 13, bounds: stage, patch: false });
      }
      label(ctx, name, 6, y - 7, c, { size: 10, align: 'left', bounds: stage, patch: false });
    };
    ch.factors.forEach((f, i) => {
      const y = 22 + i * rowH;
      drawRow(y, (x) => (ch.sign === -1 && i === 0 ? -1 : 1) * factorSign(f, x), `${f.den ? '÷ ' : ''}(x ${f.r < 0 ? '+' : '−'} ${Math.abs(f.r)})${f.power === 2 ? '²' : ''}${ch.sign === -1 && i === 0 ? ' (with the −)' : ''}`, false);
    });
    drawRow(22 + ch.factors.length * rowH, (x) => chartSign(ch, x), 'whole expression', true);
    criticals(ch).forEach((p) => {
      line(ctx, nl.px(p.r), 18, nl.px(p.r), nl.y, { color: c.grid, width: 2, dash: [4, 4] });
      dot(ctx, nl.px(p.r), nl.y, 7, p.hole ? c.paper : c.ink, c.ink);
    });
    line(ctx, nl.px(state.t), 18, nl.px(state.t), nl.y, { color: c.d, width: 4 });
    dot(ctx, nl.px(state.t), nl.y, 9, c.a, c.ink);
  },
  controls: [
    { title: 'Pick an expression' },
    { key: 'which', label: 'Expression', min: 0, max: CHARTS.length - 1, step: 1, format: (n) => CHARTS[n].name },
    { key: 'want', label: 'Where is it', options: [[1, 'positive'], [-1, 'negative']] },
    { key: 't', label: 'Test point, x', min: -7.5, max: 7.5, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Critical points', (s) => criticals(chart(s)).map((p) => fixed(p.r, 0)).join(', ')],
      ['Signs at x', (s) => chart(s).factors.map((f) => mark(factorSign(f, s.t) * (f.den ? 1 : 1))).join(' ')],
      ['Whole expression', (s) => { const v = chartSign(chart(s), s.t); return { text: Number.isNaN(v) ? 'undefined' : mark(v), good: v === s.want }; }],
      ['Regions to test', (s) => `${regions(chart(s)).length}`],
    ] },
  ],
  tex: (s) => `${chart(s).name.replace(/÷/g, '\\div')}\\ ${s.want > 0 ? '>' : '<'}\\ 0`,
});
