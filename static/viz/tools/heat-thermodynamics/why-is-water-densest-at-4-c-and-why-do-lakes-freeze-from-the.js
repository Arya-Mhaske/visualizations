import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly, label } from '../../lib/draw.js';
import { lake, rho } from './_expansion-math.js';

const state = { k: 0 };
const N = 8;

createTool({
  state,
  label: 'On the left, a column of lake water in eight layers coloured by temperature, with the surface at the top. On the right, a graph of water density against temperature with a dot for each layer, showing the maximum at four degrees.',
  setup: (stage, c) => createPlot(stage, { x: [0, 13], y: [999.3, 1000.02], c, box: (st) => ({ x: st.w * 0.42, y: 0, w: st.w * 0.58, h: st.h }) }),
  draw(ctx, stage, c, plot) {
    const t = lake(state.k, N);
    const h = (stage.h - 20) / N;
    t.forEach((T, i) => {
      const y = 10 + i * h;
      const fill = T <= 0 ? c.paper : T < 4 ? c.fillC : T === 4 ? c.fillB : c.fillA;
      poly(ctx, [[10, y], [stage.w * 0.36, y], [stage.w * 0.36, y + h], [10, y + h]], { fill, stroke: c.ink, width: 2 });
      label(ctx, `${T}${T <= 0 && i === 0 ? ' ice' : ' °C'}`, 10 + (stage.w * 0.26) / 2, y + h / 2, c, { size: 12, patch: false });
    });
    plot.axes({ xLabel: 'T (°C)', yLabel: 'ρ' });
    plot.fn(rho, { color: c.b, domain: [0, 13] });
    t.forEach((T, i) => plot.point(T, rho(T), { fill: i === 0 ? c.a : c.c, r: 5 }));
  },
  controls: [
    { title: 'Cool the surface' },
    { key: 'k', label: 'Heat removed (steps)', min: 0, max: 76, step: 1 },
    { readout: [
      ['Surface', (s) => `${lake(s.k, N)[0]} °C`],
      ['Bottom', (s) => `${lake(s.k, N)[N - 1]} °C`],
      ['Ice on top?', (s) => (lake(s.k, N)[0] === 0 ? 'yes' : 'no')],
    ] },
  ],
});
