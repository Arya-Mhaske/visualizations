import { createTool } from '../../lib/tool.js';
import { arc, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { STORY, chord, halfChord, sinD } from './_right-triangle-math.js';

const state = { step: 1, theta: 40 };

createTool({
  state,
  label: 'A circle with a chord, like a bowstring across a bow. Half of the chord is the sine. Below it, five words in a row show how the name travelled from Sanskrit jyā, through Arabic, to the Latin sinus. The word for the chosen step is highlighted.',
  draw(ctx, stage, c) {
    const R = Math.min(stage.w * 0.3, stage.h * 0.28);
    const O = [stage.w / 2, stage.h * 0.36];
    const th = (state.theta * Math.PI) / 180;
    arc(ctx, ...O, R, 0, Math.PI * 2, { color: c.grid, width: 2 });
    arc(ctx, ...O, R, -th, th, { color: c.ink, width: 4 }); // the bow
    const top = [O[0] + R * Math.cos(th), O[1] - R * Math.sin(th)];
    const bottom = [top[0], O[1] + R * Math.sin(th)];
    line(ctx, ...top, ...bottom, { color: c.d, width: 4 }); // the bowstring: the full chord
    line(ctx, ...top, top[0], O[1], { color: c.a, width: 7 }); // half of it: the sine
    line(ctx, ...O, top[0], O[1], { color: c.grid, width: 2 });
    line(ctx, ...O, ...top, { color: c.grid, width: 2 });
    label(ctx, 'half-chord', top[0] + 6, (top[1] + O[1]) / 2, c, { size: 11, align: 'left', color: c.a, bounds: stage, patch: false });
    label(ctx, 'chord = bowstring', bottom[0] + 6, bottom[1] + 12, c, { size: 11, align: 'left', color: c.d, bounds: stage, patch: false });
    // the five words
    const w = stage.w / 5;
    STORY.forEach((item, i) => {
      const x = w * i + 3;
      const y = stage.h * 0.72;
      poly(ctx, [[x, y], [x + w - 6, y], [x + w - 6, y + 46], [x, y + 46]], { fill: i + 1 === state.step ? c.fillY : c.paper, stroke: c.ink, width: i + 1 === state.step ? 3 : 1.5 });
      label(ctx, item.word, x + (w - 6) / 2, y + 23, c, { size: 13, bounds: stage, patch: false });
      label(ctx, String(i + 1), x + 9, y + 9, c, { size: 9, bounds: stage, patch: false });
      if (i < 4) label(ctx, '→', x + w - 3, y + 23, c, { size: 11, bounds: stage, patch: false });
    });
  },
  controls: [
    { title: 'Follow the word' },
    { key: 'step', label: 'Step in the story', min: 1, max: 5, step: 1 },
    { key: 'theta', label: 'Half the bow’s angle, θ', min: 10, max: 80, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Word', (s) => STORY[s.step - 1].word],
      ['Language', (s) => STORY[s.step - 1].tongue],
      ['Meaning', (s) => STORY[s.step - 1].meaning],
      ['About when', (s) => STORY[s.step - 1].when],
      ['Half-chord ÷ radius', (s) => fixed(sinD(s.theta), 4)],
    ] },
  ],
  tex: (s) => `\\dfrac{\\text{half-chord}}{R}=\\dfrac{${fixed(halfChord(1, s.theta), 3)}}{1}=\\sin ${s.theta}^\\circ,\\quad \\text{chord}=2R\\sin\\theta=${fixed(chord(1, s.theta), 3)}`,
});
