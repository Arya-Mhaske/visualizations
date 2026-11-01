import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { capacitor, inductor, resistor } from '../../lib/circuit.js';
import { fixed } from '../../lib/format.js';
import { PARTS, ruleCurve, ruleGap } from './_ac-basics-math.js';

const RAD = Math.PI / 180;
const SPAN = 720; // degrees of ωt on the axis: two whole cycles
const state = { part: 'L', phi: 0, t: 90 };
const time = createTimeline(document.querySelector('#stage'), state, { cycle: () => SPAN, update: () => tool.update() });
time.clock.speed = 60;

const WORDS = {
  R: { rule: 'iR must sit on v', hint: 'v = iR at every instant', tangent: null },
  L: { rule: 'L di/dt must sit on v', hint: 'i rises only while v pushes', tangent: 'i' },
  C: { rule: 'C dv/dt must sit on i', hint: 'v rises only as charge arrives', tangent: 'v' },
};
const V = (p) => Math.sin(p);
const I = (p, s = state) => Math.sin(p + s.phi * RAD);
const now = (s = state) => s.t * RAD;

function verdict(s) {
  return ruleGap(s.part, s.phi) > 0 ? { text: 'Fails', good: false } : { text: 'Holds', good: true };
}

function phaseText(s) {
  if (s.phi === 0) return 'i in step with v';
  const size = Math.abs(s.phi);
  return `i ${s.phi > 0 ? 'ahead of' : 'behind'} v by ${size}°`;
}

function drawCharges(ctx, x, y, count, sign, c) {
  for (let k = 0; k < count; k++) {
    label(ctx, sign, x, y - 16 + k * 8, c, { size: 12, color: sign === '+' ? c.a : c.b, patch: false });
  }
}

function drawScene(ctx, stage, c) {
  const y = stage.h * 0.13;
  const [x1, x2] = [stage.w * 0.14, stage.w * 0.86];
  const mid = stage.w / 2;
  const wire = { color: c.ink };
  if (state.part === 'R') resistor(ctx, x1, y, x2, y, { ...wire, teeth: 6, size: 10 });
  if (state.part === 'L') inductor(ctx, x1, y, x2, y, { ...wire, loops: 6 });
  if (state.part === 'C') {
    capacitor(ctx, x1, y, x2, y, { ...wire, plate: 22, gap: 7 });
    const v = V(now());
    const count = Math.round(Math.abs(v) * 5);
    drawCharges(ctx, mid - 16, y, count, v >= 0 ? '+' : '−', c);
    drawCharges(ctx, mid + 16, y, count, v >= 0 ? '−' : '+', c);
  }
  dot(ctx, x1, y, 6, c.paper, c.ink, 2);
  dot(ctx, x2, y, 6, c.paper, c.ink, 2);
  // The current arrow grows from the middle of the wire, pointing the way the charge goes now.
  const flow = I(now()) * stage.w * 0.18;
  if (Math.abs(flow) > 1) arrow(ctx, mid, y + 32, mid + flow, y + 32, { color: c.b, width: 4 });
  label(ctx, `${PARTS[state.part].name}: ${WORDS[state.part].hint}`, stage.w / 2, 12, c, { size: 11, bounds: stage });
}

function drawLegend(ctx, stage, c) {
  const y = stage.h * 0.285;
  label(ctx, 'v', 10, y, c, { size: 12, color: c.a, align: 'left', bounds: stage });
  label(ctx, 'i', 28, y, c, { size: 12, color: c.b, align: 'left', bounds: stage });
  label(ctx, `dashed: ${WORDS[state.part].rule}`, 44, y, c, { size: 11, color: c.c, align: 'left', bounds: stage });
}

function drawTangent(plot, c) {
  const which = WORDS[state.part].tangent;
  if (!which) return;
  const p = now();
  const y = which === 'i' ? I(p) : V(p);
  const slope = which === 'i' ? Math.cos(p + state.phi * RAD) : Math.cos(p);
  const reach = 0.65;
  plot.segment(p - reach, y - slope * reach, p + reach, y + slope * reach, { color: c.d, width: 4 });
}

const tool = createTool({
  state,
  label: 'Top: a resistor, inductor or capacitor with an arrow showing the current. Below: the voltage and a trial current over two cycles, with a dashed curve from the part\'s own rule. The trial is right only when the dashed curve lies on the solid one it must match.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 4 * Math.PI], y: [-1.3, 1.3], ticks: 'pi', c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.28, w: g.w, h: g.h * 0.72 }),
  }),
  draw(ctx, stage, c, plot) {
    drawScene(ctx, stage, c);
    drawLegend(ctx, stage, c);
    plot.axes({ xLabel: 'ωt', yLabel: '', grid: true });
    plot.fn(V, { color: c.a, width: 6 }); // thick, so a current in step with it still shows both
    plot.fn((p) => I(p), { color: c.b, width: 3 });
    plot.fn((p) => ruleCurve(state.part, state.phi, p), { color: c.c, dash: [8, 6], width: 3 });
    const p = now();
    plot.segment(p, -1.3, p, 1.3, { color: c.ink, width: 1, dash: [3, 4] });
    drawTangent(plot, c);
    plot.point(p, V(p), { fill: c.a, r: 6 });
    plot.point(p, I(p), { fill: c.b, r: 6 });
  },
  controls: () => [
    { title: 'Find the right phase' },
    { key: 'part', label: 'Part', options: [['L', 'Inductor'], ['C', 'Capacitor'], ['R', 'Resistor']] },
    { key: 'phi', label: 'Try a phase for i', min: -180, max: 180, step: 15, format: (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}°` },
    { key: 't', label: 'Time, ωt', min: 0, max: SPAN, step: 5, format: (n) => `${fixed(n, 0)}°` },
    transport(time.clock),
    { text: 'Curves show fractions of each peak. Purple: the slope the rule reads now. Miss: the largest gap, as a share of a full swing.' },
    { readout: [
      ['The rule', (s) => PARTS[s.part].rule],
      ['Your trial', phaseText],
      ['v now', (s) => fixed(V(now(s)), 2)],
      ['i now', (s) => fixed(I(now(s), s), 2)],
      ['Rule needs', (s) => fixed(ruleCurve(s.part, s.phi, now(s)), 2)],
      ['Biggest miss', (s) => `${fixed(ruleGap(s.part, s.phi) * 50, 0)}%`],
      ['The rule now', verdict],
    ] },
  ],
  tex: (s) => {
    const shown = s.phi === 0 ? '' : `${s.phi > 0 ? '+' : '-'}${Math.abs(s.phi)}^\\circ`;
    return `v=v_m\\sin\\omega t,\\quad i=i_m\\sin(\\omega t${shown})`;
  },
  onChange: () => time.sync(),
});

time.sync();
tool.update();
