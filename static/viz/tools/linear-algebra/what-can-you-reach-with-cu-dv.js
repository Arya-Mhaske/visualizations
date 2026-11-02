import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { det, det2, rad } from './_la-math.js';
import { plane, vec } from './_la-view.js';

// u is fixed at 30°. v turns with φ: when v lies along u the painted set collapses to a line.
// In 3D, w = (1, 1, e): at e = 0 it lies in the plane of u and v, so the cloud stays flat.
const state = { view: 'plane', c: 1, d: 1, f: 1, phi: 100, e: 1.5 };
const L = 2.5;
const u2 = [L * Math.cos(rad(30)), L * Math.sin(rad(30))];
const v2 = (s) => [L * Math.cos(rad(s.phi)), L * Math.sin(rad(s.phi))];
const u3 = [L * Math.cos(rad(30)), L * Math.sin(rad(30)), 0];
const v3 = (s) => [L * Math.cos(rad(s.phi)), L * Math.sin(rad(s.phi)), 0];
const w3 = (s) => [1, 1, s.e];
const combo = (s) => (s.view === 'plane'
  ? [s.c * u2[0] + s.d * v2(s)[0], s.c * u2[1] + s.d * v2(s)[1]]
  : [0, 1, 2].map((i) => s.c * u3[i] + s.d * v3(s)[i] + s.f * w3(s)[i]));
const reach = (s) => {
  if (s.view === 'plane') return Math.abs(det2([u2, v2(s)])) > 1e-6 ? 'the whole plane' : 'only a line';
  return Math.abs(det([u3, v3(s), w3(s)])) > 1e-6 ? 'all of 3D space' : 'only a flat plane';
};
const STEPS = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];

const tool = createTool({
  state,
  label: 'Two vectors u and v in the plane, with sliders c and d. The tip of c u plus d v is marked, and dots show every point you can reach with c and d between minus 2 and 2. When v is turned onto the line of u the dots collapse to a line. The 3D view adds a third vector w, and the reachable dots fill space unless w lies in the plane of u and v.',
  setup(stage, c) {
    const cam = createCamera(stage, { extent: 6, yaw: 0.8, pitch: 0.5, c });
    cam.orbit(() => stage.invalidate());
    return { plot: plane(stage, c, 6), cam };
  },
  draw(ctx, stage, c, { plot, cam }) {
    if (state.view === 'plane') {
      plot.axes({ grid: false });
      for (const a of STEPS) for (const b of STEPS) {
        const p = [a * u2[0] + b * v2(state)[0], a * u2[1] + b * v2(state)[1]];
        dot(ctx, ...plot.toPx(...p), 3, c.fillY, c.ink, 1);
      }
      const v = v2(state);
      vec(ctx, plot, c, [0, 0], [state.c * u2[0], state.c * u2[1]], { color: c.a, width: 3 });
      vec(ctx, plot, c, [state.c * u2[0], state.c * u2[1]], combo(state), { color: c.b, width: 3 });
      vec(ctx, plot, c, [0, 0], u2, { color: c.a, width: 5, text: 'u' });
      vec(ctx, plot, c, [0, 0], v, { color: c.b, width: 5, text: 'v' });
      dot(ctx, ...plot.toPx(...combo(state)), 8, c.c, c.ink);
      return;
    }
    cam.axes({ size: 5 });
    for (const a of [-2, -1, 0, 1, 2]) for (const b of [-2, -1, 0, 1, 2]) for (const k of [-2, -1, 0, 1, 2]) {
      cam.point([0, 1, 2].map((i) => a * u3[i] + b * v3(state)[i] + k * w3(state)[i]), { fill: c.fillY, r: 3 });
    }
    cam.arrow([0, 0, 0], u3, { color: c.a, width: 4 });
    cam.arrow([0, 0, 0], v3(state), { color: c.b, width: 4 });
    cam.arrow([0, 0, 0], w3(state), { color: c.d, width: 4 });
    cam.label('u', u3.map((x) => x * 1.1), { color: c.a });
    cam.label('v', v3(state).map((x) => x * 1.1), { color: c.b });
    cam.label('w', w3(state).map((x) => x * 1.2), { color: c.d });
    cam.point(combo(state), { fill: c.c, r: 8 });
  },
  controls: [
    { title: 'Mix two or three vectors' },
    { key: 'view', label: 'Space', options: [['plane', 'Plane (u, v)'], ['space', '3D (u, v, w)']] },
    { key: 'c', label: 'c (how much u)', min: -2, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'd', label: 'd (how much v)', min: -2, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'f', label: 'f (how much w)', min: -2, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'phi', label: 'Direction of v', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { key: 'e', label: 'Height of w', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Tip of the mix', (s) => `(${combo(s).map((x) => fixed(x, 2)).join(', ')})`],
      ['You can reach', (s) => ({ text: reach(s), good: !reach(s).startsWith('only') })],
    ] },
  ],
  tex: (s) => (s.view === 'plane'
    ? `c\\mathbf{u}+d\\mathbf{v}=${fixed(s.c, 2)}\\mathbf{u}+${fixed(s.d, 2)}\\mathbf{v}\\ \\text{is the column space of}\\ [\\mathbf{u}\\ \\mathbf{v}]`
    : `c\\mathbf{u}+d\\mathbf{v}+f\\mathbf{w}\\ \\text{is the column space of}\\ [\\mathbf{u}\\ \\mathbf{v}\\ \\mathbf{w}]`),
  onChange: (s) => show(s),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 6) return;
  fields[3].hidden = s.view === 'plane';
  fields[5].hidden = s.view === 'plane';
}
show(state);
void tool;
