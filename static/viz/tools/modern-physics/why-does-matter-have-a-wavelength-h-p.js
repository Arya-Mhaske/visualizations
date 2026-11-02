import { createTool } from '../../lib/tool.js';
import { sig } from '../../lib/format.js';
import { H, deBroglie } from './_mp.js';
import { OBJECTS, objectOf, drawRuler } from './_matter-waves-view.js';

const state = { obj: 'e', lv: 6 }; // lv = log10 of the speed in m/s
const speed = (s) => 10 ** s.lv;
const lambda = (s) => deBroglie(objectOf(s.obj)[2], speed(s));
const unit = (m) => {
  if (m >= 1e-9) return `${sig(m * 1e9, 3)} nm`;
  return `${sig(m, 3)} m`;
};

const tool = createTool({
  state,
  label: 'A ruler of lengths in powers of ten, from 10 to the minus 40 metres to 10 to the minus 4. A coral marker shows the de Broglie wavelength of the chosen object at the chosen speed. Reference marks show a nucleus, an atom and a bacterium.',
  draw(ctx, stage, c) {
    const e = Math.log10(lambda(state));
    drawRuler(ctx, c, stage, {
      lo: -40, hi: -4, y: 0.55,
      marks: [
        { e: -15, text: 'nucleus', fill: c.c, up: true },
        { e: -10, text: 'atom', fill: c.c, up: true },
        { e: -6, text: 'bacterium', fill: c.c, up: true },
        { e, text: `λ = ${sig(lambda(state), 2)} m`, fill: c.a, up: false },
      ],
    });
  },
  controls: () => [
    { title: 'Pick an object and a speed' },
    { key: 'obj', label: 'Object', options: OBJECTS.map(([k, name]) => [k, name]) },
    { key: 'lv', label: 'Speed, log₁₀ v', min: -1, max: 7, step: 0.1, format: (v) => `${sig(10 ** v, 2)} m/s` },
    { readout: [
      ['Mass m', (s) => `${sig(objectOf(s.obj)[2], 3)} kg`],
      ['Momentum p = mv', (s) => `${sig(objectOf(s.obj)[2] * speed(s), 3)} kg m/s`],
      ['Wavelength λ = h/p', (s) => unit(lambda(s))],
      ['Compared with an atom', (s) => (lambda(s) > 1e-10 ? `${sig(lambda(s) / 1e-10, 2)}× bigger` : `${sig(1e-10 / lambda(s), 2)}× smaller`)],
    ] },
  ],
  tex: (s) => `\\lambda=\\dfrac{h}{mv}=\\dfrac{${sig(H * 1e34, 3)}\\times10^{-34}}{${sig(objectOf(s.obj)[2] * speed(s), 3)}}=${sig(lambda(s), 3)}\\ \\text{m}`,
});

tool.update();
