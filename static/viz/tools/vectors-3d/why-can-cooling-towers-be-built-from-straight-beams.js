import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { ruling } from './_quadric-surfaces-math.js';

const state = { beams: 16, a: 2, c: 3, families: 'both' };
const H = 1.5;   // each beam runs from z = −H c to z = +H c
const TAU = Math.PI * 2;

const tool = createTool({
  state,
  label: 'A cooling tower: a hyperboloid of one sheet made of straight beams that cross. Beams of two families lean opposite ways.',
  setup: (stage, c) => createCamera(stage, { extent: 6, yaw: 0.7, pitch: 0.25, c }),
  draw(ctx, stage, c, cam) {
    const { a, c: cc, beams } = state;
    cam.axes({ size: 3.6 });
    const ring = (s, color) => {
      let last = ruling(a, cc, 0, 1, s);
      for (let i = 1; i <= 48; i++) {
        const p = ruling(a, cc, (i / 48) * TAU, 1, s);
        cam.line(last, p, { color, width: 2 });
        last = p;
      }
    };
    ring(-H, c.ink);
    ring(0, c.grid);
    ring(H, c.ink);
    const families = state.families === 'both' ? [1, -1] : [1];
    for (const sign of families) {
      for (let i = 0; i < beams; i++) {
        const t = (i / beams) * TAU;
        cam.line(ruling(a, cc, t, sign, -H), ruling(a, cc, t, sign, H), { color: sign === 1 ? c.a : c.b, width: 3 });
      }
    }
  },
  controls: [
    { title: 'Build the tower' },
    { key: 'beams', label: 'Beams per family', min: 4, max: 36, step: 2 },
    { key: 'families', label: 'Beams that lean', options: [['one', 'One way (coral)'], ['both', 'Both ways (coral + blue)']] },
    { key: 'a', label: 'Waist radius a', min: 1, max: 3, step: 0.5 },
    { key: 'c', label: 'Steepness c', min: 1, max: 5, step: 0.5 },
    { readout: [
      ['Beam length', (s) => fixed(2 * H * Math.hypot(s.c, s.a), 2)],
      ['Top radius', (s) => fixed(s.a * Math.sqrt(1 + H * H), 2)],
      ['Waist radius', (s) => fixed(s.a, 2)],
    ] },
  ],
  tex: () => '\\dfrac{x^2 + y^2}{a^2} - \\dfrac{z^2}{c^2} = 1',
});
tool.extra.orbit(tool.update);
