/**
 * BIPA Etiquetas QR · Persistencia en localStorage
 * Guarda calibración (dpi, medidas, offsets, tamaño QR) y último correlativo.
 */
(function (global) {
  'use strict';

  const KEYS = {
    calibration: 'bipa_qr_calibration_v1',
    correlative: 'bipa_qr_correlative_v1'
  };

  const DEFAULT_CALIBRATION = Object.freeze({
    dpi: 203,
    widthMm: 50,
    heightMm: 20,
    offsetX: 0,
    offsetY: 0,
    qrMag: 4
  });

  const DEFAULT_FORM = Object.freeze({
    prefix: 'PAR-',
    serial: '0000009',
    autoincrement: true,
    code: 'EX116',
    lot: '2609200449',
    weight: '25,00 kg',
    expiry: '09/2027',
    qrMode: 'serial',
    quantity: 1
  });

  function safeRead(key) {
    try {
      const raw = global.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_err) {
      return null;
    }
  }

  function safeWrite(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_err) {
      return false;
    }
  }

  function clampNum(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function loadCalibration() {
    const saved = safeRead(KEYS.calibration);
    if (!saved || typeof saved !== 'object') {
      return Object.assign({}, DEFAULT_CALIBRATION);
    }

    const dpi = Number(saved.dpi) === 300 ? 300 : 203;
    return {
      dpi: dpi,
      widthMm: clampNum(saved.widthMm, 25, 120, DEFAULT_CALIBRATION.widthMm),
      heightMm: clampNum(saved.heightMm, 12, 100, DEFAULT_CALIBRATION.heightMm),
      offsetX: Math.round(clampNum(saved.offsetX, -120, 120, DEFAULT_CALIBRATION.offsetX)),
      offsetY: Math.round(clampNum(saved.offsetY, -120, 120, DEFAULT_CALIBRATION.offsetY)),
      qrMag: Math.round(clampNum(saved.qrMag, 1, 10, DEFAULT_CALIBRATION.qrMag))
    };
  }

  function saveCalibration(cal) {
    const sanitized = {
      dpi: Number(cal.dpi) === 300 ? 300 : 203,
      widthMm: clampNum(cal.widthMm, 25, 120, DEFAULT_CALIBRATION.widthMm),
      heightMm: clampNum(cal.heightMm, 12, 100, DEFAULT_CALIBRATION.heightMm),
      offsetX: Math.round(clampNum(cal.offsetX, -120, 120, 0)),
      offsetY: Math.round(clampNum(cal.offsetY, -120, 120, 0)),
      qrMag: Math.round(clampNum(cal.qrMag, 1, 10, 4))
    };
    safeWrite(KEYS.calibration, sanitized);
    return sanitized;
  }

  function resetCalibration() {
    const fresh = Object.assign({}, DEFAULT_CALIBRATION);
    safeWrite(KEYS.calibration, fresh);
    return fresh;
  }

  function loadCorrelativeState() {
    const saved = safeRead(KEYS.correlative);
    if (!saved || typeof saved !== 'object') {
      return {
        prefix: DEFAULT_FORM.prefix,
        serial: DEFAULT_FORM.serial,
        autoincrement: DEFAULT_FORM.autoincrement,
        qrMode: DEFAULT_FORM.qrMode
      };
    }

    return {
      prefix: typeof saved.prefix === 'string' ? saved.prefix : DEFAULT_FORM.prefix,
      serial: typeof saved.serial === 'string' && saved.serial.length > 0 ? saved.serial : DEFAULT_FORM.serial,
      autoincrement: typeof saved.autoincrement === 'boolean' ? saved.autoincrement : DEFAULT_FORM.autoincrement,
      qrMode: saved.qrMode === 'all' ? 'all' : 'serial'
    };
  }

  function saveCorrelativeState(state) {
    safeWrite(KEYS.correlative, {
      prefix: String(state.prefix || ''),
      serial: String(state.serial || ''),
      autoincrement: Boolean(state.autoincrement),
      qrMode: state.qrMode === 'all' ? 'all' : 'serial'
    });
  }

  global.BipaStorage = {
    DEFAULT_CALIBRATION: DEFAULT_CALIBRATION,
    DEFAULT_FORM: DEFAULT_FORM,
    loadCalibration: loadCalibration,
    saveCalibration: saveCalibration,
    resetCalibration: resetCalibration,
    loadCorrelativeState: loadCorrelativeState,
    saveCorrelativeState: saveCorrelativeState
  };
})(window);
