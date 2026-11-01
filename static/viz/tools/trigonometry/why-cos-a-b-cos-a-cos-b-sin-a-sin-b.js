import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { chordFromDifference, chordSquared, cosD, rad, sinD } from './_identities-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { A: 110, B: 40, turn: 0 };
const spin = (angle, by) => [cosD(angle - by), sinD(angle - by)];

createTool({
  state,
  label: 'The unit circle with two points, one at angle A and one at angle B, joined by a chord. A slider turns the whole picture back by B so the second point lands on the x-axis. The chord is rigid, so its length does not change, and measuring it both ways gives the cosine of a difference.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.5);
    drawFrame(ctx, f, c, { ticks: false });
    const by = state.B * state.turn;
    const P = f.px(spin(state.A, by));
    const Q = f.px(spin(state.B, by));
    const O = f.px([0, 0]);
    line(ctx, ...O, ...P, { color: c.a, width: 3 });
    line(ctx, ...O, ...Q, { color: c.b, width: 3 });
    line(ctx, ...P, ...Q, { color: c.d, width: 6 });
    arc(ctx, ...O, 26, -rad(state.A - by), -rad(state.B - by), { color: c.c, width: 4 });
    dot(ctx, ...P, 8, c.a, c.ink);
    dot(ctx, ...Q, 8, c.b, c.ink);
    label(ctx, 'A', P[0] + (P[0] >= O[0] ? 14 : -14), P[1] + (P[1] >= O[1] ? 12 : -12), c, { size: 12, color: c.a, bounds: stage, patch: false });
    label(ctx, state.turn === 1 ? 'B is now at 0°' : 'B', Q[0] + (Q[0] >= O[0] ? 14 : -14), Q[1] + (Q[1] >= O[1] ? 12 : -12), c, { size: 12, color: c.b, bounds: stage, patch: false, align: Q[0] >= O[0] ? 'left' : 'right' });
    label(ctx, state.turn === 0 ? 'the chord, measured with coordinates of A and B' : `picture turned back by ${fixed(by, 0)}°: same chord`, stage.w / 2, 14, c, { size: 11, bounds: stage });
  },
  controls: [
    { title: 'Two points and a chord' },
    { key: 'A', label: 'Angle A', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { key: 'B', label: 'Angle B', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { key: 'turn', label: 'Turn the picture back by B', min: 0, max: 1, step: 0.05, format: (n) => `${Math.round(n * 100)}%` },
    { readout: [
      ['Chord² from A and B', (s) => fixed(chordSquared(s.A, s.B), 4)],
      ['Chord² after the turn', (s) => fixed(chordFromDifference(s.A, s.B), 4)],
      ['Same length?', (s) => ({ text: Math.abs(chordSquared(s.A, s.B) - chordFromDifference(s.A, s.B)) < 1e-9 ? 'yes' : 'no', good: true })],
    ] },
  ],
  tex: (s) => `2-2\\cos(A-B)=${fixed(chordFromDifference(s.A, s.B), 3)}=2-2(\\cos A\\cos B+\\sin A\\sin B)=${fixed(chordSquared(s.A, s.B), 3)}`,
});
