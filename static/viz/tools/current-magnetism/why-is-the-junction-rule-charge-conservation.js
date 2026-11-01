import { createTool } from '../../lib/tool.js';
import { createSim, transport } from '../../lib/sim.js';
import { dot, label, line } from '../../lib/draw.js';
import { flowDots } from '../../lib/circuit.js';
import { fixed, sci } from '../../lib/format.js';
import { electrons, nodeCurrents, nodePotential, nodeRates, pilePoints, spherePotential } from './_kirchhoff-math.js';

const LIMIT = 40; // C; the forced run stops here, because no node could hold it
const OPENING = { forced: 6, free: 0.5 }; // seconds already run when a view opens, so it never starts blank
const state = { view: 'forced', I1: 3, I2: 2, I3: 4, V1: 9, V2: 6, V3: 0 };

const sim = createSim(document.querySelector('#stage'), {
  init: () => ({ t: 0, y: [0, 0, 0, 0] }),
  deriv: (t, y) => nodeRates(state, y),
  stopWhen: (run) => state.view === 'forced' && Math.abs(run.y[0]) >= LIMIT,
  onFrame: () => tool.update(),
});

const pile = () => sim.state.y[0];
const currents = () => nodeCurrents(state, pile());
const net = () => { const [a, b, d] = currents(); return a + b - d; };
const countIn = () => sim.state.y[1] + sim.state.y[2];
const countOut = () => sim.state.y[3];
const balanced = () => Math.abs(net()) < 0.02;

function drawPile(ctx, x, y, c) {
  const q = pile();
  const n = Math.min(LIMIT, Math.floor(Math.abs(q) + 1e-9));
  const points = pilePoints(n);
  const radius = Math.max(18, 14 + 9 * Math.sqrt(n));
  dot(ctx, x, y, radius, c.paper);
  dot(ctx, x, y, radius, balanced() ? c.fillC : c.fillY, c.ink);
  for (const [dx, dy] of points) dot(ctx, x + dx, y + dy, 5, q > 0 ? c.d : c.paper, c.ink, 1);
}

const tool = createTool({
  state,
  label: 'Three wires meet at a node. Dots flow along them, one dot for each coulomb. Two wires carry charge in and one carries it out. Any charge that comes in and does not leave stays at the node as a growing pile of dots.',
  draw(ctx, stage, c) {
    const [x, y] = [stage.w * 0.5, stage.h * 0.52];
    const ends = [[stage.w * 0.04, stage.h * 0.17], [stage.w * 0.04, stage.h * 0.87], [stage.w * 0.96, y]];
    ends.forEach(([ex, ey]) => line(ctx, ex, ey, x, y, { color: c.ink, width: 8 }));
    const [q1, q2, q3] = sim.state.y.slice(1);
    flowDots(ctx, ...ends[0], x, y, q1, { fill: c.a, ink: c.ink });
    flowDots(ctx, ...ends[1], x, y, q2, { fill: c.b, ink: c.ink });
    flowDots(ctx, x, y, ...ends[2], q3, { fill: c.c, ink: c.ink });
    drawPile(ctx, x, y, c);
    const [i1, i2, i3] = currents();
    const forced = state.view === 'forced';
    const tag = (i, V) => (forced ? `${fixed(i, 1)} A` : `${fixed(i, 2)} A, from ${V} V`);
    label(ctx, tag(i1, state.V1), 8, stage.h * 0.09, c, { size: 12, align: 'left', bounds: stage, color: c.a });
    label(ctx, tag(i2, state.V2), 8, stage.h * 0.95, c, { size: 12, align: 'left', bounds: stage, color: c.b });
    label(ctx, forced ? tag(i3) : `${fixed(i3, 2)} A, to ${state.V3} V`, stage.w - 8, y - 26, c, { size: 12, align: 'right', bounds: stage, color: c.c });
    const message = Math.abs(pile()) >= LIMIT && forced ? 'Stopped: no node could hold this'
      : balanced() ? 'In = out: the pile holds steady'
        : net() > 0 ? 'More in than out: the pile grows' : 'More out than in: the node drains';
    label(ctx, message, stage.w / 2, stage.h * 0.03 + 8, c, { size: 12, bounds: stage });
    label(ctx, 'One dot is one coulomb', stage.w - 8, stage.h * 0.95, c, { size: 11, align: 'right', bounds: stage });
  },
  controls: () => [
    { title: 'Three wires, one node' },
    { key: 'view', label: 'Who sets the currents?', options: [['forced', 'You do'], ['free', 'The circuit does']] },
    { key: 'I3', label: 'Out wire, I₃', min: 0, max: 8, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { key: 'I1', label: 'Coral wire, I₁', min: 0, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { key: 'I2', label: 'Blue wire, I₂', min: 0, max: 5, step: 0.5, format: (n) => `${fixed(n, 1)} A` },
    { key: 'V1', label: 'Coral terminal', min: 0, max: 12, format: (n) => `${n} V` },
    { key: 'V2', label: 'Blue terminal', min: 0, max: 12, format: (n) => `${n} V` },
    { key: 'V3', label: 'Out terminal', min: 0, max: 12, format: (n) => `${n} V` },
    transport(sim, { onChange: () => tool.update() }),
    { readout: [
      ['Charge in, so far', () => `${fixed(countIn(), 1)} C`],
      ['Charge out, so far', () => `${fixed(countOut(), 1)} C`],
      ['Left at the node', () => ({ text: `${fixed(pile(), 1)} C`, good: Math.abs(net()) < 0.02 })],
      ['That many electrons', () => sci(Math.abs(electrons(pile())), 2)],
      ['Node potential', (s) => (s.view === 'forced' ? `${sci(Math.abs(spherePotential(pile())), 2)} V` : `${fixed(nodePotential(pile()), 2)} V`)],
      ['Time', () => `${fixed(sim.state.t, 1)} s`],
    ] },
  ],
  tex: () => {
    const [a, b, d] = currents();
    return `\\frac{\\Delta q}{\\Delta t}=I_1+I_2-I_3=${fixed(a, 2)}+${fixed(b, 2)}-${fixed(d, 2)}=${fixed(a + b - d, 2)}\\ \\text{C/s}`;
  },
  onChange() {
    if (state.view !== lastView) open();
    showFields();
  },
});

let lastView = state.view;

function open() {
  lastView = state.view;
  sim.reset();
  sim.step(OPENING[state.view]);
}

const fields = [...document.querySelectorAll('#panel .nb-field')];
function showFields() {
  fields.forEach((field, i) => {
    if (i > 0) field.hidden = (i <= 3) !== (state.view === 'forced');
  });
}

showFields();
open();
tool.update();
