// Seeded random numbers (mulberry32), so a run can be repeated exactly.
//   const rng = createRng(42); rng.next() in [0, 1); rng.int(a, b) inclusive; rng.pick(list); rng.shuffle(list)
export function createRng(seed = 1) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (a, b) => a + Math.floor(next() * (b - a + 1));
  return {
    next,
    int,
    pick: (list) => list[int(0, list.length - 1)],
    shuffle(list) {
      const out = [...list];
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i);
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}
