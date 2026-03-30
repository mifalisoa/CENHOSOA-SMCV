// frontend/src/presentation/hooks/useNotificationSound.ts
//
// Son : "Combo rapide" — Pop sourd → Soft Ping → Double Chime
// Durée : ~2.5 secondes | Volume : 100%
// Anti-boucle : cooldown de 3s entre deux sons

import { useCallback, useEffect, useRef } from 'react';

const MP3_PATH    = '/sounds/notification.mp3';
const COOLDOWN_MS = 3000;

export function useNotificationSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthRef    = useRef<(() => void) | null>(null);
  const playingRef  = useRef<boolean>(false);

  const getCtx = (): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  // Déverrouille l'AudioContext au premier clic ou touche (politique autoplay)
  useEffect(() => {
    const unlock = () => {
      try {
        const ctx = getCtx();
        if (ctx.state === 'suspended') ctx.resume();
      } catch { /* silencieux */ }
    };
    document.addEventListener('click',   unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    return () => {
      document.removeEventListener('click',   unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, []);

  const playSynthetic = useCallback(() => {
    try {
      const ctx = getCtx();

      // Si suspendu → reprend puis rejoue via la ref
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => { synthRef.current?.(); });
        return;
      }

      // ── Pop sourd ─────────────────────────────────────────────────────────
      const bufSize = ctx.sampleRate * 0.06;
      const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data    = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 2);
      }
      const src  = ctx.createBufferSource();
      const filt = ctx.createBiquadFilter();
      const gPop = ctx.createGain();
      filt.type            = 'lowpass';
      filt.frequency.value = 400;
      filt.Q.value         = 8;
      src.buffer = buf;
      src.connect(filt); filt.connect(gPop); gPop.connect(ctx.destination);
      gPop.gain.setValueAtTime(1.0, ctx.currentTime);
      gPop.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);
      src.start(ctx.currentTime);
      src.stop(ctx.currentTime + 0.14);

      // Queue tonale grave
      const oscPop  = ctx.createOscillator();
      const gOscPop = ctx.createGain();
      oscPop.connect(gOscPop); gOscPop.connect(ctx.destination);
      oscPop.type = 'sine';
      oscPop.frequency.setValueAtTime(120, ctx.currentTime);
      oscPop.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.35);
      gOscPop.gain.setValueAtTime(0,   ctx.currentTime);
      gOscPop.gain.linearRampToValueAtTime(0.5,  ctx.currentTime + 0.01);
      gOscPop.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
      oscPop.start(ctx.currentTime);
      oscPop.stop(ctx.currentTime + 0.4);

      // ── Helper ping ───────────────────────────────────────────────────────
      const ping = (freq: number, start: number, dur: number, vol: number) => {
        [[freq, vol], [freq * 2, vol * 0.25], [freq * 3, vol * 0.08]].forEach(([f, v]) => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime + start);
          const t = ctx.currentTime + start;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(v, t + 0.007);
          gain.gain.exponentialRampToValueAtTime(0.001, t + (f === freq ? dur : dur * 0.5));
          osc.start(t);
          osc.stop(t + dur + 0.05);
        });
      };

      // ── Helper chime ──────────────────────────────────────────────────────
      const chime = (freq: number, start: number, dur: number, vol: number) => {
        ([
          [1,    vol,       dur       ],
          [2.76, vol * 0.3, dur * 0.55],
          [5.4,  vol * 0.1, dur * 0.32],
        ] as [number, number, number][]).forEach(([h, v, d]) => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * h, ctx.currentTime + start);
          const t = ctx.currentTime + start;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(v, t + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.001, t + d);
          osc.start(t);
          osc.stop(t + d + 0.05);
        });
      };

      // ── Séquence Combo rapide ─────────────────────────────────────────────
      ping(880,     0.15, 0.7,  0.9);
      chime(659.25, 0.70, 1.0,  0.9);
      chime(830.61, 1.05, 0.9,  0.85);
      ping(1318.5,  1.50, 0.8,  0.7);

      // Libère le verrou après la durée du son
      setTimeout(() => { playingRef.current = false; }, COOLDOWN_MS);

    } catch (err) {
      playingRef.current = false;
      console.warn('[useNotificationSound] Erreur:', err);
    }
  }, []);

  // ✅ Mise à jour de la ref dans un useEffect — pas pendant le rendu
  useEffect(() => {
    synthRef.current = playSynthetic;
  }, [playSynthetic]);

  // ── Lecture publique avec verrou anti-boucle ──────────────────────────────
  const play = useCallback(() => {
    if (playingRef.current) return;
    playingRef.current = true;

    const audio  = new Audio(MP3_PATH);
    audio.volume = 1.0;
    audio.play().catch(() => playSynthetic());
  }, [playSynthetic]);

  return { play };
}