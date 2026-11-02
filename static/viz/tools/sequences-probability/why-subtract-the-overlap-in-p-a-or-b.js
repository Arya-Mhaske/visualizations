import { createTool } from '../../lib/tool.js';
import { venn } from '../../lib/discrete.js';
import { label } from '../../lib/draw.js';

const N = 40;
const state = { a: 20, b: 16, both: 8, minus: false };
let tool;
const fix = (s) => {
  s.both = Math.min(s.both, s.a, s.b);
  if (s.a + s.b - s.both > N) s.both = s.a + s.b - N;
};

tool = createTool({
  state,
  label: 'A Venn diagram of 40 students. The overlap between cricket and chess is shaded darker, because adding the two circles counts it twice.',
  draw(ctx, stage, c) {
    const { a, b, both } = state;
    venn(ctx, { x: 10, y: 10, w: stage.w - 20, h: stage.h - 70 }, c, { a: c.fillA, b: c.fillB, both: c.a, none: null }, {
      names: ['Cricket A', 'Chess B'],
      counts: { a: a - both, b: b - both, both, none: N - (a + b - both) },
    });
    const sum = a + b;
    const txt = state.minus ? `${sum} − ${both} = ${sum - both} students counted once` : `${a} + ${b} = ${sum} counted: ${both} twice`;
    label(ctx, txt, stage.w / 2, stage.h - 30, c, { size: 13, bounds: stage });
    label(ctx, `of ${N} students`, stage.w / 2, stage.h - 12, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two clubs' },
    { key: 'a', label: 'Cricket n(A)', min: 0, max: 30, step: 1 },
    { key: 'b', label: 'Chess n(B)', min: 0, max: 30, step: 1 },
    { key: 'both', label: 'Both n(A ∩ B)', min: 0, max: 30, step: 1 },
    { key: 'minus', label: 'Subtract the overlap', toggle: true },
    { readout: [
      ['P(A) + P(B)', (s) => `${s.a + s.b}/${N}`],
      ['Counted twice', (s) => String(s.both)],
      ['P(A or B)', (s) => `${s.a + s.b - s.both}/${N}`],
    ] },
  ],
  tex: (s) => `P(A\\cup B)=\\dfrac{${s.a}}{${N}}+\\dfrac{${s.b}}{${N}}-\\dfrac{${s.both}}{${N}}=\\dfrac{${s.a + s.b - s.both}}{${N}}`,
  onChange: (s) => {
    fix(s);
    tool?.ui.refresh();
  },
});
