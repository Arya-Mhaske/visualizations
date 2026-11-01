import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, dot, label, line, poly } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { rad } from './_right-triangle-math.js';
import { speedUp, spotPosition, spotSpeed } from './_tan-cot-math.js';

const CYCLE = 8; // seconds on screen for a sweep from −80° to +80°
const state = { t: 2.4, d: 200, rate: 10 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const theta = (s) => -80 + (160 * s.t) / CYCLE;

const tool = createTool({
  state,
  label: 'Top: a plan view of a lighthouse on the left, a straight wall on the right, and a beam turning at a steady rate. The spot where the beam hits the wall slides along it, and leaves the picture as the beam nears parallel to the wall. Bottom: a graph of how many times faster the spot moves than when the beam points straight at the wall. It is secant squared of the angle, which rises steeply near 90 degrees.',
  setup: (stage, c) => createPlot(stage, {
    x: [-80, 80], y: [0, 40], c, pad: 20, box: (g) => ({ x: 0, y: g.h * 0.55, w: g.w, h: g.h * 0.45 }),
  }),
  draw(ctx, stage, c, plot) {
    const th = theta(state);
    const H = stage.h * 0.5;
    const mid = H / 2;
    const lx = stage.w * 0.3;
    const wx = stage.w * 0.74;
    const yHit = mid - (wx - lx) * Math.tan(rad(th));
    line(ctx, wx, 6, wx, H - 6, { color: c.ink, width: 5 });
    line(ctx, lx, mid, wx, mid, { color: c.grid, width: 1, dash: [5, 4] });
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, stage.w, H);
    ctx.clip();
    line(ctx, lx, mid, wx, yHit, { color: c.a, width: 3 }); // the beam, cut off at the edge of this picture
    ctx.restore();
    poly(ctx, [[lx - 9, mid + 9], [lx + 9, mid + 9], [lx + 5, mid - 11], [lx - 5, mid - 11]], { fill: c.fillY, stroke: c.ink, width: 2 });
    if (yHit > 12 && yHit < H - 12) dot(ctx, wx, yHit, 8, c.a, c.ink);
    else {
      const up = yHit <= 12;
      arrow(ctx, wx - 16, up ? 30 : H - 30, wx - 16, up ? 8 : H - 8, { color: c.a, width: 3, head: 9 });
      label(ctx, up ? 'spot is far above' : 'spot is far below', wx - 26, up ? 20 : H - 18, c, { size: 10, align: 'right', color: c.a, bounds: stage, patch: false });
    }
    label(ctx, `wall, ${state.d} m away`, wx + 8, mid, c, { size: 10, align: 'left', bounds: stage, patch: false });
    label(ctx, `${fixed(th, 0)}°`, lx + 40, mid + (th > 0 ? -14 : 14), c, { size: 11, bounds: stage, patch: false });
    plot.axes({ xLabel: 'θ (°)', yLabel: '× faster', grid: true });
    plot.fn((x) => speedUp(x), { color: c.b, width: 3 });
    plot.point(th, Math.min(speedUp(th), 39), { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Sweep the beam' },
    { key: 't', label: 'Beam angle, θ', min: 0, max: CYCLE, step: 0.02, format: (n) => `${fixed(-80 + (160 * n) / CYCLE, 0)}°` },
    transport(line2.clock),
    { key: 'd', label: 'Distance to the wall, d', min: 100, max: 400, step: 50, format: (n) => `${n} m` },
    { key: 'rate', label: 'Beam turns at', min: 5, max: 30, step: 5, format: (n) => `${n}°/s` },
    { readout: [
      ['Spot along the wall', (s) => `${sig(spotPosition(s.d, theta(s)), 3)} m`],
      ['Spot speed', (s) => `${sig(spotSpeed(s.d, s.rate, theta(s)), 3)} m/s`],
      ['Faster than at 0°', (s) => `× ${sig(speedUp(theta(s)), 3)}`],
    ] },
  ],
  tex: (s) => `x=d\\tan\\theta,\\quad \\dfrac{dx}{dt}=d\\,\\omega\\sec^2\\theta=${sig(spotSpeed(s.d, s.rate, theta(s)), 3)}\\text{ m/s}`,
  onChange: () => line2.sync(),
});
line2.sync();
tool.update();
