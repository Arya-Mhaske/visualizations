import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { helixLength } from './_space-curves-math.js';

const state = { a: 2, b: 0.5, turns: 2, unroll: 0 };
const TAU = Math.PI * 2;

// Cylinder point at angle θ (height b θ). Unrolled: lay the cylinder flat on the plane y = −a, x along the arc.
const curved = (s, th) => [s.a * Math.cos(th), s.a * Math.sin(th), s.b * th];
const flat = (s, th) => [s.a * th - s.a * s.turns * Math.PI, -s.a, s.b * th];
const mix = (p, q, u) => p.map((v, i) => v + (q[i] - v) * u);
const along = (s, th) => mix(curved(s, th), flat(s, th), s.unroll);

const tool = createTool({
  state,
  label: 'A helix on a cylinder that can be unrolled flat. Unrolled, one turn becomes the slanted side of a right triangle, with base 2πa and height 2πb.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.5, pitch: 0.35, c }),
  draw(ctx, stage, c, cam) {
    const top = state.turns * TAU;
    cam.axes({ size: 4 });
    if (state.unroll >= 0.999) {
      const [a0, a1] = [flat(state, 0), flat(state, top)];
      cam.faces([{ pts: [a0, [a1[0], a1[1], a0[2]], a1], fill: c.fillY, stroke: c.grid, width: 2 }]);
      cam.label('base 2πan', [(a0[0] + a1[0]) / 2, -state.a, -0.8], { size: 11 });
      cam.label('height 2πbn', [a1[0] + 0.5, -state.a, a1[2] / 2], { size: 11 });
    }
    let last = along(state, 0);
    for (let i = 1; i <= 160; i++) {
      const p = along(state, (i / 160) * top);
      cam.line(last, p, { color: c.a, width: 4 });
      last = p;
    }
    cam.point(along(state, 0), { fill: c.ink, r: 5 });
    cam.point(last, { fill: c.a, r: 6 });
  },
  controls: [
    { title: 'Unroll the cylinder' },
    { key: 'unroll', label: 'Unrolled', min: 0, max: 1, step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'a', label: 'Radius a', min: 1, max: 3, step: 0.5 },
    { key: 'b', label: 'Rise per radian b', min: 0.2, max: 1.5, step: 0.1 },
    { key: 'turns', label: 'Turns', min: 1, max: 3, step: 1 },
    { readout: [
      ['Base 2πan', (s) => fixed(TAU * s.a * s.turns, 3)],
      ['Height 2πbn', (s) => fixed(TAU * s.b * s.turns, 3)],
      ['Length L', (s) => fixed(helixLength(s.a, s.b, s.turns), 3)],
    ] },
  ],
  tex: (s) => `L = \\sqrt{(2\\pi a n)^2 + (2\\pi b n)^2} = 2\\pi n\\sqrt{a^2+b^2} = ${fixed(helixLength(s.a, s.b, s.turns), 3)}`,
});
tool.extra.orbit(tool.update);
