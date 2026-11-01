import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { TRACKS, G, gravityWork, trackLength } from './_vector-calculus-math.js';

const state = { track: 'hill', m: 500, a: -5, b: 4 };

const tool = createTool({
  state,
  label: 'A roller-coaster track as a height profile, with a start and a finish marked. The work done by gravity depends only on the height difference between them.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-0.5, 8], c }),
  draw(ctx, stage, c, plot) {
    const T = TRACKS[state.track];
    plot.axes({ xLabel: 'x (m)', yLabel: 'height (m)' });
    plot.fn(T.h, { color: c.ink, width: 4, domain: [-6, 6] });
    const [lo, hi] = [Math.min(state.a, state.b), Math.max(state.a, state.b)];
    plot.fn(T.h, { color: c.a, width: 7, domain: [lo, hi] });
    plot.segment(state.a, 0, state.a, T.h(state.a), { color: c.c, width: 2, dash: [5, 4] });
    plot.segment(state.b, 0, state.b, T.h(state.b), { color: c.b, width: 2, dash: [5, 4] });
    plot.point(state.a, T.h(state.a), { fill: c.c, r: 8 });
    plot.point(state.b, T.h(state.b), { fill: c.b, r: 8 });
    plot.text('start', state.a, T.h(state.a) + 0.6, { size: 11 });
    plot.text('finish', state.b, T.h(state.b) + 0.6, { size: 11 });
  },
  controls: [
    { title: 'Ride from start to finish' },
    { key: 'track', label: 'Track shape', options: Object.entries(TRACKS).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'Start x', min: -6, max: 6, step: 0.5 },
    { key: 'b', label: 'Finish x', min: -6, max: 6, step: 0.5 },
    { key: 'm', label: 'Mass of the train (kg)', min: 100, max: 1000, step: 100 },
    { readout: [
      ['Work by gravity ∫F · dr', (s) => `${fixed(gravityWork(TRACKS[s.track], s.m, s.a, s.b) / 1000, 2)} kJ`],
      ['m g (h_start − h_finish)', (s) => `${fixed((s.m * G * (TRACKS[s.track].h(s.a) - TRACKS[s.track].h(s.b))) / 1000, 2)} kJ`],
      ['Length of track', (s) => `${fixed(trackLength(TRACKS[s.track], Math.min(s.a, s.b), Math.max(s.a, s.b)), 1)} m`],
    ] },
  ],
  tex: (s) => `W = \\int \\mathbf{F}\\cdot d\\mathbf{r} = mg\\,(h_{\\text{start}} - h_{\\text{finish}})`,
});
