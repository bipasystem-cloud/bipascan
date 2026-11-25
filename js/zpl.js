/**
 * BIPA Etiquetas QR · Motor ZPL II nativo para Zebra ZD410
 * Ajusta automáticamente coordenadas y tipografía entre 203 dpi y 300 dpi,
 * incluye eslogan BIPA con ^CI28 (UTF-8), soporta modo QR personalizado,
 * offsets X/Y en dots y correlativos con ceros a la izquierda.
 */
(function (global) {
  'use strict';

  const BIPA_SLOGAN = 'BIPA · Buenas ideas puestas en acción';

  /**
   * Suma un desplazamiento entero a un correlativo numérico conservando
   * los ceros a la izquierda (ej. "0000009" + 5 => "0000014").
   */
  function stepSerial(serialStr, delta) {
    const raw = String(serialStr || '').trim();
    const digitsOnly = raw.replace(/\D/g, '');
    if (!digitsOnly) {
      return String(Math.max(0, delta));
    }
    const width = digitsOnly.length;
    const baseNum = parseInt(digitsOnly, 10);
    const nextNum = Math.max(0, (Number.isFinite(baseNum) ? baseNum : 0) + delta);
    return String(nextNum).padStart(width, '0');
  }

  /**
   * Sanitiza texto para campos ^FD de ZPL II evitando comandos accidentales (^ o ~).
   */
  function sanitizeZplField(text) {
    return String(text || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\^~]/g, ' ')
      .trim();
  }

  /**
   * Construye el eslogan opcional, las 3 líneas de texto y el contenido del QR.
   */
  function buildLabelLines(data, serialOverride) {
    const prefix = String(data.prefix || '');
    const serial = serialOverride !== undefined ? String(serialOverride) : String(data.serial || '');
    const code = String(data.code || '').trim();
    const lot = String(data.lot || '').trim();
    const weight = String(data.weight || '').trim();
    const expiry = String(data.expiry || '').trim();
    const showSlogan = data.showSlogan !== false;

    const correlative = prefix + serial;

    let line2 = '';
    if (code && lot) {
      line2 = code + ' · L ' + lot;
    } else if (code) {
      line2 = code;
    } else if (lot) {
      line2 = 'L ' + lot;
    }

    let line3 = '';
    if (weight && expiry) {
      line3 = weight + ' · vence ' + expiry;
    } else if (weight) {
      line3 = weight;
    } else if (expiry) {
      line3 = 'vence ' + expiry;
    }

    let qrPayload = correlative;
    let isCustomEmpty = false;

    if (data.qrMode === 'all') {
      qrPayload = [correlative, code, lot, weight, expiry].join('|');
    } else if (data.qrMode === 'custom') {
      const customRaw = String(data.customQrText || '').trim();
      if (customRaw.length > 0) {
        qrPayload = customRaw;
      } else {
        qrPayload = correlative || BIPA_SLOGAN;
        isCustomEmpty = true;
      }
    }

    return {
      correlative: correlative,
      slogan: showSlogan ? BIPA_SLOGAN : '',
      showSlogan: showSlogan,
      line1: correlative,
      line2: line2,
      line3: line3,
      qrPayload: qrPayload || ' ',
      isCustomEmpty: isCustomEmpty
    };
  }

  /**
   * Estima la cantidad de módulos por lado del QR (EC Level M) para calcular
   * un espacio horizontal preciso entre el QR y el bloque derecho de texto.
   */
  function estimateQrModules(payload) {
    const len = typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(String(payload || '')).length
      : String(payload || '').length;
    if (len <= 14) return 21;  // v1
    if (len <= 26) return 25;  // v2
    if (len <= 42) return 29;  // v3
    if (len <= 62) return 33;  // v4
    if (len <= 84) return 37;  // v5
    if (len <= 106) return 41; // v6
    if (len <= 122) return 45; // v7
    return 49;                 // v8+
  }

  /**
   * Calcula un ancho de carácter seguro en ^A0 para que la línea no se corte
   * en el borde derecho de la etiqueta física.
   */
  function fitFontWidth(text, targetWidthDots, maxAvailableDots, minWidthDots) {
    const chars = Math.max(1, String(text || '').length);
    // ^A0 tiene un factor de avance promedio aproximado de 0.60 del ancho especificado
    const estimatedTotal = chars * targetWidthDots * 0.60;
    if (estimatedTotal <= maxAvailableDots) {
      return Math.round(targetWidthDots);
    }
    const fitted = Math.floor(maxAvailableDots / (chars * 0.60));
    return Math.max(minWidthDots, fitted);
  }

  /**
   * Genera un bloque ZPL II (^XA ... ^XZ) para una etiqueta individual.
   */
  function buildSingleLabelZpl(lines, cal, copies) {
    const dpi = Number(cal.dpi) === 300 ? 300 : 203;
    const dotsPerMm = dpi / 25.4;
    const scale = dpi / 203;

    const pw = Math.max(160, Math.round(cal.widthMm * dotsPerMm));
    const ll = Math.max(80, Math.round(cal.heightMm * dotsPerMm));
    const offX = Math.round(Number(cal.offsetX) || 0);
    const offY = Math.round(Number(cal.offsetY) || 0);
    const qrMag = Math.max(1, Math.min(10, Math.round(Number(cal.qrMag) || 4)));

    // Tamaño estimado del QR en dots (módulos * factor)
    const qrModules = estimateQrModules(lines.qrPayload);
    const qrSizeDots = qrModules * qrMag;

    // Margen izquierdo y centrado vertical del bloque QR
    const marginLeft = Math.round(12 * scale);
    const marginRight = Math.round(10 * scale);
    const qrCenterY = Math.round((ll - qrSizeDots) / 2) - Math.round(4 * scale);

    const qrX = Math.max(0, marginLeft + offX);
    const qrY = Math.max(0, Math.max(Math.round(4 * scale), qrCenterY) + offY);

    // Inicio horizontal del bloque de texto a la derecha del QR
    const qrGap = Math.round(14 * scale);
    const minTextX = Math.round(134 * scale);
    const maxTextX = Math.round(pw * 0.50);
    const computedTextX = Math.min(maxTextX, Math.max(minTextX, marginLeft + qrSizeDots + qrGap));
    const textX = Math.max(0, computedTextX + offX);
    const availableTextWidth = Math.max(Math.round(80 * scale), pw - computedTextX - marginRight);

    // Tamaños de fuente ^A0 escalados por DPI y por alto de etiqueta
    const heightRatio = Math.max(0.8, Math.min(1.6, cal.heightMm / 20));
    const hasSlogan = Boolean(lines.showSlogan && lines.slogan);

    const fSloganH = Math.round(14 * scale * heightRatio);
    const fSloganW = fitFontWidth(lines.slogan, 12 * scale * heightRatio, availableTextWidth, Math.round(8 * scale));

    const f1H = Math.round((hasSlogan ? 30 : 32) * scale * heightRatio);
    const f1W = fitFontWidth(lines.line1, (hasSlogan ? 24 : 25) * scale * heightRatio, availableTextWidth, Math.round(13 * scale));

    const f2H = Math.round((hasSlogan ? 19 : 20) * scale * heightRatio);
    const f2W = fitFontWidth(lines.line2, (hasSlogan ? 16 : 17) * scale * heightRatio, availableTextWidth, Math.round(10 * scale));

    const f3H = Math.round((hasSlogan ? 18 : 19) * scale * heightRatio);
    const f3W = fitFontWidth(lines.line3, (hasSlogan ? 15 : 16) * scale * heightRatio, availableTextWidth, Math.round(10 * scale));

    // Distribución vertical limpia y equilibrada en el bloque derecho
    const gapSlogan = hasSlogan ? Math.round(10 * scale * heightRatio) : 0;
    const gap12 = Math.round((hasSlogan ? 11 : 14) * scale * heightRatio);
    const gap23 = Math.round((hasSlogan ? 9 : 12) * scale * heightRatio);

    const textBlockHeight =
      (hasSlogan ? fSloganH + gapSlogan : 0) +
      f1H +
      gap12 +
      f2H +
      gap23 +
      f3H;

    const baseTextY = Math.max(Math.round(8 * scale), Math.round((ll - textBlockHeight) / 2));

    let cursorY = baseTextY;
    const ySlogan = Math.max(0, cursorY + offY);
    if (hasSlogan) {
      cursorY += fSloganH + gapSlogan;
    }
    const y1 = Math.max(0, cursorY + offY);
    cursorY += f1H + gap12;
    const y2 = Math.max(0, cursorY + offY);
    cursorY += f2H + gap23;
    const y3 = Math.max(0, cursorY + offY);

    const safeQr = sanitizeZplField(lines.qrPayload);
    const safeSlogan = sanitizeZplField(lines.slogan);
    const safeL1 = sanitizeZplField(lines.line1);
    const safeL2 = sanitizeZplField(lines.line2);
    const safeL3 = sanitizeZplField(lines.line3);

    const zpl = [
      '^XA',
      '^CI28',
      '^PW' + pw,
      '^LL' + ll,
      '^LH0,0',
      '^FO' + qrX + ',' + qrY + '^BQN,2,' + qrMag + '^FDMA,' + safeQr + '^FS'
    ];

    if (hasSlogan && safeSlogan) {
      zpl.push('^FO' + textX + ',' + ySlogan + '^A0N,' + fSloganH + ',' + fSloganW + '^FD' + safeSlogan + '^FS');
    }

    zpl.push('^FO' + textX + ',' + y1 + '^A0N,' + f1H + ',' + f1W + '^FD' + safeL1 + '^FS');

    if (safeL2) {
      zpl.push('^FO' + textX + ',' + y2 + '^A0N,' + f2H + ',' + f2W + '^FD' + safeL2 + '^FS');
    }
    if (safeL3) {
      zpl.push('^FO' + textX + ',' + y3 + '^A0N,' + f3H + ',' + f3W + '^FD' + safeL3 + '^FS');
    }

    const qty = Math.max(1, Math.round(Number(copies) || 1));
    zpl.push('^PQ' + qty + ',0,1,Y');
    zpl.push('^XZ');

    return zpl.join('\n');
  }

  /**
   * Genera el lote completo ZPL II según cantidad y switch de autoincremento.
   * Devuelve el código ZPL, el rango de correlativos y el siguiente serial disponible.
   */
  function generateBatchZpl(formData, calibration) {
    const quantity = Math.max(1, Math.min(500, Math.round(Number(formData.quantity) || 1)));
    const auto = Boolean(formData.autoincrement);
    const startSerial = String(formData.serial || '').trim();

    if (!auto) {
      const lines = buildLabelLines(formData, startSerial);
      return {
        zpl: buildSingleLabelZpl(lines, calibration, quantity) + '\n',
        count: quantity,
        firstCorrelative: lines.correlative,
        lastCorrelative: lines.correlative,
        nextSerial: startSerial
      };
    }

    const blocks = [];
    let firstCorrelative = '';
    let lastCorrelative = '';

    for (let i = 0; i < quantity; i++) {
      const currentSerial = stepSerial(startSerial, i);
      const lines = buildLabelLines(formData, currentSerial);
      if (i === 0) firstCorrelative = lines.correlative;
      lastCorrelative = lines.correlative;
      blocks.push(buildSingleLabelZpl(lines, calibration, 1));
    }

    const nextSerial = stepSerial(startSerial, quantity);

    return {
      zpl: blocks.join('\n') + '\n',
      count: quantity,
      firstCorrelative: firstCorrelative,
      lastCorrelative: lastCorrelative,
      nextSerial: nextSerial
    };
  }

  global.BipaZPL = {
    BIPA_SLOGAN: BIPA_SLOGAN,
    stepSerial: stepSerial,
    buildLabelLines: buildLabelLines,
    generateBatchZpl: generateBatchZpl
  };
})(window);
