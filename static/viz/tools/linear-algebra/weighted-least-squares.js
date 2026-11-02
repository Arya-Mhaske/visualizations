import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { evalPoly, polyFitLS } from './_la-math.js';

// Five readings that follow y = 1 + 0.8 t closely, and a sixth that is off. Weighted least squares trusts each reading in proportion to its weight.
const PTS = [[0, 1.0], [1, 1.9], [2, 2.5], [3, 3.5], [4, 4.1], [5, 7.0]];
const state = { w: 1, w1: 1 };
const weights = (s) => PTS.map((_, i) => (i === 5 ? s.w : s.w1));
const fitW = (s) => polyFitLS(PTS, 1, weights(s));
const plain = polyFitLS(PTS, 1);

createTool({
  state,
  label: 'Six measurements, five of which lie near a straight line and one of which, at t equals 5, is off. The grey line is the ordinary least squares fit, pulled upwards by the odd point. The coral line is the weighted fit: as the weight of the odd point goes down, the line moves back towards the other five.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 5.5], y: [-1, 8], c, pad: 24 }),
  draw(ctx, stage, c, plot) {
    const f = fitW(state);
    plot.axes({ xLabel: 't', yLabel: 'y' });
    plot.fn((t) => evalPoly(plain, t), { color: c.grid, width: 3, dash: [6, 5], domain: [-0.5, 5.5] });
    plot.fn((t) => evalPoly(f, t), { color: c.a, width: 4, domain: [-0.5, 5.5] });
    PTS.forEach(([t, y], i) => {
      const w = weights(state)[i];
      dot(ctx, ...plot.toPx(t, y), 5 + Math.sqrt(Math.min(w, 8)) * 3, i === 5 ? c.fillA : c.fillY, c.ink, 2);
    });
  },
  controls: [
    { title: 'Decide whom to trust' },
    { key: 'w', label: 'Weight of the odd reading (t = 5)', min: 0.05, max: 4, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 'w1', label: 'Weight of the other five', min: 0.5, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Ordinary fit', (s) => `${fixed(plain[0], 3)} + ${fixed(plain[1], 3)} t`],
      ['Weighted fit', (s) => `${fixed(fitW(s)[0], 3)} + ${fixed(fitW(s)[1], 3)} t`],
      ['Weighted slope vs 0.8', (s) => fixed(fitW(s)[1], 3)],
    ] },
  ],
  tex: () => 'A^{\\mathsf T}W A\\,\\hat{\\mathbf x}=A^{\\mathsf T}W\\,\\mathbf b,\\qquad W=\\operatorname{diag}(w_1,\\dots,w_6)',
});
