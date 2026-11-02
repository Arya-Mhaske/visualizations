import { createTool } from '../../lib/tool.js';
import { dot, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawPolarGrid, eqFrame, rad, segW } from './_kit.js';
import { otherName, toRect } from './_polar-math.js';

const state = { r: 3, th: 40, turns: 0, flip: false };
const name = () => otherName(state.r, state.th, state.turns, state.flip);
const P = () => toRect(state.r, state.th);

createTool({
  state,
  label: 'A polar grid with one fixed point. A spiral arc shows the turn, which can be a full extra turn or a half turn more. A coral arrow shows the walk, which goes backwards if r is negative. However the name is changed this way, the walk ends on the same point.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-5.3, 5.3], [-5.3, 5.3], 8);
    drawPolarGrid(ctx, f, c, stage, { rMax: 4.5, rayStep: 45 });
    const n = name();
    const O = f.px([0, 0]);
    // the turn, drawn as a spiral so extra whole turns show
    const pts = [];
    const sweep = n.thD;
    const steps = Math.max(8, Math.round(Math.abs(sweep) / 5));
    for (let i = 0; i <= steps; i++) {
      const a = (sweep * i) / steps;
      const rr = 0.45 + (Math.abs(a) / 360) * 0.25;
      pts.push(f.px([rr * Math.cos(rad(a)), rr * Math.sin(rad(a))]));
    }
    poly(ctx, pts, { stroke: c.b, width: 3, closed: false });
    const dir = [Math.cos(rad(n.thD)), Math.sin(rad(n.thD))];
    segW(ctx, f, [0, 0], [dir[0] * 4.8, dir[1] * 4.8], { color: c.d, width: 2, dash: [6, 5] });
    arrowW(ctx, f, [0, 0], [dir[0] * n.r, dir[1] * n.r], { color: c.a, width: 5, head: 12 });
    dot(ctx, ...f.px(P()), 9, c.c, c.ink);
    dot(ctx, ...O, 4, c.ink, c.ink);
    label(ctx, `(${fixed(n.r, 1)}, ${fixed(n.thD, 0)}°)`, f.px(P())[0], f.px(P())[1] - 17, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Rename the same point' },
    { key: 'turns', label: 'Extra whole turns, k', min: -2, max: 2, step: 1, format: (n) => (n > 0 ? `+${n}` : String(n)) },
    { toggle: true, key: 'flip', label: 'Use a negative r (turn half a turn more)' },
    { key: 'th', label: 'Original angle', min: 0, max: 345, step: 15, format: (n) => `${n}°` },
    { key: 'r', label: 'Original r', min: 1, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['This name', () => `(${fixed(name().r, 1)}, ${fixed(name().thD, 0)}°)`],
      ['Where it lands (x, y)', () => `(${fixed(toRect(name().r, name().thD)[0], 3)}, ${fixed(toRect(name().r, name().thD)[1], 3)})`],
      ['Original lands at', () => `(${fixed(P()[0], 3)}, ${fixed(P()[1], 3)})`],
    ] },
  ],
  tex: () => `(r,\\theta)=(${fixed(state.r, 1)},\\ ${state.th}^\\circ)=(${fixed(name().r, 1)},\\ ${fixed(name().thD, 0)}^\\circ)`,
});
