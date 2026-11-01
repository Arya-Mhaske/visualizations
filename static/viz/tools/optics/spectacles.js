import { createTool } from '../../lib/tool.js';
import { createBench, axisCrossing } from '../../lib/rays.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { RETINA, myopiaLens, hyperLens, relaxedPower, accommodatedPower } from './_lenses-math.js';

// Lengths along the axis are in centimetres on the stage; powers are in dioptres. The eye's lens is at x = 0, the retina at x = 2.27 cm.
const L_CM = RETINA * 100;
const state = { cond: 'myopia', far: 0.4, near: 0.6, wear: true };
const READ = 0.25; // m, the book
const eyePower = (s) => (s.cond === 'myopia' ? relaxedPower(s.far) : accommodatedPower(s.near));
const lensPower = (s) => (s.cond === 'myopia' ? myopiaLens(s.far) : hyperLens(s.near, READ));
const total = (s) => eyePower(s) + (s.wear ? lensPower(s) : 0);
// the distance of the thing being looked at, in cm (Infinity for a far object)
const objectCm = (s) => (s.cond === 'myopia' ? Infinity : READ * 100);
const HEIGHTS = [-0.5, -0.25, 0.25, 0.5];
const slopeAfter = (s, y) => (Number.isFinite(objectCm(s)) ? y / objectCm(s) : 0) - (y * total(s)) / 100;
const focusX = (s) => axisCrossing([0, 0.5], [1, slopeAfter(s, 0.5)]);
const gapMm = (s) => (focusX(s) - L_CM) * 10;

const tool = createTool({
  state,
  label: 'A side view of an eye with rays entering from the left and meeting at a focus. For a short-sighted eye the focus falls in front of the retina. For a long-sighted eye it falls behind. With the right spectacle lens the focus lands on the retina.',
  setup: (stage, c) => createBench(stage, { x: [-2, 3], cy: 0.5, c }),
  draw(ctx, stage, c, bench) {
    // eyeball
    const [cx, cy] = bench.toPx((L_CM + 0.3) / 2 - 0.05, 0);
    const [ex] = bench.toPx(L_CM + 0.3, 0);
    const rx = ex - cx;
    const ry = bench.toPx(0, 1.25)[1];
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, cy - ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = c.fillB;
    ctx.fill();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.stroke();
    // retina
    const [rt, rb] = [bench.toPx(L_CM, 0.9), bench.toPx(L_CM, -0.9)];
    line(ctx, rt[0], rt[1], rb[0], rb[1], { color: c.d, width: 6 });
    label(ctx, 'retina', ...bench.toPx(L_CM, -1.55), c, { color: c.d, size: 11, bounds: stage });
    // the eye lens
    const [lt, lb] = [bench.toPx(0, 0.75), bench.toPx(0, -0.75)];
    line(ctx, lt[0], lt[1], lb[0], lb[1], { color: c.ink, width: 4 });
    if (state.wear) {
      const x = -0.35;
      const [gt, gb] = [bench.toPx(x, 1.2), bench.toPx(x, -1.2)];
      line(ctx, gt[0], gt[1], gb[0], gb[1], { color: c.c, width: 5 });
      label(ctx, `${fixed(lensPower(state), 1)} D`, ...bench.toPx(x - 0.1, 1.6), c, { color: c.c, size: 11, bounds: stage });
    }
    for (const y of HEIGHTS) {
      const s0 = Number.isFinite(objectCm(state)) ? y / objectCm(state) : 0;
      const slope = slopeAfter(state, y);
      bench.ray([-2, y - 2 * s0], [0, y], { color: c.b, width: 2, arrow: false });
      const end = Math.max(L_CM + 0.3, Math.min(2.95, focusX(state) + 0.2));
      bench.ray([0, y], [end, y + slope * end], { color: c.a, width: 2, arrow: false });
    }
    const f = focusX(state);
    if (Number.isFinite(f) && f < 3) dot(ctx, ...bench.toPx(f, 0), 6, c.fillY, c.ink);
    bench.axis();
  },
  controls: () => [
    { title: 'An eye that does not focus' },
    { key: 'cond', label: 'Problem', options: [['myopia', 'Short sight'], ['hyper', 'Long sight']] },
    { key: 'far', label: 'Far point', min: 0.3, max: 3, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'near', label: 'Near point', min: 0.3, max: 2, step: 0.1, format: (n) => `${fixed(n, 1)} m` },
    { key: 'wear', label: 'Wear the spectacles', toggle: true },
    { readout: [
      ['Lens that corrects it', (s) => `${fixed(lensPower(s), 2)} D`],
      ['Its focal length', (s) => `${sig(100 / lensPower(s), 3)} cm`],
      ['Focus compared with retina', (s) => (Math.abs(gapMm(s)) < 0.05 ? { text: 'on the retina: sharp', good: true } : { text: `${sig(Math.abs(gapMm(s)), 2)} mm ${gapMm(s) < 0 ? 'in front' : 'behind'}: blurred`, good: false })],
    ] },
  ],
  tex: (s) => (s.cond === 'myopia'
    ? `P=-\\dfrac{1}{d_{far}}=-\\dfrac{1}{${fixed(s.far, 1)}}=${fixed(lensPower(s), 2)}\\ \\text{D}`
    : `P=\\dfrac{1}{0.25}-\\dfrac{1}{${fixed(s.near, 1)}}=${fixed(lensPower(s), 2)}\\ \\text{D}`),
  onChange: () => show(),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
const show = () => {
  // fields: cond, far, near
  fields[1].hidden = state.cond !== 'myopia';
  fields[2].hidden = state.cond === 'myopia';
};
show();
tool.update();
