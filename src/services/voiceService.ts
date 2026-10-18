/**
 * J.A.R.V.I.S. Audio & Speech Synthesis/Recognition Service
 */

// Web Audio synthesizer for futuristic Stark acoustic telemetry
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play classic high-tech Iron Man HUD chimes
 */
export function playJarvisSound(type: 'activate' | 'confirm' | 'alert' | 'complete' | 'pulse'): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'activate') {
      // Two-tone rising holographic chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      osc2.frequency.setValueAtTime(260, now);
      osc2.frequency.exponentialRampToValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } else if (type === 'confirm') {
      // Crisp Stark confirmation beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1320, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'complete') {
      // Harmonic chord for task completion
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.05, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.3);
      });
    } else if (type === 'alert') {
      // Security alert pulsing beep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (err) {
    // Audio context not allowed until user gesture, safe ignore
  }
}

/**
 * Text-to-Speech using British / sophisticated voice synthesis
 */
export function speakJarvis(text: string, onEnd?: () => void): void {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.05;
  utterance.pitch = 0.95; // Slightly lower, authoritative JARVIS pitch

  const voices = window.speechSynthesis.getVoices();
  // Find British English voice if available (e.g. Daniel, Google UK English Male, en-GB)
  const preferredVoice = voices.find(
    (v) =>
      (v.lang === 'en-GB' || v.lang.includes('GB')) &&
      (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('daniel') || v.name.toLowerCase().includes('uk'))
  ) || voices.find((v) => v.lang.startsWith('en-GB')) || voices.find((v) => v.lang.startsWith('en'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Speech Recognition Wrapper
 */
export class JarvisSpeechRecognizer {
  private recognition: any = null;
  public isSupported = false;
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: any) => void) | null = null;
  private onStateChangeCallback: ((isListening: boolean) => void) | null = null;
  private isListening = false;
  private shouldKeepListening = false;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        // Automatically restart if user enabled continuous voice listening mode
        if (this.shouldKeepListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // ignore
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
        if (this.onErrorCallback) this.onErrorCallback(event);
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.onResultCallback) {
          if (finalTranscript.trim()) {
            this.onResultCallback(finalTranscript.trim(), true);
          } else if (interimTranscript.trim()) {
            this.onResultCallback(interimTranscript.trim(), false);
          }
        }
      };
    }
  }

  public start(continuousMode = false, onResult: (text: string, isFinal: boolean) => void, onStateChange?: (listening: boolean) => void) {
    if (!this.isSupported || !this.recognition) return;
    this.shouldKeepListening = continuousMode;
    this.onResultCallback = onResult;
    this.onStateChangeCallback = onStateChange || null;

    try {
      this.recognition.start();
    } catch (e) {
      // already started
    }
  }

  public stop() {
    this.shouldKeepListening = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }
}
