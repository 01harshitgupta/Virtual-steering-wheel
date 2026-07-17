class SoundEffects {
  private static ctx: AudioContext | null = null;

  private static getCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  static playBeep(freq = 880, duration = 0.08, type: OscillatorType = "sine", volume = 0.03) {
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context blocked
    }
  }

  static playClick() {
    this.playBeep(800, 0.05, "sine", 0.04);
  }

  static playTick() {
    this.playBeep(1200, 0.02, "triangle", 0.02);
  }

  static playSelect() {
    this.playBeep(1000, 0.08, "sine", 0.03);
    setTimeout(() => {
      this.playBeep(1300, 0.08, "sine", 0.03);
    }, 45);
  }

  static playStartup() {
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;
      
      const playNote = (freq: number, startOffset: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + startOffset);
        gain.gain.setValueAtTime(0.04, now + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration);
      };

      // Cyberpunk ascending chime
      playNote(523.25, 0, 0.12);     // C5
      playNote(659.25, 0.08, 0.12);  // E5
      playNote(783.99, 0.16, 0.12);  // G5
      playNote(1046.50, 0.24, 0.28); // C6
    } catch (e) {}
  }
}

export default SoundEffects;
export { SoundEffects };
