// VerifyCheck — feedback du scanner : son (WebAudio) + vibration.
// Aucun fichier audio : tout est généré, pour rester offline et léger.

window.VC = window.VC || {};

VC.feedback = (function () {
  let ctx = null;

  function audio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!ctx) ctx = new Ctx();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  // Tons : un "ok" montant, un "déjà scanné" neutre, une erreur grave.
  const TONES = {
    success: [{ f: 880, at: 0, d: 0.09 }, { f: 1320, at: 0.1, d: 0.14 }],
    duplicate: [{ f: 560, at: 0, d: 0.11 }, { f: 560, at: 0.16, d: 0.11 }],
    invalid: [{ f: 200, at: 0, d: 0.3 }],
    "no-course": [{ f: 200, at: 0, d: 0.3 }],
    queued: [{ f: 660, at: 0, d: 0.1 }, { f: 440, at: 0.12, d: 0.12 }],
  };

  const VIBRATION = {
    success: [40, 60, 40],
    duplicate: [90, 50, 90],
    invalid: [140, 60, 140],
    "no-course": [140, 60, 140],
    queued: [70, 50, 70],
  };

  function play(kind) {
    const prefs = VC.prefs || {};
    const c = audio();
    if (prefs.sound !== false && c && TONES[kind]) {
      TONES[kind].forEach((t) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        const t0 = c.currentTime + t.at;
        osc.type = kind === "invalid" || kind === "no-course" ? "square" : "sine";
        osc.frequency.setValueAtTime(t.f, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + t.d);
        osc.connect(gain).connect(c.destination);
        osc.start(t0);
        osc.stop(t0 + t.d + 0.02);
      });
    }
    if (prefs.vibrate !== false && navigator.vibrate && VIBRATION[kind]) {
      navigator.vibrate(VIBRATION[kind]);
    }
  }

  // À appeler sur un geste utilisateur : débloque l'audio sur iOS/Android.
  function unlock() {
    audio();
  }

  return { play, unlock };
})();
