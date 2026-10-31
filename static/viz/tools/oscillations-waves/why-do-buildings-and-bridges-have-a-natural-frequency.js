import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createClock, transport } from '../../lib/sim.js';
import { label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { lag, naturalFreq, response, TAU } from './_force-law-math.js';

const GROUND_CM = 2;
const state = { f: 0.6, n: 4, zeta: 0.05 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const ratio = (s) => response(s.f, s.n, s.zeta);
const peak = (s) => Math.max(...Array.from({ length: 121 }, (_, i) => response(i * 0.025, s.n, s.zeta)));

const tool = createTool({
  state,
  label: 'A model building on a shaking ground, with a graph of how much it sways at each shaking frequency. The sway is largest when the shaking matches the natural frequency.',
  setup: (stage, c) => createPlot(stage, {
    x: [0, 3], y: [0, 4], c, box: (s) => ({ x: s.w * 0.4, y: 0, w: s.w * 0.6, h: s.h }),
  }),
  draw(ctx, stage, c, plot) {
    const phase = TAU * state.f * clock.state.t;
    const r = state.f / naturalFreq(state.n);
    const scale = 3;
    const ground = Math.cos(phase) * scale;
    const top = ratio(state) * Math.cos(phase - lag(r, state.zeta)) * scale;
    const [cx, base] = [stage.w * 0.2, stage.h - 40];
    const floorH = Math.min(40, (stage.h - 90) / state.n);
    const half = 28;
    ctx.fillStyle = c.fillY;
    ctx.fillRect(4, base, stage.w * 0.4 - 8, 14);
    line(ctx, 4, base + 14, stage.w * 0.4 - 4, base + 14, { color: c.ink, width: 3 });
    for (let i = 0; i < state.n; i++) {
      const [lo, hi] = [i / state.n, (i + 1) / state.n];
      const dx = (u) => ground + (top - ground) * u;
      const [yLo, yHi] = [base - i * floorH, base - (i + 1) * floorH];
      poly(ctx, [
        [cx - half + dx(lo), yLo], [cx + half + dx(lo), yLo], [cx + half + dx(hi), yHi], [cx - half + dx(hi), yHi],
      ], { fill: i % 2 ? c.fillB : c.fillA, stroke: c.ink });
    }
    label(ctx, `top sways ${fixed(ratio(state) * GROUND_CM, 1)} cm`, stage.w * 0.2, 14, c, { size: 10, bounds: { w: stage.w * 0.4, h: stage.h } });
    label(ctx, `ground ${GROUND_CM} cm`, stage.w * 0.2, stage.h - 8, c, { size: 10, bounds: { w: stage.w * 0.4, h: stage.h } });

    const high = Math.max(2, peak(state) * 1.15);
    plot.setRange([0, 3], [0, high]);
    plot.axes({ xLabel: 'f (Hz)', yLabel: 'sway ÷ ground' });
    const f0 = naturalFreq(state.n);
    plot.segment(f0, 0, f0, high, { color: c.c, width: 2, dash: [6, 5] });
    plot.text('f₀', f0, high * 0.93, { size: 11, color: c.c });
    plot.fn((u) => response(u, state.n, state.zeta), { color: c.a });
    plot.point(state.f, ratio(state), { r: 7 });
  },
  controls: [
    { title: 'Shake the model' },
    { key: 'f', label: 'Shaking frequency, f', min: 0.1, max: 3, step: 0.05, format: (n) => `${fixed(n, 2)} Hz` },
    { key: 'n', label: 'Floors (mass)', min: 1, max: 8, step: 1, format: (n) => `${n}` },
    { key: 'zeta', label: 'Damping', options: [[0.05, 'Low'], [0.15, 'Medium'], [0.4, 'High']] },
    transport(clock),
    { readout: [
      ['Natural frequency, f₀', (s) => `${fixed(naturalFreq(s.n), 2)} Hz`],
      ['Shaking frequency, f', (s) => `${fixed(s.f, 2)} Hz`],
      ['f ÷ f₀', (s) => fixed(s.f / naturalFreq(s.n), 2)],
      ['Sway ÷ ground shake', (s) => `× ${fixed(ratio(s), 2)}`],
      ['Top of building sways', (s) => `${fixed(ratio(s) * GROUND_CM, 1)} cm`],
    ] },
  ],
  tex: (s) => `f_0 = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}} = \\frac{1}{2\\pi}\\sqrt{\\frac{3.95\\times 10^{6}}{${s.n}\\times 10^{5}}} = ${fixed(naturalFreq(s.n), 2)}\\ \\text{Hz}`,
});

clock.step(1);
