/**
 * BIPA Etiquetas QR · Motor ZPL II nativo para Zebra ZD410
 * - Convierte ./assets/logo-bipa.png en tiempo real mediante un <canvas> oculto
 *   a mapa de bits monocromático de 1 bit (^GFA) escalado según 203 dpi o 300 dpi.
 * - Incluye encabezado de marca (logo + "BIPA · Buenas ideas puestas en acción") con ^CI28 (UTF-8).
 * - Soporta modo QR personalizado, offsets X/Y en dots y correlativos con ceros a la izquierda.
 */
(function (global) {
  'use strict';

  const BIPA_SLOGAN = 'BIPA · Buenas ideas puestas en acción';
  const DEFAULT_LOGO_SRC = './assets/logo-bipa.png';

  // Caché en memoria del logo cargado y sus mapas de bits ^GFA por resolución (WxH)
  let logoImage = null;
  let logoCropBounds = null;
  let logoLoadPromise = null;
  const gfaCache = Object.create(null);

  /**
   * Detecta el rectángulo útil (sin bordes transparentes) del logo cargado.
   */
  function computeImageBounds(img) {
    if (typeof document === 'undefined') {
      return { x: 0, y: 0, w: img.naturalWidth || img.width, h: img.naturalHeight || img.height };
    }
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;

      let minX = w;
      let minY = h;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < h; y++) {
        const rowOffset = y * w * 4;
        for (let x = 0; x < w; x++) {
          const idx = rowOffset + x * 4;
          const a = data[idx + 3];
          if (a > 24) {
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            if (lum < 245) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
      }

      if (maxX >= minX && maxY >= minY) {
        return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
      }
    } catch (_err) {
      // Fallback si el navegador restringe getImageData (ej. file://)
    }
    return { x: 0, y: 0, w: w, h: h };
  }

  /**
   * Carga ./assets/logo-bipa.png una sola vez para generar el comando ^GFA en tiempo real.
   */
  function loadLogo(src) {
    const targetSrc = src || DEFAULT_LOGO_SRC;
    if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
      return Promise.resolve(logoImage);
    }
    if (logoLoadPromise) return logoLoadPromise;

    if (typeof Image === 'undefined') {
      return Promise.resolve(null);
    }

    logoLoadPromise = new Promise(function (resolve) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        logoImage = img;
        logoCropBounds = computeImageBounds(img);
        resolve(img);
      };
      img.onerror = function () {
        logoLoadPromise = null;
        resolve(null);
      };
      img.src = targetSrc;
    });

    return logoLoadPromise;
  }

  /**
   * Permite inyectar una fuente rasterizada (p. ej. pruebas en Node o canvas externo).
   */
  function setLogoSource(img, bounds) {
    logoImage = img || null;
    logoCropBounds = bounds || (img ? computeImageBounds(img) : null);
    Object.keys(gfaCache).forEach(function (k) { delete gfaCache[k]; });
  }

  /**
   * Convierte el logo de BIPA a un mapa de bits monocromático de 1 bit (negro puro sobre blanco)
   * usando un <canvas> oculto y devuelve el comando ZPL ^GFA listo para insertar.
   */
  function buildLogoGfa(targetWidthDots, targetHeightDots) {
    if (!logoImage || typeof document === 'undefined') return null;

    const w = Math.max(8, Math.round(targetWidthDots));
    const h = Math.max(8, Math.round(targetHeightDots));
    const cacheKey = w + 'x' + h;
    if (gfaCache[cacheKey]) return gfaCache[cacheKey];

    try {
      const bounds = logoCropBounds || {
        x: 0,
        y: 0,
        w: logoImage.naturalWidth || logoImage.width,
        h: logoImage.naturalHeight || logoImage.height
      };

      // Renderizamos en un canvas oculto con fondo blanco limpio para conservar nitidez
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Ajustar manteniendo proporción exacta del logo sin deformar
      const scale = Math.min(w / bounds.w, h / bounds.h);
      const drawW = Math.max(1, Math.round(bounds.w * scale));
      const drawH = Math.max(1, Math.round(bounds.h * scale));
      const drawX = Math.floor((w - drawW) / 2);
      const drawY = Math.floor((h - drawH) / 2);

      ctx.drawImage(
        logoImage,
        bounds.x,
        bounds.y,
        bounds.w,
        bounds.h,
        drawX,
        drawY,
        drawW,
        drawH
      );

      const pixels = ctx.getImageData(0, 0, w, h).data;
      const bytesPerRow = Math.ceil(w / 8);
      const totalBytes = bytesPerRow * h;
      const hexParts = [];

      for (let y = 0; y < h; y++) {
        const rowStart = y * w * 4;
        for (let byteIdx = 0; byteIdx < bytesPerRow; byteIdx++) {
          let byteVal = 0;
          for (let bit = 0; bit < 8; bit++) {
            const x = byteIdx * 8 + bit;
            if (x < w) {
              const p = rowStart + x * 4;
              const r = pixels[p];
              const g = pixels[p + 1];
              const b = pixels[p + 2];
              const a = pixels[p + 3];

              // Convertir con alto contraste: los trazos del logo (verde hoja/marrón/gris)
              // sobre fondo transparente pasan a negro puro (1), el fondo a blanco (0).
              let isDark = false;
              if (a >= 72) {
                const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                // Compensar antialiasing sobre blanco para conservar trazos finos de la hoja y letras
                const blendedLum = (lum * (a / 255)) + 255 * (1 - a / 255);
                isDark = blendedLum < 218;
              }
              if (isDark) {
                byteVal |= (0x80 >> bit);
              }
            }
          }
          hexParts.push(byteVal.toString(16).toUpperCase().padStart(2, '0'));
        }
      }

      const result = {
        widthDots: w,
        heightDots: h,
        bytesPerRow: bytesPerRow,
        totalBytes: totalBytes,
        command: '^GFA,' + totalBytes + ',' + totalBytes + ',' + bytesPerRow + ',' + hexParts.join('')
      };

      gfaCache[cacheKey] = result;
      return result;
    } catch (_err) {
      return null;
    }
  }

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
   * Construye el encabezado de marca opcional, las 3 líneas de texto y el contenido del QR.
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
   * la proporción real en la vista previa y el espacio horizontal en ZPL.
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
    const estimatedTotal = chars * targetWidthDots * 0.60;
    if (estimatedTotal <= maxAvailableDots) {
      return Math.round(targetWidthDots);
    }
    const fitted = Math.floor(maxAvailableDots / (chars * 0.60));
    return Math.max(minWidthDots, fitted);
  }

  /**
   * Calcula métricas de layout compartidas (dots y porcentajes) para mantener coherencia
   * entre la vista previa en pantalla y la salida ZPL II física.
   */
  function computeLayoutMetrics(lines, cal) {
    const dpi = Number(cal.dpi) === 300 ? 300 : 203;
    const dotsPerMm = dpi / 25.4;
    const scale = dpi / 203;
    const pw = Math.max(160, Math.round(cal.widthMm * dotsPerMm));
    const ll = Math.max(80, Math.round(cal.heightMm * dotsPerMm));
    const qrMag = Math.max(1, Math.min(10, Math.round(Number(cal.qrMag) || 4)));
    const qrModules = estimateQrModules(lines.qrPayload);
    const qrSizeDots = qrModules * qrMag;

    // Porcentaje visual del QR en la columna izquierda (32%–38% en calibración estándar),
    // reflejando cambios del factor ^BQN en vivo sin desbordar el alto ni empujar el texto.
    const maxQrByHeightPct = ((ll * 0.92) / pw) * 100;
    const defaultMag = 4 * scale;
    const magRatio = qrMag / defaultMag;
    const moduleBoost = qrModules > 25 ? 1.04 : 1.0;
    const scaledPct = 34 * (0.45 + 0.55 * magRatio) * moduleBoost;
    const clampedPct = Math.max(18, Math.min(38, maxQrByHeightPct, scaledPct));

    return {
      dpi: dpi,
      dotsPerMm: dotsPerMm,
      scale: scale,
      pw: pw,
      ll: ll,
      qrMag: qrMag,
      qrModules: qrModules,
      qrSizeDots: qrSizeDots,
      previewQrWidthPercent: Number(clampedPct.toFixed(2))
    };
  }

  /**
   * Genera un bloque ZPL II (^XA ... ^XZ) para una etiqueta individual.
   */
  function buildSingleLabelZpl(lines, cal, copies) {
    const m = computeLayoutMetrics(lines, cal);
    const scale = m.scale;
    const pw = m.pw;
    const ll = m.ll;
    const offX = Math.round(Number(cal.offsetX) || 0);
    const offY = Math.round(Number(cal.offsetY) || 0);

    // Margen izquierdo y centrado vertical del bloque QR
    const marginLeft = Math.round(12 * scale);
    const marginRight = Math.round(10 * scale);
    const qrCenterY = Math.round((ll - m.qrSizeDots) / 2) - Math.round(4 * scale);

    const qrX = Math.max(0, marginLeft + offX);
    const qrY = Math.max(0, Math.max(Math.round(4 * scale), qrCenterY) + offY);

    // Inicio horizontal del bloque derecho a la derecha del QR
    const qrGap = Math.round(14 * scale);
    const minTextX = Math.round(134 * scale);
    const maxTextX = Math.round(pw * 0.46);
    const computedTextX = Math.min(maxTextX, Math.max(minTextX, marginLeft + m.qrSizeDots + qrGap));
    const textX = Math.max(0, computedTextX + offX);
    const availableTextWidth = Math.max(Math.round(80 * scale), pw - computedTextX - marginRight);

    // Escalado por DPI y alto de etiqueta
    const heightRatio = Math.max(0.8, Math.min(1.6, cal.heightMm / 20));
    const hasBrandHeader = Boolean(lines.showSlogan && lines.slogan);

    // Dimensiones del logo BIPA monocromático (^GFA) junto al lema
    const logoAspect = logoCropBounds && logoCropBounds.h > 0
      ? (logoCropBounds.w / logoCropBounds.h)
      : 1.61;
    const logoH = Math.round(22 * scale * heightRatio);
    const logoW = Math.round(logoH * logoAspect);
    const logoGfa = hasBrandHeader ? buildLogoGfa(logoW, logoH) : null;
    const logoGap = logoGfa ? Math.round(6 * scale) : 0;

    const sloganX = textX + (logoGfa ? logoGfa.widthDots + logoGap : 0);
    const availableSloganWidth = Math.max(
      Math.round(60 * scale),
      availableTextWidth - (logoGfa ? logoGfa.widthDots + logoGap : 0)
    );

    const fSloganH = Math.round(14 * scale * heightRatio);
    const fSloganW = fitFontWidth(lines.slogan, 11.5 * scale * heightRatio, availableSloganWidth, Math.round(7.5 * scale));

    const headerRowH = hasBrandHeader ? Math.max(fSloganH, logoGfa ? logoGfa.heightDots : fSloganH) : 0;

    const f1H = Math.round((hasBrandHeader ? 30 : 32) * scale * heightRatio);
    const f1W = fitFontWidth(lines.line1, (hasBrandHeader ? 24 : 25) * scale * heightRatio, availableTextWidth, Math.round(13 * scale));

    const f2H = Math.round((hasBrandHeader ? 19 : 20) * scale * heightRatio);
    const f2W = fitFontWidth(lines.line2, (hasBrandHeader ? 16 : 17) * scale * heightRatio, availableTextWidth, Math.round(10 * scale));

    const f3H = Math.round((hasBrandHeader ? 18 : 19) * scale * heightRatio);
    const f3W = fitFontWidth(lines.line3, (hasBrandHeader ? 15 : 16) * scale * heightRatio, availableTextWidth, Math.round(10 * scale));

    // Distribución vertical centrada y equilibrada
    const gapHeader = hasBrandHeader ? Math.round(8 * scale * heightRatio) : 0;
    const gap12 = Math.round((hasBrandHeader ? 10 : 14) * scale * heightRatio);
    const gap23 = Math.round((hasBrandHeader ? 8 : 12) * scale * heightRatio);

    const textBlockHeight =
      (hasBrandHeader ? headerRowH + gapHeader : 0) +
      f1H +
      gap12 +
      f2H +
      gap23 +
      f3H;

    const baseTextY = Math.max(Math.round(6 * scale), Math.round((ll - textBlockHeight) / 2));

    let cursorY = baseTextY;
    const yLogo = Math.max(0, cursorY + offY);
    const ySlogan = Math.max(0, cursorY + Math.round((headerRowH - fSloganH) / 2) + offY);
    if (hasBrandHeader) {
      cursorY += headerRowH + gapHeader;
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
      '^FO' + qrX + ',' + qrY + '^BQN,2,' + m.qrMag + '^FDMA,' + safeQr + '^FS'
    ];

    if (hasBrandHeader) {
      if (logoGfa) {
        zpl.push('^FO' + textX + ',' + yLogo + logoGfa.command + '^FS');
      }
      if (safeSlogan) {
        zpl.push('^FO' + sloganX + ',' + ySlogan + '^A0N,' + fSloganH + ',' + fSloganW + '^FD' + safeSlogan + '^FS');
      }
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
    loadLogo: loadLogo,
    setLogoSource: setLogoSource,
    buildLogoGfa: buildLogoGfa,
    computeLayoutMetrics: computeLayoutMetrics,
    stepSerial: stepSerial,
    buildLabelLines: buildLabelLines,
    generateBatchZpl: generateBatchZpl
  };
})(window);
