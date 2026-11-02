import { createTool } from '../../lib/tool.js';
import { arrow, dot, line, label, TAU } from '../../lib/draw.js';
import { divide, decimalText } from './_number-systems-math.js';

const state = { view: 'div', q: 7, p: 1, n: 3 };
let tool;

tool = createTool({
  state,
  label: 'Either a ring of dots for the possible remainders with arrows following the long division from one remainder to the next until it repeats, or rows of shrinking gaps between 0.999… and 1.',
  draw(ctx, stage, c) {
    if (state.view === 'nines') {
      for (let k = 1; k <= 12; k++) {
        const y = 28 + (k - 1) * ((stage.h - 60) / 12);
        const len = ((13 - k) / 12) * (stage.w - 150);
        line(ctx, 130, y, 130 + len, y, { color: k <= state.n ? c.a : c.grid, width: 6 });
        label(ctx, `1 − 0.${'9'.repeat(k)}`.slice(0, 16), 8, y, c, { size: 10, align: 'left', patch: false });
      }
      label(ctx, `gap after ${state.n} nines = 10^−${state.n}`, stage.w / 2, stage.h - 12, c, { size: 12, bounds: stage, patch: false });
      return;
    }
    const { p, q } = state;
    const d = divide(p, q);
    const [cx, cy, R] = [stage.w / 2, stage.h * 0.54, Math.min(stage.w, stage.h) * 0.36];
    const at = (r) => [cx + R * Math.sin((r / q) * TAU), cy - R * Math.cos((r / q) * TAU)];
    const seq = [...d.rem, ...(d.terminates ? [0] : [d.rem[d.start]])];
    for (let i = 0; i < seq.length - 1; i++) {
      const [x1, y1] = at(seq[i]);
      const [x2, y2] = at(seq[i + 1]);
      const looping = !d.terminates && i >= d.start;
      arrow(ctx, x1, y1, x1 + (x2 - x1) * 0.82, y1 + (y2 - y1) * 0.82, { color: looping ? c.a : c.ink, width: 2, head: 7 });
    }
    for (let r = 0; r < q; r++) {
      const [x, y] = at(r);
      const used = seq.includes(r);
      dot(ctx, x, y, 8, used ? c.fillB : c.paper, c.ink, 2);
      label(ctx, String(r), x, y, c, { size: 9, patch: false });
    }
    label(ctx, `${p}/${q} = ${decimalText(p, q)}`, stage.w / 2, 16, c, { size: 14, bounds: stage, patch: false });
    label(ctx, d.terminates ? 'remainder 0: stops' : `repeats every ${d.period}`, stage.w / 2, stage.h - 10, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Divide' },
    { key: 'view', label: 'View', options: [['div', 'Long division'], ['nines', '0.999…']] },
    { key: 'p', label: 'Numerator p', min: 1, max: 29, step: 1 },
    { key: 'q', label: 'Denominator q', min: 2, max: 30, step: 1 },
    { key: 'n', label: 'Number of nines', min: 1, max: 12, step: 1 },
    { readout: [
      ['Decimal', (s) => (s.view === 'div' ? decimalText(s.p, s.q) : `0.${'9'.repeat(s.n)}`)],
      ['Remainders before repeat', (s) => String(divide(s.p, s.q).rem.length)],
      ['Most possible', (s) => String(s.q - 1)],
    ] },
  ],
  tex: (s) => (s.view === 'div' ? `\\dfrac{${s.p}}{${s.q}}=${decimalText(s.p, s.q).replace('(', '\\overline{').replace(')', '}')}` : `1-0.${'9'.repeat(s.n)}=10^{-${s.n}}`),
  onChange: (s) => {
    s.p = Math.min(s.p, s.q - 1);
    sync(s);
    tool?.ui.refresh();
  },
});
function sync(s) {
  const fields = [...document.querySelectorAll('#panel .nb-field')];
  fields[1].hidden = fields[2].hidden = s.view !== 'div';
  fields[3].hidden = s.view !== 'nines';
}
sync(state);
