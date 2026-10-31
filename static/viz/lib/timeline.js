// A looping time axis that a slider and the Play button share, for tools that animate an exact formula.
//   const line = createTimeline(document.querySelector('#stage'), state, { cycle: (s) => 7, update: () => tool.update() });
//   state.t  is the time in seconds, always in [0, cycle). Put { key: 't', label, min: 0, max, step } in the controls,
//   transport(line.clock) after it, and call line.sync(cycle) from onChange so a dragged slider moves the clock too.
//   line.sync() also pulls state.t back inside the cycle if a control shortened it.
import { createClock } from './sim.js';

export function createTimeline(target, state, { cycle, update }) {
  const clock = createClock(target, {
    onFrame: () => {
      state.t = clock.state.t % cycle(state);
      update();
    },
  });
  return {
    clock,
    sync() {
      state.t = Math.min(state.t, cycle(state) - 1e-9);
      clock.state.t = state.t;
    },
  };
}
