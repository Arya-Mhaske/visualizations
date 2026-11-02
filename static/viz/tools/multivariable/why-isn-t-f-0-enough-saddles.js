import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { SURF, surfaceFaces, fxx, fyy, fxy, fx, fy } from './_mv.js';

// At a critical point ∇f = 0 the surface is flat to first order. The shape then depends on the curvature in each direction:
// slice through the point at angle ψ and the slice has second derivative f_xx cos²ψ + 2 f_xy cosψ sinψ + f_yy sin²ψ.
// A saddle has slices curving up in some directions and down in others.
const state = { surface: 'saddle', psi: 0 };
const SHAPES = { saddle: SURF.saddle, bowl: SURF.bowl, hill: SURF.hill, monkey: { name: 'Flat top (x⁴ + y⁴)', R: 3, f: (x, y) => (x ** 4 + y ** 4) / 12 } };
const S = () => SHAPES[state.surface];
const curv = (deg) => { const t = (deg * Math.PI) / 180; const { f } = S(); return fxx(f, 0, 0) * Math.cos(t) ** 2 + 2 * fxy(f, 0, 0) * Math.cos(t) * Math.sin(t) + fyy(f, 0, 0) * Math.sin(t) ** 2; };
const kinds = () => { const v = [...Array(36).keys()].map((k) => curv(k * 5)); return { up: v.some((x) => x > 1e-3), down: v.some((x) => x < -1e-3) }; };

const tool = createTool({
  state,
  label: 'A surface with a critical point at the centre. A vertical slice through the centre at an angle you choose is drawn in coral. On a saddle the slice curves up for some angles and down for others, so the flat point is neither a peak nor a pit.',
  setup: (stage, c) => createCamera(stage, { extent: 5.2, yaw: 0.7, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    const { f, R } = S();
    cam.faces(surfaceFaces(c, f, R, 18, { stroke: c.grid }));
    const t = (state.psi * Math.PI) / 180;
    for (let i = -30; i < 30; i++) {
      const a = (i * R) / 30;
      const b = ((i + 1) * R) / 30;
      cam.line([a * Math.cos(t), a * Math.sin(t), f(a * Math.cos(t), a * Math.sin(t))], [b * Math.cos(t), b * Math.sin(t), f(b * Math.cos(t), b * Math.sin(t))], { color: c.a, width: 4 });
    }
    cam.point([0, 0, f(0, 0)]);
  },
  controls: [
    { title: 'Slice through the flat point' },
    { key: 'surface', label: 'Surface', options: Object.entries(SHAPES).map(([k, v]) => [k, v.name]) },
    { key: 'psi', label: 'Slice direction', min: 0, max: 180, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['f_x, f_y at the centre', () => `${fx(S().f, 0, 0).toFixed(3)}, ${fy(S().f, 0, 0).toFixed(3)}`],
      ['Curvature of this slice', () => curv(state.psi).toFixed(3)],
      ['This slice looks like', () => (Math.abs(curv(state.psi)) < 1e-3 ? 'flat to second order' : curv(state.psi) > 0 ? 'a valley (minimum)' : 'a hilltop (maximum)')],
      ['Over all slices', () => { const k = kinds(); return k.up && k.down ? 'both: a saddle' : k.up ? 'always up: a minimum' : k.down ? 'always down: a maximum' : 'all flat: the test fails'; }],
    ] },
  ],
  tex: () => '\\nabla f=\\mathbf 0\\ \\text{is only the first condition}',
});
tool.extra.orbit(tool.update);
