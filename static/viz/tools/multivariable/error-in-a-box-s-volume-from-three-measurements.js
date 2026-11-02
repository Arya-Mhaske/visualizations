import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';

// V = xyz. If each length is off by a small amount, the extra volume is three thin slabs (one on each of three faces),
// of sizes yz·dx, xz·dy and xy·dz, plus tiny edge and corner pieces. dV = yz dx + xz dy + xy dz is the slabs only.
const state = { x: 8, y: 6, z: 5, dx: 0.4, dy: 0.4, dz: 0.4 };
export const volume = (s) => s.x * s.y * s.z;
export const differential = (s) => s.y * s.z * s.dx + s.x * s.z * s.dy + s.x * s.y * s.dz;
export const exactChange = (s) => (s.x + s.dx) * (s.y + s.dy) * (s.z + s.dz) - volume(s);
const K = 0.34;

function box(lo, hi, fill, c) {
  const [a, b] = [lo.map((v) => v * K), hi.map((v) => v * K)];
  const q = (i) => [i & 1 ? b[0] : a[0], i & 2 ? b[1] : a[1], i & 4 ? b[2] : a[2]];
  const quads = [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]];
  return quads.map((idx) => ({ pts: idx.map(q), fill, stroke: c.ink, width: 1.5 }));
}

const tool = createTool({
  state,
  label: 'A 3D box of length x, width y and height z. Three thin coloured slabs on its far faces show the extra volume caused by measurement errors in each direction. The sizes of the slabs add up to the total differential.',
  setup: (stage, c) => createCamera(stage, { extent: 4.2, yaw: 0.6, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 3.4 });
    cam.faces([
      ...box([0, 0, 0], [state.x, state.y, state.z], c.paper, c),
      ...box([state.x, 0, 0], [state.x + state.dx, state.y, state.z], c.fillA, c),
      ...box([0, state.y, 0], [state.x, state.y + state.dy, state.z], c.fillB, c),
      ...box([0, 0, state.z], [state.x, state.y, state.z + state.dz], c.fillC, c),
    ]);
  },
  controls: [
    { title: 'Measure the box (cm)' },
    { key: 'x', label: 'Length x', min: 2, max: 10, step: 0.5 },
    { key: 'y', label: 'Width y', min: 2, max: 10, step: 0.5 },
    { key: 'z', label: 'Height z', min: 2, max: 10, step: 0.5 },
    { key: 'dx', label: 'Error in x', min: 0, max: 1, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'dy', label: 'Error in y', min: 0, max: 1, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'dz', label: 'Error in z', min: 0, max: 1, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Volume V', (s) => `${volume(s).toFixed(1)} cm³`],
      ['Slab from x error', (s) => (s.y * s.z * s.dx).toFixed(2)],
      ['Slab from y error', (s) => (s.x * s.z * s.dy).toFixed(2)],
      ['Slab from z error', (s) => (s.x * s.y * s.dz).toFixed(2)],
      ['dV (sum of slabs)', (s) => differential(s).toFixed(2)],
      ['True change ΔV', (s) => exactChange(s).toFixed(2)],
    ] },
  ],
  tex: (s) => `dV=yz\\,dx+xz\\,dy+xy\\,dz=${differential(s).toFixed(2)}`,
});
tool.extra.orbit(tool.update);
