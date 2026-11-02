import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { BA, baAt, drop } from './_nucleus.js';

// Liquid-drop terms, MeV per nucleon: volume (each nucleon bound to its few neighbours) gives a flat 15.75.
// Surface lowers small nuclei, Coulomb lowers big ones, and asymmetry adds a little. Dots are measured values.
const state = { A: 56, surface: false, coulomb: false, asym: false };
const model = (A) => drop(A, state);
const full = (A) => drop(A);

const tool = createTool({
  state,
  label: 'A graph of binding energy per nucleon in MeV against mass number A from 0 to 240. Blue dots are measured values: they rise steeply, peak near iron at about 8.8 and slowly fall. The coral curve is a model that starts as a flat line when only the volume term is on, and bends into the real shape as you switch on the surface, Coulomb and asymmetry terms.',
  setup: (stage, c) => createPlot(stage, { x: [0, 240], y: [0, 17], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'A', yLabel: 'B/A (MeV)' });
    plot.shade(() => 8.5, () => 7.5, 30, 170, c.fillC);
    plot.fn(model, { color: c.a, domain: [4, 240] });
    for (const [A, v] of BA) if (A > 2) plot.point(A, v, { fill: c.b, r: 4 });
    plot.point(state.A, model(state.A), { fill: c.a, r: 7 });
    plot.text('plateau', 100, 9.4, { size: 10 });
  },
  controls: () => [
    { title: 'Add the physics, term by term' },
    { key: 'surface', label: 'Surface nucleons have fewer neighbours', toggle: true },
    { key: 'coulomb', label: 'Protons repel (Coulomb)', toggle: true },
    { key: 'asym', label: 'Too many of one kind (asymmetry)', toggle: true },
    { key: 'A', label: 'Mass number A', min: 4, max: 238, step: 1 },
    { readout: [
      ['Model B/A', (s) => `${fixed(model(s.A), 2)} MeV`],
      ['Measured B/A', (s) => `${fixed(baAt(s.A), 2)} MeV`],
      ['Full model', (s) => `${fixed(full(s.A), 2)} MeV`],
    ] },
  ],
  tex: (s) => `\\dfrac{B}{A}=a_V${s.surface ? '-\\dfrac{a_S}{A^{1/3}}' : ''}${s.coulomb ? '-\\dfrac{a_CZ^2}{A^{4/3}}' : ''}${s.asym ? '-a_A\\dfrac{(A-2Z)^2}{A^2}' : ''}`,
});

tool.update();
