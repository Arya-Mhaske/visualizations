import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const l2 = Math.log2;
const l10 = Math.log10;
const EQS = [
  { tex: '\\log_2 x+\\log_2(x-2)=3', quad: 'x^2-2x-8=0', roots: [4, -2], lhs: (x) => l2(x) + l2(x - 2), rhs: () => 3, args: [['x', (x) => x], ['x − 2', (x) => x - 2]], view: [[-4, 8], [-3, 6]] },
  { tex: '\\ln(x+6)=\\ln(x^2)', quad: 'x^2-x-6=0', roots: [3, -2], lhs: (x) => Math.log(x + 6), rhs: (x) => Math.log(x * x), args: [['x + 6', (x) => x + 6], ['x²', (x) => x * x]], view: [[-6, 6], [-2, 4]] },
  { tex: '\\log(x-1)+\\log(x+2)=1', quad: 'x^2+x-12=0', roots: [3, -4], lhs: (x) => l10(x - 1) + l10(x + 2), rhs: () => 1, args: [['x − 1', (x) => x - 1], ['x + 2', (x) => x + 2]], view: [[-6, 7], [-2, 3]] },
  { tex: '\\log_2(x+1)+\\log_2(x-3)=5', quad: 'x^2-2x-35=0', roots: [7, -5], lhs: (x) => l2(x + 1) + l2(x - 3), rhs: () => 5, args: [['x + 1', (x) => x + 1], ['x − 3', (x) => x - 3]], view: [[-7, 9], [-3, 8]] },
];
const state = { e: 0, which: 0 };
const test = (s) => EQS[s.e].roots[s.which];
const valid = (s) => EQS[s.e].args.every(([, f]) => f(test(s)) > 0);

createTool({
  state,
  label: 'Both sides of a log equation drawn as graphs. The left side exists only where every log argument is positive. Algebra gives two candidate answers, shown as vertical dashed lines. One sits where the graphs really cross. The other sits in a region where the left graph does not exist at all, so it is rejected.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 8], y: [-3, 6], c }),
  draw(ctx, stage, c, plot) {
    const E = EQS[state.e];
    plot.setRange(E.view[0], E.view[1]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(E.lhs, { color: c.a, width: 4 });
    plot.fn(E.rhs, { color: c.b, width: 3, dash: [8, 5] });
    E.roots.forEach((r, i) => {
      const ok = E.args.every(([, f]) => f(r) > 0);
      plot.segment(r, E.view[1][0], r, E.view[1][1], { color: ok ? c.c : c.a, width: i === state.which ? 4 : 2, dash: [5, 5] });
      if (ok) plot.point(r, E.rhs(r), { fill: c.fillC, r: 9 });
      else plot.text('no graph here', r, E.view[1][1] - 0.5, { size: 10, color: c.a });
    });
  },
  controls: [
    { title: 'Test a root' },
    { key: 'e', label: 'Equation', options: [[0, 'log₂'], [1, 'ln'], [2, 'log'], [3, 'log₂ (b)']] },
    { key: 'which', label: 'Candidate answer', options: [[0, 'First root'], [1, 'Second root']] },
    { readout: [
      ['Candidate x', (s) => `${test(s)}`],
      ['First log argument', (s) => { const [n, f] = EQS[s.e].args[0]; return { text: `${n} = ${fixed(f(test(s)), 2)}`, good: f(test(s)) > 0 }; }],
      ['Second log argument', (s) => { const [n, f] = EQS[s.e].args[1]; return { text: `${n} = ${fixed(f(test(s)), 2)}`, good: f(test(s)) > 0 }; }],
      ['Verdict', (s) => (valid(s) ? { text: 'accepted', good: true } : { text: 'rejected', good: false })],
    ] },
  ],
  tex: (s) => `${EQS[s.e].tex}\\ \\Rightarrow\\ ${EQS[s.e].quad}\\ \\Rightarrow\\ x=${EQS[s.e].roots.join('\\text{ or }')}`,
});
