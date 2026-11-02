import { createTool } from '../../lib/tool.js';

const STEPS = [
  { who: 'Kaṇāda and the Vaiśeṣika school (ancient India)', when: 'dates uncertain, centuries BCE', kind: 'An idea (conjecture)', text: 'Keep dividing a piece of matter. The argument says the division must stop at a tiny indivisible particle, the paramāṇu. There was no experiment: it was reasoning.' },
  { who: 'Democritus (ancient Greece)', when: 'about 400 BCE', kind: 'An idea (conjecture)', text: 'He called the smallest pieces atomos, "uncuttable". Again this was an argument and not a measurement.' },
  { who: 'John Dalton', when: '1803', kind: 'Chemical evidence', text: 'Elements combine in fixed ratios of mass. For example, 8 g of oxygen always meets 1 g of hydrogen to make water. Dalton explained this by atoms of fixed weights.' },
  { who: 'Brown, Einstein and Perrin', when: '1827, 1905, 1908', kind: 'A visible jitter', text: 'Pollen and dust grains in water jiggle for ever. Einstein showed that random kicks from molecules would do it. Perrin measured the jitter and found a number of molecules close to the one chemistry gave.' },
  { who: 'Laue and the Braggs', when: '1912–1913', kind: 'Pictures of order', text: 'X-rays sent through crystals make regular patterns of spots. Rows of atoms spaced a fraction of a nanometre apart explain them.' },
  { who: 'Binnig and Rohrer', when: '1981', kind: 'Seeing atoms', text: 'The scanning tunnelling microscope feels a surface with a needle and draws single atoms as bumps.' },
];
const state = { i: 0 };

createTool({
  state,
  label: 'A card showing one step in the history of the idea that matter is made of atoms. Steps run from ancient arguments, through chemistry and Brownian motion, to pictures of single atoms.',
  dom(el) {
    const box = document.createElement('div');
    box.className = 'nb-callout nb-callout--note';
    el.appendChild(box);
    return {
      refresh() {
        const s = STEPS[state.i];
        box.replaceChildren();
        const add = (tag, text) => { const n = document.createElement(tag); n.textContent = text; box.appendChild(n); };
        add('strong', `${s.who}, ${s.when}`);
        add('p', s.kind);
        add('p', s.text);
      },
    };
  },
  controls: [
    { title: 'Walk through the evidence' },
    { key: 'i', label: 'Step', min: 0, max: STEPS.length - 1, step: 1, format: (v) => `${v + 1} of ${STEPS.length}` },
    { readout: [['Kind', (s) => STEPS[s.i].kind], ['When', (s) => STEPS[s.i].when]] },
  ],
});
