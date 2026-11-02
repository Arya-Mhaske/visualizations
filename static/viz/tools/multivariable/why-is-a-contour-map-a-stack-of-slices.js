import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { createPlot } from '../../lib/plot.js';
import { SURF, surfaceFaces, drawLevel3d, drawLevel, levelList, zRange } from './_mv.js';

// Flood a hill to height h. The shoreline is the level curve f = h. Stack the shorelines and you have the contour map.
const state = { surface: 'two', h: 1, view: '3d' };
const S = () => SURF[state.surface];
const levels = () => levelList(S().f, S().R, 8);

const tool = createTool({
  state,
  label: 'A hill that is flooded to a chosen height. The shoreline where the water meets the hill is a level curve. In the 3D view the shorelines for lower water levels are stacked at their heights; in the map view the same curves are seen from above.',
  setup(stage, c) { return { cam: createCamera(stage, { extent: 5.5, yaw: 0.7, pitch: 0.5, c }), plot: createPlot(stage, { x: [-3.4, 3.4], y: [-3.4, 3.4], c }) }; },
  draw(ctx, stage, c, { cam, plot }) {
    const { f, R } = S();
    const lows = levels().filter((l) => l <= state.h);
    if (state.view === '3d') {
      cam.faces(surfaceFaces(c, f, R, 18, { stroke: c.grid }));
      cam.axes({ size: 3.6 });
      lows.forEach((l) => drawLevel3d(cam, f, l, R, { color: c.ink, width: 2 }));
      drawLevel3d(cam, f, state.h, R, { color: c.a, width: 4 });
      cam.label(`water at z = ${state.h.toFixed(2)}`, [R, -R, state.h], { size: 11 });
    } else {
      plot.axes();
      const step = 0.1;
      for (let x = -R; x < R; x += step) for (let y = -R; y < R; y += step) {
        if (f(x + step / 2, y + step / 2) <= state.h) {
          const [px, py] = plot.toPx(x, y + step);
          const [qx, qy] = plot.toPx(x + step, y);
          ctx.fillStyle = c.fillB;
          ctx.fillRect(px, py, qx - px + 0.5, qy - py + 0.5);
        }
      }
      lows.forEach((l) => drawLevel(ctx, plot, f, l, R, { color: c.ink, width: 2 }));
      drawLevel(ctx, plot, f, state.h, R, { color: c.a, width: 4 });
    }
  },
  controls: [
    { title: 'Raise the water' },
    { key: 'surface', label: 'Hill', options: Object.entries(SURF).filter(([k]) => ['two', 'hill', 'waves', 'saddle'].includes(k)).map(([k, v]) => [k, v.name]) },
    { key: 'h', label: 'Water level, z', min: -1.3, max: 3, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'view', label: 'View', options: [['3d', '3D hill'], ['map', 'From above']] },
    { readout: [
      ['Height range', () => zRange(S().f, S().R).map((v) => v.toFixed(1)).join(' to ')],
      ['Shorelines drawn', () => String(levels().filter((l) => l <= state.h).length + 1)],
    ] },
  ],
  tex: (s) => `f(x,y)=${Number(s.h).toFixed(2)}\\ \\text{is one level curve}`,
});
tool.extra.cam.orbit(tool.update);
