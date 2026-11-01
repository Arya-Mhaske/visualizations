import { createTool } from '../../lib/tool.js';
import { drawPrism } from './_prism-view.js';
import { indexFrom, minDeviation, minAngle } from './_prism-math.js';
import { fixed } from '../../lib/format.js';

const state = { A: 60, D: 37 };
const nOf = (s) => indexFrom(s.A, s.D);

const tool = createTool({
  state,
  label: 'A prism with a ray passing through at minimum deviation, so the ray inside is parallel to the base. The index calculated from the prism angle and the measured minimum deviation is shown.',
  draw(ctx, stage, c) {
    const n = nOf(state);
    drawPrism(ctx, c, { x: 0, y: 0, w: stage.w, h: stage.h }, state.A, [{ n, i: minAngle(state.A, n), color: c.a }]);
  },
  controls: () => [
    { title: 'Your measurements' },
    { key: 'A', label: 'Prism angle, A', min: 40, max: 70, step: 1, format: (n) => `${n}°` },
    { key: 'D', label: 'Minimum deviation, D', min: 20, max: 60, step: 0.5, format: (n) => `${fixed(n, 1)}°` },
    { readout: [
      ['(A + D) / 2', (s) => `${fixed((s.A + s.D) / 2, 2)}°`],
      ['A / 2', (s) => `${fixed(s.A / 2, 2)}°`],
      ['Index, n', (s) => fixed(nOf(s), 3)],
      ['Check: D from this n', (s) => `${fixed(minDeviation(s.A, nOf(s)), 2)}°`],
    ] },
  ],
  tex: (s) => `n=\\dfrac{\\sin\\frac{A+D}{2}}{\\sin\\frac{A}{2}}=\\dfrac{\\sin ${fixed((s.A + s.D) / 2, 1)}^\\circ}{\\sin ${fixed(s.A / 2, 1)}^\\circ}=${fixed(nOf(s), 3)}`,
});
tool.update();
