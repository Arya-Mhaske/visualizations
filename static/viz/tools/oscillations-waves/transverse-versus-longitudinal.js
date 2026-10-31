import { createTool } from '../../lib/tool.js';
import { createClock, transport } from '../../lib/sim.js';
import { arrow, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { SAFE, densityRatio, maxCompression, maxRarefaction, shift } from './_wave-basics-math.js';

const LENGTH = 12;
const SPACING = 0.25;
const REST = Array.from({ length: LENGTH / SPACING + 1 }, (_, i) => i * SPACING);
const state = { mode: 'both', lambda: 4, T: 2, A: 0.3, mark: 6 };
const clock = createClock(document.querySelector('#stage'), { onFrame: () => tool.update() });
const t = () => clock.state.t;

const tool = createTool({
  state,
  label: 'A slinky drawn twice. In the top copy each coil moves up and down across the direction the wave travels. In the bottom copy each coil moves back and forth along it, so coils bunch up and spread out.',
  draw(ctx, stage, c) {
    const px = (x) => stage.w * 0.05 + (x / LENGTH) * stage.w * 0.9;
    const big = (stage.h * 0.15) / 0.4; // pixels per metre of shift
    const rows = state.mode === 'both' ? [0.25, 0.66] : [0.4, 0.4];
    const showT = state.mode !== 'longitudinal';
    const showL = state.mode !== 'transverse';
    const mark = state.mark;

    if (showT) {
      const y = stage.h * rows[0];
      line(ctx, px(0), y, px(LENGTH), y, { color: c.grid, width: 1, dash: [4, 4] });
      const pts = REST.map((x) => [px(x), y - shift(x, t(), state.A, state.lambda, state.T) * big]);
      poly(ctx, pts, { stroke: c.ink, closed: false, width: 3 });
      REST.forEach((x, i) => { if (Math.abs(x - mark) > 1e-9) dot(ctx, pts[i][0], pts[i][1], 4, c.fillB, c.ink, 2); });
      const sy = y - shift(mark, t(), state.A, state.lambda, state.T) * big;
      dot(ctx, px(mark), sy, 9, c.a, c.ink);
      arrow(ctx, px(mark) + 22, y + 0.4 * big, px(mark) + 22, y - 0.4 * big, { color: c.a, width: 3 });
      arrow(ctx, px(mark) + 22, y - 0.4 * big, px(mark) + 22, y + 0.4 * big, { color: c.a, width: 3 });
      label(ctx, 'across', px(mark) + 22, y + 0.4 * big + 14, c, { size: 11, bounds: stage });
      label(ctx, 'Transverse', stage.w * 0.14, y - stage.h * 0.17, c, { size: 12, bounds: stage });
    }
    if (showL) {
      const y = stage.h * rows[1];
      const pos = REST.map((x) => x + shift(x, t(), state.A, state.lambda, state.T));
      REST.forEach((x, i) => {
        const dense = densityRatio(x, t(), state.A, state.lambda, state.T);
        const coil = Math.abs(x - mark) < 1e-9;
        line(ctx, px(pos[i]), y - 20, px(pos[i]), y + 20, { color: coil ? c.a : c.ink, width: coil ? 6 : 3 });
        if (i < pos.length - 1) {
          ctx.fillStyle = dense > 1.15 ? c.a : dense < 0.87 ? c.b : c.paper;
          ctx.fillRect(px(pos[i]), y + 28, px(pos[i + 1]) - px(pos[i]), 8);
        }
      });
      const mx = px(mark + shift(mark, t(), state.A, state.lambda, state.T));
      arrow(ctx, mx - 0.4 * big, y - 30, mx + 0.4 * big, y - 30, { color: c.a, width: 3 });
      arrow(ctx, mx + 0.4 * big, y - 30, mx - 0.4 * big, y - 30, { color: c.a, width: 3 });
      label(ctx, 'along', mx, y - 44, c, { size: 11, bounds: stage });
      label(ctx, 'coral squeezed · blue spread', stage.w * 0.5, y + 54, c, { size: 11, bounds: stage });
      label(ctx, 'Longitudinal', stage.w * 0.14, y - 70, c, { size: 12, bounds: stage });
    }
    const gy = stage.h * 0.93;
    arrow(ctx, stage.w * 0.3, gy, stage.w * 0.7, gy, { color: c.b, width: 5 });
    label(ctx, 'the wave travels this way', stage.w / 2, gy - 14, c, { size: 11, bounds: stage });
  },
  onChange(s) {
    const cap = Math.floor((SAFE * s.lambda / (2 * Math.PI)) * 20) / 20;
    if (s.A > cap) s.A = cap;
  },
  controls: [
    { title: 'Shake it sideways, then push it' },
    { key: 'mode', label: 'Show', options: [['both', 'Both'], ['transverse', 'Sideways'], ['longitudinal', 'Push']] },
    { key: 'mark', label: 'Follow the coil at', min: 1, max: 11, step: SPACING, format: (n) => `${fixed(n, 2)} m` },
    { key: 'lambda', label: 'Wavelength, λ', min: 3, max: 6, step: 0.5, format: (n) => `${fixed(n, 1)} m` },
    { key: 'T', label: 'Period, T', min: 1, max: 4, step: 0.5, format: (n) => `${fixed(n, 1)} s` },
    { key: 'A', label: 'Amplitude, A', min: 0.1, max: 0.4, step: 0.05, format: (n) => `${fixed(n, 2)} m` },
    transport(clock),
    { readout: [
      ['Wave speed, λ/T', (s) => `${fixed(s.lambda / s.T, 2)} m/s`],
      ['Sideways row', () => 'coil moves ⟂ wave'],
      ['Push row', () => 'coil moves ∥ wave'],
      ['Most squeezed', (s) => `${fixed(maxCompression(s.A, s.lambda), 2)} × usual density`],
      ['Most spread', (s) => `${fixed(maxRarefaction(s.A, s.lambda), 2)} × usual density`],
    ] },
  ],
  tex: (s) => `v = \\dfrac{\\lambda}{T} = \\dfrac{${fixed(s.lambda, 1)}}{${fixed(s.T, 1)}} = ${fixed(s.lambda / s.T, 2)}\\ \\text{m/s}`,
});

clock.step(0.5);
