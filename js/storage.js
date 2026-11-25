/**
 * BIPA Etiquetas de Lote · Persistencia en localStorage
 * Guarda calibración de la Zebra ZD410 (57x19 mm, 203/300 dpi, offsets, oscuridad, velocidad)
 * y los datos activos de lote (producto seleccionado, lote, elaboración y vencimiento).
 */
(function (global) {
  'use strict';

  const KEYS = {
    calibration: 'bipa_lotes_calibration_v1',
    lotState: 'bipa_lotes_state_v1'
  };

  const DEFAULT_CALIBRATION = Object.freeze({
    dpi: 203,
    widthMm: 57,
    heightMm: 19,
    offsetX: 0,
    offsetY: 0,
    darkness: 25,
    speed: 3
  });

  const DEFAULT_LOT_STATE = Object.freeze({
    productId: 'aroma-1',
    lot: '02062658001L7',
    elaboration: '15/10/2026',
    expiry: '15/10/2028'
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
      widthMm: clampNum(saved.widthMm, 30, 120, DEFAULT_CALIBRATION.widthMm),
      heightMm: clampNum(saved.heightMm, 12, 100, DEFAULT_CALIBRATION.heightMm),
      offsetX: Math.round(clampNum(saved.offsetX, -120, 120, 0)),
      offsetY: Math.round(clampNum(saved.offsetY, -120, 120, 0)),
      darkness: Math.round(clampNum(saved.darkness, 5, 30, DEFAULT_CALIBRATION.darkness)),
      speed: Math.round(clampNum(saved.speed, 2, 6, DEFAULT_CALIBRATION.speed))
    };
  }

  function saveCalibration(cal) {
    const sanitized = {
      dpi: Number(cal.dpi) === 300 ? 300 : 203,
      widthMm: clampNum(cal.widthMm, 30, 120, DEFAULT_CALIBRATION.widthMm),
      heightMm: clampNum(cal.heightMm, 12, 100, DEFAULT_CALIBRATION.heightMm),
      offsetX: Math.round(clampNum(cal.offsetX, -120, 120, 0)),
      offsetY: Math.round(clampNum(cal.offsetY, -120, 120, 0)),
      darkness: Math.round(clampNum(cal.darkness, 5, 30, DEFAULT_CALIBRATION.darkness)),
      speed: Math.round(clampNum(cal.speed, 2, 6, DEFAULT_CALIBRATION.speed))
    };
    safeWrite(KEYS.calibration, sanitized);
    return sanitized;
  }

  function resetCalibration() {
    const fresh = Object.assign({}, DEFAULT_CALIBRATION);
    safeWrite(KEYS.calibration, fresh);
    return fresh;
  }

  function loadLotState() {
    const saved = safeRead(KEYS.lotState);
    if (!saved || typeof saved !== 'object') {
      return Object.assign({}, DEFAULT_LOT_STATE);
    }

    return {
      productId: typeof saved.productId === 'string' && saved.productId ? saved.productId : DEFAULT_LOT_STATE.productId,
      lot: typeof saved.lot === 'string' && saved.lot.trim() ? saved.lot : DEFAULT_LOT_STATE.lot,
      elaboration: typeof saved.elaboration === 'string' && saved.elaboration.trim() ? saved.elaboration : DEFAULT_LOT_STATE.elaboration,
      expiry: typeof saved.expiry === 'string' && saved.expiry.trim() ? saved.expiry : DEFAULT_LOT_STATE.expiry
    };
  }

  function saveLotState(state) {
    safeWrite(KEYS.lotState, {
      productId: String(state.productId || DEFAULT_LOT_STATE.productId),
      lot: String(state.lot || ''),
      elaboration: String(state.elaboration || ''),
      expiry: String(state.expiry || '')
    });
  }

  global.BipaStorage = {
    DEFAULT_CALIBRATION: DEFAULT_CALIBRATION,
    DEFAULT_LOT_STATE: DEFAULT_LOT_STATE,
    loadCalibration: loadCalibration,
    saveCalibration: saveCalibration,
    resetCalibration: resetCalibration,
    loadLotState: loadLotState,
    saveLotState: saveLotState
  };
})(window);
