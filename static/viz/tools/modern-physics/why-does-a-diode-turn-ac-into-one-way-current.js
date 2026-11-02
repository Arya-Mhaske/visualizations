import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rectified } from './_rect.js';

const CYCLE = 4; // seconds on screen for 40 ms of real time (slow motion ×100)
const state = { t: 0.55, Vm: 10, drop: 0.7 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const ms = (s) => s.t * 10;
const vin = (s, m = ms(s)) => s.Vm * Math.sin(2 * Math.PI * 0.05 * m);
const vout = (s, m = ms(s)) => rectified(vin(s, m), 'half', s.drop);

const tool = createTool({
  state,
  label: 'Two stacked graphs against time over two cycles of 50 hertz. Top: the AC source, a sine wave swinging above and below zero. Bottom: the voltage across the load after a diode, which follows only the positive humps and stays at zero for the negative half. A coral dot on each marks the present moment.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 40], y: [-13, 13], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    bottom: createPlot(stage, { x: [0, 40], y: [-13, 13], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    top.axes({ xLabel: 't (ms)', yLabel: 'source v' });
    top.fn((m) => vin(state, m), { color: c.b });
    top.point(ms(state), vin(state), { fill: c.a, r: 6 });
    bottom.axes({ xLabel: 't (ms)', yLabel: 'across R_L' });
    bottom.fn((m) => vout(state, m), { color: c.c });
    bottom.point(ms(state), vout(state), { fill: c.a, r: 6 });
    const on = vin(state) > state.drop;
    label(ctx, on ? 'diode ON: current flows' : 'diode OFF: blocked', stage.w - 10, stage.h * 0.5 + 16, c, { size: 11, align: 'right', bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Feed AC to a diode' },
    { key: 't', label: 'Time', min: 0, max: CYCLE, step: 0.01, format: (v) => `${fixed(v * 10, 1)} ms` },
    transport(line2.clock),
    { key: 'Vm', label: 'Source peak, V_m', min: 2, max: 12, step: 1, format: (v) => `${v} V` },
    { key: 'drop', label: 'Diode', options: [[0, 'ideal'], [0.7, 'silicon, 0.7 V']] },
    { readout: [
      ['Source now', (s) => `${fixed(vin(s), 2)} V`],
      ['Output now', (s) => `${fixed(vout(s), 2)} V`],
      ['Diode', (s) => ({ text: vin(s) > s.drop ? 'conducting' : 'blocking', good: vin(s) > s.drop })],
      ['Mean output (ideal)', (s) => `${fixed(s.Vm / Math.PI, 2)} V`],
    ] },
  ],
  tex: (s) => `v_{out}=\\begin{cases}v-${s.drop}&v>${s.drop}\\\\0&v\\le${s.drop}\\end{cases}`,
  onChange: () => line2.sync(),
});
line2.sync();
tool.update();
