// VerifyCheck — contrôleur de l'écran scan.
// Flux : caméra → décodage QR → lookup élève → présence (ou file hors-ligne) → feedback.

(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICONS = { idle: "…", success: "✓", duplicate: "!", invalid: "✕", "no-course": "✕", error: "⚠", queued: "↻" };
  // États qui doivent interrompre le lecteur d'écran (échecs), pas seulement l'informer.
  const ALERT_STATES = { invalid: true, "no-course": true, error: true };
  const DEDUPE_MS = 2500; // même carte re-décodée plusieurs fois par seconde

  const el = {
    app: $("app"),
    net: $("net"),
    installBtn: $("installBtn"),
    settingsBtn: $("settingsBtn"),
    classe: $("classe"),
    badge: $("badge"),
    cours: $("cours"),
    screenScan: $("screenScan"),
    screenManual: $("screenManual"),
    viewfinder: $("viewfinder"),
    overlay: $("vfOverlay"),
    overlayTitle: $("vfTitle"),
    overlayText: $("vfText"),
    overlayBtn: $("vfAction"),
    overlayBtn2: $("vfAction2"),
    torchBtn: $("torchBtn"),
    switchCamBtn: $("switchCamBtn"),
    feedback: $("feedback"),
    fbIcon: $("fbIcon"),
    fbTitle: $("fbTitle"),
    fbSub: $("fbSub"),
    fbTime: $("fbTime"),
    count: $("count"),
    barFill: $("barFill"),
    recentList: $("recentList"),
    tabScan: $("tabScan"),
    tabManual: $("tabManual"),
    manualForm: $("manualForm"),
    manualInput: $("manualInput"),
    manualError: $("manualError"),
    manualCodes: $("manualCodes"),
    settings: $("settings"),
    setSound: $("setSound"),
    setVibrate: $("setVibrate"),
    setCourse: $("setCourse"),
    setFailure: $("setFailure"),
    resetData: $("resetData"),
    closeSettings: $("closeSettings"),
    flash: $("flash"),
    toast: $("toast"),
  };

  const state = { tab: "scan", lastCode: null, lastAt: 0, deviceId: null, cameras: [], deferredInstall: null, cameraError: null, busy: false };
  let toastTimer = null;

  // ---------------------------------------------------------------- affichage
  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const initials = (name) =>
    String(name).split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  function toast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("on"), 2200);
  }

  function setFeedback(kind, title, sub, time) {
    el.app.dataset.state = kind;
    el.fbIcon.textContent = ICONS[kind] || "…";
    el.fbTitle.textContent = title;
    el.fbSub.textContent = sub;
    el.fbTime.textContent = time || "";
    const alert = Boolean(ALERT_STATES[kind]);
    el.feedback.setAttribute("role", alert ? "alert" : "status");
    el.feedback.setAttribute("aria-live", alert ? "assertive" : "polite");
  }

  function flash(kind) {
    el.flash.className = "flash " + kind;
    void el.flash.offsetWidth; // relance l'animation CSS
    el.flash.classList.add("go");
  }

  function setViewfinderBlocked(blocked, options) {
    el.viewfinder.classList.toggle("is-blocked", blocked);
    if (!blocked) return;
    const o = options || {};
    el.overlayTitle.textContent = o.title || "Indisponible";
    el.overlayText.textContent = o.text || "";
    el.overlayBtn.textContent = o.actionLabel || "Réessayer";
    el.overlayBtn.onclick = o.action || null;
    if (o.secondaryLabel) {
      el.overlayBtn2.hidden = false;
      el.overlayBtn2.textContent = o.secondaryLabel;
      el.overlayBtn2.onclick = o.secondaryAction || null;
    } else {
      el.overlayBtn2.hidden = true;
      el.overlayBtn2.onclick = null;
    }
  }

  // Message d'erreur en ligne sous le champ de saisie manuelle.
  function showManualError(message) {
    el.manualError.textContent = message;
    el.manualError.hidden = false;
    el.manualInput.setAttribute("aria-invalid", "true");
  }
  function clearManualError() {
    el.manualError.hidden = true;
    el.manualError.textContent = "";
    el.manualInput.removeAttribute("aria-invalid");
  }

  // Traduit l'erreur caméra en message actionnable (permission, matériel, contexte…).
  function describeCameraError(err) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        title: "Contexte non sécurisé",
        text: "La caméra exige HTTPS (ou localhost). Ouvre le scanner via une URL sécurisée.",
      };
    }
    const name = (err && err.name) || "";
    if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
      return { title: "Caméra refusée", text: "Autorise l'accès à la caméra dans le navigateur, puis réessaie." };
    }
    if (name === "NotFoundError" || name === "DevicesNotFoundError") {
      return { title: "Aucune caméra", text: "Aucun appareil photo détecté. Utilise la saisie manuelle." };
    }
    if (name === "NotReadableError" || name === "TrackStartError") {
      return { title: "Caméra occupée", text: "Une autre application utilise la caméra. Ferme-la, puis réessaie." };
    }
    if (name === "OverconstrainedError") {
      return { title: "Caméra incompatible", text: "L'appareil ne fournit pas le flux demandé. Essaie une autre caméra." };
    }
    if (err && /Librairie QR indisponible/.test(err.message || "")) {
      return { title: "Scanner indisponible", text: "La librairie de décodage n'a pas pu être chargée. Recharge la page." };
    }
    return { title: "Caméra indisponible", text: "Autorise la caméra, ou passe à la saisie manuelle." };
  }

  function renderNetwork() {
    const online = VC.api.isOnline();
    const pending = VC.api.pendingCount();
    el.net.textContent =
      (online ? "En ligne" : "Hors ligne") + (pending ? " · " + pending + " en attente" : "");
    el.net.className = "chip " + (online ? (pending ? "pending" : "is-online") : "is-offline");
  }

  function renderSession() {
    const course = VC.api.getActiveCourse();
    const online = VC.api.isOnline();
    if (!course) {
      el.classe.textContent = "Aucun cours";
      el.badge.textContent = "Aucune session";
      el.badge.className = "badge is-off";
      el.cours.textContent = "La direction doit ouvrir une session pour scanner.";
      return;
    }
    const classe = VC.api.listClasses().find((c) => c.id === course.classe_id);
    el.classe.textContent = classe ? classe.nom : "Classe";
    el.badge.textContent = "Session active";
    el.badge.className = "badge";
    el.cours.textContent =
      course.nom + " · " + course.heure_debut + " – " + course.heure_fin + (online ? "" : " · hors ligne");
  }

  function renderCounter() {
    const course = VC.api.getActiveCourse();
    const total = course ? VC.api.listStudents(course.classe_id).length : 0;
    const present = course
      ? new Set(VC.api.recordsForCourse(course.id).map((r) => r.studentId)).size
      : 0;
    el.count.innerHTML = present + "<small>/" + total + "</small>";
    el.barFill.style.width = total ? Math.round((present / total) * 100) + "%" : "0%";
  }

  function renderRecent() {
    const course = VC.api.getActiveCourse();
    const list = course ? VC.api.recordsForCourse(course.id).slice(-5).reverse() : [];
    if (!list.length) {
      el.recentList.innerHTML = '<li class="empty">Aucun scan pour ce cours.</li>';
      return;
    }
    el.recentList.innerHTML = list
      .map((r) => {
        const s = VC.api.getStudentById(r.studentId);
        const suffix = r.synced ? "" : " · en attente";
        return (
          '<li><span class="ini">' + esc(initials(s ? s.nom : "?")) + "</span>" +
          '<span class="who">' + esc(s ? s.nom : "Inconnu") +
          "<span>" + esc(r.code) + esc(suffix) + "</span></span>" +
          '<span class="at">' + esc(fmtTime(r.at)) + "</span></li>"
        );
      })
      .join("");
  }

  function renderManualCodes() {
    const course = VC.api.getActiveCourse();
    const students = course ? VC.api.listStudents(course.classe_id) : [];
    el.manualCodes.innerHTML = students
      .map((s) => '<button type="button" data-code="' + esc(s.code_qr) + '">' + esc(s.code_qr) + "</button>")
      .join("");
  }

  function renderAll() {
    renderNetwork();
    renderSession();
    renderCounter();
    renderRecent();
    renderManualCodes();
    applyCourseAvailability();
  }

  function applyCourseAvailability() {
    const course = VC.api.getActiveCourse();
    if (!course) {
      stopCamera();
      setFeedback("no-course", "Aucun cours en cours", "Aucune session ouverte pour le moment.", "");
      setViewfinderBlocked(true, {
        title: "Aucun cours en cours",
        text: "Le scan est désactivé. Demande à la direction d'ouvrir une session.",
        actionLabel: "Ouvrir les réglages",
        action: openSettings,
      });
      el.torchBtn.hidden = true;
      el.switchCamBtn.hidden = true;
      return;
    }

    // Un cours vient d'être (re)sélectionné : on repart d'un bandeau neutre.
    if (el.app.dataset.state === "no-course") {
      setFeedback("idle", "En attente d'un scan", "Approche la carte élève de la caméra.", "");
    }

    if (state.cameraError) {
      const info = describeCameraError(state.cameraError);
      setViewfinderBlocked(true, {
        title: info.title,
        text: info.text,
        actionLabel: "Réessayer",
        action: retryCamera,
        secondaryLabel: "Saisie manuelle",
        secondaryAction: () => setTab("manual"),
      });
    } else {
      setViewfinderBlocked(false);
    }
  }

  // -------------------------------------------------------------------- scan
  async function handleScan(rawCode) {
    const code = String(rawCode || "").trim().toUpperCase();
    if (!code) return;

    const now = Date.now();
    if (code === state.lastCode && now - state.lastAt < DEDUPE_MS) return;
    state.lastCode = code;
    state.lastAt = now;

    if (state.busy) return; // une écriture est déjà en cours : on ignore le doublon
    const course = VC.api.getActiveCourse();
    if (!course) {
      return result("no-course", "Aucun cours en cours", "Aucune session ouverte pour le moment.");
    }

    const student = VC.api.findStudentByCode(code);
    if (!student) {
      showManualError("Carte inconnue : « " + code + " ». Vérifie le code ou réessaie le scan.");
      return result("invalid", "Carte non reconnue", "Aucun élève pour « " + code + " ».");
    }

    state.busy = true;
    try {
      const res = await VC.api.recordAttendance({ courseId: course.id, studentId: student.id, code });
      if (res.status === "duplicate") {
        return result("duplicate", "Déjà scanné", student.nom + " est déjà présent(e) pour ce cours.");
      }
      if (res.status === "queued") {
        return result("queued", "Enregistré hors ligne", student.nom + " · sera synchronisé au retour du réseau.");
      }
      return result("success", "Présence validée", student.nom + " · " + student.code_qr);
    } catch (err) {
      // Échec du service : on le distingue clairement d'une carte invalide.
      const reason = (err && err.message) || "Le service n'a pas répondu.";
      return result("error", "Enregistrement impossible", student.nom + " · " + reason);
    } finally {
      state.busy = false;
    }
  }

  function result(kind, title, sub) {
    const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setFeedback(kind, title, sub, time);
    flash(kind);
    VC.feedback.play(kind);
    if (kind === "success" || kind === "queued") el.manualInput.value = "";
    if (kind !== "invalid") clearManualError();
    if (kind === "error") toast("Enregistrement impossible — réessaie");
    renderAll();
  }

  // ------------------------------------------------------------------ caméra
  async function startCamera() {
    if (!VC.api.getActiveCourse() || state.cameraError) return;
    if (VC.qr.isRunning()) return;
    try {
      await VC.qr.start({ deviceId: state.deviceId, onCode: handleScan });
      state.cameraOk = true;
      state.cameraError = null;
      setViewfinderBlocked(false);
      state.cameras = await VC.qr.listCameras();
      el.switchCamBtn.hidden = state.cameras.length < 2;
      // La torche n'est détectable qu'une fois la piste vidéo active.
      setTimeout(() => {
        el.torchBtn.hidden = !VC.qr.hasTorch();
      }, 900);
    } catch (err) {
      state.cameraOk = false;
      state.cameraError = err || new Error("caméra indisponible");
      applyCourseAvailability();
    }
  }

  async function stopCamera() {
    if (VC.qr.isRunning()) await VC.qr.stop();
  }

  async function retryCamera() {
    state.cameraError = null;
    setViewfinderBlocked(false);
    await startCamera();
  }

  async function switchCamera() {
    if (state.cameras.length < 2) return;
    const index = state.cameras.findIndex((c) => c.id === state.deviceId);
    const next = state.cameras[(index + 1) % state.cameras.length];
    state.deviceId = next.id;
    await stopCamera();
    await startCamera();
    toast("Caméra : " + (next.label || "suivante"));
  }

  // ------------------------------------------------------------------ onglets
  function setTab(tab) {
    state.tab = tab;
    el.tabScan.setAttribute("aria-selected", String(tab === "scan"));
    el.tabManual.setAttribute("aria-selected", String(tab === "manual"));
    el.screenScan.classList.toggle("on", tab === "scan");
    el.screenManual.classList.toggle("on", tab === "manual");
    if (tab === "scan") startCamera();
    else stopCamera();
  }

  // ---------------------------------------------------------------- réglages
  function openSettings() {
    el.setSound.checked = VC.prefs.sound !== false;
    el.setVibrate.checked = VC.prefs.vibrate !== false;
    el.setCourse.value = VC.prefs.courseId || "";
    el.setFailure.checked = VC.api.isFailureMode();
    el.settings.showModal();
  }

  function bindSettings() {
    el.setSound.addEventListener("change", () => VC.api.setPref("sound", el.setSound.checked));
    el.setVibrate.addEventListener("change", () => VC.api.setPref("vibrate", el.setVibrate.checked));
    el.setCourse.addEventListener("change", () => {
      VC.api.setActiveCourseId(el.setCourse.value);
      state.cameraError = null;
      stopCamera().then(() => {
        if (state.tab === "scan") startCamera();
      });
    });
    el.resetData.addEventListener("click", () => {
      VC.api.resetLocalData();
      clearManualError();
      setFeedback("idle", "En attente d'un scan", "Approche la carte élève de la caméra.", "");
      toast("Données locales effacées");
    });
    el.setFailure.addEventListener("change", () => {
      VC.api.setFailureMode(el.setFailure.checked);
      toast(el.setFailure.checked ? "Panne d'enregistrement simulée" : "Panne simulée désactivée");
    });
    el.closeSettings.addEventListener("click", () => el.settings.close());
  }

  function fillCourseOptions() {
    const options = ['<option value="">Aucun (simuler)</option>'].concat(
      VC.api.listCourses().map((c) => {
        const classe = VC.api.listClasses().find((k) => k.id === c.classe_id);
        return (
          '<option value="' + esc(c.id) + '">' + esc((classe ? classe.nom + " — " : "") + c.nom) +
          " (" + esc(c.heure_debut) + "–" + esc(c.heure_fin) + ")</option>"
        );
      })
    );
    el.setCourse.innerHTML = options.join("");
  }

  // ------------------------------------------------------------------ réseau
  async function onOnline() {
    renderNetwork();
    try {
      const sent = await VC.api.flushQueue();
      renderAll();
      toast(sent ? sent + " présence(s) synchronisée(s)" : "Réseau rétabli");
    } catch {
      renderAll();
      toast("Synchronisation impossible — la file est conservée");
    }
  }

  function onOffline() {
    renderNetwork();
    renderAll();
    toast("Hors ligne : les scans sont mis en file");
  }

  // --------------------------------------------------------------------- PWA
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!location.protocol.startsWith("http")) return; // file:// ne peut pas enregistrer de SW
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }

  function bindInstall() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      state.deferredInstall = event;
      el.installBtn.hidden = false;
    });
    el.installBtn.addEventListener("click", async () => {
      if (!state.deferredInstall) return;
      state.deferredInstall.prompt();
      await state.deferredInstall.userChoice;
      state.deferredInstall = null;
      el.installBtn.hidden = true;
    });
  }

  // -------------------------------------------------------------------- init
  function bindEvents() {
    el.settingsBtn.addEventListener("click", openSettings);
    el.torchBtn.addEventListener("click", async () => {
      const on = await VC.qr.setTorch(!el.torchBtn.classList.contains("on"));
      if (!on) return toast("Torche non disponible sur cet appareil");
      el.torchBtn.classList.toggle("on", on);
    });
    el.switchCamBtn.addEventListener("click", switchCamera);
    el.tabScan.addEventListener("click", () => setTab("scan"));
    el.tabManual.addEventListener("click", () => setTab("manual"));
    el.manualForm.addEventListener("submit", (event) => {
      event.preventDefault();
      clearManualError();
      handleScan(el.manualInput.value);
    });
    el.manualInput.addEventListener("input", clearManualError);
    el.manualCodes.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-code]");
      if (btn) {
        clearManualError();
        handleScan(btn.dataset.code);
      }
    });
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopCamera();
      else if (state.tab === "scan") startCamera();
    });
    document.addEventListener(
      "pointerdown",
      () => VC.feedback.unlock(),
      { once: true }
    );
    VC.api.onChange(renderAll);
  }

  function init() {
    fillCourseOptions();
    bindSettings();
    bindInstall();
    bindEvents();
    renderAll();
    setTab("scan");
    registerServiceWorker();
    setFeedback("idle", "En attente d'un scan", "Approche la carte élève de la caméra.", "");
  }

  document.addEventListener("DOMContentLoaded", init);

  // Accroche de test/démo : permet de simuler un scan sans caméra.
  window.VC.debug = {
    scan: (code) => handleScan(code),
    setOffline: (value) => VC.api.setForcedOffline(value),
    setFailure: (value) => VC.api.setFailureMode(value),
    startCamera,
    retryCamera,
    state,
  };
})();
