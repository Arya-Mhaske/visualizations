import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { buildPieces, coefficients, valueOfPieces } from './_properties-library-math.js';

const state = { b1: -1, b2: 2, s1: 0.5, s2: -1, s3: 1, J1: 1, J2: 0, own1: true, own2: false };
const pieces = (s = state) => buildPieces(s);
const text = (v) => (v === null ? 'not defined' : fixed(v, 2));
const line = ([m, k]) => `${fixed(m, 1)}x${k < 0 ? '-' : '+'}${fixed(Math.abs(k), 1)}`.replace('-0.0', '-0').replace(/^0x\+?/, '');

createTool({
  state,
  label: 'A graph made of three straight pieces joined at two break points. Where two pieces meet, a filled dot shows which piece owns the break point, and an empty dot shows the end that does not. A jump of zero closes the gap.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [-6, 6], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ grid: true });
    const parts = pieces();
    parts.forEach((p, i) => plot.fn(p.fn, { color: [c.b, c.a, c.c][i], width: 4, domain: [p.a, p.b] }));
    parts.forEach((p) => {
      if (p.a > -5) plot.point(p.a, p.fn(p.a), { fill: p.ca ? c.ink : c.paper, r: 6 });
      if (p.b < 5) plot.point(p.b, p.fn(p.b), { fill: p.cb ? c.ink : c.paper, r: 6 });
    });
    [state.b1, state.b2].forEach((b) => plot.segment(b, -6, b, 6, { color: c.grid, width: 1, dash: [4, 4] }));
  },
  controls: [
    { title: 'Break points' },
    { key: 'b1', label: 'First break, b₁', min: -3, max: 0, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b2', label: 'Second break, b₂', min: 1, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { title: 'Slopes and jumps' },
    { key: 's1', label: 'Slope of piece 1', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 's2', label: 'Slope of piece 2', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 's3', label: 'Slope of piece 3', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'J1', label: 'Jump at b₁', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'J2', label: 'Jump at b₂', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { row: [
      { key: 'own1', label: 'b₁ in the left piece', toggle: true },
      { key: 'own2', label: 'b₂ in the left piece', toggle: true },
    ] },
    { readout: [
      ['f(b₁)', (s) => text(valueOfPieces(pieces(s), s.b1))],
      ['f(b₂)', (s) => text(valueOfPieces(pieces(s), s.b2))],
      ['At b₁', (s) => (s.J1 === 0 ? 'joined' : 'a jump')],
      ['At b₂', (s) => (s.J2 === 0 ? 'joined' : 'a jump')],
    ] },
  ],
  tex: (s) => {
    const [p1, p2, p3] = coefficients(s).map(line);
    const [b1, b2] = [fixed(s.b1, 1), fixed(s.b2, 1)];
    return `f(x)=\\begin{cases}${p1} & x${s.own1 ? '\\le' : '<'}${b1}\\\\ ${p2} & ${b1}${s.own1 ? '<' : '\\le'}x${s.own2 ? '\\le' : '<'}${b2}\\\\ ${p3} & x${s.own2 ? '>' : '\\ge'}${b2}\\end{cases}`;
  },
  onChange(s) { if (s.b2 <= s.b1) s.b2 = s.b1 + 0.5; },
});
