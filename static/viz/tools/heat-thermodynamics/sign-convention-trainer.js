import { createDrill } from '../../lib/drill.js';

// NCERT: ΔU = Q − W. Q > 0 heat into the gas. W > 0 work done by the gas.
const SC = [
  ['A gas in a rigid box is heated by a flame.', 1, 0],
  ['A gas in a cylinder expands against a piston while a heat bath keeps its temperature constant.', 1, 1],
  ['A gas is compressed slowly and heat flows out to the surroundings so its temperature stays constant.', -1, -1],
  ['A gas expands into a vacuum inside an insulated container (free expansion).', 0, 0],
  ['A paddle stirs a gas in an insulated rigid container.', 0, -1],
  ['Hot gas in a rigid box cools down to room temperature.', -1, 0],
  ['Air is compressed very quickly in an insulated bicycle pump.', 0, -1],
  ['Gas in an insulated cylinder expands quickly and pushes the piston out.', 0, 1],
  ['A gas is heated at constant pressure and the piston rises.', 1, 1],
  ['A gas in a cylinder is cooled at constant pressure and the piston sinks.', -1, -1],
];
const word = (q, name) => (q > 0 ? `${name} > 0` : q < 0 ? `${name} < 0` : `${name} = 0`);
const pair = (q, w) => `${word(q, 'Q')}, ${word(w, 'W')}`;
const POOL = [];
for (const q of [-1, 0, 1]) for (const w of [-1, 0, 1]) POOL.push([q, w]);

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 5,
  generate(rng) {
    const [text, q, w] = rng.pick(SC);
    const wrong = rng.shuffle(POOL.filter(([a, b]) => a !== q || b !== w)).slice(0, 3);
    const options = rng.shuffle([[q, w], ...wrong]).map(([a, b]) => pair(a, b));
    const dU = q === 0 && w === 0 ? 'ΔU = 0' : `ΔU = Q − W`;
    return {
      prompt: `${text} What are the signs of Q (heat into the gas) and W (work done by the gas)?`,
      options,
      answer: options.indexOf(pair(q, w)),
      hint: 'Q is + when heat enters the gas. W is + when the gas pushes something out.',
      explain: `${pair(q, w)}. ${dU}.`,
    };
  },
});
