// A pure sine tone through the browser's Web Audio (no library). Browsers only allow sound after a click or tap,
// so call set() from a control's handler.
//   const tone = createTone();
//   tone.supported         false where the browser has no Web Audio (hide or ignore the sound switch)
//   tone.set(440)          start, or move to, 440 Hz;  tone.set(0) stops. Frequencies are kept to 40–6000 Hz.
//   tone.level(0.4)        loudness from 0.03 to 1 (default 1); can be changed while sounding
//   tone.playing           true while sounding
// The tone fades in and out so there are no clicks, and stops when the tab is hidden or the page is left.
// All tones on a page share one audio clock, so two set() calls in one handler start exactly in step (beats need this).
const Context = typeof window === 'undefined' ? null : window.AudioContext || window.webkitAudioContext;
let shared = null;

export function createTone({ volume = 0.15 } = {}) {
  let ctx = null;
  let osc = null;
  let gain = null;
  let level = 1;
  const stop = () => {
    if (!osc) return;
    const [old, level] = [osc, gain];
    osc = null;
    gain = null;
    level.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
    old.stop(ctx.currentTime + 0.15);
  };
  const tone = {
    supported: Boolean(Context),
    get playing() { return Boolean(osc); },
    set(freq) {
      if (!Context) return;
      if (!(freq > 0)) { stop(); return; }
      const hz = Math.min(6000, Math.max(40, freq));
      if (!ctx) {
        shared ??= new Context();
        ctx = shared;
      }
      if (ctx.state === 'suspended') ctx.resume();
      if (osc) {
        osc.frequency.setTargetAtTime(hz, ctx.currentTime, 0.02);
        return;
      }
      osc = ctx.createOscillator();
      gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = hz;
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      gain.gain.setTargetAtTime(volume * level, ctx.currentTime, 0.02);
    },
    level(x) {
      level = Math.min(1, Math.max(0.03, x));
      if (gain) gain.gain.setTargetAtTime(volume * level, ctx.currentTime, 0.03);
    },
  };
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    window.addEventListener('pagehide', stop);
  }
  return tone;
}
