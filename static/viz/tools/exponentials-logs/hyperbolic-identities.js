import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { fam: 'hyp', id: 'pyth', t: 0.8 };

// Each identity is two bars: the left side as one block, the right side as stacked blocks. [value, fill key, label]
function bars(s) {
  const t = s.t;
  const hyp = s.fam === 'hyp';
  const [S, C] = hyp ? [Math.sinh(t), Math.cosh(t)] : [Math.sin(t), Math.cos(t)];
  if (s.id === 'pyth') {
    return hyp
      ? { left: [[C * C, 'fillA', 'cosh² t']], right: [[1, 'fillC', '1'], [S * S, 'fillB', 'sinh² t']], eq: 'cosh² t = 1 + sinh² t' }
      : { left: [[1, 'fillC', '1']], right: [[C * C, 'fillA', 'cos² t'], [S * S, 'fillB', 'sin² t']], eq: '1 = cos² t + sin² t' };
  }
  const double = hyp ? Math.sinh(2 * t) : Math.sin(2 * t);
  return {
    left: [[double, 'fillA', hyp ? 'sinh 2t' : 'sin 2t']],
    right: [[S * C, 'fillB', hyp ? 'sinh·cosh' : 'sin·cos'], [S * C, 'fillB', hyp ? 'sinh·cosh' : 'sin·cos']],
    eq: hyp ? 'sinh 2t = 2 sinh t cosh t' : 'sin 2t = 2 sin t cos t',
  };
}
const total = (list) => list.reduce((sum, p) => sum + p[0], 0);

createTool({
  state,
  label: 'Two bars compare the two sides of an identity. The left bar is one block and the right bar is stacked blocks. They always reach the same height. The same comparison can be shown for the trigonometric version or the hyperbolic version, so you can see where the minus sign appears in the hyperbolic Pythagorean identity.',
  setup: (stage, c) => createPlot(stage, { x: [0, 2], y: [0, 4], c }),
  draw(ctx, stage, c, plot) {
    const b = bars(state);
    const top = Math.max(total(b.left), total(b.right)) * 1.25;
    plot.setRange([0, 2], [-top * 0.1, top]);
    plot.segment(0, 0, 2, 0, { color: c.ink, width: 3 });
    [[b.left, 0.1, 0.85, 'left side'], [b.right, 1.15, 1.9, 'right side']].forEach(([parts, x0, x1, title]) => {
      let y = 0;
      for (const [v, fill, name] of parts) {
        plot.shade(() => y + v, () => y, x0, x1, c[fill]);
        for (const [ax, ay, bx, by] of [[x0, y, x0, y + v], [x1, y, x1, y + v], [x0, y + v, x1, y + v], [x0, y, x1, y]]) plot.segment(ax, ay, bx, by, { color: c.ink, width: 3 });
        plot.text(`${name} = ${fixed(v, 3)}`, (x0 + x1) / 2, y + v / 2, { size: 10 });
        y += v;
      }
      plot.text(`${title}: ${fixed(y, 4)}`, (x0 + x1) / 2, y + top * 0.07, { size: 11, patch: false });
    });
    plot.text(b.eq, 1, -top * 0.05, { size: 11, patch: false });
  },
  controls: [
    { title: 'Compare the twins' },
    { key: 'fam', label: 'Functions', options: [['hyp', 'Hyperbolic'], ['trig', 'Trigonometric']] },
    { key: 'id', label: 'Identity', options: [['pyth', 'Pythagorean'], ['double', 'Double angle']] },
    { key: 't', label: 't', min: 0.05, max: 1.5, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['Left side', (s) => fixed(total(bars(s).left), 4)],
      ['Right side', (s) => ({ text: fixed(total(bars(s).right), 4), good: true })],
    ] },
  ],
  tex: (s) => (s.fam === 'hyp' ? '\\cosh^2t-\\sinh^2t=1\\qquad\\text{vs}\\qquad\\cos^2t+\\sin^2t=1' : '\\cos^2t+\\sin^2t=1\\qquad\\text{vs}\\qquad\\cosh^2t-\\sinh^2t=1'),
});
