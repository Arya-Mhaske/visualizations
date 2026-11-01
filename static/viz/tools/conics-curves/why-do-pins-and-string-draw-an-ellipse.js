import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { fixed } from '../../lib/format.js';
import { dist, ellipsePoint, focalC } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 5, c: 3, t: 55 };
const R = 7;
const b = (s = state) => Math.sqrt(s.a * s.a - s.c * s.c);
const pen = (s = state) => ellipsePoint(s.a, b(s), (s.t * Math.PI) / 180);
const d1 = (s = state) => dist(pen(s), [-s.c, 0]);
const d2 = (s = state) => dist(pen(s), [s.c, 0]);
let tool;

tool = createTool({
  state,
  label: 'Two pins on a line and a loop of string pulled tight by a pen. As the pen moves, the string stays taut, so the two distances from the pen to the pins always add up to the string length. The pen traces an ellipse. The two distances and their sum are shown.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: '', yLabel: '' });
    curve(plot, trace((u) => ellipsePoint(state.a, b(), u), 0, Math.PI * 2, 200), { color: c.grid, width: 3, dash: [5, 4] });
    const P = pen();
    plot.segment(-state.c, 0, P[0], P[1], { color: c.a, width: 3 });
    plot.segment(state.c, 0, P[0], P[1], { color: c.b, width: 3 });
    [-state.c, state.c].forEach((x) => plot.point(x, 0, { fill: c.c, r: 8 }));
    plot.point(P[0], P[1], { fill: c.fillY, r: 9 });
    plot.text('pin', -state.c, -0.8, { size: 11, patch: false });
    plot.text('pin', state.c, -0.8, { size: 11, patch: false });
  },
  controls: [
    { title: 'Move the pen' },
    { key: 't', label: 'Pen position (angle)', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { key: 'a', label: 'Half the string, a', min: 3, max: 6, step: 0.5 },
    { key: 'c', label: 'Half the gap between pins, c', min: 0, max: 2.5, step: 0.5 },
    { text: 'You can also drag the pen round.' },
    { readout: [
      ['Pen to left pin', (s) => fixed(d1(s), 3)],
      ['Pen to right pin', (s) => fixed(d2(s), 3)],
      ['Sum', (s) => ({ text: fixed(d1(s) + d2(s), 3), good: true })],
      ['String length, 2a', (s) => fixed(2 * s.a, 3)],
    ] },
  ],
  onChange(s) { if (s.c >= s.a) s.c = s.a - 0.5; },
  tex: (s) => `d_1+d_2=${fixed(d1(s), 2)}+${fixed(d2(s), 2)}=${fixed(d1(s) + d2(s), 2)}=2a`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(...pen()),
  move(px, py) {
    const [x, y] = tool.extra.toWorld(px, py);
    state.t = Math.round((Math.atan2(y / b(), x / state.a) * 180) / Math.PI + 360) % 360;
  },
  nudge(dir) { state.t = (state.t + dir * 5 + 360) % 360; },
}], { onChange: () => tool.update(), radius: 30 });
tool.update();
