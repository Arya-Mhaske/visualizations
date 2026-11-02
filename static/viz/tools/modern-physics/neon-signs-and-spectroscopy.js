import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { lightColor } from './_mp.js';

// Visible lines (nm) of five elements. The mystery lamps are fixed, so a student can compare, then reveal.
const LINES = {
  H: [410.2, 434.0, 486.1, 656.3],
  He: [447.1, 471.3, 492.2, 501.6, 587.6, 667.8, 706.5],
  Ne: [585.2, 588.2, 603.0, 614.3, 626.6, 633.4, 640.2, 650.6, 692.9, 703.2],
  Na: [568.3, 589.0, 589.6, 615.4],
  Hg: [404.7, 435.8, 546.1, 577.0, 579.1],
};
const NAMES = { H: 'hydrogen', He: 'helium', Ne: 'neon', Na: 'sodium', Hg: 'mercury' };
const LAMPS = { 1: 'Ne', 2: 'Hg', 3: 'H', 4: 'He' };
const state = { lamp: 1, ref: 'Na', mode: 'e', reveal: false };
const matched = (s) => {
  const lines = LINES[LAMPS[s.lamp]];
  return lines.filter((l) => LINES[s.ref].some((r) => Math.abs(r - l) < 1.2)).length;
};

function strip(ctx, c, stage, lines, y, h, absorb) {
  const x0 = 14;
  const x1 = stage.w - 14;
  const X = (nm) => x0 + ((nm - 380) / (750 - 380)) * (x1 - x0);
  if (absorb) {
    for (let px = x0; px < x1; px += 2) {
      ctx.fillStyle = lightColor(c, 380 + ((px - x0) / (x1 - x0)) * 370);
      ctx.fillRect(px, y, 2, h);
    }
  } else {
    ctx.fillStyle = c.ink;
    ctx.fillRect(x0, y, x1 - x0, h);
  }
  for (const nm of lines) {
    ctx.fillStyle = absorb ? c.ink : lightColor(c, nm);
    ctx.fillRect(X(nm) - 2, y, 4, h);
  }
  ctx.strokeStyle = c.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(x0, y, x1 - x0, h);
  return X;
}

const tool = createTool({
  state,
  label: 'Two spectrum strips from 380 to 750 nanometres. The top strip is the mystery lamp, the bottom strip is the element you compare it with. In emission mode coloured lines glow on black; in absorption mode dark lines cut a rainbow band. Matching lines line up above one another.',
  draw(ctx, stage, c) {
    const h = stage.h * 0.24;
    const absorb = state.mode === 'a';
    const lamp = LAMPS[state.lamp];
    label(ctx, state.reveal ? `lamp ${state.lamp}: ${NAMES[lamp]}` : `lamp ${state.lamp}: unknown`, stage.w / 2, stage.h * 0.1, c, { size: 12, bounds: stage, patch: false });
    strip(ctx, c, stage, LINES[lamp], stage.h * 0.17, h, absorb);
    label(ctx, `comparison: ${NAMES[state.ref]}`, stage.w / 2, stage.h * 0.55, c, { size: 12, bounds: stage, patch: false });
    const X = strip(ctx, c, stage, LINES[state.ref], stage.h * 0.62, h, absorb);
    for (const nm of LINES[lamp]) {
      if (LINES[state.ref].some((r) => Math.abs(r - nm) < 1.2)) {
        ctx.fillStyle = c.ink;
        ctx.fillRect(X(nm) - 1, stage.h * 0.17 + h, 2, stage.h * 0.62 - stage.h * 0.17 - h);
      }
    }
    label(ctx, '380 nm', 14, stage.h * 0.9, c, { size: 10, align: 'left', patch: false });
    label(ctx, '750 nm', stage.w - 14, stage.h * 0.9, c, { size: 10, align: 'right', patch: false });
  },
  controls: () => [
    { title: 'Name the gas' },
    { key: 'lamp', label: 'Mystery lamp', options: [[1, '1'], [2, '2'], [3, '3'], [4, '4']] },
    { key: 'ref', label: 'Compare with', options: Object.keys(LINES).map((k) => [k, k]) },
    { key: 'mode', label: 'Spectrum', options: [['e', 'emission'], ['a', 'absorption']] },
    { key: 'reveal', label: 'Reveal the lamp', toggle: true },
    { readout: [
      ['Lines in the lamp', (s) => LINES[LAMPS[s.lamp]].length],
      ['Matching this element', (s) => ({ text: `${matched(s)} of ${LINES[LAMPS[s.lamp]].length}`, good: matched(s) === LINES[LAMPS[s.lamp]].length })],
    ] },
  ],
});

tool.update();
