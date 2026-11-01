import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arrow, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { RULES, table } from './_what-is-a-function-math.js';

const XS = [-3, -2, -1, 0, 1, 2, 3];
const state = { rule: 'lin', x: 2 };

createTool({
  state,
  label: 'Three views of one function, kept in step. At the top, a machine takes the chosen input and gives an output. In the middle, the graph with a point at that input. At the bottom, a table of values for inputs minus three to three, with the chosen column highlighted.',
  setup: (stage, c) => createPlot(stage, {
    x: [-3.6, 3.6], y: RULES.lin.y, c, pad: 18, box: (g) => ({ x: 0, y: g.h * 0.22, w: g.w, h: g.h * 0.5 }),
  }),
  draw(ctx, stage, c, plot) {
    const { f, text, y } = RULES[state.rule];
    const out = f(state.x);
    // the machine
    const mid = stage.h * 0.11;
    const [bx, bw, bh] = [stage.w * 0.34, stage.w * 0.32, stage.h * 0.12];
    arrow(ctx, stage.w * 0.14, mid, bx - 2, mid, { color: c.ink, width: 3 });
    arrow(ctx, bx + bw + 2, mid, stage.w * 0.86, mid, { color: c.ink, width: 3 });
    poly(ctx, [[bx, mid - bh / 2], [bx + bw, mid - bh / 2], [bx + bw, mid + bh / 2], [bx, mid + bh / 2]], { fill: c.fillY, stroke: c.ink, width: 3 });
    label(ctx, text, bx + bw / 2, mid, c, { size: 13, patch: false, bounds: stage });
    label(ctx, `x = ${state.x}`, stage.w * 0.14, mid - 20, c, { size: 12, color: c.a, bounds: stage, patch: false });
    label(ctx, `f(x) = ${fixed(out, 2)}`, stage.w * 0.86, mid - 20, c, { size: 12, color: c.c, align: 'right', bounds: stage, patch: false });
    // the graph
    plot.setRange([-3.6, 3.6], y);
    plot.axes({ grid: false });
    plot.fn(f, { color: c.b, width: 3 });
    XS.forEach((x) => plot.point(x, f(x), { fill: x === state.x ? c.a : c.paper, r: x === state.x ? 8 : 4 }));
    // the table
    const rows = table(state.rule, XS);
    const colW = stage.w / 8;
    const top = stage.h * 0.77;
    label(ctx, 'x', colW * 0.5, top, c, { size: 12, bounds: stage, patch: false });
    label(ctx, 'f(x)', colW * 0.5, top + 26, c, { size: 12, bounds: stage, patch: false });
    rows.forEach(([x, v], i) => {
      const cx = colW * (i + 1.5);
      if (x === state.x) poly(ctx, [[cx - colW / 2 + 2, top - 14], [cx + colW / 2 - 2, top - 14], [cx + colW / 2 - 2, top + 40], [cx - colW / 2 + 2, top + 40]], { fill: c.fillA });
      label(ctx, String(x), cx, top, c, { size: 12, bounds: stage, patch: false });
      label(ctx, fixed(v, 1), cx, top + 26, c, { size: 12, bounds: stage, patch: false });
    });
    line(ctx, 4, top + 13, stage.w - 4, top + 13, { color: c.ink, width: 2 });
  },
  controls: [
    { title: 'Change the rule or the input' },
    { key: 'rule', label: 'Rule', options: [['lin', '2x − 1'], ['sq', 'x² − 2'], ['abs', '|x| − 1'], ['cube', 'x³/3']] },
    { key: 'x', label: 'Input, x', min: -3, max: 3, step: 1 },
    { readout: [
      ['Rule', (s) => `f(x) = ${RULES[s.rule].text}`],
      ['Input', (s) => s.x],
      ['Output', (s) => fixed(RULES[s.rule].f(s.x), 3)],
    ] },
  ],
  tex: (s) => `f(x)=${RULES[s.rule].tex}\\ \\Rightarrow\\ f(${s.x})=${fixed(RULES[s.rule].f(s.x), 2)}`,
});
