import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { handles } from '../../lib/stage.js';
import { contour } from '../vectors-3d/_quadric-surfaces-math.js';
import { dist, KM_PER_US, timeDiff } from './_conics-math.js';

// Stations in km on a flat map: a master M and two secondaries S1, S2. The ship is the point you drag.
const M = [0, 0];
const S1 = [500, 0];
const S2 = [150, -420];
const R = 800;
const state = { x: 220, y: 310, both: true };
const dt1 = (s = state) => timeDiff([s.x, s.y], M, S1);
const dt2 = (s = state) => timeDiff([s.x, s.y], M, S2);
let tool;

tool = createTool({
  state,
  label: 'A map with three radio stations, a master and two secondaries, and a ship you can drag. The ship measures how much later the signal from each secondary arrives than the master\'s. A fixed time difference means a fixed difference of distances, which is a hyperbola with the two stations as foci. The ship is on that hyperbola. A second pair of stations gives a second hyperbola, and the ship is where they cross.',
  setup: (stage, c) => createPlot(stage, { x: [-R, R], y: [-R, R], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'km', yLabel: '' });
    const P = [state.x, state.y];
    const level1 = dist(P, M) - dist(P, S1);
    contour((x, y) => dist([x, y], M) - dist([x, y], S1) - level1, -R, R, 160).forEach(([p, q]) => plot.segment(p[0], p[1], q[0], q[1], { color: c.a, width: 3 }));
    if (state.both) {
      const level2 = dist(P, M) - dist(P, S2);
      contour((x, y) => dist([x, y], M) - dist([x, y], S2) - level2, -R, R, 160).forEach(([p, q]) => plot.segment(p[0], p[1], q[0], q[1], { color: c.b, width: 3 }));
    }
    [[M, 'M'], [S1, 'S1'], [S2, 'S2']].forEach(([p, name]) => { plot.point(p[0], p[1], { fill: c.c, r: 8 }); plot.text(name, p[0] + 40, p[1] - 40, { size: 12, patch: false }); });
    plot.point(state.x, state.y, { fill: c.fillY, r: 10 });
    plot.text('ship', state.x + 50, state.y + 45, { size: 12, patch: false });
  },
  controls: [
    { title: 'Drag the ship' },
    { key: 'both', label: 'Use the second pair of stations too', toggle: true },
    { text: 'Drag the ship, or use the arrow keys.' },
    { readout: [
      ['Time gap, M and S1', (s) => `${(dt1(s)).toFixed(1)} μs`],
      ['Time gap, M and S2', (s) => `${(dt2(s)).toFixed(1)} μs`],
      ['Distance difference, S1', (s) => `${(dt1(s) * KM_PER_US).toFixed(1)} km`],
    ] },
  ],
  tex: (s) => `d_M-d_{S1}=c\\,\\Delta t=0.2998\\times ${dt1(s).toFixed(1)}=${(dt1(s) * KM_PER_US).toFixed(1)}\\text{ km}`,
});

handles(tool.stage, [{
  at: () => tool.extra.toPx(state.x, state.y),
  move(px, py) { const [x, y] = tool.extra.toWorld(px, py); state.x = Math.round(Math.max(-R + 30, Math.min(R - 30, x))); state.y = Math.round(Math.max(-R + 30, Math.min(R - 30, y))); },
  keyStep: 10,
}], { onChange: () => tool.update(), radius: 32 });
tool.update();
