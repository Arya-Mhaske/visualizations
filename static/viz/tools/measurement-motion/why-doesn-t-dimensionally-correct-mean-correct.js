import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';
import { dimText, mul, power, same, fallSpeedSquared, kineticGuess } from './_dimensions-math.js';

// A ball of mass m falls through h. The energy it gains is m g h. The guess is E = k m v^2.
const G = 9.8;
const state = { k: 0.1875, m: 2, h: 5 };
const v2 = (s) => fallSpeedSquared(G, s.h);
const gained = (s) => s.m * G * s.h;
const guess = (s) => kineticGuess(s.k, s.m, v2(s));
const guessDim = mul([1, 0, 0], power([0, 1, -1], 2));
const energyDim = [1, 2, -2];

const tool = createTool({
  state,
  label: 'Two panels. The top one checks dimensions: the guess k m v squared always has the dimensions of energy, whatever k is. The bottom one compares two bars: the energy the falling ball really gains, and what the guess says. They only match when k is one half.',
  draw(ctx, stage, c) {
    const ok = same(guessDim, energyDim);
    ctx.fillStyle = ok ? c.fillC : c.fillA;
    ctx.fillRect(14, 14, stage.w - 28, stage.h * 0.22);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, stage.w - 28, stage.h * 0.22);
    label(ctx, `k m v² has dimension ${dimText(guessDim)}`, stage.w / 2, 14 + stage.h * 0.07, c, { color: c.ink, size: 12, patch: false, bounds: stage });
    label(ctx, `energy has dimension ${dimText(energyDim)}: ${ok ? 'the check passes' : 'fails'}`, stage.w / 2, 14 + stage.h * 0.15, c, { color: c.ink, size: 12, patch: false, bounds: stage });
    const top = Math.max(gained(state), guess(state)) * 1.1;
    const base = stage.h - 36;
    const room = base - stage.h * 0.4;
    [['real gain m g h', gained(state), c.b], [`guess: ${fixed(state.k, 4)} m v²`, guess(state), c.a]].forEach(([name, v, color], i) => {
      const x = stage.w * (0.14 + i * 0.44);
      const h = (v / top) * room;
      ctx.fillStyle = color;
      ctx.fillRect(x, base - h, stage.w * 0.3, h);
      ctx.strokeRect(x, base - h, stage.w * 0.3, h);
      label(ctx, `${sig(v, 3)} J`, x + stage.w * 0.15, base - h - 12, c, { color: c.ink, size: 12, bounds: stage });
      label(ctx, name, x + stage.w * 0.15, base + 16, c, { color: c.ink, size: 10, bounds: stage });
    });
  },
  controls: () => [
    { title: 'Guess a formula: E = k m v²' },
    { key: 'k', label: 'The number k', min: 0.05, max: 1, step: 0.0125, format: (n) => fixed(n, 4) },
    { row: [{ button: '3/16', ghost: true, onClick: () => { state.k = 0.1875; tool.update(); } }, { button: '1/2', ghost: true, onClick: () => { state.k = 0.5; tool.update(); } }] },
    { key: 'm', label: 'Mass, m', min: 1, max: 10, step: 1, format: (n) => `${n} kg` },
    { key: 'h', label: 'Height fallen, h', min: 1, max: 20, step: 1, format: (n) => `${n} m` },
    { readout: [
      ['Dimension check', () => ({ text: 'passes for every k', good: true })],
      ['v² after falling h', (s) => `${sig(v2(s), 3)} m²/s²`],
      ['Real gain vs guess', (s) => (Math.abs(guess(s) - gained(s)) < 1e-6 ? { text: 'they agree', good: true } : { text: `off by ${sig(guess(s) - gained(s), 3)} J`, good: false })],
    ] },
  ],
  tex: (s) => `E=k\\,m\\,v^2\\quad \\text{dimension: }[M\\,L^2\\,T^{-2}]\\ \\text{for any }k\\qquad k=${fixed(s.k, 4)}`,
});
tool.update();
