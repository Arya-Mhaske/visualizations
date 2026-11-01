import { createStepper } from '../../lib/stepper.js';
import { createStage } from '../../lib/stage.js';
import { readColors } from '../../lib/colors.js';
import { liveFormula } from '../../lib/formula.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { cell, resistor } from '../../lib/circuit.js';
import { fixed, sig } from '../../lib/format.js';
import { eliminate } from './_kirchhoff-math.js';

const state = { E1: 12, E2: 9, R1: 2, R2: 2, R3: 4, flip: false };
const c = readColors();
const given = (s) => ({ E1: s.E1, E2: s.flip ? -s.E2 : s.E2, R1: s.R1, R2: s.R2, R3: s.R3 });
const n = (x) => sig(x, 4);
const direction = (x) => (Math.abs(x) < 1e-9 ? 'no current' : x > 0 ? 'the way the arrow points' : 'against the arrow');

function drawCircuit(ctx, size, stage) {
  const [x0, x1, x2] = [stage.w * 0.14, stage.w * 0.5, stage.w * 0.86];
  const [top, bottom] = [24, stage.h - 18];
  const mid = (top + bottom) / 2;
  line(ctx, x0, top, x2, top, { color: c.ink });
  line(ctx, x0, bottom, x2, bottom, { color: c.ink });
  const branch = (x, flip, name, value, arrowName) => {
    const y = bottom - (bottom - top) * 0.3;
    if (flip) cell(ctx, x, y, x, bottom, { color: c.ink });
    else cell(ctx, x, bottom, x, y, { color: c.ink });
    resistor(ctx, x, y, x, top, { color: c.ink });
    label(ctx, name, x + (x < stage.w / 2 ? 26 : -26), (y + top) / 2, c, { size: 12, bounds: stage });
    label(ctx, value, x + (x < stage.w / 2 ? 28 : -28), y + 20, c, { size: 12, bounds: stage });
    arrow(ctx, x - 13 * (x < stage.w / 2 ? 1 : -1), top + 28, x - 13 * (x < stage.w / 2 ? 1 : -1), top + 8, { color: c.a, width: 2, head: 7 });
    label(ctx, arrowName, x, top - 13, c, { size: 12, color: c.a, bounds: stage });
  };
  branch(x0, false, `R₁ ${state.R1} Ω`, `${state.E1} V`, 'I₁');
  branch(x2, state.flip, `R₂ ${state.R2} Ω`, `${state.E2} V`, 'I₂');
  resistor(ctx, x1, top, x1, bottom, { color: c.ink });
  label(ctx, `R₃ ${state.R3} Ω`, x1 + 2, mid + 34, c, { size: 12, bounds: stage });
  arrow(ctx, x1 + 14, top + 8, x1 + 14, top + 28, { color: c.a, width: 2, head: 7 });
  label(ctx, 'I₃', x1, top - 13, c, { size: 12, color: c.a, bounds: stage });
  dot(ctx, x1, top, 5, c.ink, c.ink);
  dot(ctx, x1, bottom, 5, c.ink, c.ink);
}

const stageEl = document.querySelector('#stage');
stageEl.setAttribute('aria-label', 'A circuit with two cells and three resistors, followed by the worked solution with Kirchhoff\'s rules');
stageEl.setAttribute('role', 'group');
const figureEl = document.createElement('div');
figureEl.className = 'viz-figure';
stageEl.appendChild(figureEl);
const figure = createStage(figureEl, drawCircuit, { label: 'Circuit: cell E1 with R1 on the left, R3 in the middle, cell E2 with R2 on the right, all between a top and a bottom rail' });

function steps(s) {
  const g = given(s);
  const { a, b, d, m, d2, f2, I1, I2, I3 } = eliminate(g);
  return [
    { text: 'Junction rule at the top node: what comes in goes out.', tex: 'I_3 = I_1 + I_2' },
    { text: 'Loop rule, left loop, walking up through the cell and down R₃:', tex: `${g.E1} - ${g.R1}I_1 - ${g.R3}I_3 = 0` },
    { text: 'Loop rule, right loop, the same way:', tex: `${n(g.E2)} - ${g.R2}I_2 - ${g.R3}I_3 = 0`.replace('−', '-') },
    { text: 'Put I₃ = I₁ + I₂ into both. Two unknowns, two linear equations:', tex: `\\begin{bmatrix}${a} & ${b}\\\\ ${b} & ${d}\\end{bmatrix}\\begin{bmatrix}I_1\\\\ I_2\\end{bmatrix}=\\begin{bmatrix}${g.E1}\\\\ ${n(g.E2)}\\end{bmatrix}` },
    { text: `Eliminate I₁: row 2 minus ${n(m)} × row 1.`, tex: `${n(d2)}\\,I_2 = ${n(f2)}` },
    { text: 'So:', tex: `I_2 = \\frac{${n(f2)}}{${n(d2)}} = ${n(I2)}\\ \\text{A}` },
    { text: 'Back-substitute into row 1:', tex: `I_1 = \\frac{${g.E1} - ${b}(${n(I2)})}{${a}} = ${n(I1)}\\ \\text{A}` },
    { text: `The junction rule gives I₃. A minus sign only means the current runs against its arrow: I₂ runs ${direction(I2)}.`, tex: `I_3 = ${n(I1)} + (${n(I2)}) = ${n(I3)}\\ \\text{A}` },
    { text: 'Check with the outer loop, which we never used:', tex: `${g.E1} - ${n(g.E2)} - ${n(I1 * g.R1)} + ${n(I2 * g.R2)} = ${fixed(g.E1 - g.E2 - I1 * g.R1 + I2 * g.R2, 3)}` },
  ].map((step) => ({ ...step, tex: step.tex.replace(/−/g, '-').replace(/- -/g, '+ ').replace(/\+ -/g, '- ') }));
}

const formula = liveFormula(document.querySelector('#formula'), (s) => {
  const { I1, I2, I3 } = eliminate(given(s));
  return `I_1=${n(I1)}\\ \\text{A},\\ I_2=${n(I2)}\\ \\text{A},\\ I_3=${n(I3)}\\ \\text{A}`.replace(/−/g, '-');
});
formula.update(state);

createStepper({
  stage: stageEl,
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'The circuit' },
    { key: 'E1', label: 'Cell E₁', min: 1, max: 24, format: (v) => `${v} V` },
    { key: 'E2', label: 'Cell E₂', min: 1, max: 24, format: (v) => `${v} V` },
    { key: 'R1', label: 'R₁', min: 1, max: 20, format: (v) => `${v} Ω` },
    { key: 'R2', label: 'R₂', min: 1, max: 20, format: (v) => `${v} Ω` },
    { key: 'R3', label: 'R₃', min: 1, max: 20, format: (v) => `${v} Ω` },
    { key: 'flip', label: 'Turn cell E₂ round', toggle: true },
    { readout: [
      ['I₁', (s) => `${n(eliminate(given(s)).I1)} A`],
      ['I₂', (s) => `${n(eliminate(given(s)).I2)} A`],
      ['I₃', (s) => `${n(eliminate(given(s)).I3)} A`],
    ] },
  ],
  onChange() {
    formula.update(state);
    figure.invalidate();
  },
});
