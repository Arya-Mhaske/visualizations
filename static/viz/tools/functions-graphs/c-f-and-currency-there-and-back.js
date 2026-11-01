import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { machineRow, num } from './_combining-view.js';

// A made-up exchange rate for practice: 1 US dollar = 83 rupees. The dealer's spread is 2% each way.
const RATE = 83;
const state = { kind: 'temp', v: 37, spread: false };
const there = (s) => (s.kind === 'temp' ? (s.v * 9) / 5 + 32 : s.spread ? s.v * (RATE * 0.98) : s.v * RATE);
const back = (s) => (s.kind === 'temp' ? ((there(s) - 32) * 5) / 9 : s.spread ? there(s) / (RATE * 1.02) : there(s) / RATE);

createTool({
  state,
  label: 'A conversion and its undoing. A temperature in degrees Celsius is changed to Fahrenheit and back again, and the answer returns to exactly what you started with: the two conversions are inverse functions. Money is the same until a dealer takes a cut each time you change. With that cut switched on, going there and back no longer gives the starting amount, because the two conversions are no longer exact inverses.',
  draw(ctx, stage, c) {
    const unit = state.kind === 'temp' ? ['°C', '°F'] : ['US$', '₹'];
    machineRow(ctx, stage, c, stage.h * 0.3, state.v, [{ name: `${unit[0]}→${unit[1]}`, value: there(state) }, { name: `${unit[1]}→${unit[0]}`, value: back(state) }], { title: 'there and back' });
  },
  controls: [
    { title: 'Convert and convert back' },
    { key: 'kind', label: 'Quantity', options: [['temp', 'Temperature'], ['money', 'Money']] },
    { key: 'v', label: 'Start value', min: 0, max: 100, step: 1 },
    { key: 'spread', label: 'The dealer takes 2% each way (money only)', toggle: true },
    { readout: [
      ['There', (s) => num(there(s))],
      ['And back', (s) => ({ text: num(back(s)), good: Math.abs(back(s) - s.v) < 1e-9 })],
      ['Lost', (s) => `${fixed(s.v - back(s), 3)}`],
    ] },
  ],
  tex: (s) => (s.kind === 'temp' ? 'F=\\dfrac95C+32,\\quad C=\\dfrac59(F-32)' : s.spread ? '\\text{buy at }0.98r,\\ \\text{sell at }1.02r:\\ \\text{not inverses}' : `R=${RATE}\\,D,\\quad D=R/${RATE}`),
});
