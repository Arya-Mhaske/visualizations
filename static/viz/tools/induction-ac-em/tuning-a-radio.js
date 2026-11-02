import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

// L = 250 μH with a variable capacitor from about 40 to 360 pF covers the medium-wave band (531–1602 kHz).
// The response to a station at f_s is the current at f_s in a circuit tuned to f₀ = 1/(2π√LC), with Q = 60.
const L = 250e-6;
const Q = 60;
const STATIONS = [585, 810, 1000, 1260, 1440]; // kHz, example frequencies
const state = { C: 101 }; // pF
const f0 = (Cpf) => 1 / (2 * Math.PI * Math.sqrt(L * Cpf * 1e-12)) / 1000; // kHz
const resp = (fs, Cpf) => { const x = fs / f0(Cpf) - f0(Cpf) / fs; return 1 / Math.sqrt(1 + (Q * x) ** 2); };
const best = (Cpf) => { let b = 0; STATIONS.forEach((s, i) => { if (resp(s, Cpf) > resp(STATIONS[b], Cpf)) b = i; }); return b; };

const tool = createTool({
  state,
  label: 'A graph of the radio’s response against frequency in kilohertz. A coral peak sits at the circuit’s resonant frequency, which moves as you turn the capacitor. Five vertical lines are radio stations. The station nearest the peak is heard loudly, and the others are almost silent.',
  setup: (stage, c) => createPlot(stage, { x: [500, 1650], y: [0, 1.1], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'f (kHz)', yLabel: 'response' });
    plot.fn((f) => resp(f, state.C), { color: c.a, domain: [500, 1650] });
    const b = best(state.C);
    STATIONS.forEach((s, i) => {
      plot.segment(s, 0, s, resp(s, state.C), { color: i === b ? c.c : c.b, width: i === b ? 6 : 3 });
      plot.text(`${s}`, s, 1.04, { size: 9 });
    });
    plot.point(f0(state.C), 1, { fill: c.a, r: 7 });
  },
  controls: () => [
    { title: 'Turn the dial' },
    { key: 'C', label: 'Variable capacitor C', min: 40, max: 360, step: 2, format: (v) => `${v} pF` },
    { readout: [
      ['Tuned to f₀', (s) => `${sig(f0(s.C), 4)} kHz`],
      ['Loudest station', (s) => `${STATIONS[best(s.C)]} kHz`],
      ['How loud', (s) => `${fixed(resp(STATIONS[best(s.C)], s.C) * 100, 0)}%`],
      ['Neighbour station', (s) => `${fixed(Math.max(...STATIONS.filter((_, i) => i !== best(s.C)).map((f) => resp(f, s.C))) * 100, 1)}%`],
    ] },
  ],
  tex: (s) => `f_0=\\dfrac{1}{2\\pi\\sqrt{LC}}=${sig(f0(s.C), 4)}\\ \\text{kHz}\\quad(L=250\\ \\mu\\text{H})`,
});

tool.update();
