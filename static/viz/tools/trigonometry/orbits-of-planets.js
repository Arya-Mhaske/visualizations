import { createTool } from '../../lib/tool.js';
import { dot, label, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { drawGrid, eqFrame, rad, segW } from './_kit.js';
import { PLANETS, aphelion, orbitR, perihelion, semiMinor } from './_polar-math.js';

const state = { a: 4, e: 0.4, t: 60 };
const where = (tD) => { const r = orbitR(state.a, state.e, tD); return [r * Math.cos(rad(tD)), r * Math.sin(rad(tD))]; };

const tool = createTool({
  state,
  label: 'An orbit drawn from the polar equation r equals a times one minus e squared over one plus e cos theta, with the Sun at one focus at the centre of the polar grid. At eccentricity zero the orbit is a circle. As e grows the orbit stretches into a long ellipse, close to the Sun on the right and far from it on the left.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-10.5, 10.5], [-8, 8], 8);
    drawGrid(ctx, f, c, stage, { step: 2, labels: false });
    const pts = [];
    for (let t = 0; t <= 360; t += 2) pts.push(f.px(where(t)));
    poly(ctx, pts, { stroke: c.b, width: 4 });
    segW(ctx, f, [0, 0], where(state.t), { color: c.a, width: 3 });
    dot(ctx, ...f.px([0, 0]), 10, c.fillY, c.ink);
    dot(ctx, ...f.px(where(state.t)), 8, c.a, c.ink);
    dot(ctx, ...f.px([perihelion(state.a, state.e), 0]), 4, c.c, c.ink, 2);
    dot(ctx, ...f.px([-aphelion(state.a, state.e), 0]), 4, c.d, c.ink, 2);
    label(ctx, 'Sun', f.px([0, 0])[0], f.px([0, 0])[1] + 18, c, { size: 10, bounds: stage, patch: false });
    label(ctx, 'closest', f.px([perihelion(state.a, state.e), 0])[0] + 8, f.px([0, 0])[1] - 12, c, { size: 10, color: c.c, align: 'left', bounds: stage, patch: false });
    label(ctx, 'farthest', f.px([-aphelion(state.a, state.e), 0])[0], f.px([0, 0])[1] - 12, c, { size: 10, color: c.d, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Shape the orbit' },
    { key: 'e', label: 'Eccentricity, e', min: 0, max: 0.95, step: 0.01, format: (n) => fixed(n, 2) },
    { key: 'a', label: 'Size, a', min: 2, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 't', label: 'Planet’s angle, θ', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { row: PLANETS.map(([name, e]) => ({ button: name, ghost: true, onClick: () => { state.e = e; tool.update(); } })) },
    { readout: [
      ['Distance now, r', () => fixed(orbitR(state.a, state.e, state.t), 2)],
      ['Closest, a(1 − e)', () => fixed(perihelion(state.a, state.e), 2)],
      ['Farthest, a(1 + e)', () => fixed(aphelion(state.a, state.e), 2)],
      ['Short half-width, b', () => fixed(semiMinor(state.a, state.e), 2)],
    ] },
  ],
  tex: () => `r=\\dfrac{a(1-e^2)}{1+e\\cos\\theta}=\\dfrac{${fixed(state.a * (1 - state.e ** 2), 2)}}{1+${fixed(state.e, 2)}\\cos ${state.t}^\\circ}=${fixed(orbitR(state.a, state.e, state.t), 2)}`,
});
