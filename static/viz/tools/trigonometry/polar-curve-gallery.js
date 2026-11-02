import { createTool } from '../../lib/tool.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { drawPolarGrid, eqFrame } from './_kit.js';
import { CURVES, rosePetals, samplePolar } from './_polar-math.js';

const state = { kind: 'cardioid', a: 2, b: 2, n: 3 };
const USES = { circle: ['a'], cardioid: ['a'], limacon: ['a', 'b'], spiral: ['a'], lemniscate: ['a'], rose: ['a', 'n'] };
const FIELDS = ['a', 'b', 'n'];
let fields = [];
const showFields = () => fields.forEach((el, i) => { el.hidden = i > 0 && !USES[state.kind].includes(FIELDS[i - 1]); });
const curve = () => CURVES[state.kind];

const tool = createTool({
  state,
  label: 'The graph of one polar curve chosen from a gallery of circle, cardioid, limaçon, spiral, lemniscate and rose, drawn on a polar grid. Sliders change the numbers in its equation and the curve reshapes.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-7.2, 7.2], [-7.2, 7.2], 8);
    drawPolarGrid(ctx, f, c, stage, { rMax: 6, ringStep: 2, rayStep: 45, labels: false });
    const cv = curve();
    const pieces = samplePolar((t) => cv.r(t, state), cv.span, 900, cv.both);
    pieces.forEach((piece) => poly(ctx, piece.map(f.px), { stroke: c.a, width: 4, closed: false }));
  },
  controls: [
    { title: 'Pick a curve' },
    { key: 'kind', label: 'Curve', options: Object.entries(CURVES).map(([k, v]) => [k, v.name.split('  ')[0]]) },
    { key: 'a', label: 'a', min: 0.5, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'b', min: 0, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'n', label: 'n', min: 1, max: 6, step: 1 },
    { readout: [
      ['Equation', () => curve().name.split('  ')[1]],
      ['Shape', () => (state.kind === 'limacon' ? (state.b < state.a ? 'with an inner loop' : state.b === state.a ? 'a cardioid' : state.b < 2 * state.a ? 'with a dimple' : 'convex') : state.kind === 'rose' ? `${rosePetals(state.n)} petals` : '—')],
    ] },
  ],
  tex: () => curve().tex(state),
  onChange: showFields,
});
fields = [...document.querySelectorAll('#panel .nb-field')];
showFields();
void tool;
