import { createStepper } from '../../lib/stepper.js';
import { liveFormula } from '../../lib/formula.js';
import { fixed } from '../../lib/format.js';
import { deriv } from '../../lib/graph.js';
import { ONIONS, chain, compose, insideTex, wholeTex } from './_chain-rule-math.js';

const state = { which: 'sinsq', x: 0.8 };
const layersOf = (s) => ONIONS[s.which].layers;

function steps(s) {
  const layers = layersOf(s);
  const { ins, slopes, total } = chain(layers, s.x);
  const list = [
    { text: 'Name the layers, outside in. The last layer holds only x.', tex: `y=${wholeTex(layers)}` },
    { text: `At x = ${fixed(s.x, 2)}, each layer receives a number from the layer inside it.`, tex: ins.map((v, i) => `\\text{${layers[i].name}} \\leftarrow ${fixed(v, 3)}`).join(',\\ \\ ') },
  ];
  layers.forEach((layer, i) => {
    list.push({
      text: `Layer ${i + 1} (${layer.name}): differentiate it and leave its inside alone.`,
      tex: `${layer.dtex(insideTex(layers, i))}=${fixed(slopes[i], 4)}`,
    });
  });
  list.push({ text: 'Multiply the slopes of the layers.', tex: `\\dfrac{dy}{dx}=${slopes.map((m) => fixed(m, 3)).join('\\times')}=${fixed(total, 4)}` });
  list.push({ text: 'Check: nudge x a tiny bit and measure the slope of the whole function.', tex: `\\dfrac{\\Delta y}{\\Delta x}\\approx${fixed(deriv((t) => compose(layers, t), s.x), 4)}` });
  return list;
}

const formula = liveFormula(document.querySelector('#formula'), (s) => `y=${wholeTex(layersOf(s))}`);
formula.update(state);

createStepper({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  state,
  steps,
  controls: [
    { title: 'Choose an onion' },
    { key: 'which', label: 'Function', options: Object.entries(ONIONS).map(([key, v]) => [key, v.name]) },
    { key: 'x', label: 'x', min: 0.2, max: 1.1, step: 0.1, format: (n) => fixed(n, 1) },
    { readout: [
      ['Layers', (s) => String(layersOf(s).length)],
      ['dy/dx', (s) => ({ text: fixed(chain(layersOf(s), s.x).total, 4), good: true })],
    ] },
  ],
  onChange: (s) => formula.update(s),
});
