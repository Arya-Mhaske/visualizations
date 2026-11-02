import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rectified, meanIdeal, outFreq } from './_rect.js';

const CYCLE = 4; // 4 s on screen for 40 ms of real time
const F = 50;
const state = { t: 1.3, mode: 'full', drop: 0 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const ms = (s) => s.t * 10;
const vin = (m) => 10 * Math.sin(2 * Math.PI * (F / 1000) * m);
const vout = (s, m = ms(s)) => rectified(vin(m), s.mode, s.drop);
const diode = (s) => (vin(ms(s)) > s.drop ? 'D1' : vin(ms(s)) < -s.drop && s.mode === 'full' ? 'D2' : 'none');
const peaks = (s) => (s.mode === 'half' ? 2 : 4);

const tool = createTool({
  state,
  label: 'Two stacked graphs against time over 40 milliseconds. Top: the AC input at 50 hertz with two peaks. Bottom: the rectifier output. In half-wave mode it has two humps with gaps between. In full-wave mode it has four humps with no gaps, so the output repeats 100 times a second.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 40], y: [-12, 12], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    bottom: createPlot(stage, { x: [0, 40], y: [-2, 12], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    top.axes({ xLabel: 't (ms)', yLabel: 'input' });
    top.fn(vin, { color: c.b });
    top.point(ms(state), vin(ms(state)), { fill: c.a, r: 6 });
    bottom.axes({ xLabel: 't (ms)', yLabel: 'output' });
    bottom.fn((m) => vout(state, m), { color: c.c });
    for (let k = 0; k < peaks(state); k++) {
      const m = state.mode === 'half' ? 5 + 20 * k : 5 + 10 * k;
      bottom.segment(m, 0, m, 10.8, { color: c.grid, width: 1, dash: [3, 4] });
    }
    bottom.point(ms(state), vout(state), { fill: c.a, r: 6 });
    label(ctx, `conducting: ${diode(state)}`, stage.w - 10, stage.h * 0.5 + 16, c, { size: 11, align: 'right', bounds: stage, patch: false });
  },
  controls: () => [
    { title: 'Rectify the whole wave' },
    { key: 'mode', label: 'Circuit', options: [['half', 'half-wave, 1 diode'], ['full', 'full-wave, 2 diodes']] },
    { key: 't', label: 'Time', min: 0, max: CYCLE, step: 0.01, format: (v) => `${fixed(v * 10, 1)} ms` },
    transport(line2.clock),
    { key: 'drop', label: 'Diode', options: [[0, 'ideal'], [0.7, 'silicon, 0.7 V']] },
    { readout: [
      ['Input frequency', () => `${F} Hz`],
      ['Output repeats at', (s) => `${outFreq(F, s.mode)} Hz`],
      ['Humps in 40 ms', (s) => peaks(s)],
      ['Mean output (ideal)', (s) => `${fixed(meanIdeal(10, s.mode), 2)} V`],
    ] },
  ],
  tex: (s) => `f_{out}=${outFreq(F, s.mode)}\\ \\text{Hz},\\quad V_{dc}=${s.mode === 'half' ? '\\dfrac{V_m}{\\pi}' : '\\dfrac{2V_m}{\\pi}'}=${fixed(meanIdeal(10, s.mode), 2)}\\ \\text{V}`,
  onChange: () => line2.sync(),
});
line2.sync();
tool.update();
