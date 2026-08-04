export interface AmbientTrack {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'noise' | 'solfeggio' | 'binaural' | 'music' | 'nature';
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'pink_noise',
    name: 'Pink Noise',
    emoji: '🌸',
    description: 'Balanced 1/f frequency spectrum for deep focus & study',
    category: 'noise'
  },
  {
    id: 'brown_noise',
    name: 'Brown Noise',
    emoji: '🟤',
    description: 'Deep, rich low-frequency rumble for silencing mental chatter',
    category: 'noise'
  },
  {
    id: 'hz_432',
    name: '432 Hz Resonance',
    emoji: '✨',
    description: 'Harmonic Solfeggio frequency tuned to natural resonance',
    category: 'solfeggio'
  },
  {
    id: 'hz_528',
    name: '528 Hz Clarity',
    emoji: '🧬',
    description: 'Transformation frequency for cellular harmony & focus',
    category: 'solfeggio'
  },
  {
    id: 'hz_40',
    name: '40 Hz Gamma Pulse',
    emoji: '⚡',
    description: 'Cognitive enhancement & high-performance brainwave pulse',
    category: 'binaural'
  },
  {
    id: 'theta_waves',
    name: 'Theta Flow (6 Hz)',
    emoji: '🌀',
    description: 'Deep meditative & creative problem-solving brainwaves',
    category: 'binaural'
  },
  {
    id: 'alpha_waves',
    name: 'Alpha Focus (10 Hz)',
    emoji: '🧠',
    description: 'Relaxed alertness for sustained reading & absorption',
    category: 'binaural'
  },
  {
    id: 'rain',
    name: 'Rain & Thunder',
    emoji: '🌧️',
    description: 'Soothing rain soundscape with gentle distant thunder',
    category: 'nature'
  },
  {
    id: 'library',
    name: 'Library Study',
    emoji: '📚',
    description: 'Warm fireplace crackle & quiet room atmosphere',
    category: 'nature'
  },
  {
    id: 'lofi',
    name: 'Lofi Chill Chords',
    emoji: '🎧',
    description: 'Mellow lofi chord progressions & vinyl warmth',
    category: 'music'
  },
  {
    id: 'piano',
    name: 'Ambient Piano',
    emoji: '🎹',
    description: 'Soft ambient piano arpeggios & serene resonance',
    category: 'music'
  },
  {
    id: 'ambient',
    name: 'Deep Focus Drone',
    emoji: '🌌',
    description: 'Harmonic multi-oscillator drone & relaxing space waves',
    category: 'music'
  }
];

const LOCAL_STORAGE_AUDIO_KEY = 'tmiktb_ambient_music_v1';

export interface AudioSettings {
  volume: number; // 0 to 1
  muted: boolean;
  enabled: boolean;
  trackId: string;
}

const DEFAULT_SETTINGS: AudioSettings = {
  volume: 0.7,
  muted: false,
  enabled: false,
  trackId: 'pink_noise'
};

export function loadAudioSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUDIO_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.warn('Could not read audio settings from localStorage:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveAudioSettings(settings: Partial<AudioSettings>) {
  try {
    const current = loadAudioSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(LOCAL_STORAGE_AUDIO_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save audio settings to localStorage:', e);
  }
}

// Boost multiplier to ensure ample volume (up to 2.5x gain boost)
const VOLUME_BOOST_MULTIPLIER = 2.5;

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTrackId: string = 'pink_noise';
  private isPlaying: boolean = false;
  private volume: number = 0.7;
  private muted: boolean = false;

  private activeNodes: (AudioNode | number)[] = [];
  private activeTimerIds: any[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private calculateGainTarget(): number {
    if (this.muted) return 0;
    return this.volume * VOLUME_BOOST_MULTIPLIER;
  }

  public async start(trackId?: string, fadeInDurationSec = 1.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (trackId) {
      this.currentTrackId = trackId;
    }

    this.stopActiveNodes();
    this.isPlaying = true;

    const targetVol = this.calculateGainTarget();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + fadeInDurationSec);

    this.createSoundscape(this.currentTrackId);
    saveAudioSettings({ enabled: true, trackId: this.currentTrackId });
  }

  public stop(fadeOutDurationSec = 0.8) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;

    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + fadeOutDurationSec);

    setTimeout(() => {
      this.stopActiveNodes();
      this.isPlaying = false;
      saveAudioSettings({ enabled: false });
    }, fadeOutDurationSec * 1000);
  }

  public switchTrack(newTrackId: string) {
    if (!this.isPlaying) {
      this.currentTrackId = newTrackId;
      this.start(newTrackId);
      return;
    }

    if (newTrackId === this.currentTrackId) return;

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.5);

      setTimeout(() => {
        this.stopActiveNodes();
        this.currentTrackId = newTrackId;
        this.createSoundscape(newTrackId);
        const targetVol = this.calculateGainTarget();
        if (this.ctx && this.masterGain) {
          this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
          this.masterGain.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.8);
        }
        saveAudioSettings({ trackId: newTrackId });
      }, 500);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.isPlaying && !this.muted) {
      const target = this.calculateGainTarget();
      this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
    }
    saveAudioSettings({ volume: this.volume });
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.ctx && this.masterGain && this.isPlaying) {
      const target = this.calculateGainTarget();
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.2);
    }
    saveAudioSettings({ muted: this.muted });
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public getCurrentTrackId() {
    return this.currentTrackId;
  }

  public getVolume() {
    return this.volume;
  }

  public getIsMuted() {
    return this.muted;
  }

  private stopActiveNodes() {
    this.activeNodes.forEach((node) => {
      if (typeof node !== 'number' && (node as any).stop) {
        try {
          (node as any).stop();
        } catch (e) {}
      }
      if (typeof node !== 'number' && node.disconnect) {
        try {
          node.disconnect();
        } catch (e) {}
      }
    });
    this.activeNodes = [];

    this.activeTimerIds.forEach((id) => clearInterval(id));
    this.activeTimerIds = [];
  }

  private createSoundscape(type: string) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    switch (type) {
      case 'pink_noise': {
        // High quality Paul Kellet Pink Noise generator
        const bufferSize = 4 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.22; // Rich volume level
          b6 = white * 0.115926;
        }

        const pink = ctx.createBufferSource();
        pink.buffer = noiseBuffer;
        pink.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, ctx.currentTime);

        pink.connect(filter);
        filter.connect(this.masterGain);
        pink.start();

        this.activeNodes.push(pink, filter);
        break;
      }

      case 'brown_noise': {
        // Brown noise generator (1/f^2 spectrum) - heavy bass warmth
        const bufferSize = 4 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOutput = 0.0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOutput + (0.02 * white)) / 1.02;
          lastOutput = output[i];
          output[i] *= 3.8; // Boost brown noise presence
        }

        const brown = ctx.createBufferSource();
        brown.buffer = noiseBuffer;
        brown.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, ctx.currentTime);

        brown.connect(filter);
        filter.connect(this.masterGain);
        brown.start();

        this.activeNodes.push(brown, filter);
        break;
      }

      case 'hz_432': {
        // 432 Hz Solfeggio natural resonance tone + subtle panning tremolo
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);

        // Sub harmonic (216 Hz)
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(216, ctx.currentTime);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        subGain.gain.setValueAtTime(0.18, ctx.currentTime);

        osc.connect(gain);
        subOsc.connect(subGain);
        gain.connect(this.masterGain);
        subGain.connect(this.masterGain);

        osc.start();
        subOsc.start();

        this.activeNodes.push(osc, gain, subOsc, subGain);
        break;
      }

      case 'hz_528': {
        // 528 Hz Transformation & DNA Repair Frequency + 264 Hz octave
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime);

        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(264, ctx.currentTime);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        subGain.gain.setValueAtTime(0.2, ctx.currentTime);

        osc.connect(gain);
        subOsc.connect(subGain);
        gain.connect(this.masterGain);
        subGain.connect(this.masterGain);

        osc.start();
        subOsc.start();

        this.activeNodes.push(osc, gain, subOsc, subGain);
        break;
      }

      case 'hz_40': {
        // 40 Hz Gamma pulse (Focus & High Cognition)
        // Carrier 200 Hz amplitude modulated at 40 Hz
        const carrier = ctx.createOscillator();
        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        const mainGain = ctx.createGain();

        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(200, ctx.currentTime);

        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(40, ctx.currentTime);

        modGain.gain.setValueAtTime(0.2, ctx.currentTime);
        mainGain.gain.setValueAtTime(0.3, ctx.currentTime);

        modulator.connect(modGain);
        modGain.connect(mainGain.gain);
        carrier.connect(mainGain);
        mainGain.connect(this.masterGain);

        carrier.start();
        modulator.start();

        this.activeNodes.push(carrier, modulator, modGain, mainGain);
        break;
      }

      case 'theta_waves': {
        // 6 Hz Theta Binaural / Modulation (136.1 Hz carrier)
        const carrier = ctx.createOscillator();
        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        const mainGain = ctx.createGain();

        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(136.1, ctx.currentTime); // Om Frequency

        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(6, ctx.currentTime); // 6 Hz Theta

        modGain.gain.setValueAtTime(0.25, ctx.currentTime);
        mainGain.gain.setValueAtTime(0.35, ctx.currentTime);

        modulator.connect(modGain);
        modGain.connect(mainGain.gain);
        carrier.connect(mainGain);
        mainGain.connect(this.masterGain);

        carrier.start();
        modulator.start();

        this.activeNodes.push(carrier, modulator, modGain, mainGain);
        break;
      }

      case 'alpha_waves': {
        // 10 Hz Alpha Waves (Relaxed Alertness - 216 Hz carrier)
        const carrier = ctx.createOscillator();
        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        const mainGain = ctx.createGain();

        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(216, ctx.currentTime);

        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(10, ctx.currentTime); // 10 Hz Alpha

        modGain.gain.setValueAtTime(0.22, ctx.currentTime);
        mainGain.gain.setValueAtTime(0.35, ctx.currentTime);

        modulator.connect(modGain);
        modGain.connect(mainGain.gain);
        carrier.connect(mainGain);
        mainGain.connect(this.masterGain);

        carrier.start();
        modulator.start();

        this.activeNodes.push(carrier, modulator, modGain, mainGain);
        break;
      }

      case 'rain': {
        // Pink noise filter rain + low rumble thunder intervals
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.35; // Loud rain
          b6 = white * 0.115926;
        }

        const rain = ctx.createBufferSource();
        rain.buffer = noiseBuffer;
        rain.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);

        rain.connect(filter);
        filter.connect(this.masterGain);
        rain.start();

        this.activeNodes.push(rain, filter);
        break;
      }

      case 'library': {
        // Room tone + warm fireplace crackle
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12, ctx.currentTime);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();

        // Fireplace crackle
        const bufferSize = ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.15;
        }

        const crackle = ctx.createBufferSource();
        crackle.buffer = noiseBuffer;
        crackle.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);

        crackle.connect(filter);
        filter.connect(this.masterGain);
        crackle.start();

        this.activeNodes.push(osc, gain, crackle, filter);
        break;
      }

      case 'lofi': {
        // Warm lofi chord progression
        const notesProgression = [
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [130.81, 164.81, 196.00, 246.94]  // Cmaj7
        ];

        let chordIndex = 0;

        const playChord = () => {
          if (!this.ctx || !this.masterGain || !this.isPlaying) return;
          const chord = notesProgression[chordIndex];
          chordIndex = (chordIndex + 1) % notesProgression.length;

          chord.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(0.001, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 1.2);
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 4.5);

            osc.connect(gain);
            gain.connect(this.masterGain!);
            osc.start();
            osc.stop(ctx.currentTime + 4.8);
            this.activeNodes.push(osc, gain);
          });
        };

        playChord();
        const intervalId = setInterval(playChord, 5000);
        this.activeTimerIds.push(intervalId);
        break;
      }

      case 'piano': {
        // Serene ambient piano arpeggios
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C Major Pentatonic

        const playNote = () => {
          if (!this.ctx || !this.masterGain || !this.isPlaying) return;
          const freq = scale[Math.floor(Math.random() * scale.length)];
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start();
          osc.stop(ctx.currentTime + 3.2);
          this.activeNodes.push(osc, gain);
        };

        playNote();
        const intervalId = setInterval(playNote, 2200);
        this.activeTimerIds.push(intervalId);
        break;
      }

      case 'ambient':
      default: {
        // Deep drone focus (A2, E3, B3, C#4)
        const freqs = [110.00, 164.81, 246.94, 277.18];
        freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);

          gain.gain.setValueAtTime(0.12, ctx.currentTime);

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start();
          this.activeNodes.push(osc, gain);
        });
        break;
      }
    }
  }
}

export const ambientEngine = new AmbientEngine();
