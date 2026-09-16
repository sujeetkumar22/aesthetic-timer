import { AmbientSoundType } from '../types/timer';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private isMuted: boolean = false;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private currentAmbientType: AmbientSoundType = 'rain';

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public unlockAudio() {
    this.initContext();
    if (this.ctx && !this.isUnlocked) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
        });
      } else {
        this.isUnlocked = true;
      }
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isAmbientPlaying) {
      this.stopAmbientSound();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playFlipTick(volume: number = 0.3) {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.4, now);
      masterGain.connect(this.ctx.destination);

      // Low frequency click pop
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.035);

      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.04);

      // White noise burst for plastic/metal flap impact
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start(now);
      noise.stop(now + 0.025);
    } catch (e) {
      // Audio blocked or failed
    }
  }

  public playWarningTick(volume: number = 0.5) {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

      gain.gain.setValueAtTime(volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      // Audio failed
    }
  }

  public playCompletionChime(volume: number = 0.6) {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const chord = [329.63, 493.88, 659.25, 830.61, 987.77]; // E major 9th
      const now = this.ctx.currentTime;

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        const startTime = now + idx * 0.06;
        const duration = 2.4 - idx * 0.2;

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime((volume * 0.25) / (idx * 0.3 + 1), startTime + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.1);
      });
    } catch (e) {
      // Audio failed
    }
  }

  /**
   * Multi-soundscape Focus Audio Generator
   */
  public toggleAmbientSound(
    volume: number = 0.25,
    type: AmbientSoundType = this.currentAmbientType
  ): boolean {
    if (this.isMuted) return false;

    try {
      this.initContext();
      if (!this.ctx) return false;

      // If already playing the same type, stop it
      if (this.isAmbientPlaying && this.currentAmbientType === type) {
        this.stopAmbientSound();
        return false;
      }

      // If playing a different type, stop previous and start new
      if (this.isAmbientPlaying) {
        this.stopAmbientSound();
      }

      this.currentAmbientType = type;
      const now = this.ctx.currentTime;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.linearRampToValueAtTime(volume * 0.2, now + 1.2);
      masterGain.connect(this.ctx.destination);

      if (type === 'alpha') {
        // 432 Hz Zen Alpha Waves (Binaural Drone)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const sub = this.ctx.createOscillator();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(432, now); // 432 Hz healing tone

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, now); // 8 Hz difference creates Alpha Wave!

        sub.type = 'triangle';
        sub.frequency.setValueAtTime(108, now); // Warm bass foundation

        const droneGain = this.ctx.createGain();
        droneGain.gain.setValueAtTime(0.35, now);

        osc1.connect(droneGain);
        osc2.connect(droneGain);
        sub.connect(droneGain);
        droneGain.connect(masterGain);

        osc1.start();
        osc2.start();
        sub.start();

        this.ambientSource = droneGain;
      } else {
        // Noise-based soundscapes (Rain, Brown, White)
        const bufferSize = this.ctx.sampleRate * 5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;

          if (type === 'brown') {
            // Brownian 1/f^2 noise
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
          } else if (type === 'rain') {
            // Rain simulation: Pink/brown blend with occasional raindrops
            data[i] = (lastOut + 0.05 * white) / 1.05;
            lastOut = data[i];
            if (Math.random() < 0.0008) {
              data[i] += (Math.random() * 2 - 1) * 0.6; // Rain droplet crackle
            }
            data[i] *= 2.8;
          } else {
            // Pure White Noise
            data[i] = white * 0.25;
          }
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        if (type === 'brown') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, now);
        } else if (type === 'rain') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(800, now);
          filter.Q.setValueAtTime(1.2, now);
        } else {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(4500, now);
        }

        source.connect(filter);
        filter.connect(masterGain);
        source.start();

        this.ambientSource = source;
      }

      this.ambientGain = masterGain;
      this.isAmbientPlaying = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  public stopAmbientSound() {
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
      }
      setTimeout(() => {
        if (this.ambientSource) {
          try {
            (this.ambientSource as any).stop?.();
            this.ambientSource.disconnect();
          } catch (e) {}
          this.ambientSource = null;
        }
        this.ambientGain = null;
        this.isAmbientPlaying = false;
      }, 400);
    } catch (e) {
      this.isAmbientPlaying = false;
    }
  }

  public setAmbientType(type: AmbientSoundType, volume: number = 0.25) {
    const wasPlaying = this.isAmbientPlaying;
    if (wasPlaying) {
      this.stopAmbientSound();
      this.currentAmbientType = type;
      setTimeout(() => {
        this.toggleAmbientSound(volume, type);
      }, 150);
    } else {
      this.currentAmbientType = type;
    }
  }

  public getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying;
  }

  public getCurrentAmbientType(): AmbientSoundType {
    return this.currentAmbientType;
  }
}

export const soundSynth = new SoundSynthesizer();
