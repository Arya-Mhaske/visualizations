import { createTool } from '../../lib/tool.js';
import { cellGrid } from '../../lib/discrete.js';

const EV = [
  ['c. 150 CE', 'Ptolemy: the Almagest explains planetary motion with circles on circles (epicycles) round a central Earth.'],
  ['499 CE', 'Aryabhata: states that the Earth turns on its axis, which explains the daily motion of the stars.'],
  ['1543', 'Copernicus: puts the Sun near the centre, with the planets in circles round it.'],
  ['1576–1601', 'Tycho Brahe: measures planet positions far more accurately than before, with no telescope.'],
  ['1609', 'Kepler: from Tycho\'s data for Mars, finds elliptical orbits and the equal-areas law.'],
  ['1610', 'Galileo: sees the moons of Jupiter and the phases of Venus through a telescope.'],
  ['1619', 'Kepler: T² ∝ R³ links the planets\' periods and distances.'],
  ['1687', 'Newton: the inverse-square law of gravitation explains all three of Kepler\'s laws.'],
];
const state = { i: 4 };
let tool;

tool = createTool({
  state,
  label: 'A timeline table of key steps in astronomy from Ptolemy to Newton, with the selected step marked.',
  dom: (el) => cellGrid(el, {
    rows: EV.length,
    cols: 2,
    cell: (r, c) => ({ text: EV[r][c === 0 ? 0 : 1].slice(0, c === 0 ? 20 : 26) + (c === 1 ? '…' : ''), state: r === state.i ? 'mark' : '', label: EV[r][0] }),
    onPress: (r) => {
      state.i = r;
      tool.update();
    },
  }),
  controls: [
    { title: 'The timeline' },
    { key: 'i', label: 'Step', min: 0, max: EV.length - 1, step: 1, format: (v) => EV[v][0] },
    { readout: [['When', (s) => EV[s.i][0]], ['What', (s) => EV[s.i][1]]] },
  ],
  tex: () => `T^2\\propto R^3`,
});
