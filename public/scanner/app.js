// VerifyCheck — contrôleur de l'écran scan (données RÉELLES).
// Flux : connexion → contexte (classe/cours actifs serveur) → caméra →
// POST /api/scan → état métier affiché. Hors ligne : file IndexedDB « EN ATTENTE ».

(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICONS = {
    idle: "…", success: "✓", duplicate: "!", invalid: "✕", "no-course": "✕",
    queued: "↻", ambiguous: "!", salle: "!", session: "🔒", "server-error": "⚠",
    "pending-dup": "↻", rejected: "✕", error: "⚠",
  };
  const ALERT_STATES = {
    invalid: true, "no-course": true, ambiguous: true, salle: true,
    session: true, "server-error": true, rejected: true, error: true,
  };
  const DEDUPE_MS = 2500; // même carte re-décodée plusieurs fois par seconde

  const el = {
    app: $("app"),
    net: $("net"),
    installBtn: $("installBtn"),
    settingsBtn: $("settingsBtn"),

    // connexion
    screenLogin: $("screenLogin"),
    loginForm: $("loginForm"),
    loginEmail: $("loginEmail"),
    loginPassword: $("loginPassword"),
    loginError: $("loginError"),

    // contexte
    screenContext: $("screenContext"),
    ctxNow: $("ctxNow"),
    ctxClasse: $("ctxClasse"),
    ctxCours: $("ctxCours"),
    ctxCoursHint: $("ctxCoursHint"),
    ctxSalle: $("ctxSalle"),
    ctxError: $("ctxError"),
    ctxLogout: $("ctxLogout"),

    // scan
    screenScan: $("screenScan"),
    screenManual: $("screenManual"),
    classe: $("classe"),
    badge: $("badge"),
    cours: $("cours"),
    viewfinder: $("viewfinder"),
    overlay: $("vfOverlay"),
    overlayTitle: $("vfTitle"),
    overlayText: $("vfText"),
    overlayBtn: $("vfAction"),
    overlayBtn2: $("vfAction2"),
    feedback: $("feedback"),
    torchBtn: $("torchBtn"),
    switchCamBtn: $("switchCamBtn"),
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

    // réglages
    settings: $("settings"),
    setSound: $("setSound"),
    setVibrate: $("setVibrate"),
    pendingNote: $("pendingNote"),
    clearQueue: $("clearQueue"),
    closeSettings: $("closeSettings"),

    flash: $("flash"),
    toast: $("toast"),
  };

  const state = {
    tab: "scan", lastCode: null, lastAt: 0, deviceId: null, cameras: [],
    deferredInstall: null, cameraError: null, dashboard: null, busy: false,
  };
  let toastTimer = null;

  // ---------------------------------------------------------------- affichage
  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

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
    void el.flash.offsetWidth;
    el.flash.classList.add("go");
  }

  function setViewfinderBlocked(blocked, options) {
    el.viewfinder.classList.toggle("is-blocked", blocked);
    if (!blocked) {
      el.overlayBtn2.hidden = true;
      el.overlayBtn2.onclick = null;
      return;
    }
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

  function showManualError(message) {
    el.manualError.textContent = message;
    el.manualError.hidden = false;
    el.manualInput.setAttribute("aria-invalid", "true");
  }

  function clearManualError() {
    el.manualError.textContent = "";
    el.manualError.hidden = true;
    el.manualInput.removeAttribute("aria-invalid");
  }

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

  function showScreen(name) {
    for (const s of [el.screenLogin, el.screenContext, el.screenScan, el.screenManual]) {
      s.classList.toggle("on", false);
    }
    // le scan et le manuel sont pilotés par l'onglet une fois le contexte prêt
    if (name === "login") el.screenLogin.classList.add("on");
    if (name === "context") el.screenContext.classList.add("on");
    if (name === "scan") { setTab(state.tab || "scan"); }
    document.querySelector(".tabs").hidden = !(name === "scan");
    el.settingsBtn.hidden = name === "login";
  }

  async function renderNetwork() {
    const online = VC.api.isOnline();
    const pending = await VC.api.pendingCount();
    el.net.textContent =
      (online ? "En ligne" : "Hors ligne") + (pending ? " · " + pending + " en attente" : "");
    el.net.className = "chip " + (online ? (pending ? "pending" : "is-online") : "is-offline");
  }

  function renderSession() {
    const sel = VC.api.selected;
    if (!sel) return;
    el.classe.textContent = sel.classeNom || "Classe";
    el.badge.textContent = "Pointage actif";
    el.badge.className = "badge";
    const online = VC.api.isOnline();
    el.cours.textContent =
      sel.coursNom + " · " + (sel.salle ? sel.salle + " · " : "") + (online ? "" : "hors ligne");
  }

  function renderCounter() {
    const d = state.dashboard;
    if (!d) return;
    el.count.innerHTML = d.presents + "<small>/" + d.effectif + "</small>";
    el.barFill.style.width = d.effectif ? Math.round((d.presents / d.effectif) * 100) + "%" : "0%";
  }

  async function renderRecent() {
    const local = await VC.api.listRecent();
    const items = local.map((r) => ({
      who: r.nom || r.code,
      code: r.code,
      at: r.at,
      tag: r.state === "pending" ? "EN ATTENTE" : r.state === "rejected" ? "REJETÉ" : (r.note || ""),
      kind: r.state,
    }));
    if (!items.length) {
      el.recentList.innerHTML = '<li class="empty">Aucun scan pour ce cours.</li>';
      return;
    }
    el.recentList.innerHTML = items
      .map(
        (r) =>
          '<li><span class="who">' + esc(r.who) +
          "<span>" + esc(r.code) + (r.tag ? " · " + esc(r.tag) : "") + "</span></span>" +
          '<span class="at">' + esc(fmtTime(r.at)) + "</span></li>"
      )
      .join("");
  }

  async function renderAll() {
    await renderNetwork();
    renderSession();
    renderCounter();
    await renderRecent();
  }

  /** Données réelles du cours : effectif, présents confirmés. */
  async function refreshDashboard() {
    if (!VC.api.selected) return;
    const res = await VC.api.fetchDashboard();
    if (res.status === "ok") {
      state.dashboard = res.data;
      const cours = res.data.cours_prevus.find((c) => c.id === VC.api.selected.coursId);
      if (cours) {
        const eleves = res.data.eleves.filter((e) =>
          e.presences.some((p) => p.course_id === cours.id)
        );
        state.dashboard = Object.assign({}, res.data, {
          effectif: res.data.effectif,
          presents: eleves.length,
          details: eleves.map((e) => ({
            nom: e.nom,
            code: e.code_qr,
            at: (e.presences.find((p) => p.course_id === cours.id) || {}).scanned_at,
          })),
        });
      }
    }
    renderCounter();
  }

  // -------------------------------------------------------------------- scan
  async function handleScan(rawCode) {
    const code = String(rawCode || "").trim().toUpperCase();
    if (!code || state.busy) return;

    const now = Date.now();
    if (code === state.lastCode && now - state.lastAt < DEDUPE_MS) return;
    state.lastCode = code;
    state.lastAt = now;
    state.busy = true;

    try {
      const res = await VC.api.recordScan(code);
      const time = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

      switch (res.status) {
        case "recorded":
          result("success", "Présence confirmée", (res.nom || code) + " · serveur", time);
          break;
        case "duplicate":
          result("duplicate", "Déjà scanné", "Ce cours a déjà validé cette carte.", time);
          break;
        case "queued":
          result("queued", "En attente de synchronisation",
            "Réseau indisponible — le pointage reste EN ATTENTE jusqu'à confirmation du serveur.", time);
          break;
        case "pending-dup":
          result("pending-dup", "Déjà en attente", "Ce pointage est déjà dans la file hors ligne.", time);
          break;
        case "invalid":
          showManualError("Carte inconnue : « " + code + " ». Vérifie le code ou réessaie le scan.");
          result("invalid", "Carte non reconnue", "Aucun élève pour « " + code + " » (réponse du serveur).", time);
          break;
        case "no-course":
          result("no-course", "Aucun cours applicable", "Il est " + (res.heure || "?") + " à Conakry : aucun cours actif pour cette classe.", time);
          break;
        case "ambiguous":
          result("ambiguous", "Contexte ambigu", "Plusieurs cours actifs pour cette classe. Reprends le contexte et précise le cours ou la salle.", time);
          break;
        case "salle":
          result("salle", "Salle / cours incorrects", "Le cours choisi ne correspond pas à la salle ou n'est pas actif.", time);
          break;
        case "session":
          result("session", "Session expirée", "Reconnexion nécessaire.", time);
          await stopCamera();
          showScreen("login");
          break;
        default:
          result("server-error", "Erreur serveur", "Réponse inattendue — le pointage n'est PAS confirmé. Réessaie.", time);
      }
    } catch (err) {
      const reason = (err && err.message) || "Le service n'a pas répondu.";
      result("server-error", "Enregistrement impossible", reason + " — le pointage n'est PAS confirmé.", "");
    } finally {
      state.busy = false;
    }
  }

  function result(kind, title, sub, time) {
    setFeedback(kind, title, sub, time);
    flash(kind);
    VC.feedback.play(["server-error", "rejected", "error"].includes(kind) ? "error" : kind);
    if (kind === "success" || kind === "queued") el.manualInput.value = "";
    if (kind !== "invalid") clearManualError();
    if (kind === "server-error") toast("Enregistrement impossible — réessaie");
    Promise.resolve(refreshDashboard()).then(renderAll).catch(() => renderAll());
  }

  // ------------------------------------------------------------------ caméra
  async function startCamera() {
    if (!VC.api.selected || state.cameraError) return;
    if (VC.qr.isRunning()) return;
    try {
      await VC.qr.start({ deviceId: state.deviceId, onCode: handleScan });
      state.cameraError = null;
      setViewfinderBlocked(false);
      state.cameras = await VC.qr.listCameras();
      el.switchCamBtn.hidden = state.cameras.length < 2;
      setTimeout(() => { el.torchBtn.hidden = !VC.qr.hasTorch(); }, 900);
    } catch (err) {
      state.cameraError = err || new Error("caméra indisponible");
      const info = describeCameraError(state.cameraError);
      setViewfinderBlocked(true, {
        title: info.title,
        text: info.text,
        actionLabel: "Réessayer",
        action: retryCamera,
        secondaryLabel: "Saisie manuelle",
        secondaryAction: () => setTab("manual"),
      });
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

  // ---------------------------------------------------------------- connexion
  function bindLogin() {
    el.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      el.loginError.hidden = true;
      const res = await VC.api.login(el.loginEmail.value.trim(), el.loginPassword.value);
      if (res.status === "ok") {
        el.loginPassword.value = "";
        enterContext();
      } else {
        el.loginError.textContent =
          res.status === "identifiants" ? "Identifiants invalides." :
          res.status === "role" ? "Ce compte n'est pas un compte admin." :
          res.status === "champs" ? "Email et mot de passe requis." :
          "Erreur serveur — réessaie.";
        el.loginError.hidden = false;
      }
    });
  }

  async function enterContext() {
    const res = await VC.api.ensureContext();
    if (res.status === "session") return showScreen("login");
    if (res.status !== "ok") {
      el.ctxError.textContent = "Erreur serveur — réessaie.";
      el.ctxError.hidden = false;
      return showScreen("context");
    }
    const ctx = VC.api.context;
    el.ctxNow.textContent = ctx.jour + " · " + ctx.heure + " (Conakry)";
    el.ctxClasse.innerHTML = ctx.classes
      .map((c) => '<option value="' + esc(c.id) + '">' + esc(c.nom) + "</option>")
      .join("");
    fillCoursOptions();
    el.ctxError.hidden = true;
    showScreen("context");
  }

  function fillCoursOptions() {
    const classeId = el.ctxClasse.value;
    const actifs = VC.api.activeCourses().filter((c) => c.classe_id === classeId);
    el.ctxCours.innerHTML = actifs.length
      ? actifs
          .map(
            (c) =>
              '<option value="' + esc(c.id) + '">' + esc(c.nom) +
              " (" + esc(c.heure_debut.slice(0, 5)) + "–" + esc(c.heure_fin.slice(0, 5)) + ")" +
              (c.salle ? " · " + esc(c.salle) : "") + "</option>"
          )
          .join("")
      : '<option value="">Aucun cours actif pour cette classe</option>';
    el.ctxCoursHint.textContent = actifs.length
      ? "Seuls les cours actifs à l'heure de Conakry peuvent être pointés."
      : "Aucun cours actif maintenant : la direction doit mettre à jour le planning.";
  }

  function bindContext() {
    el.ctxClasse.addEventListener("change", fillCoursOptions);
    el.contextForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const coursId = el.ctxCours.value;
      if (!coursId) return;
      const cours = VC.api.context.cours.find((c) => c.id === coursId);
      const classe = VC.api.context.classes.find((c) => c.id === el.ctxClasse.value);
      VC.api.setSelected({
        classeId: classe.id,
        classeNom: classe.nom,
        coursId: cours.id,
        coursNom: cours.nom,
        salle: el.ctxSalle.value.trim(),
      });
      state.cameraError = null;
      state.dashboard = null;
      showScreen("scan");
      setFeedback("idle", "En attente d'un scan", "Approche la carte élève de la caméra.", "");
      refreshDashboard().then(renderAll);
    });
    el.ctxLogout.addEventListener("click", async () => {
      await VC.api.logout();
      showScreen("login");
    });
  }

  // ---------------------------------------------------------------- réglages
  function openSettings() {
    el.setSound.checked = VC.api.prefs.sound !== false;
    el.setVibrate.checked = VC.api.prefs.vibrate !== false;
    VC.api.pendingCount().then((n) => {
      el.pendingNote.textContent = n
        ? n + " pointage(s) EN ATTENTE de synchronisation."
        : "Aucun pointage en attente.";
    });
    el.settings.showModal();
  }

  function bindSettings() {
    el.setSound.addEventListener("change", () => VC.api.setPref("sound", el.setSound.checked));
    el.setVibrate.addEventListener("change", () => VC.api.setPref("vibrate", el.setVibrate.checked));
    el.clearQueue.addEventListener("click", () => {
      if (!confirm("Vider la file en attente ? Les pointages non synchronisés seront perdus.")) return;
      VC.api.clearQueue().then(() => {
        renderNetwork();
        toast("File locale vidée");
        el.settings.close();
      });
    });
    el.closeSettings.addEventListener("click", () => el.settings.close());
  }

  // ------------------------------------------------------------------ réseau
  async function onOnline() {
    try {
      const { synced } = await VC.api.flushQueue();
      await refreshDashboard();
      await renderAll();
      toast(synced ? synced + " pointage(s) synchronisé(s)" : "Réseau rétabli");
    } catch {
      await renderAll();
      toast("Synchronisation impossible — la file est conservée");
    }
  }

  function onOffline() {
    renderNetwork();
    toast("Hors ligne : les scans restent EN ATTENTE");
  }

  // --------------------------------------------------------------------- PWA
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!location.protocol.startsWith("http")) return;
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
    bindLogin();
    bindContext();
    bindSettings();
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
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", async () => {
      if (document.hidden) stopCamera();
      else {
        if (state.tab === "scan" && VC.api.selected) startCamera();
        // retour au premier plan : re-synchronise la file et le contexte
        try {
          const { synced } = await VC.api.flushQueue();
          if (synced) toast(synced + " pointage(s) synchronisé(s)");
          await refreshDashboard();
          await renderAll();
        } catch {
          await renderAll();
          toast("Synchronisation impossible — la file est conservée");
        }
      }
    });
    document.addEventListener("pointerdown", () => VC.feedback.unlock(), { once: true });
    VC.api.onChange(renderAll);
  }

  function init() {
    bindEvents();
    bindInstall();
    registerServiceWorker();
    renderNetwork();
    // Sans session : écran connexion. Avec session : contexte de pointage.
    VC.api.ensureContext().then((res) => {
      if (res.status === "ok") enterContext();
      else showScreen("login");
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
