import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { label, line, spring } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { omega, periodOf } from './_force-law-math.js';

const REF = { k: 4, m: 1 };
const A = 1;
const END = 10;
const state = { k: 9, m: 1 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const t = () => clock.state.t % END;
const pos = (k, m, u) => A * Math.cos(omega(k, m) * u);

const tool = createTool({
  state,
  label: 'Two masses on springs, both pulled aside by the same distance and released. A reference system is blue and the one you change is coral. Their graphs show which swings faster.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, END], y: [-1.3, 1.3], c, box: (s) => ({ x: 0, y: s.h * 0.4, w: s.w, h: s.h * 0.6 }),
  }),
  draw(ctx, stage, c, plot) {
    const [wall, mid] = [14, stage.w * 0.55];
    const unit = (stage.w * 0.36) / A;
    [[REF, c.b, stage.h * 0.1, 'reference'], [state, c.a, stage.h * 0.27, 'yours']].forEach(([s, color, y, name]) => {
      const x = mid + pos(s.k, s.m, t()) * unit;
      const half = 10 + s.m * 5;
      line(ctx, wall, y - 18, wall, y + 18, { color: c.ink, width: 5 });
      spring(ctx, wall, x - half, y, { color: c.ink, width: 1 + s.k * 0.3 });
      ctx.fillStyle = color;
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.fillRect(x - half, y - half, half * 2, half * 2);
      ctx.strokeRect(x - half, y - half, half * 2, half * 2);
      label(ctx, name, stage.w - 40, y, c, { size: 10, bounds: stage });
    });
    line(ctx, mid, stage.h * 0.03, mid, stage.h * 0.34, { color: c.grid, width: 2, dash: [4, 4] });
    plot.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    plot.fn((u) => pos(REF.k, REF.m, u), { color: c.b });
    plot.fn((u) => pos(state.k, state.m, u), { color: c.a });
    plot.segment(t(), -1.3, t(), 1.3, { color: c.ink, width: 1 });
  },
  controls: [
    { title: 'Stiffen the spring, add mass' },
    { key: 'k', label: 'Spring stiffness, k', min: 1, max: 16, step: 1, format: (n) => `${n} N/m` },
    { key: 'm', label: 'Mass, m', min: 0.5, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} kg` },
    transport(clock),
    { readout: [
      ['Force at release, kA', (s) => `${fixed(s.k * A, 1)} N`],
      ['Acceleration, kA/m', (s) => `${fixed((s.k * A) / s.m, 2)} m/s²`],
      ['ω = √(k/m)', (s) => `${fixed(omega(s.k, s.m), 2)} rad/s`],
      ['Period, T', (s) => `${fixed(periodOf(s.k, s.m), 2)} s`],
      ['Reference ω', () => `${fixed(omega(REF.k, REF.m), 2)} rad/s`],
      ['ω against reference', (s) => `× ${fixed(omega(s.k, s.m) / omega(REF.k, REF.m), 2)}`],
    ] },
  ],
  tex: (s) => `\\omega = \\sqrt{\\frac{k}{m}} = \\sqrt{\\frac{${s.k}}{${fixed(s.m, 1)}}} = ${fixed(omega(s.k, s.m), 2)}\\ \\text{rad/s}`,
});

clock.step(1);
