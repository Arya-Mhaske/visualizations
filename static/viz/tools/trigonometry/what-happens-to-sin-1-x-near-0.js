import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { zerosUpTo } from './_inverses-math.js';

const state = { zoom: 0 }; // window is x from -w to w, w = 10^(-zoom / 2)
const width = () => 10 ** (-state.zoom / 2);

createTool({
  state,
  label: 'The graph of sine of 1 over x on a window around zero that you can shrink. However far you zoom in, the wave keeps swinging between minus one and one faster and faster, and each smaller window still holds more crossings of the axis than the last. A yellow band marks where the wave is too fast for the screen to draw.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [-1.4, 1.4], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    const w = width();
    plot.setRange([-w, w], [-1.4, 1.4]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const n = Math.max(200, Math.round((stage.w - 52) * 5));
    const dx = (2 * w) / (stage.w - 52);
    const xc = Math.sqrt((4 * dx) / Math.PI); // zeros closer than ~4 px apart
    if (xc < w) {
      const [x0, y0] = plot.toPx(-xc, 1.4);
      const [x1, y1] = plot.toPx(xc, -1.4);
      ctx.save(); ctx.fillStyle = c.fillY; ctx.globalAlpha = 0.7; ctx.fillRect(x0, y0, x1 - x0, y1 - y0); ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle = c.a; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    for (const side of [-1, 1]) {
      ctx.beginPath();
      for (let i = 1; i <= n; i++) {
        const x = (side * w * i) / n;
        const [px, py] = plot.toPx(x, Math.sin(1 / x));
        if (i === 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  },
  controls: [
    { title: 'Zoom in on x = 0' },
    { key: 'zoom', label: 'Zoom', min: 0, max: 12, step: 0.5, format: (n) => `×${sig(10 ** (n / 2), 2)}` },
    { readout: [
      ['Window', () => `−${sig(width(), 2)} to ${sig(width(), 2)}`],
      ['Axis crossings at x > 0', () => String(zerosUpTo(width()))],
      ['Highest value in window', () => '1'],
      ['Lowest value in window', () => '−1'],
    ] },
  ],
  tex: () => `y=\\sin\\dfrac1x\\ \\text{is}\\ 0\\ \\text{at}\\ x=\\dfrac{1}{k\\pi}\\ (k=1,2,3,\\dots)`,
});
void fixed;
