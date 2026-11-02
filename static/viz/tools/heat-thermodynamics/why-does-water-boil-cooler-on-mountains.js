import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { satP, boilT, atmAt } from './_phase.js';

const PLACES = { sea: ['Sea level', 0], shimla: ['Shimla (2.2 km)', 2.2], leh: ['Leh (3.5 km)', 3.5], everest: ['Everest (8.85 km)', 8.85] };
const state = { place: 'sea', h: 0 };
let tool;
let lastPlace = 'sea';
let lastH = 0;
const P = (s) => atmAt(s.h);

tool = createTool({
  state,
  label: 'A curve of the vapour pressure of water against temperature, with a horizontal line at the air pressure. Water boils where the line meets the curve. The line drops as the height rises, and so does the boiling point.',
  setup: (stage, c) => createPlot(stage, { x: [20, 130], y: [0, 300], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'T (°C)', yLabel: 'P (kPa)' });
    plot.fn(satP, { color: c.b });
    const p = P(state) * 101.325;
    const Tb = boilT(P(state));
    plot.segment(20, p, 130, p, { color: c.a, width: 3 });
    plot.segment(Tb, 0, Tb, p, { color: c.ink, dash: [5, 4], width: 2 });
    plot.point(Tb, p, { fill: c.c });
    plot.text(`${fixed(Tb, 1)} °C`, Tb + 3, p + 18, { align: 'left', patch: false });
  },
  controls: [
    { title: 'Climb' },
    { key: 'place', label: 'Place', options: [...Object.entries(PLACES).map(([k, v]) => [k, v[0]]), ['custom', 'Custom']] },
    { key: 'h', label: 'Height (km)', min: 0, max: 9, step: 0.05 },
    { readout: [
      ['Air pressure', (s) => `${fixed(P(s) * 101.325, 1)} kPa (${fixed(P(s), 2)} atm)`],
      ['Water boils at', (s) => `${fixed(boilT(P(s)), 1)} °C`],
    ] },
  ],
  tex: (s) => `p=p_0e^{-h/8.4}=${fixed(P(s), 2)}\\ \\mathrm{atm}\\ \\Rightarrow\\ T_b=${fixed(boilT(P(s)), 1)}\\,^\\circ\\mathrm{C}`,
  onChange: (s) => {
    if (s.place !== lastPlace && s.place !== 'custom') s.h = PLACES[s.place][1];
    else if (s.h !== lastH) s.place = 'custom';
    [lastPlace, lastH] = [s.place, s.h];
    tool?.ui.refresh();
  },
});
