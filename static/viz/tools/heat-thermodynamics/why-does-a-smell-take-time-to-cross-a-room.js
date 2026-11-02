import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { dot, line, label } from '../../lib/draw.js';
import { createDisks, mfp2d } from './_mfp.js';
import { fixed } from '../../lib/format.js';

const state = { N: 60 };
const R = 0.15;
let disks = createDisks({ N: state.N, r: R });
let last = 0;
const clock = createClock(document.querySelector('#stage'), {
  onFrame: (st) => {
    if (st.t < last) disks = createDisks({ N: state.N, r: R });
    const dt = st.t - last;
    last = st.t;
    if (dt > 0) disks.step(dt * 2);
    tool.update();
  },
});

const tool = createTool({
  state,
  label: 'Hard discs bouncing in a box. One disc is tagged in coral and leaves a trail. It changes direction at every collision, so its long winding path takes it only a short way from where it started. A dashed line joins the start to where it is now.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const s = Math.min((W - 20) / disks.W, (H - 20) / disks.H);
    const [x0, y0] = [10, (H - disks.H * s) / 2];
    ctx.fillStyle = c.fillY;
    ctx.fillRect(x0, y0, disks.W * s, disks.H * s);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 4;
    ctx.strokeRect(x0, y0, disks.W * s, disks.H * s);
    for (let i = 1; i < disks.N; i++) dot(ctx, x0 + disks.x[i] * s, y0 + disks.y[i] * s, R * s, c.fillB, c.ink, 1.5);
    ctx.beginPath();
    disks.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x0 + x * s, y0 + y * s) : ctx.moveTo(x0 + x * s, y0 + y * s)));
    ctx.strokeStyle = c.a;
    ctx.lineWidth = 2;
    ctx.stroke();
    line(ctx, x0 + disks.start[0] * s, y0 + disks.start[1] * s, x0 + disks.x[0] * s, y0 + disks.y[0] * s, { color: c.ink, width: 2, dash: [5, 4] });
    dot(ctx, x0 + disks.start[0] * s, y0 + disks.start[1] * s, 5, c.paper, c.ink, 2);
    dot(ctx, x0 + disks.x[0] * s, y0 + disks.y[0] * s, R * s + 1, c.a, c.ink, 2);
    label(ctx, 'start', x0 + disks.start[0] * s, y0 + disks.start[1] * s - 12, c, { size: 11, bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Crowd the box' },
    { key: 'N', label: 'Number of discs', min: 10, max: 120, step: 10 },
    transport(clock),
    { readout: [
      ['Path travelled', () => fixed(disks.path, 1)],
      ['Distance from start', () => fixed(disks.away(), 1)],
      ['Collisions', () => disks.coll],
      ['Mean free path', () => (disks.coll ? `${fixed(disks.path / disks.coll, 2)} (formula ${fixed(mfp2d(state.N, 2 * R, disks.W * disks.H), 2)})` : '—')],
    ] },
  ],
  onChange(s) { disks = createDisks({ N: s.N, r: R }); last = 0; clock.reset(); clock.play(); },
  tex: () => `\\text{path}=${fixed(disks.path, 1)}\\ \\gg\\ \\text{displacement}=${fixed(disks.away(), 1)}`,
});
clock.play();
