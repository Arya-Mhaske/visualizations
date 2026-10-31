import { createTool } from '../../lib/tool.js';
import { label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { PEOPLE, unitLength, unitsAcross } from './_units-measurement-math.js';

const state = { unit: 'span', length: 120 };
const NAMES = { span: 'spans', cubit: 'cubits', foot: 'feet', metre: 'metres' };
const count = (person) => unitsAcross(state.length, unitLength(person, state.unit));

createTool({
  state,
  label: 'A table measured by three people. Each lays their own unit end to end along it and gets a different count. With the metre as the unit, all three get the same number.',
  draw(ctx, stage, c) {
    const pad = 14;
    const scale = (stage.w - 2 * pad) / 200; // pixels per cm, fixed so the table length is visible
    const tableW = state.length * scale;
    const rowH = Math.min(30, stage.h * 0.09);
    ctx.fillStyle = c.fillY;
    ctx.fillRect(pad, pad + 4, tableW, rowH);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = c.line;
    ctx.strokeRect(pad, pad + 4, tableW, rowH);
    label(ctx, `Table: ${state.length} cm`, pad + 4, pad + 4 + rowH / 2, c, { align: 'left', patch: false, size: 12 });
    const pitch = (stage.h - 2 * pad - rowH - 20) / PEOPLE.length;
    PEOPLE.forEach((person, row) => {
      const unitCm = unitLength(person, state.unit);
      const unitPx = unitCm * scale;
      const top = pad + rowH + 30 + row * pitch + 18;
      label(ctx, `${person.name}: ${fixed(count(person), 1)} ${NAMES[state.unit]}  (1 = ${unitCm} cm)`, pad, top - 12, c, { align: 'left', bounds: stage, size: 12 });
      for (let i = 0; i * unitPx < tableW - 0.5; i++) {
        const w = Math.min(unitPx, tableW - i * unitPx);
        ctx.fillStyle = i % 2 ? c.fillB : c.fillA;
        ctx.fillRect(pad + i * unitPx, top, w, rowH * 0.8);
        ctx.strokeStyle = c.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(pad + i * unitPx, top, w, rowH * 0.8);
      }
    });
  },
  controls: [
    { title: 'Measure the table' },
    { key: 'unit', label: 'Unit', options: [['span', 'Span'], ['cubit', 'Cubit'], ['foot', 'Foot'], ['metre', 'Metre']] },
    { key: 'length', label: 'Table length', min: 60, max: 200, step: 5, format: (v) => `${v} cm` },
    { text: 'Spans, cubits and feet are each person\'s own. The metre is the same for all.' },
    { readout: PEOPLE.map((person) => [person.name, () => `${fixed(count(person), 1)} ${NAMES[state.unit]}`]) },
  ],
  tex: (s) => `N = \\frac{L}{u}:\\ ${PEOPLE.map((p) => `\\frac{${s.length}}{${unitLength(p, s.unit)}}`).join(',\\ ')} = ${PEOPLE.map((p) => fixed(count(p), 1)).join(',\\ ')}`,
});
