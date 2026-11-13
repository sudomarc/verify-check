// VerifyCheck — couche de données du scanner (RÉELLE, Sprint 2+).
//
// Toutes les opérations passent par les endpoints same-origin (/api/**) avec la
// session admin (cookies httpOnly). Aucune donnée simulée en production :
// - `recordScan` interroge POST /api/scan et renvoie un état métier explicite ;
// - hors ligne, le pointage part dans une file IndexedDB persistante et reste
//   « EN ATTENTE » tant que le serveur ne l'a pas confirmé ;
// - à la synchronisation, un doublon renvoyé par le serveur est CONFIRMÉ (pas
//   une erreur) ; un rejet définitif (QR invalide) est marqué « rejeté ».

window.VC = window.VC || {};

VC.api = (function () {
  const DB_NAME = "vc-scanner";
  const DB_STORE = "queue";
  const K_PREFS = "vc.prefs.v1";

  // ---------------------------------------------------------------- prefs
  let prefs;
  try {
    prefs = Object.assign({ sound: true, vibrate: true }, JSON.parse(localStorage.getItem(K_PREFS) || "{}"));
  } catch {
    prefs = { sound: true, vibrate: true };
  }
  const savePrefs = () => {
    try { localStorage.setItem(K_PREFS, JSON.stringify(prefs)); } catch { /* */ }
  };
  VC.prefs = prefs; // alias lu par lib/feedback.js

  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());

  // ------------------------------------------------------------ IndexedDB
  let dbPromise = null;
  function openDb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve) => {
        try {
          const req = indexedDB.open(DB_NAME, 1);
          req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains(DB_STORE)) {
              req.result.createObjectStore(DB_STORE, { keyPath: "id" });
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null); // pas d'IndexedDB → pas de file
        } catch {
          resolve(null);
        }
      });
    }
    return dbPromise;
  }

  function dbOp(mode, fn) {
    return openDb().then(
      (db) =>
        new Promise((resolve) => {
          if (!db) return resolve([]);
          const tx = db.transaction(DB_STORE, mode);
          const store = tx.objectStore(DB_STORE);
          let result = [];
          fn(store, (r) => (result = r));
          tx.oncomplete = () => resolve(result);
          tx.onerror = () => resolve(mode === "readonly" ? [] : null);
        })
    );
  }
  const queueAll = () => dbOp("readonly", (s, done) => (done(s.getAll())));
  const queuePut = (item) => dbOp("readwrite", (s) => s.put(item));
  const queueDelete = (id) => dbOp("readwrite", (s) => s.delete(id));
  const queueClear = () => dbOp("readwrite", (s) => s.clear());

  async function pendingRecords() {
    const all = (await queueAll()) || [];
    return all.filter((r) => r.state === "pending").sort((a, b) => String(a.at).localeCompare(String(b.at)));
  }
  async function allRecords() {
    return ((await queueAll()) || []).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  }

  const uid = () =>
    "r-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

  const isOnline = () => navigator.onLine !== false;

  // ------------------------------------------------------------ HTTP base
  async function apiFetch(url, options) {
    const res = await fetch(url, Object.assign({ credentials: "same-origin" }, options));
    let body = {};
    try { body = await res.json(); } catch { /* */ }
    return { status: res.status, body, headers: res.headers };
  }

  // ---------------------------------------------------------------- états
  // Contrasté avec le mock : chaque statut correspond à une réponse RÉELLE.
  const mapScanResponse = (status, body) => {
    const err = body && body.error;
    if (status === 201) return { status: "recorded", nom: body.eleve, cours: body.cours };
    if (err === "doublon") return { status: "duplicate", nom: null };
    if (err === "qr_invalide") return { status: "invalid" };
    if (err === "pas_de_cours") return { status: "no-course", heure: body.heure };
    if (err === "cours_ambigu") return { status: "ambiguous", candidates: body.candidates };
    if (err === "salle_invalide") return { status: "salle", salle: body.salle };
    if (err === "cours_pas_actif") return { status: "salle" };
    if (status === 401 || err === "session_requise" || err === "session_invalide") return { status: "session" };
    return { status: "server-error" };
  };

  return {
    // ---------- préférences ----------
    get prefs() { return prefs; },
    setPref(key, value) {
      prefs[key] = value; savePrefs(); VC.prefs = prefs; emit();
    },

    // ---------- session ----------
    async login(email, password) {
      if (!email || !password) return { status: "champs" };
      const { status } = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (status === 200) return { status: "ok" };
      if (status === 401) return { status: "identifiants" };
      if (status === 403) return { status: "role" };
      return { status: "server-error" };
    },
    async logout() {
      await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      this.context = null;
      this.selected = null;
      emit();
    },

    // ---------- contexte (classe/cours du jour, données serveur) ----------
    context: null,
    selected: null,
    async ensureContext() {
      const { status, body } = await apiFetch("/api/scan/context");
      if (status === 401) return { status: "session" };
      if (status !== 200) return { status: "server-error" };
      this.context = body;
      emit();
      return { status: "ok", context: body };
    },
    activeCourses() {
      if (!this.context) return [];
      return this.context.cours.filter((c) => c.actif);
    },
    setSelected(selection) {
      this.selected = selection;
      emit();
    },

    // ---------- lectures dérivées du dashboard réel ----------
    async fetchDashboard() {
      const sel = this.selected || {};
      const params = new URLSearchParams();
      if (sel.classeId) params.set("classe", sel.classeId);
      const { status, body } = await apiFetch("/api/dashboard?" + params.toString());
      if (status === 401) return { status: "session" };
      if (status !== 200) return { status: "server-error" };
      return { status: "ok", data: body };
    },

    // ---------- pointage ----------
    async recordScan(code) {
      const sel = this.selected;
      if (!sel || !sel.coursId) return { status: "no-course" };

      const payload = { code_qr: code, cours: sel.coursId };
      if (sel.salle) payload.salle = sel.salle;

      if (isOnline()) {
        try {
          const { status, body } = await apiFetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const mapped = mapScanResponse(status, body);
          if (mapped.status === "session") return mapped;
          if (mapped.status === "recorded" || mapped.status === "duplicate") return mapped;
          // Rejets métier définitifs : pas de file (ils ne réussiront jamais).
          if (["invalid", "no-course", "ambiguous", "salle"].includes(mapped.status)) return mapped;
          // server-error → mise en file EN ATTENTE (perte interdite)
        } catch {
          /* réseau indisponible → file */
        }
      }

      const item = {
        id: uid(),
        code: String(code || "").toUpperCase(),
        cours: sel.coursId,
        coursNom: sel.coursNom || "",
        salle: sel.salle || "",
        at: new Date().toISOString(),
        state: "pending",
        tries: 0,
        note: "",
      };
      // anti-doublon local : déjà en attente pour ce cours+code → pas de 2e entrée
      const pend = await pendingRecords();
      const already = pend.find((r) => r.code === item.code && r.cours === item.cours);
      if (already) return { status: "pending-dup" };
      await queuePut(item);
      emit();
      return { status: "queued" };
    },

    // ---------- file hors ligne ----------
    pendingCount: async () => (await pendingRecords()).length,
    isOnline,
    listRecent: async () => (await allRecords()).slice(0, 8),

    /** Rejoue la file : doublon serveur = confirmé ; rejet définitif = rejeté. */
    async flushQueue() {
      if (!isOnline() || !this.selected) return { synced: 0 };
      const pending = await pendingRecords();
      let synced = 0;
      for (const item of pending) {
        try {
          const payload = { code_qr: item.code, cours: item.cours };
          if (item.salle) payload.salle = item.salle;
          const { status, body } = await apiFetch("/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (status === 201 || (body && body.error === "doublon")) {
            item.state = "synced";
            item.note = body && body.error === "doublon" ? "doublon confirmé" : "";
            await queuePut(item);
            synced++;
          } else if (
            body && ["qr_invalide", "cours_pas_actif", "salle_invalide", "pas_de_cours"].includes(body.error)
          ) {
            item.state = "rejected";
            item.note = body.error;
            await queuePut(item);
          } else {
            item.tries = (item.tries || 0) + 1;
            await queuePut(item); // reste EN ATTENTE
          }
        } catch {
          break; // réseau perdu : on arrête proprement
        }
      }
      if (synced) emit();
      return { synced };
    },

    /** Vide la file locale (demande explicite de l'agent, avec confirmation). */
    async clearQueue() {
      await queueClear();
      emit();
    },

    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();
