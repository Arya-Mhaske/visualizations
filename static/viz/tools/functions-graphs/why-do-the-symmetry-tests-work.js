import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { CURVES, MIRRORS, mirrorScore, onCurve } from './_coordinate-plane-math.js';

const R = 6;
const state = { curve: 0, mirror: 'y', s: 0.7 };
const curve = (s = state) => CURVES[s.curve];
const pointAt = (s = state) => {
  const [a, b] = curve(s).t;
  return curve(s).at(a + (b - a) * s.s);
};
const mirrored = (s = state) => MIRRORS[s.mirror](pointAt(s));
const SUB = { y: 'x by −x', x: 'y by −y', origin: 'x by −x and y by −y' };

const tool = createTool({
  state,
  label: 'A coordinate plane with a curve and a point P on it, chosen by a slider. The point is reflected across the y-axis, the x-axis or the origin to give a mirror point Q joined to P by a dashed line. The mirror point turns green when it lands on the curve and coral when it misses. The readout counts how many of 41 sample points of the curve have their mirror image on the curve too.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    const cv = curve();
    const [a, b] = cv.t;
    ctx.save();
    ctx.strokeStyle = c.b;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const p = cv.at(a + ((b - a) * i) / 200);
      const [px, py] = plot.toPx(p[0], p[1]);
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
    const p = pointAt();
    const q = mirrored();
    const hit = onCurve(cv, q);
    plot.segment(p[0], p[1], q[0], q[1], { color: c.ink, width: 2, dash: [6, 5] });
    plot.point(p[0], p[1], { fill: c.fillY, r: 9 });
    plot.point(q[0], q[1], { fill: hit ? c.c : c.a, r: 9 });
    plot.text('P', p[0] + 0.5, p[1] + 0.6, { size: 13 });
    plot.text('Q', q[0] + 0.5, q[1] + 0.6, { size: 13 });
  },
  controls: () => [
    { title: 'Pick a curve' },
    { key: 'curve', label: 'Curve', options: CURVES.map((cv, i) => [i, cv.text]) },
    { key: 'mirror', label: 'Mirror in', options: [['y', 'y-axis'], ['x', 'x-axis'], ['origin', 'origin']] },
    { key: 's', label: 'Move P along the curve', min: 0, max: 1, step: 0.01, format: (n) => fixed(n, 2) },
    { readout: [
      ['P', () => `(${fixed(pointAt()[0], 2)}, ${fixed(pointAt()[1], 2)})`],
      ['Q, the mirror of P', () => `(${fixed(mirrored()[0], 2)}, ${fixed(mirrored()[1], 2)})`],
      ['Q on the curve?', () => (onCurve(curve(), mirrored()) ? { text: 'yes', good: true } : { text: 'no', good: false })],
      ['Mirror images that land', (s) => `${mirrorScore(curve(s), s.mirror)} of 41`],
    ] },
  ],
  tex: (s) => `\\text{Replace }${SUB[s.mirror].replace('−', '-')}\\text{: }\\ ${mirrorScore(curve(s), s.mirror) === 41 ? '\\text{the equation is unchanged}' : '\\text{the equation changes}'}`,
});

tool.update();
