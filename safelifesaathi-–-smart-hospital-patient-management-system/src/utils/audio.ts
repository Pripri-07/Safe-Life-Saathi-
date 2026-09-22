/**
 * Web Audio API synthesizer for hospital chimes and emergency audio alerts
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playHospitalChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Note 1: 523.25 Hz (C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Note 2: 659.25 Hz (E5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.25);
    gain2.gain.setValueAtTime(0.2, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 1.2);
  } catch (e) {
    console.debug('Audio chime playback error:', e);
  }
}

export function playEmergencyWarningTone() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency modulation siren-like beep
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.2);
    osc.frequency.linearRampToValueAtTime(750, now + 0.4);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch (e) {
    console.debug('Audio emergency tone error:', e);
  }
}

export function speakTokenAnnouncement(tokenNumber: string, roomNumber: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      playHospitalChime();
      setTimeout(() => {
        window.speechSynthesis.cancel();
        const text = `Token number ${tokenNumber.split('').join(' ')}, please proceed to ${roomNumber}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }, 500);
    } catch (e) {
      console.debug('Speech synth error:', e);
    }
  } else {
    playHospitalChime();
  }
}
