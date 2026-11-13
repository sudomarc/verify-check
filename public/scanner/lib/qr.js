// VerifyCheck — accès caméra + décodage QR (html5-qrcode vendorisé).
// Encapsulé pour que l'UI ne dépende pas de la lib, et pour pouvoir la
// remplacer sans toucher au reste (BarcodeDetector natif, etc.).

window.VC = window.VC || {};

VC.qr = (function () {
  let scanner = null;
  let running = false;
  let currentDeviceId = null;

  const hasLib = () => typeof window.Html5Qrcode !== "undefined";

  const READER_ID = "reader";

  function config() {
    return {
      fps: 10,
      qrbox: { width: 220, height: 220 },
      aspectRatio: 1.0,
      disableFlip: false,
    };
  }

  function source(deviceId) {
    return deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "environment" };
  }

  async function start({ deviceId = null, onCode, onError } = {}) {
    if (!hasLib()) throw new Error("Librairie QR indisponible");
    await stop();
    scanner = new window.Html5Qrcode(READER_ID, { verbose: false });
    await scanner.start(
      source(deviceId),
      config(),
      (text) => onCode && onCode(text),
      () => {
        /* pas de QR dans cette frame : normal, on ignore */
      }
    );
    running = true;
    currentDeviceId = deviceId;
    if (onError) scanner.__onError = onError;
    return true;
  }

  async function stop() {
    if (scanner && running) {
      try {
        await scanner.stop();
      } catch {
        /* déjà arrêté */
      }
    }
    if (scanner) {
      try {
        scanner.clear();
      } catch {
        /* rien à nettoyer */
      }
    }
    running = false;
    return true;
  }

  async function listCameras() {
    if (!hasLib()) return [];
    try {
      return await window.Html5Qrcode.getCameras();
    } catch {
      return [];
    }
  }

  function videoTrack() {
    const video = document.querySelector("#" + READER_ID + " video");
    const stream = video && video.srcObject;
    return stream && stream.getVideoTracks ? stream.getVideoTracks()[0] || null : null;
  }

  /** Torche : API Track Constraints, support variable selon l'appareil. */
  async function setTorch(on) {
    const track = videoTrack();
    if (!track || !track.getCapabilities) return false;
    const caps = track.getCapabilities();
    if (!caps.torch) return false;
    try {
      await track.applyConstraints({ advanced: [{ torch: on }] });
      return true;
    } catch {
      return false;
    }
  }

  function hasTorch() {
    const track = videoTrack();
    return Boolean(track && track.getCapabilities && track.getCapabilities().torch);
  }

  return {
    hasLib,
    start,
    stop,
    listCameras,
    setTorch,
    hasTorch,
    getDeviceId: () => currentDeviceId,
    isRunning: () => running,
  };
})();
