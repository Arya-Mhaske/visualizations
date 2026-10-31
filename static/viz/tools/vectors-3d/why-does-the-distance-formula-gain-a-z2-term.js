import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { distance3, floorDiagonal } from './_3d-coordinates-math.js';

const state = { x: 4, y: 3, z: 5, step: 2 };
const O = [0, 0, 0];

const tool = createTool({
  state,
  label: 'A box with its floor diagonal and its space diagonal. The right triangle on the floor feeds into a second right triangle standing up.',
  setup: (stage, c) => createCamera(stage, { extent: 6.5, yaw: -0.5, pitch: 0.35, c }),
  draw(ctx, stage, c, cam) {
    const { x, y, z } = state;
    const [X, Y, F, T] = [[x, 0, 0], [0, y, 0], [x, y, 0], [x, y, z]];
    const [U, UX, UY] = [[0, 0, z], [x, 0, z], [0, y, z]];
    for (const [a, b] of [[O, X], [O, Y], [X, F], [Y, F], [O, U], [X, UX], [Y, UY], [F, T], [U, UX], [U, UY], [UX, T], [UY, T]]) {
      cam.line(a, b, { color: c.grid, width: 2 });
    }
    cam.faces([{ pts: [O, X, F], fill: c.fillB, stroke: c.b }]);
    cam.line(O, X, { color: c.a, width: 4 });
    cam.line(X, F, { color: c.a, width: 4 });
    cam.line(O, F, { color: c.b, width: 4 });
    if (state.step === 2) {
      cam.faces([{ pts: [O, F, T], fill: c.fillA, stroke: c.a }]);
      cam.line(F, T, { color: c.c, width: 5 });
      cam.line(O, T, { color: c.d, width: 5 });
      cam.point(T, { fill: c.d, r: 6 });
    }
    cam.label(`x = ${x}`, [x / 2, -0.6, 0], { size: 11 });
    cam.label(`y = ${y}`, [x + 0.7, y / 2, 0], { size: 11 });
    cam.label('d', [x / 2 - 0.3, y / 2 + 0.3, 0], { size: 12, color: c.b });
    if (state.step === 2) cam.label(`z = ${z}`, [x + 0.3, y + 0.3, z / 2], { size: 11 });
  },
  controls: [
    { title: 'Pythagoras, twice' },
    { key: 'step', label: 'Triangle', options: [[1, '1 On the floor'], [2, '2 Standing up']] },
    { key: 'x', label: 'x', min: 1, max: 6, step: 1 },
    { key: 'y', label: 'y', min: 1, max: 6, step: 1 },
    { key: 'z', label: 'z', min: 1, max: 6, step: 1 },
    { readout: [
      ['Floor diagonal, d', (s) => fixed(floorDiagonal(s.x, s.y), 3)],
      ['d²', (s) => String(s.x ** 2 + s.y ** 2)],
      ['Space diagonal', (s) => fixed(distance3(s.x, s.y, s.z), 3)],
      ['Its square', (s) => String(s.x ** 2 + s.y ** 2 + s.z ** 2)],
    ] },
  ],
  tex: (s) => (s.step === 1
    ? `d^2 = x^2 + y^2 = ${s.x ** 2} + ${s.y ** 2} = ${s.x ** 2 + s.y ** 2}`
    : `D^2 = d^2 + z^2 = (x^2 + y^2) + z^2 = ${s.x ** 2 + s.y ** 2} + ${s.z ** 2} = ${s.x ** 2 + s.y ** 2 + s.z ** 2}`),
});
tool.extra.orbit(tool.update);
