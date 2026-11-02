import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { arc, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { arrowW, drawPolarGrid, eqFrame, polarHandle, rad, segW } from './_kit.js';
import { toRect } from './_polar-math.js';

const state = { r: 4, th: 40, legs: true };
let f = null;

const tool = createTool({
  state,
  label: 'A polar grid of rings and rays. A point is reached by turning through the angle theta from the right-hand axis and then walking out along that ray by the distance r. The same point can also be reached by walking x across and y up, drawn as a right triangle whose sides are r cos theta and r sin theta.',
  draw(ctx, stage, c) {
    f = eqFrame(stage, [-6.3, 6.3], [-6.3, 6.3], 8);
    drawPolarGrid(ctx, f, c, stage, { rMax: 5 });
    const O = f.px([0, 0]);
    const [x, y] = toRect(state.r, state.th);
    if (state.legs) {
      segW(ctx, f, [0, 0], [x, 0], { color: c.c, width: 5 });
      segW(ctx, f, [x, 0], [x, y], { color: c.d, width: 5 });
    }
    if (state.r > 0) {
      arc(ctx, ...O, 34, 0, -rad(state.th), { color: c.a, width: 4 });
      arrowW(ctx, f, [0, 0], [x, y], { color: c.b, width: 5, head: 12 });
    }
    dot(ctx, ...f.px([x, y]), 9, c.a, c.ink);
    label(ctx, `(${fixed(state.r, 1)}, ${state.th}°)`, f.px([x, y])[0], f.px([x, y])[1] - 17, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Turn, then walk' },
    { text: 'Drag the point, or use the sliders.' },
    { key: 'th', label: 'Turn, θ', min: 0, max: 345, step: 15, format: (n) => `${n}°` },
    { key: 'r', label: 'Walk, r', min: 0, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { toggle: true, key: 'legs', label: 'Show x and y' },
    { readout: [
      ['Polar (r, θ)', () => `(${fixed(state.r, 1)}, ${state.th}°)`],
      ['x = r cos θ', () => fixed(toRect(state.r, state.th)[0], 3)],
      ['y = r sin θ', () => fixed(toRect(state.r, state.th)[1], 3)],
    ] },
  ],
  tex: () => `(x,y)=(r\\cos\\theta,\\ r\\sin\\theta)=(${fixed(toRect(state.r, state.th)[0], 2)},\\ ${fixed(toRect(state.r, state.th)[1], 2)})`,
});

handles(tool.stage, [polarHandle(() => f, () => state, (p) => Object.assign(state, p), { rMax: 5 })], { onChange: () => tool.update(), radius: 34 });
