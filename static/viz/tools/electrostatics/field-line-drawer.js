import { createTool } from '../../lib/tool.js';
import { handles } from '../../lib/stage.js';
import { dot, label } from '../../lib/draw.js';
import { createBench } from '../../lib/rays.js';
import { drawCharge, drawLine, fieldLines } from '../../lib/field.js';

const PRESETS = {
  dipole: [{ x: -2, y: 0, q: 1 }, { x: 2, y: 0, q: -1 }],
  like: [{ x: -2, y: 0, q: 1 }, { x: 2, y: 0, q: 1 }],
  uneven: [{ x: -2, y: 0, q: 2 }, { x: 2, y: 0, q: -1 }],
};
const MAX = 5;
const state = { q: 2, density: 6 };
let charges = PRESETS.uneven.map((one) => ({ ...one }));
let result = null;
const grips = [];
let grab = { active: 0 };

const signed = (n) => `${n > 0 ? '+' : ''}${n}`;
const chosen = () => charges[Math.min(grab.active, charges.length - 1)];
const net = () => charges.reduce((sum, one) => sum + one.q, 0);
const recount = () => { result = fieldLines(charges, { perUnit: state.density }); };

function regrip() {
  grips.length = 0;
  charges.forEach((one) => grips.push({
    at: () => tool.extra.toPx(one.x, one.y),
    move(px, py) {
      const [x, y] = tool.extra.toWorld(px, py);
      one.x = Math.max(-5.5, Math.min(5.5, x));
      one.y = Math.max(-5.5, Math.min(5.5, y));
    },
  }));
  grab.active = Math.min(grab.active, charges.length - 1);
}

function refresh() {
  regrip();
  state.q = chosen().q;
  recount();
  tool.update();
}

function load(name) {
  charges = PRESETS[name].map((one) => ({ ...one }));
  grab.active = 0;
  refresh();
}

function add(q) {
  if (charges.length >= MAX) return;
  charges.push({ x: (charges.length % 3) * 1.6 - 1.6, y: charges.length % 2 ? 2.6 : -2.6, q });
  grab.active = charges.length - 1;
  refresh();
}

function remove() {
  if (charges.length < 2) return;
  charges.splice(grab.active, 1);
  refresh();
}

const tool = createTool({
  state,
  label: 'Point charges with their field lines traced around them. Lines leave positive charges and end on negative ones, and the number of lines at a charge follows its size. Drag any charge to redraw the lines.',
  setup: (stage, c) => createBench(stage, { x: [-6, 6], c }),
  draw(ctx, stage, c, bench) {
    if (!result) recount();
    for (const entry of result.lines) drawLine(ctx, bench.toPx, entry, { color: c.ink, width: 2 });
    charges.forEach((one) => {
      const [x, y] = bench.toPx(one.x, one.y);
      drawCharge(ctx, x, y, 9 + 2.5 * Math.abs(one.q), one.q, c);
      if (one === chosen()) dot(ctx, x, y, 3, c.ink, c.ink, 1);
    });
    label(ctx, 'Drag a charge. Press it to choose it', 6, 12, c, { size: 11, align: 'left', bounds: stage });
  },
  controls: () => [
    { title: 'Place the charges' },
    { key: 'q', label: 'Chosen charge', min: -3, max: 3, format: (n) => (n === 0 ? '0 is not allowed' : `${signed(n)} nC`) },
    { key: 'density', label: 'Lines per nC', min: 3, max: 10 },
    { row: [
      { button: 'Add +', onClick: () => add(1) },
      { button: 'Add −', ghost: true, onClick: () => add(-1) },
      { button: 'Remove chosen', ghost: true, onClick: remove },
    ] },
    { row: [
      { button: 'Dipole', ghost: true, onClick: () => load('dipole') },
      { button: 'Two alike', ghost: true, onClick: () => load('like') },
      { button: '+2 and −1', ghost: true, onClick: () => load('uneven') },
    ] },
    { readout: [
      ['Charges', () => `${charges.length} of ${MAX}`],
      ['Total charge', () => `${signed(net())} nC`],
      ['Lines starting', () => (result ? result.out : 0)],
      ['Lines ending on a −', () => (result ? result.into : 0)],
      ['Lines going off to infinity', () => (result ? Math.abs(result.out - result.into) : 0)],
    ] },
  ],
  tex: () => `q_{\\text{net}}=${charges.map((one) => signed(one.q)).join('\\,')}=${signed(net())}\\ \\text{nC}`,
  onChange() {
    if (state.q !== 0) chosen().q = state.q;
    else state.q = chosen().q;
    recount();
  },
});

grab = handles(tool.stage, grips, { onChange() { state.q = chosen().q; recount(); tool.update(); }, radius: 26, keyStep: 6 });
refresh();
