import { createTool } from '../../lib/tool.js';
import { arrow, line, label } from '../../lib/draw.js';

// Outside field E_ext. A closed metal body gives zero inside. Open windows leak a little. A plastic body does not shield.
const state = { body: 'metal', E: 50, strike: false };
const inside = (s) => (s.body === 'metal' ? 0 : s.body === 'open' ? 0.04 * s.E : 0.9 * s.E);
const names = { metal: 'Closed metal body', open: 'Metal body, windows open', plastic: 'Plastic body' };

createTool({
  state,
  label: 'A car in a strong electric field from a storm cloud. With a closed metal body the field lines end on the outside surface and there is no field inside. With open windows a very small field leaks in. A plastic body lets the field straight through. In a lightning strike the current runs around the outside of a metal body.',
  draw(ctx, stage, c) {
    const [W, H] = [stage.w, stage.h];
    const [x0, x1, y0, y1] = [W * 0.28, W * 0.72, H * 0.42, H * 0.76];
    ctx.fillStyle = state.body === 'plastic' ? c.fillC : c.fillB;
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    ctx.fillRect(x0 + (x1 - x0) * 0.22, y0 - H * 0.12, (x1 - x0) * 0.5, H * 0.12);
    ctx.strokeStyle = c.ink; ctx.lineWidth = 4;
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    ctx.strokeRect(x0 + (x1 - x0) * 0.22, y0 - H * 0.12, (x1 - x0) * 0.5, H * 0.12);
    ctx.fillStyle = c.paper;
    ctx.fillRect(x0 + (x1 - x0) * 0.28, y0 - H * 0.09, (x1 - x0) * 0.38, H * 0.07);
    label(ctx, state.body === 'open' ? 'window open' : 'driver', (x0 + x1) / 2, y0 - H * 0.055, c, { size: 11, bounds: stage, patch: false });
    ctx.beginPath(); ctx.arc(x0 + (x1 - x0) * 0.2, y1 + 10, 11, 0, 7); ctx.arc(x0 + (x1 - x0) * 0.8, y1 + 10, 11, 0, 7);
    ctx.fillStyle = c.ink; ctx.fill();
    // field arrows from the cloud, downward
    for (let i = 0; i < 7; i++) {
      const x = W * (0.12 + i * 0.13);
      const hits = x > x0 && x < x1;
      arrow(ctx, x, H * 0.04, x, hits ? (state.body === 'plastic' ? y1 - 10 : y0 - H * 0.13) : H * 0.9, { color: c.a, width: 3, head: 9 });
    }
    if (state.strike) {
      if (state.body === 'plastic') arrow(ctx, W * 0.5, H * 0.04, W * 0.5, y1, { color: c.ink, width: 6, head: 12 });
      else { line(ctx, W * 0.5, H * 0.04, W * 0.5, y0 - H * 0.12, { color: c.ink, width: 5 }); line(ctx, x0 - 6, y0, x0 - 6, y1, { color: c.ink, width: 5 }); line(ctx, x1 + 6, y0, x1 + 6, y1, { color: c.ink, width: 5 }); }
    }
    label(ctx, `field inside: ${inside(state).toFixed(1)} kV/m`, W * 0.5, H * 0.95, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Storm overhead' },
    { key: 'body', label: 'Car body', options: [['metal', 'Closed metal'], ['open', 'Metal, open'], ['plastic', 'Plastic']] },
    { key: 'E', label: 'Field outside (kV/m)', min: 10, max: 100, step: 10 },
    { key: 'strike', label: 'Lightning strikes', toggle: true },
    { readout: [
      ['Field inside', (s) => `${inside(s).toFixed(1)} kV/m`],
      ['Shielding', (s) => `${(100 - (inside(s) / s.E) * 100).toFixed(0)} %`],
      ['Don\'t', () => 'touch the metal'],
    ] },
  ],
});
