import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// Eddy currents oppose the fall with a force proportional to speed: v′ = g − γv, terminal speed g/γ.
// γ grows with the pipe's conductivity and wall thickness, and with the magnet's strength squared.
const G = 9.8;
const CYCLE = 4;
const MAT = { plastic: ['plastic', 0], aluminium: ['aluminium', 3.5], copper: ['copper', 5.9] }; // conductivity, 10^7 S/m
const state = { t: 1.6, mat: 'copper', wall: 3, mag: 1 };
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => CYCLE, update: () => tool.update() });
const gamma = (s) => 0.4 * MAT[s.mat][1] * s.wall * s.mag * s.mag;
const v = (s, t) => (gamma(s) < 1e-9 ? G * t : (G / gamma(s)) * (1 - Math.exp(-gamma(s) * t)));
const y = (s, t) => (gamma(s) < 1e-9 ? 0.5 * G * t * t : (G / gamma(s)) * (t - (1 - Math.exp(-gamma(s) * t)) / gamma(s)));
const free = (t) => 0.5 * G * t * t;

const tool = createTool({
  state,
  label: 'Left: two tubes drawn side by side. A magnet in the first tube, the chosen pipe, drops and settles to a slow steady speed. A second magnet in free fall, on the right, speeds up and soon leaves the picture. Right: a graph of the distance fallen against time for both.',
  setup: (stage, c) => createPlot(stage, { x: [0, CYCLE], y: [0, 40], c, pad: 24, box: (g) => ({ x: g.w * 0.45, y: 0, w: g.w * 0.55, h: g.h }) }),
  draw(ctx, stage, c, plot) {
    const top = 24;
    const bot = stage.h - 20;
    const scale = (bot - top) / 40;
    const drawTube = (x, name, dist) => {
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(x - 18, top, 36, bot - top);
      const yy = Math.min(bot - 10, top + 10 + dist * scale);
      ctx.fillStyle = c.fillA;
      ctx.fillRect(x - 9, yy - 12, 18, 24);
      ctx.strokeRect(x - 9, yy - 12, 18, 24);
      label(ctx, name, x, top - 10, c, { size: 9, bounds: stage, patch: false });
    };
    drawTube(stage.w * 0.1, MAT[state.mat][0], y(state, state.t));
    drawTube(stage.w * 0.3, 'no pipe', free(state.t));
    plot.axes({ xLabel: 't (s)', yLabel: 'fallen (m)' });
    plot.fn(free, { color: c.grid, width: 2, dash: [6, 4] });
    plot.fn((t) => y(state, t), { color: c.a });
    plot.point(state.t, y(state, state.t), { fill: c.a, r: 6 });
  },
  controls: () => [
    { title: 'Drop a magnet down a pipe' },
    { key: 'mat', label: 'Pipe material', options: Object.entries(MAT).map(([k, m]) => [k, m[0]]) },
    { key: 'wall', label: 'Wall thickness', min: 1, max: 6, step: 1, format: (n) => `${n} mm` },
    { key: 'mag', label: 'Magnet strength (×)', min: 0.5, max: 2, step: 0.25, format: (n) => `×${fixed(n, 2)}` },
    { key: 't', label: 'Time', min: 0, max: CYCLE, step: 0.01, format: (n) => `${fixed(n, 2)} s` },
    transport(line2.clock),
    { readout: [
      ['Speed now', (s) => `${fixed(v(s, s.t), 2)} m/s`],
      ['Free-fall speed', (s) => `${fixed(G * s.t, 2)} m/s`],
      ['Terminal speed g/γ', (s) => (gamma(s) < 1e-9 ? 'none (no eddy currents)' : `${fixed(G / gamma(s), 2)} m/s`)],
    ] },
  ],
  onChange: () => line2.sync(),
  tex: (s) => (gamma(s) < 1e-9 ? 'v=gt' : `v=\\dfrac{g}{\\gamma}\\left(1-e^{-\\gamma t}\\right)\\to ${sig(G / gamma(s), 3)}\\ \\text{m/s}`),
});
line2.sync();
tool.update();
