import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { dot, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawPolarGrid, eqFrame, rad, segW } from './_kit.js';
import { roseTurn, rosePetals } from './_polar-math.js';

const A = 4;
const state = { n: 2, t: 100 };
const timeline = createTimeline(document.querySelector('#stage'), state, { cycle: () => 360, update: () => tool.update() });
timeline.clock.speed = 60;
const r = (t) => A * Math.cos(state.n * rad(t));

const tool = createTool({
  state,
  label: 'A rose curve r equals 4 cos of n theta being drawn by a pen as the angle theta grows. Stretches where r is positive are coral and stretches where r is negative are blue. For even n the blue stretches draw new petals behind the pen, so there are 2n petals; for odd n they retrace the coral petals, so there are n.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-5.2, 5.2], [-5.2, 5.2], 8);
    drawPolarGrid(ctx, f, c, stage, { rMax: 4.5, rayStep: 45, labels: false });
    const trace = (from, to, color, width) => {
      const piece = [];
      const steps = Math.max(2, Math.ceil(to - from));
      for (let i = 0; i <= steps; i++) {
        const t = from + ((to - from) * i) / steps;
        const rr = r(t);
        piece.push(f.px([rr * Math.cos(rad(t)), rr * Math.sin(rad(t))]));
      }
      if (piece.length > 1) poly(ctx, piece, { stroke: color, width, closed: false });
    };
    trace(0, 360, c.grid, 2);
    let start = 0;
    for (let t = 1; t <= state.t; t += 1) {
      if ((r(t) >= 0) !== (r(t - 1) >= 0)) {
        trace(start, t, r((start + t) / 2) >= 0 ? c.a : c.b, 4);
        start = t;
      }
    }
    if (state.t > start) trace(start, state.t, r((start + state.t) / 2) >= 0 ? c.a : c.b, 4);
    const rr = r(state.t);
    const pen = [rr * Math.cos(rad(state.t)), rr * Math.sin(rad(state.t))];
    segW(ctx, f, [0, 0], [4.9 * Math.cos(rad(state.t)), 4.9 * Math.sin(rad(state.t))], { color: c.d, width: 1.5, dash: [6, 5] });
    arrowW(ctx, f, [0, 0], pen, { color: rr >= 0 ? c.a : c.b, width: 3, head: 9 });
    dot(ctx, ...f.px(pen), 8, rr >= 0 ? c.a : c.b, c.ink);
    label(ctx, rr >= 0 ? 'r positive' : 'r negative: walking backwards', stage.w / 2, 14, c, { size: 11, color: rr >= 0 ? c.a : c.b, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Draw r = 4 cos nθ' },
    { key: 'n', label: 'n', min: 1, max: 8, step: 1 },
    { key: 't', label: 'Angle drawn so far, θ', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    transport(timeline.clock),
    { readout: [
      ['r now', () => fixed(r(state.t), 2)],
      ['Petals', () => String(rosePetals(state.n))],
      ['θ to finish the curve', () => `${roseTurn(state.n)}°`],
    ] },
  ],
  tex: () => `r=4\\cos ${state.n}\\theta\\ \\Rightarrow\\ ${rosePetals(state.n)}\\ \\text{petals}\\ (n\\ \\text{is}\\ ${state.n % 2 ? 'odd: n' : 'even: 2n'})`,
  onChange: () => timeline.sync(),
});
