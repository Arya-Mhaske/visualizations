import { createTool } from '../../lib/tool.js';
import { createCamera, splitQuad } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { octant, regions, signs } from './_3d-coordinates-math.js';

const R = 4.5;
const state = { xy: true, yz: true, zx: false, x: 2, y: 2, z: 2 };
const count = (s) => s.xy + s.yz + s.zx;
const QUADS = {
  xy: [[-R, -R, 0], [R, -R, 0], [R, R, 0], [-R, R, 0]],
  yz: [[0, -R, -R], [0, R, -R], [0, R, R], [0, -R, R]],
  zx: [[-R, 0, -R], [R, 0, -R], [R, 0, R], [-R, 0, R]],
};

const tool = createTool({
  state,
  label: 'Up to three coordinate planes crossing at the origin, with a movable point. Each new plane doubles the regions of space.',
  setup: (stage, c) => createCamera(stage, { extent: 7.5, yaw: 0.65, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    const fills = { xy: c.fillY, yz: c.fillB, zx: c.fillC };
    const faces = [];
    for (const key of Object.keys(QUADS)) {
      if (!state[key]) continue;
      // Every plane is cut along the axes, so depth sorting holds where planes cross.
      for (const pts of splitQuad(QUADS[key], 4)) faces.push({ pts, fill: fills[key], stroke: c.grid, width: 1 });
    }
    cam.faces(faces);
    cam.axes({ size: R + 0.8 });
    const p = [state.x, state.y, state.z];
    cam.line([p[0], p[1], 0], p, { color: c.ink, width: 2, dash: [4, 4] });
    cam.point(p);
    cam.label(signs(...p).split('').join(' '), [p[0], p[1], p[2] + 0.9], { size: 12 });
  },
  controls: [
    { title: 'Add the planes one at a time' },
    { row: [
      { key: 'xy', label: 'xy-plane', toggle: true },
      { key: 'yz', label: 'yz-plane', toggle: true },
      { key: 'zx', label: 'zx-plane', toggle: true },
    ] },
    { key: 'x', label: 'Point: x', min: -4, max: 4, step: 1 },
    { key: 'y', label: 'Point: y', min: -4, max: 4, step: 1 },
    { key: 'z', label: 'Point: z', min: -4, max: 4, step: 1 },
    { readout: [
      ['Planes on', (s) => String(count(s))],
      ['Regions of space', (s) => String(regions(count(s)))],
      ['Point\'s signs', (s) => `(${signs(s.x, s.y, s.z).split('').join(', ').replace(/-/g, '−')})`],
      ['Octant', (s) => (count(s) === 3 ? octant(s.x, s.y, s.z) : 'turn on all 3')],
    ] },
  ],
  tex: (s) => `${['1', '2', '2 \\times 2', '2 \\times 2 \\times 2'][count(s)]} = ${fixed(regions(count(s)), 0)}\\ \\text{regions}`,
  onChange: () => {},
});
tool.extra.orbit(tool.update);
