/**
 * BIPA Etiquetas de Lote · Motor ZPL II nativo para Zebra ZD410
 * Plantillas fieles a las 3 categorías de sistema/imprimir.ps1 (57 x 19 mm):
 * - Aromas (5 filas): logo ancho (172/456), divisoria x=178, título + Cont. Neto, Lote, Elaboración, Vencimiento
 * - Intenciones (5 filas): logo compacto (138/456), divisoria x=144, título "Vela Aromática ...", estilo uniforme
 * - Pack x2 (6 filas): logo compacto (138/456), divisoria x=144, título + subtítulo de aromas + 4 filas uniformes
 */
(function (global) {
  'use strict';

  const DEFAULT_LOGO_SRC = './assets/logo-bipa.png';

  let logoImage = null;
  let logoCropBounds = null;
  let logoLoadPromise = null;
  const gfaCache = Object.create(null);

  /**
   * Detecta el rectángulo útil (sin bordes transparentes) del logo cargado.
   */
  function computeImageBounds(img) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (typeof document === 'undefined') {
      return { x: 0, y: 0, w: w, h: h };
    }
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
      // Fallback si el entorno restringe getImageData
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
   * Permite inyectar una fuente de imagen para pruebas automatizadas.
   */
  function setLogoSource(img, bounds) {
    logoImage = img || null;
    logoCropBounds = bounds || (img ? computeImageBounds(img) : null);
    Object.keys(gfaCache).forEach(function (k) { delete gfaCache[k]; });
  }

  /**
   * Convierte ./assets/logo-bipa.png a un mapa de bits de 1 bit (negro puro sobre blanco)
   * usando un <canvas> oculto y devuelve el comando ZPL ^GFA correspondiente.
   */
  function buildLogoGfa(targetWidthDots, targetHeightDots) {
    if (!logoImage || typeof document === 'undefined') return null;

    const w = Math.max(16, Math.round(targetWidthDots));
    const h = Math.max(12, Math.round(targetHeightDots));
    const cacheKey = w + 'x' + h;
    if (gfaCache[cacheKey]) return gfaCache[cacheKey];

    try {
      const bounds = logoCropBounds || {
        x: 0,
        y: 0,
        w: logoImage.naturalWidth || logoImage.width,
        h: logoImage.naturalHeight || logoImage.height
      };

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

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

              let isDark = false;
              if (a >= 68) {
                const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                const blendedLum = (lum * (a / 255)) + 255 * (1 - a / 255);
                isDark = blendedLum < 215;
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
   * Sanitiza texto para campos ^FD de ZPL II evitando comandos accidentales (^ o ~).
   */
  function sanitizeZplField(text) {
    return String(text || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\^~]/g, ' ')
      .trim();
  }

  /**
   * Ajusta el ancho de carácter en ^A0N para que el texto nunca se corte por el borde derecho.
   */
  function fitFontWidth(text, targetWidthDots, maxAvailableDots, minWidthDots) {
    const chars = Math.max(1, String(text || '').length);
    const estimatedTotal = chars * targetWidthDots * 0.56;
    if (estimatedTotal <= maxAvailableDots) {
      return Math.round(targetWidthDots);
    }
    const fitted = Math.floor(maxAvailableDots / (chars * 0.56));
    return Math.max(minWidthDots, fitted);
  }

  /**
   * Calcula métricas fieles a imprimir.ps1 en 57 x 19 mm (456 x 152 dots a 203 dpi)
   * diferenciando Aromas (logo 172/456) de Intenciones y Pack x2 (logo 138/456).
   */
  function computeLayoutMetrics(data, cal) {
    const dpi = Number(cal.dpi) === 300 ? 300 : 203;
    const dotsPerMm = dpi / 25.4;
    const scale = dpi / 203;
    const widthMm = Number(cal.widthMm) || 57;
    const heightMm = Number(cal.heightMm) || 19;

    const pw = Math.max(200, Math.round(widthMm * dotsPerMm));
    const ll = Math.max(80, Math.round(heightMm * dotsPerMm));

    const category = data.category === 'intenciones' || data.category === 'packx2' ? data.category : 'aromas';
    const hasSubtitle = category === 'packx2' || Boolean(String(data.subtitle || '').trim());
    const compactLogo = category !== 'aromas' || Boolean(data.compactLogo || hasSubtitle);
    const uniformBold = category !== 'aromas' || Boolean(data.uniformBold);

    // Proporciones exactas de imprimir.ps1: 172/456 (Aromas) vs 138/456 (Intenciones y Pack x2)
    const logoWidthRatio = compactLogo ? (138 / 456) : (172 / 456);
    const logoMaxH = Math.round(ll * 0.84);
    const logoAspect = logoCropBounds && logoCropBounds.h > 0
      ? (logoCropBounds.w / logoCropBounds.h)
      : 1.648;

    let logoW = Math.round(pw * logoWidthRatio);
    let logoH = Math.round(logoW / logoAspect);
    if (logoH > logoMaxH) {
      logoH = logoMaxH;
      logoW = Math.round(logoH * logoAspect);
    }

    const previewLogoColPct = Number(((logoW / pw) * 100).toFixed(2));

    return {
      dpi: dpi,
      dotsPerMm: dotsPerMm,
      scale: scale,
      widthMm: widthMm,
      heightMm: heightMm,
      pw: pw,
      ll: ll,
      category: category,
      hasSubtitle: hasSubtitle,
      compactLogo: compactLogo,
      uniformBold: uniformBold,
      logoW: logoW,
      logoH: logoH,
      previewLogoColPct: Math.max(24, Math.min(39, previewLogoColPct))
    };
  }

  /**
   * Genera el código ZPL II completo adaptado a la plantilla de la categoría activa.
   */
  function generateLotZpl(data, cal) {
    const m = computeLayoutMetrics(data, cal);
    const scale = m.scale;
    const pw = m.pw;
    const ll = m.ll;
    const offX = Math.round(Number(cal.offsetX) || 0);
    const offY = Math.round(Number(cal.offsetY) || 0);
    const darkness = Math.max(5, Math.min(30, Math.round(Number(cal.darkness) || 25)));
    const speed = Math.max(2, Math.min(6, Math.round(Number(cal.speed) || 3)));
    const copies = Math.max(1, Math.min(999, Math.round(Number(data.quantity) || 1)));

    // 1. Logo monocromático BIPA a la izquierda (^GFA) en posición fiel (x=2, divisoria x=178 o x=144)
    const marginLeft = Math.round(2 * scale);
    const logoX = Math.max(0, marginLeft + offX);
    const logoY = Math.max(0, Math.round((ll - m.logoH) / 2) + offY);
    const logoGfa = buildLogoGfa(m.logoW, m.logoH);

    // 2. Línea divisoria vertical (^GB)
    const dividerGap = Math.round(4 * scale);
    const dividerThick = Math.max(2, Math.round(2 * scale));
    const dividerPadY = Math.round(6 * scale);
    const dividerX = Math.max(0, marginLeft + m.logoW + dividerGap + offX);
    const dividerY = Math.max(0, dividerPadY + offY);
    const dividerH = Math.max(20, ll - dividerPadY * 2);

    // 3. Bloque derecho de textos
    const colT = Math.max(0, dividerX + dividerThick + Math.round(4 * scale));
    const marginRight = Math.round(4 * scale);
    const fullRightWidth = Math.max(
      Math.round(100 * scale),
      pw - (colT - offX) - marginRight
    );

    const safeTitle = sanitizeZplField(data.labelTitle || data.name || 'Producto BIPA');
    const safeSubtitle = m.category === 'packx2' || data.subtitle
      ? sanitizeZplField(data.subtitle || '')
      : '';
    const safeNet = sanitizeZplField(data.netContent || '');
    const safeLot = sanitizeZplField(data.lot || '');
    const safeElab = sanitizeZplField(data.elaboration || '');
    const safeExp = sanitizeZplField(data.expiry || '');

    const rows = [
      { kind: 'title', label: '', value: safeTitle }
    ];
    if (safeSubtitle) {
      rows.push({ kind: 'subtitle', label: '', value: safeSubtitle });
    }
    rows.push(
      { kind: 'field', label: 'Cont. Neto:', value: safeNet },
      { kind: 'field', label: 'Lote:', value: safeLot },
      { kind: 'field', label: 'Elaboración:', value: safeElab },
      { kind: 'field', label: 'Vencimiento:', value: safeExp }
    );

    const nRows = rows.length;
    const heightRatio = Math.max(0.8, Math.min(1.8, m.heightMm / 19));
    const isSixRows = nRows > 5;
    const rowStep = Math.round((isSixRows ? 23.5 : 28) * scale * heightRatio);
    const blockH = rowStep * nRows;
    const baseY = Math.max(Math.round(4 * scale), Math.round((ll - blockH) / 2));

    // Tipografía diferenciada por plantilla (Aromas, Intenciones, Pack x2)
    let titleTargetH = 24;
    let titleTargetW = 18;
    let fieldTargetH = 19.5;
    let labelCharTargetW = 15;

    if (m.category === 'intenciones') {
      titleTargetH = 23;
      titleTargetW = 17.5;
      fieldTargetH = 19.5;
      labelCharTargetW = 14.5;
    } else if (m.category === 'packx2' || isSixRows) {
      titleTargetH = 20;
      titleTargetW = 16;
      fieldTargetH = 17;
      labelCharTargetW = 13;
    }

    const titleH = Math.round(titleTargetH * scale * heightRatio);
    const titleW = fitFontWidth(safeTitle, titleTargetW * scale * heightRatio, fullRightWidth, Math.round(9 * scale));

    const subH = Math.round(17 * scale * heightRatio);
    const subW = fitFontWidth(safeSubtitle, 14 * scale * heightRatio, fullRightWidth, Math.round(8 * scale));

    const fieldH = Math.round(fieldTargetH * scale * heightRatio);
    const labelCharW = Math.round(labelCharTargetW * scale * heightRatio);

    // Columna de valores alineada tras "Vencimiento:"
    const labelColW = Math.min(
      Math.round(fullRightWidth * 0.43),
      Math.round(12 * labelCharW * 0.56) + Math.round(6 * scale)
    );
    const colV = colT + labelColW;
    const maxValWidth = Math.max(Math.round(60 * scale), fullRightWidth - labelColW);

    const zpl = [
      '~SD' + darkness,
      '^XA',
      '^CI28',
      '^PW' + pw,
      '^LL' + ll,
      '^MNY',
      '^PR' + speed,
      '^LH0,0'
    ];

    if (logoGfa) {
      zpl.push('^FO' + logoX + ',' + logoY + logoGfa.command + '^FS');
    }

    zpl.push('^FO' + dividerX + ',' + dividerY + '^GB' + dividerThick + ',' + dividerH + ',' + dividerThick + '^FS');

    for (let i = 0; i < nRows; i++) {
      const row = rows[i];
      const y = Math.max(0, baseY + i * rowStep + offY);

      if (row.kind === 'title') {
        zpl.push('^FO' + colT + ',' + y + '^A0N,' + titleH + ',' + titleW + '^FD' + row.value + '^FS');
      } else if (row.kind === 'subtitle') {
        zpl.push('^FO' + colT + ',' + y + '^A0N,' + subH + ',' + subW + '^FD' + row.value + '^FS');
      } else {
        zpl.push('^FO' + colT + ',' + y + '^A0N,' + fieldH + ',' + labelCharW + '^FD' + row.label + '^FS');
        if (row.value) {
          const valBaseW = m.uniformBold ? labelCharW : Math.max(Math.round(8 * scale), labelCharW - Math.round(scale));
          const valW = fitFontWidth(row.value, valBaseW, maxValWidth, Math.round(8 * scale));
          zpl.push('^FO' + colV + ',' + y + '^A0N,' + fieldH + ',' + valW + '^FD' + row.value + '^FS');
        }
      }
    }

    zpl.push('^PQ' + copies + ',0,1,Y');
    zpl.push('^XZ');

    return {
      zpl: zpl.join('\n') + '\n',
      count: copies,
      title: safeTitle,
      metrics: m
    };
  }

  global.BipaZPL = {
    loadLogo: loadLogo,
    setLogoSource: setLogoSource,
    buildLogoGfa: buildLogoGfa,
    computeLayoutMetrics: computeLayoutMetrics,
    generateLotZpl: generateLotZpl
  };
})(window);
