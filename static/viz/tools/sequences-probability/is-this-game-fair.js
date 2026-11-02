import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { createRng } from '../../lib/rng.js';
import { fixed } from '../../lib/format.js';

// You pay a fee to play and win a prize if the event happens. Net gain per play: prize − fee, or −fee.
// E = p × prize − fee. A fair game has E = 0.
const GAMES = {
  six: ['one die: win on a 6', 1 / 6, '1/6'],
  big: ['two dice: win on 11 or 12', 3 / 36, '3/36'],
  nine: ['two dice: win if sum ≥ 9', 10 / 36, '10/36'],
};
const state = { game: 'six', prize: 24, fee: 4, plays: 300, seed: 1 };
const p = (s) => GAMES[s.game][1];
const expected = (s) => p(s) * s.prize - s.fee;
let cache = { key: '', mean: null };
function means(s) {
  const key = `${s.game}/${s.prize}/${s.fee}/${s.seed}`;
  if (cache.key === key) return cache.mean;
  const rng = createRng(s.seed * 31 + 7);
  const out = new Float64Array(1001);
  let sum = 0;
  for (let i = 1; i <= 1000; i++) {
    sum += (rng.next() < p(s) ? s.prize : 0) - s.fee;
    out[i] = sum / i;
  }
  cache = { key, mean: out };
  return out;
}

const tool = createTool({
  state,
  label: 'A graph of your average net gain per play against the number of plays, from 1 to 1000. The line jumps about wildly for the first few plays, then settles towards a dashed horizontal line, the expected gain. Above the zero line you gain on average; below it you lose.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1000], y: [-10, 30], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const lo = Math.min(-state.fee - 2, expected(state) - 6);
    const hi = Math.max(state.prize - state.fee + 2, expected(state) + 6);
    plot.setRange([0, 1000], [Math.floor(lo), Math.ceil(hi)]);
    plot.axes({ xLabel: 'plays', yLabel: '₹ per play' });
    plot.segment(0, 0, 1000, 0, { color: c.ink, width: 2 });
    plot.segment(0, expected(state), 1000, expected(state), { color: c.a, width: 3, dash: [7, 5] });
    const m = means(state);
    plot.fn((n) => m[Math.max(1, Math.min(1000, Math.round(n)))], { color: c.b, width: 2, domain: [1, state.plays] });
    plot.point(state.plays, m[state.plays], { fill: c.b, r: 6 });
  },
  controls: () => [
    { title: 'Set up a game' },
    { key: 'game', label: 'Game', options: Object.entries(GAMES).map(([k, v]) => [k, v[0]]) },
    { key: 'prize', label: 'Prize if you win', min: 5, max: 60, step: 1, format: (v) => `₹${v}` },
    { key: 'fee', label: 'Fee to play', min: 0, max: 20, step: 0.5, format: (v) => `₹${fixed(v, 1)}` },
    { key: 'plays', label: 'Plays', min: 10, max: 1000, step: 10 },
    { row: [{ button: 'Play again', onClick: () => { state.seed += 1; tool.update(); } }] },
    { readout: [
      ['P(win)', (s) => GAMES[s.game][2]],
      ['Expected gain E', (s) => `₹${fixed(expected(s), 2)}`],
      ['Verdict', (s) => ({ text: Math.abs(expected(s)) < 0.005 ? 'fair' : expected(s) > 0 ? 'favours you' : 'favours the house', good: Math.abs(expected(s)) < 0.005 })],
      ['Fair fee would be', (s) => `₹${fixed(p(s) * s.prize, 2)}`],
      ['Your average so far', (s) => `₹${fixed(means(s)[s.plays], 2)}`],
    ] },
  ],
  tex: (s) => `E=p\\times${s.prize}-${fixed(s.fee, 1)}=${GAMES[s.game][2]}\\times${s.prize}-${fixed(s.fee, 1)}=${fixed(expected(s), 2)}`,
});

tool.update();
