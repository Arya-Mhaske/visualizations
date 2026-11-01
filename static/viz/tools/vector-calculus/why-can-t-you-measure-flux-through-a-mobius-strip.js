import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { MOBIUS, BAND, unitNormal, dot, scale, add, TAU } from './_vector-calculus-math.js';

const state = { strip: 'mobius', walk: 0 };
const S = (s) => (s.strip === 'mobius' ? MOBIUS : BAND);
const pos = (s, u, v) => S(s).r(u, v);
const turn = (s) => (state.walk / 100) * TAU;

const tool = createTool({
  state,
  label: 'A paper band with an arrow standing out of it, walked once round the middle. On an ordinary band the arrow comes back as it started. On a Möbius strip it comes back pointing the other way.',
  setup: (stage, c) => createCamera(stage, { extent: 2.7, yaw: 0.6, pitch: 0.7, c }),
  draw(ctx, stage, c, cam) {
    const M = S(state);
    const nu = 72;
    const faces = [];
    for (let i = 0; i < nu; i++) {
      const [u0, u1] = [(i / nu) * TAU, ((i + 1) / nu) * TAU];
      faces.push({ pts: [M.r(u0, -1), M.r(u1, -1), M.r(u1, 1), M.r(u0, 1)], fill: i % 2 ? c.fillY : c.fillA, stroke: c.grid, width: 1 });
    }
    cam.faces(faces);
    const u = turn(state);
    const p = M.r(u, 0);
    const n = unitNormal(M, u, 0);
    const n0 = unitNormal(M, 0, 0);
    const same = dot(n, n0) > 0;
    // Where the walk has been, as a line along the middle.
    let last = M.r(0, 0);
    for (let i = 1; i <= 80; i++) {
      const q = M.r((i / 80) * u, 0);
      cam.line(last, q, { color: c.ink, width: 3 });
      last = q;
    }
    cam.arrow(M.r(0, 0), add(M.r(0, 0), scale(n0, 0.7)), { color: c.grid, width: 3 });
    cam.arrow(p, add(p, scale(n, 0.9)), { color: same ? c.c : c.a, width: 5 });
    cam.point(p, { fill: c.ink, r: 5 });
  },
  controls: [
    { title: 'Walk the arrow once round' },
    { key: 'strip', label: 'Band', options: [['mobius', 'Möbius strip (half twist)'], ['band', 'Ordinary band']] },
    { key: 'walk', label: 'Walked round', min: 0, max: 100, step: 1, format: (v) => `${v}%` },
    { readout: [
      ['Arrow vs the start', (s) => { const M = S(s); const d = dot(unitNormal(M, (s.walk / 100) * TAU, 0), unitNormal(M, 0, 0)); return `${fixed(d + 0, 2)} (${d > 0.05 ? 'same way' : d < -0.05 ? 'opposite' : 'sideways'})`; }],
      ['Back at the start?', (s) => (s.walk < 100 ? 'not yet' : dot(unitNormal(S(s), TAU, 0), unitNormal(S(s), 0, 0)) > 0 ? 'arrow is the same: two sides' : 'arrow is reversed: ONE side')],
    ] },
  ],
  tex: (s) => '\\mathbf{n}\\text{ must vary continuously. On a Möbius strip } \\mathbf{n}(2\\pi) = -\\mathbf{n}(0)',
});
tool.extra.orbit(tool.update);
