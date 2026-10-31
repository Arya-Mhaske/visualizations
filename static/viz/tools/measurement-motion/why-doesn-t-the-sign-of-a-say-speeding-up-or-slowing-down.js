import { createTool } from '../../lib/tool.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { speedingUp, uniformV, uniformX } from './_motion-in-a-straight-line-math.js';

const state = { v: 8, a: -2, flip: false };
const sign = (s) => (s.flip ? -1 : 1);
const shownV = (s) => sign(s) * s.v;
const shownA = (s) => sign(s) * s.a;
const SECONDS = [0, 1, 2, 3];

createTool({
  state,
  label: 'A car with velocity and acceleration arrows above dots marking its position each second. Wider gaps mean speeding up.',
  draw(ctx, stage, c) {
    const y = stage.h * 0.55;
    const unit = stage.w / 60;
    const mid = stage.w / 2;
    const dir = sign(state);
    line(ctx, 12, y, stage.w - 12, y, { color: c.ink });
    arrow(ctx, mid + dir * (stage.w / 2 - 44), y + 36, mid + dir * (stage.w / 2 - 12), y + 36, { color: c.ink, width: 2 });
    label(ctx, '+x', mid + dir * (stage.w / 2 - 34), y + 52, c, { size: 12 });
    const position = (t) => mid + (uniformX(state.v, state.a, t) - 9) * unit;
    SECONDS.forEach((t) => {
      dot(ctx, position(t), y, 8, t ? c.fillA : c.a, c.ink);
      label(ctx, `${t} s`, position(t), y - 18, c, { size: 10 });
    });
    const start = position(0);
    const arrowAt = (value, top, color, name) => {
      arrow(ctx, start, top, start + value * unit * 2.5, top, { color, width: 5, head: 14 });
      label(ctx, name, start, top - 16, c, { size: 12, color, bounds: stage });
    };
    arrowAt(state.v, stage.h * 0.16, c.b, `v = ${fixed(shownV(state), 1)}`);
    arrowAt(state.a, stage.h * 0.32, c.d, `a = ${fixed(shownA(state), 1)}`);
  },
  controls: [
    { title: 'Compare a with v' },
    { key: 'v', label: 'Velocity along the road', min: -10, max: 10, step: 1, format: (v) => `${v} m/s` },
    { key: 'a', label: 'Acceleration along the road', min: -4, max: 4, step: 0.5, format: (v) => `${fixed(v, 1)} m/s²` },
    { key: 'flip', label: 'Flip the +x axis', toggle: true },
    { readout: [
      ['v (with this axis)', (s) => `${fixed(shownV(s), 1)} m/s`],
      ['a (with this axis)', (s) => `${fixed(shownA(s), 1)} m/s²`],
      ['Speed after 1 s', (s) => `${fixed(Math.abs(uniformV(s.v, s.a, 1)), 1)} m/s`],
      ['The car is', (s) => {
        if (s.v === 0 || s.a === 0) return s.a === 0 ? 'steady' : 'starting off';
        return speedingUp(s.v, s.a) ? { text: 'speeding up', good: true } : { text: 'slowing down', good: false };
      }],
    ] },
  ],
  tex: (s) => `v \\times a = (${fixed(shownV(s), 1).replace('−', '-')}) \\times (${fixed(shownA(s), 1).replace('−', '-')}) = ${fixed(s.v * s.a, 1).replace('−', '-')}`,
});
