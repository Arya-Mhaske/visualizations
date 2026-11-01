import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { CHANNELS, N_FILM, filmIntensity, strongest } from './_interference-math.js';

const state = { t: 120 }; // film thickness, nm
const T_MAX = 800;
const tints = (c) => [c.a, c.c, c.b];

const tool = createTool({
  state,
  label: 'A graph of reflected brightness against film thickness from 0 to 800 nanometres, with three curves: red light at 650 nanometres in coral, green at 550 in green, and blue at 450 in blue. Each curve is a wave that starts at zero for a very thin film. The curves peak at different thicknesses, so the colour that reflects most changes as the film thickens. A vertical line marks the chosen thickness.',
  setup: (stage, c) => createPlot(stage, { x: [0, T_MAX], y: [0, 1.15], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (nm)', yLabel: 'reflected' });
    CHANNELS.forEach((ch, i) => plot.fn((t) => filmIntensity(t, ch.nm), { color: tints(c)[i] }));
    plot.segment(state.t, 0, state.t, 1.15, { color: c.ink, width: 2, dash: [6, 4] });
    CHANNELS.forEach((ch, i) => plot.point(state.t, filmIntensity(state.t, ch.nm), { fill: tints(c)[i], r: 6 }));
  },
  controls: () => [
    { title: 'Thicken the film' },
    { key: 't', label: 'Thickness, t', min: 0, max: T_MAX, step: 5, format: (n) => `${n} nm` },
    { readout: [
      ...CHANNELS.map((ch) => [`${ch.name} (${ch.nm} nm)`, (s) => `${fixed(filmIntensity(s.t, ch.nm) * 100, 0)} %`]),
      ['Strongest', (s) => (s.t === 0 ? 'none: dark' : strongest(s.t).name)],
      ['2nt', (s) => `${sig(2 * N_FILM * s.t, 3)} nm`],
    ] },
  ],
  tex: (s) => `2nt=2\\times${N_FILM}\\times${s.t}=${fixed(2 * N_FILM * s.t, 0)}\\ \\text{nm};\\ \\text{bright when }2nt=\\left(m+\\tfrac12\\right)\\lambda`,
});

tool.update();
