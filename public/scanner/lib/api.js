// VerifyCheck — couche de données du scanner.
//
// ⚠️ MOCK. Le Rôle 1 n'a pas encore livré l'endpoint de scan (Sprint 2). Cette
// couche reproduit le contrat attendu (chercher l'élève, écrire une présence
// horodatée, refuser le doublon) et gère la file hors-ligne. Le jour où l'API
// existe, seules les fonctions marquées « TODO API » changent : le reste de
// l'UI ne bouge pas.

window.VC = window.VC || {};

VC.api = (function () {
  const K_RECORDS = "vc.records.v1";
  const K_PREFS = "vc.prefs.v1";
  const LATENCY_MS = 250;

  const read = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };
  const write = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota / mode privé : on continue en mémoire */
    }
  };

  // --- préférences (persistées, lues par lib/feedback.js via VC.prefs) ---
  VC.prefs = Object.assign(
    { sound: true, vibrate: true, courseId: VC.mockData.courses[0].id },
    read(K_PREFS, {})
  );
  const savePrefs = () => write(K_PREFS, VC.prefs);

  // --- présences locales : synced=false ⇒ en attente de synchronisation ---
  let records = read(K_RECORDS, []);
  const saveRecords = () => write(K_RECORDS, records);

  let forcedOffline = false;
  let failureMode = false; // simulation : le « service » refuse l'écriture
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn());

  const uid = () =>
    "r-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

  const isOnline = () => !forcedOffline && navigator.onLine !== false;

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function courseById(id) {
    return VC.mockData.courses.find((c) => c.id === id) || null;
  }

  return {
    // ---------- lecture ----------
    listClasses: () => VC.mockData.classes.slice(),
    listCourses: () => VC.mockData.courses.slice(),
    listStudents: (classeId) =>
      VC.mockData.students.filter((s) => !classeId || s.classe_id === classeId),
    getStudentById: (id) => VC.mockData.students.find((s) => s.id === id) || null,
    findStudentByCode: (code) => {
      const needle = String(code || "").trim().toUpperCase();
      return VC.mockData.students.find((s) => s.code_qr.toUpperCase() === needle) || null;
    },

    // ---------- cours en cours ----------
    // TODO API : remplacer par la session active renvoyée par le serveur.
    getActiveCourse() {
      return courseById(VC.prefs.courseId);
    },
    setActiveCourseId(id) {
      VC.prefs.courseId = id || "";
      savePrefs();
      emit();
    },

    // ---------- présences ----------
    recordsForCourse(courseId) {
      return records
        .filter((r) => r.courseId === courseId)
        .sort((a, b) => a.at.localeCompare(b.at));
    },
    hasRecord(courseId, studentId) {
      return records.some((r) => r.courseId === courseId && r.studentId === studentId);
    },
    pendingCount: () => records.filter((r) => !r.synced).length,
    isOnline,
    setForcedOffline(value) {
      forcedOffline = Boolean(value);
      emit();
    },
    isForcedOffline: () => forcedOffline,
    setFailureMode(value) {
      failureMode = Boolean(value);
      emit();
    },
    isFailureMode: () => failureMode,

    /**
     * Enregistre une présence. Renvoie un statut explicite pour les cas métier
     * (doublon, QR inconnu…) et **lève une exception** si le service échoue :
     * l'UI doit alors afficher l'état « error » et proposer de réessayer.
     * @returns {Promise<{status:'recorded'|'queued'|'duplicate'|'invalid'|'no-course'}>}
     */
    async recordAttendance({ courseId, studentId, code }) {
      if (!courseById(courseId)) return { status: "no-course" };
      if (!this.getStudentById(studentId)) return { status: "invalid" };
      if (this.hasRecord(courseId, studentId)) return { status: "duplicate" };

      const entry = {
        id: uid(),
        courseId,
        studentId,
        code: String(code || "").toUpperCase(),
        at: new Date().toISOString(),
        synced: false,
      };

      if (isOnline()) {
        await delay(LATENCY_MS); // TODO API : POST /api/scan (Rôle 1)
        if (failureMode) throw new Error("Le service a refusé l'enregistrement");
        entry.synced = true;
      }

      records.push(entry);
      saveRecords();
      emit();
      return { status: entry.synced ? "recorded" : "queued" };
    },

    /** Rejoue la file hors-ligne. Renvoie le nombre d'entrées synchronisées. */
    async flushQueue() {
      if (!isOnline()) return 0;
      const pending = records.filter((r) => !r.synced);
      if (!pending.length) return 0;
      await delay(LATENCY_MS); // TODO API : POST groupé
      if (failureMode) throw new Error("Synchronisation refusée par le service");
      pending.forEach((r) => {
        r.synced = true;
      });
      saveRecords();
      emit();
      return pending.length;
    },

    // ---------- réglages / démo ----------
    setPref(key, value) {
      VC.prefs[key] = value;
      savePrefs();
      emit();
    },
    resetLocalData() {
      records = [];
      saveRecords();
      emit();
    },

    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
})();
