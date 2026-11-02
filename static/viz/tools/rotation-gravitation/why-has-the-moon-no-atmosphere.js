import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';
import { ME, RE, MM, RM, vEsc } from './_rg.js';

const GAS = [['H₂', 2.016], ['He', 4.003], ['N₂', 28.01], ['O₂', 32.0]];
const state = { world: 'moon', T: 300 };
const vrms = (m, T) => Math.sqrt((3 * 8.314 * T) / (m / 1000));
const esc = (s) => (s.world === 'moon' ? vEsc(MM, RM) : vEsc(ME, RE));

barTool({
  state,
  label: 'Bars of the typical speed of four gases and of one fifth of the escape speed of the chosen world. A gas whose bar is longer than the fifth-of-escape-speed bar leaks away over time.',
  rows: (s, c) => [...GAS.map(([n, m]) => [n, vrms(m, s.T), vrms(m, s.T) > esc(s) / 5 ? c.fillA : c.fillC, `${fixed(vrms(m, s.T), 0)} m/s`]), ['escape speed ÷ 5', esc(s) / 5, c.fillB, `${fixed(esc(s) / 5, 0)} m/s`]],
  max: 2500,
  left: 0.28,
  controls: [
    { title: 'World and temperature' },
    { key: 'world', label: 'World', options: [['moon', 'Moon'], ['earth', 'Earth']] },
    { key: 'T', label: 'Temperature (K)', min: 100, max: 600, step: 25 },
    { readout: [
      ['Escape speed', (s) => `${fixed(esc(s) / 1000, 2)} km/s`],
      ['Gases lost', (s) => GAS.filter(([, m]) => vrms(m, s.T) > esc(s) / 5).map(([n]) => n).join(', ') || 'none'],
    ] },
  ],
  tex: (s) => `v_{\\text{rms}}=\\sqrt{\\dfrac{3RT}{M}}`,
});
