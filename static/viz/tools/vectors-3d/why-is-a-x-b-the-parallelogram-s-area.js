import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { cross, norm } from './_cross-product-math.js';

const state = { la: 4, lb: 3, theta: 60 };
const O = [0, 0, 0];
const vectors = (s) => {
  const t = (s.theta * Math.PI) / 180;
  return [[s.la, 0, 0], [s.lb * Math.cos(t), s.lb * Math.sin(t), 0]];
};

const tool = createTool({
  state,
  label: 'A parallelogram on the floor, spanned by a along the x axis and b at an angle. The height of b above the line of a is drawn dashed. The arrow a × b stands up from it.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.5, pitch: 0.7, c }),
  draw(ctx, stage, c, cam) {
    const [a, b] = vectors(state);
    const far = [a[0] + b[0], a[1] + b[1], 0];
    cam.axes({ size: 6 });
    cam.faces([{ pts: [O, a, far, b], fill: c.fillY, stroke: c.ink, width: 3 }]);
    cam.line([b[0], b[1], 0], [b[0], 0, 0], { color: c.c, width: 4, dash: [6, 4] });
    cam.line(O, a, { color: c.a, width: 6 });
    cam.arrow(O, b, { color: c.b, width: 4 });
    const n = cross(a, b);
    if (norm(n) > 1e-9) {
      const tip = [0, 0, (norm(n) * 4) / Math.max(norm(n), 4)];
      cam.arrow(O, tip, { color: c.d, width: 5 });
      cam.label('a × b', [0, 0, tip[2] + 0.7], { size: 12, color: c.d });
    }
    cam.label('base |a|', [a[0] / 2, -0.7, 0], { size: 11, color: c.a });
    cam.label('height', [b[0] + 0.5, b[1] / 2, 0], { size: 11, color: c.c });
  },
  controls: [
    { title: 'Shape the parallelogram' },
    { key: 'la', label: '|a| (base)', min: 1, max: 6, step: 0.5 },
    { key: 'lb', label: '|b|', min: 1, max: 6, step: 0.5 },
    { key: 'theta', label: 'Angle θ', min: 0, max: 180, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['Height |b| sin θ', (s) => fixed(s.lb * Math.sin((s.theta * Math.PI) / 180), 3)],
      ['Base × height', (s) => fixed(s.la * s.lb * Math.sin((s.theta * Math.PI) / 180), 3)],
      ['|a × b|', (s) => { const [a, b] = vectors(s); return fixed(norm(cross(a, b)), 3); }],
    ] },
  ],
  tex: (s) => `|\\mathbf{a}\\times\\mathbf{b}| = |\\mathbf{a}||\\mathbf{b}|\\sin\\theta = ${fixed(s.la, 1)}\\times${fixed(s.lb, 1)}\\times\\sin ${s.theta}^\\circ = ${fixed(s.la * s.lb * Math.sin((s.theta * Math.PI) / 180), 3)}`,
});
tool.extra.orbit(tool.update);
