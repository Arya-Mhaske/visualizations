import { createTool } from '../../lib/tool.js';
import { createLoop, reducedMotion } from '../../lib/anim.js';
import { arc, dot, label, line, TAU } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { speed } from './_angles-arcs-math.js';

const state = { omega: 0.6, inner: 2, outer: 5, angle: 0.5, trail: 2 };
let loop = null;

const tool = createTool({
  state,
  label: 'A merry-go-round seen from above with an inner and an outer horse on one spoke. In the same time the outer horse sweeps a longer arc.',
  draw(ctx, stage, c) {
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const unit = (stage.size * 0.44) / 6;
    arc(ctx, cx, cy, 6 * unit, 0, TAU, { color: c.grid });
    for (const [radius, color] of [[state.inner, c.b], [state.outer, c.a]]) {
      const r = radius * unit;
      arc(ctx, cx, cy, r, 0, TAU, { color: c.grid, width: 1 });
      arc(ctx, cx, cy, r, -state.angle, -state.angle + state.omega * state.trail, { color, width: 7 });
    }
    const [dx, dy] = [Math.cos(-state.angle), Math.sin(-state.angle)];
    line(ctx, cx, cy, cx + 6 * unit * dx, cy + 6 * unit * dy, { color: c.ink });
    dot(ctx, cx + state.inner * unit * dx, cy + state.inner * unit * dy, 9, c.b, c.ink);
    dot(ctx, cx + state.outer * unit * dx, cy + state.outer * unit * dy, 11, c.a, c.ink);
    dot(ctx, cx, cy, 5, c.ink);
    label(ctx, `coloured arcs: distance in the last ${state.trail} s`, stage.w / 2, stage.h - 12, c, { size: 11, bounds: stage });
  },
  controls: (self) => [
    { title: 'One spoke, two horses' },
    { key: 'omega', label: 'Angular speed, ω', min: 0.1, max: 1.5, step: 0.1, format: (v) => `${fixed(v, 1)} rad/s` },
    { key: 'inner', label: 'Inner horse, r', min: 1, max: 3, step: 0.5, format: (v) => `${fixed(v, 1)} m` },
    { key: 'outer', label: 'Outer horse, r', min: 3.5, max: 6, step: 0.5, format: (v) => `${fixed(v, 1)} m` },
    { key: 'angle', label: 'Spoke position', min: 0, max: 6.28, step: 0.01, format: (v) => `${fixed(v, 2)} rad` },
    { row: [
      { button: 'Spin', onClick() { if (!loop.playing && !loop.start()) { state.angle = (state.angle + 0.5) % TAU; self.update(); } } },
      { button: 'Stop', ghost: true, onClick() { loop.stop(); } },
    ] },
    { readout: [
      ['Both horses turn', (s) => `${fixed(s.omega, 1)} rad/s`],
      ['Inner speed', (s) => `${fixed(speed(s.inner, s.omega), 2)} m/s`],
      ['Outer speed', (s) => `${fixed(speed(s.outer, s.omega), 2)} m/s`],
      ['Outer ÷ inner', (s) => fixed(s.outer / s.inner, 2)],
    ] },
  ],
  tex: (s) => `v = r\\omega:\\quad ${fixed(s.outer, 1)} \\times ${fixed(s.omega, 1)} = ${fixed(speed(s.outer, s.omega), 2)}\\ \\text{m/s}`,
});

loop = createLoop(document.querySelector('#stage'), (dt) => {
  state.angle = (state.angle + state.omega * dt) % TAU;
  tool.update();
});
if (reducedMotion()) loop.stop();
