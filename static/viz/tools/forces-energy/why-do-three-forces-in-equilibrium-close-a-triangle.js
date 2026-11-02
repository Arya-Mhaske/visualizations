import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { m3: 30, a3: 250 };
const rad = (d) => (d * Math.PI) / 180;
const F1 = [40 * Math.cos(rad(110)), 40 * Math.sin(rad(110))];
const F2 = [30 * Math.cos(rad(10)), 30 * Math.sin(rad(10))];
const F3 = (s) => [s.m3 * Math.cos(rad(s.a3)), s.m3 * Math.sin(rad(s.a3))];
const sum = (s) => [F1[0] + F2[0] + F3(s)[0], F1[1] + F2[1] + F3(s)[1]];
let tool;

tool = createTool({
  state,
  label: 'Three force arrows laid tip to tail. When the third force balances the first two, the chain returns to its start and forms a closed triangle. Otherwise a dashed line shows the gap, the net force.',
  setup: (stage, c) => createPlot(stage, { x: [-60, 60], y: [-60, 60], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x (N)', yLabel: 'y (N)' });
    const p1 = F1;
    const p2 = [F1[0] + F2[0], F1[1] + F2[1]];
    const p3 = [p2[0] + F3(state)[0], p2[1] + F3(state)[1]];
    plot.segment(0, 0, ...p1, { color: c.a, width: 4 });
    plot.segment(...p1, ...p2, { color: c.b, width: 4 });
    plot.segment(...p2, ...p3, { color: c.c, width: 4 });
    plot.segment(...p3, 0, 0, { color: c.ink, width: 2, dash: [5, 4] });
    [p1, p2, p3].forEach((p) => plot.point(...p, { fill: c.ink, r: 4 }));
  },
  controls: [
    { title: 'Choose the third force' },
    { key: 'm3', label: 'Size of F₃ (N)', min: 0, max: 60, step: 1 },
    { key: 'a3', label: 'Direction of F₃ (°)', min: 0, max: 360, step: 1 },
    { button: 'Balance it for me', onClick: () => { const s = sum({ m3: 0, a3: 0 }); state.m3 = Math.round(Math.hypot(...s)); state.a3 = Math.round(((Math.atan2(-s[1], -s[0]) * 180) / Math.PI + 360) % 360); tool.update(); } },
    { readout: [
      ['Net force ΣF', (s) => `${fixed(Math.hypot(...sum(s)), 1)} N`],
      ['In equilibrium?', (s) => ({ text: Math.hypot(...sum(s)) < 1.5 ? 'yes: triangle closed' : 'no: gap', good: Math.hypot(...sum(s)) < 1.5 })],
    ] },
  ],
  tex: () => `\\vec F_1+\\vec F_2+\\vec F_3=\\vec 0`,
});
