import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { foot, pointLine } from './_coordinate-plane-math.js';

const state = { A: 3, B: 4, C: -12, x: 5, y: 4 };
const R = 8;
const L = (s = state) => ({ a: s.A, b: s.B, c: s.C });
const byFormula = (s = state) => Math.abs(s.A * s.x + s.B * s.y + s.C) / Math.hypot(s.A, s.B);
const sg = (v) => (v < 0 ? `-${Math.abs(v)}` : `+${v}`);

const tool = createTool({
  state,
  label: 'A line given by A x plus B y plus C equals 0, and a point P you can drag. The foot of the perpendicular from P to the line is marked and the length of that perpendicular is measured. The formula using the coefficients gives the same number.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const { A, B, C } = state;
    if (B === 0) plot.segment(-C / A, -R, -C / A, R, { color: c.a, width: 4 });
    else plot.fn((x) => (-A * x - C) / B, { color: c.a, width: 4 });
    const F = foot(L(), [state.x, state.y]);
    plot.segment(state.x, state.y, F[0], F[1], { color: c.b, width: 4 });
    plot.point(F[0], F[1], { fill: c.c, r: 6 });
    plot.point(state.x, state.y, { fill: c.fillY, r: 9 });
    plot.text('P', state.x + 0.5, state.y + 0.6, { size: 12, patch: false });
  },
  controls: [
    { title: 'Line and point' },
    { key: 'A', label: 'A', min: -5, max: 5, step: 1 },
    { key: 'B', label: 'B', min: -5, max: 5, step: 1 },
    { key: 'C', label: 'C', min: -20, max: 20, step: 1 },
    { key: 'x', label: 'Point P, x', min: -7, max: 7, step: 1 },
    { key: 'y', label: 'Point P, y', min: -7, max: 7, step: 1 },
    { text: 'Drag P, or use the arrow keys.' },
    { readout: [
      ['Measured (perpendicular)', (s) => fixed(pointLine(L(s), [s.x, s.y]), 4)],
      ['By the formula', (s) => fixed(byFormula(s), 4)],
      ['Foot of the perpendicular', (s) => { const F = foot(L(s), [s.x, s.y]); return `(${fixed(F[0], 2)}, ${fixed(F[1], 2)})`; }],
    ] },
  ],
  onChange(s) { if (s.A === 0 && s.B === 0) s.A = 1; },
  tex: (s) => `d=\\dfrac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}=\\dfrac{|${s.A}(${s.x})${sg(s.B)}(${s.y})${sg(s.C)}|}{\\sqrt{${s.A * s.A + s.B * s.B}}}=${fixed(byFormula(s), 3)}`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.x, state.y),
  move(px, py) { const [x, y] = tool.extra.toWorld(px, py); state.x = Math.max(-7, Math.min(7, Math.round(x))); state.y = Math.max(-7, Math.min(7, Math.round(y))); },
  get keyStep() { return Math.abs(tool.extra.toPx(1, 0)[0] - tool.extra.toPx(0, 0)[0]); },
}], { onChange: () => tool.update(), radius: 28 });
tool.update();
