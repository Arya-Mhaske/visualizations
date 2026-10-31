import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';

const SIZE = 6;
const state = { x: 4, y: 3, z: 3, walked: 3 };
const LEGS = ['along x', 'then along y', 'then up z'];
const part = (s, i) => Math.max(0, Math.min(1, s.walked - i));
const stops = (s) => [
  [0, 0, 0],
  [s.x * part(s, 0), 0, 0],
  [s.x, s.y * part(s, 1), 0],
  [s.x, s.y, s.z * part(s, 2)],
];

const tool = createTool({
  state,
  label: 'The corner of a room, with a walk from the corner along one wall, then along the other, then straight up to a point.',
  setup: (stage, c) => createCamera(stage, { extent: 7.5, yaw: 0.8, pitch: 0.42, c }),
  draw(ctx, stage, c, cam) {
    cam.faces([
      { pts: [[0, 0, 0], [SIZE, 0, 0], [SIZE, SIZE, 0], [0, SIZE, 0]], fill: c.fillY, stroke: c.grid },
      { pts: [[0, 0, 0], [SIZE, 0, 0], [SIZE, 0, SIZE], [0, 0, SIZE]], fill: c.fillB, stroke: c.grid },
      { pts: [[0, 0, 0], [0, SIZE, 0], [0, SIZE, SIZE], [0, 0, SIZE]], fill: c.fillC, stroke: c.grid },
    ]);
    cam.axes({ size: SIZE + 0.6 });
    const points = stops(state);
    if (state.walked >= 3) {
      cam.line([state.x, state.y, 0], [0, 0, 0], { color: c.ink, width: 1, dash: [4, 4] });
      cam.line([state.x, state.y, state.z], [0, 0, 0], { color: c.d, width: 2, dash: [6, 4] });
    }
    [c.a, c.b, c.c].forEach((color, i) => {
      if (part(state, i) > 0) cam.line(points[i], points[i + 1], { color, width: 5 });
    });
    const here = [points[0], points[1], points[2], points[3]][Math.min(3, Math.ceil(state.walked))];
    cam.point(here);
    if (state.walked >= 3) cam.label(`P(${state.x}, ${state.y}, ${state.z})`, [state.x, state.y, state.z + 0.8], { size: 12 });
  },
  controls: [
    { title: 'Walk from the corner' },
    { key: 'walked', label: 'Walked', min: 0, max: 3, step: 0.05, format: (v) => `${fixed(v, 1)} of 3 legs` },
    { key: 'x', label: 'x', min: 0, max: SIZE, step: 1 },
    { key: 'y', label: 'y', min: 0, max: SIZE, step: 1 },
    { key: 'z', label: 'z', min: 0, max: SIZE, step: 1 },
    { readout: [
      ['Now walking', (s) => (s.walked >= 3 ? 'arrived' : LEGS[Math.floor(s.walked)])],
      ['Position', (s) => { const p = stops(s)[Math.min(3, Math.ceil(s.walked))]; return `(${p.map((v) => fixed(v, 1)).join(', ')})`; }],
      ['Numbers needed', () => '3'],
    ] },
  ],
  tex: (s) => `P = (x, y, z) = (${s.x}, ${s.y}, ${s.z})`,
});
tool.extra.orbit(tool.update);
