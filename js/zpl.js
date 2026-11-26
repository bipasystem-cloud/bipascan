/**
 * BIPA Etiquetas · Motor ZPL II nativo para Zebra ZD410
 * Soporta dos presets de papel completos y escalables a 203 dpi y 300 dpi:
 * - Preset 1: "50x20" — Estándar (50 × 20 mm -> ^PW400 ^LL160 en 203 dpi)
 * - Preset 2: "60x40" — Grande (60 × 40 mm -> ^PW448 ^LL320 en 203 dpi con márgenes seguros)
 */
(function (global) {
  'use strict';

  const DEFAULT_LOGO_SRC = './assets/logo-bipa.png';

  const PAPER_PRESETS = Object.freeze({
    '50x20': Object.freeze({
      id: '50x20',
      label: 'Estándar (50 × 20 mm)',
      widthMm: 50,
      heightMm: 20,
      pw203: 400,
      ll203: 160
    }),
    '60x40': Object.freeze({
      id: '60x40',
      label: 'Grande (60 × 40 mm)',
      widthMm: 60,
      heightMm: 40,
      pw203: 448,
      ll203: 320
    })
  });

  let logoImage = null;
  let logoCropBounds = null;
  let logoLoadPromise = null;
  const gfaCache = Object.create(null);

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

  function setLogoSource(img, bounds) {
    logoImage = img || null;
    logoCropBounds = bounds || (img ? computeImageBounds(img) : null);
    Object.keys(gfaCache).forEach(function (k) { delete gfaCache[k]; });
  }

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

  function sanitizeZplField(text) {
    return String(text || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\^~]/g, ' ')
      .trim();
  }

  function fitFontWidth(text, targetWidthDots, maxAvailableDots, minWidthDots) {
    const chars = Math.max(1, String(text || '').length);
    const estimatedTotal = chars * targetWidthDots * 0.56;
    if (estimatedTotal <= maxAvailableDots) {
      return Math.round(targetWidthDots);
    }
    const fitted = Math.floor(maxAvailableDots / (chars * 0.56));
    return Math.max(minWidthDots, fitted);
  }

  function computeLayoutMetrics(data, cal) {
    const dpi = Number(cal.dpi) === 300 ? 300 : 203;
    const dotsPerMm = dpi / 25.4;
    const scale = dpi / 203;
    const presetId = cal.paperPreset === '50x20' ? '50x20' : '60x40';
    const widthMm = Number(cal.widthMm) || PAPER_PRESETS[presetId].widthMm;
    const heightMm = Number(cal.heightMm) || PAPER_PRESETS[presetId].heightMm;

    let pw;
    let ll;
    if (widthMm === 60 && heightMm === 40) {
      pw = Math.round(PAPER_PRESETS['60x40'].pw203 * scale);
      ll = Math.round(PAPER_PRESETS['60x40'].ll203 * scale);
    } else if (widthMm === 50 && heightMm === 20) {
      pw = Math.round(PAPER_PRESETS['50x20'].pw203 * scale);
      ll = Math.round(PAPER_PRESETS['50x20'].ll203 * scale);
    } else {
      pw = Math.max(200, Math.round(widthMm * dotsPerMm));
      ll = Math.max(80, Math.round(heightMm * dotsPerMm));
    }

    const isLargePreset = presetId === '60x40' || heightMm >= 30;
    const template = data.template || 'lot';
    const category = data.category || 'aromas';
    const hasSubtitle = category === 'packx2' || Boolean(String(data.subtitle || '').trim());
    const compactLogo = template !== 'lot' || category !== 'aromas' || Boolean(data.compactLogo || hasSubtitle);
    const uniformBold = template === 'lot' && (category !== 'aromas' || Boolean(data.uniformBold));

    const logoWidthRatio = isLargePreset
      ? (compactLogo ? 0.32 : 0.365)
      : (compactLogo ? 0.305 : 0.365);
    const logoMaxH = Math.round(ll * (isLargePreset ? 0.72 : 0.82));
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
      paperPreset: presetId,
      isLargePreset: isLargePreset,
      dpi: dpi,
      dotsPerMm: dotsPerMm,
      scale: scale,
      widthMm: widthMm,
      heightMm: heightMm,
      pw: pw,
      ll: ll,
      template: template,
      category: category,
      hasSubtitle: hasSubtitle,
      compactLogo: compactLogo,
      uniformBold: uniformBold,
      logoW: logoW,
      logoH: logoH,
      previewLogoColPct: Math.max(24, Math.min(39, previewLogoColPct))
    };
  }

  function buildZplHeader(pw, ll, cal) {
    const darkness = Math.max(5, Math.min(30, Math.round(Number(cal.darkness) || 25)));
    const speed = Math.max(2, Math.min(6, Math.round(Number(cal.speed) || 3)));
    return [
      '~SD' + darkness,
      '^XA',
      '^CI28',
      '^PW' + pw,
      '^LL' + ll,
      '^MNY',
      '^PR' + speed,
      '^LH0,0'
    ];
  }

  function buildBarcodeCellZpl(lines, data, cellX, cellY, cellW, cellH, scale, isCompactCell, isLargePreset) {
    const safeName = sanitizeZplField(data.labelTitle || data.name || 'BIPA');
    const cleanEan = String(data.ean13 || '').replace(/\D/g, '').slice(0, 13) || '7596246002876';
    const safeCpe = sanitizeZplField(data.cpe || '');

    const yScale = isLargePreset && !isCompactCell ? 1.55 : 1.0;
    const padX = Math.round((isCompactCell ? 6 : 16) * scale);
    const padY = Math.round((isCompactCell ? 3 : 12) * scale * yScale);
    const innerW = Math.max(Math.round(80 * scale), cellW - padX * 2);

    const nameH = Math.round((isCompactCell ? 13 : 22) * scale * yScale);
    const nameW = fitFontWidth(safeName, (isCompactCell ? 11 : 17) * scale * (isLargePreset && !isCompactCell ? 1.25 : 1), innerW, Math.round(7 * scale));

    const cpeText = safeCpe ? ('CPE ' + safeCpe) : '';
    const cpeH = Math.round((isCompactCell ? 12 : 19) * scale * yScale);
    const cpeW = fitFontWidth(cpeText, (isCompactCell ? 10 : 15) * scale * (isLargePreset && !isCompactCell ? 1.2 : 1), innerW, Math.round(7 * scale));

    const moduleW = isCompactCell || cellW < Math.round(230 * scale)
      ? Math.max(1, Math.round(1 * scale))
      : Math.max(2, Math.round(2 * scale));
    const barcodeVisualW = moduleW * 105;
    const barX = cellX + Math.max(padX, Math.round((cellW - barcodeVisualW) / 2));

    const nameY = cellY + padY;
    const cpeY = cellY + cellH - padY - cpeH;
    const barY = nameY + nameH + Math.round((isCompactCell ? 3 : 10) * scale * yScale);
    const barH = Math.max(
      Math.round((isCompactCell ? 24 : 44) * scale),
      cpeY - barY - Math.round((isCompactCell ? 10 : 22) * scale * yScale)
    );

    const nameX = cellX + Math.max(padX, Math.round((cellW - Math.min(innerW, safeName.length * nameW * 0.56)) / 2));
    lines.push('^FO' + nameX + ',' + nameY + '^A0N,' + nameH + ',' + nameW + '^FD' + safeName + '^FS');
    lines.push('^FO' + barX + ',' + barY + '^BY' + moduleW + ',3,' + barH + '^BEN,' + barH + ',Y,N^FD' + cleanEan + '^FS');

    if (cpeText) {
      const cpeX = cellX + Math.max(padX, Math.round((cellW - Math.min(innerW, cpeText.length * cpeW * 0.56)) / 2));
      lines.push('^FO' + cpeX + ',' + cpeY + '^A0N,' + cpeH + ',' + cpeW + '^FD' + cpeText + '^FS');
    }
  }

  function generateLotZpl(data, cal) {
    const m = computeLayoutMetrics(data, cal);
    const scale = m.scale;
    const pw = m.pw;
    const ll = m.ll;
    const isLarge = m.isLargePreset;
    const offX = Math.round(Number(cal.offsetX) || 0);
    const offY = Math.round(Number(cal.offsetY) || 0);
    const copies = Math.max(1, Math.min(999, Math.round(Number(data.quantity) || 1)));
    const safeTitle = sanitizeZplField(data.labelTitle || data.name || 'Producto BIPA');

    const zpl = buildZplHeader(pw, ll, cal);

    // ---- PLANTILLA CÓDIGO DE BARRAS (EAN-13 + CPE) ----
    if (m.template === 'barcode') {
      const fmtId = data.barcodeFormat || 'gs1';
      if (fmtId === 'x4') {
        const halfW = Math.floor(pw / 2);
        const halfH = Math.floor(ll / 2);
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 2; c++) {
            buildBarcodeCellZpl(
              zpl,
              data,
              Math.max(0, c * halfW + offX),
              Math.max(0, r * halfH + offY),
              halfW,
              halfH,
              scale,
              true,
              isLarge
            );
          }
        }
      } else {
        const fmt = global.BipaCatalog && global.BipaCatalog.getBarcodeFormat
          ? global.BipaCatalog.getBarcodeFormat(fmtId)
          : { widthMm: 0, heightMm: 0 };
        const areaW = fmt.widthMm > 0 ? Math.min(pw, Math.round(fmt.widthMm * m.dotsPerMm)) : pw;
        const areaH = fmt.heightMm > 0 ? Math.min(ll, Math.round(fmt.heightMm * m.dotsPerMm)) : ll;
        const startX = Math.max(0, Math.round((pw - areaW) / 2) + offX);
        const startY = Math.max(0, Math.round((ll - areaH) / 2) + offY);
        buildBarcodeCellZpl(zpl, data, startX, startY, areaW, areaH, scale, areaH < Math.round(105 * scale), isLarge);
      }

      zpl.push('^PQ' + copies + ',0,1,Y');
      zpl.push('^XZ');
      return { zpl: zpl.join('\n') + '\n', count: copies, title: safeTitle, metrics: m };
    }

    // ---- BLOQUE IZQUIERDO COMPARTIDO: LOGO ^GFA + LÍNEA DIVISORIA ^GB ----
    const marginLeft = Math.round((isLarge ? 10 : 4) * scale);
    const marginRight = Math.round((isLarge ? 10 : 4) * scale);
    const logoX = Math.max(0, marginLeft + offX);
    const logoY = Math.max(0, Math.round((ll - m.logoH) / 2) + offY);
    const logoGfa = buildLogoGfa(m.logoW, m.logoH);

    const dividerGap = Math.round((isLarge ? 10 : 5) * scale);
    const dividerThick = Math.max(isLarge ? 3 : 2, Math.round((isLarge ? 3 : 2) * scale));
    const dividerPadY = Math.round((isLarge ? 18 : 6) * scale);
    const dividerX = Math.max(0, marginLeft + m.logoW + dividerGap + offX);
    const dividerY = Math.max(0, dividerPadY + offY);
    const dividerH = Math.max(20, ll - dividerPadY * 2);

    const colT = Math.max(0, dividerX + dividerThick + Math.round((isLarge ? 10 : 6) * scale));
    const fullRightWidth = Math.max(
      Math.round(100 * scale),
      pw - (colT - offX) - marginRight
    );

    if (logoGfa) {
      zpl.push('^FO' + logoX + ',' + logoY + logoGfa.command + '^FS');
    }
    zpl.push('^FO' + dividerX + ',' + dividerY + '^GB' + dividerThick + ',' + dividerH + ',' + dividerThick + '^FS');

    // ---- PLANTILLA SIMPLE ----
    if (m.template === 'simple') {
      const safeWeight = sanitizeZplField(data.weightText || '');
      const titleH = Math.round((isLarge ? (safeWeight ? 44 : 50) : (safeWeight ? 28 : 32)) * scale);
      const titleW = fitFontWidth(safeTitle, (isLarge ? 30 : 22) * scale, fullRightWidth, Math.round(10 * scale));
      if (safeWeight) {
        const wH = Math.round((isLarge ? 34 : 22) * scale);
        const wW = fitFontWidth(safeWeight, (isLarge ? 26 : 18) * scale, fullRightWidth, Math.round(10 * scale));
        const gapS = Math.round((isLarge ? 20 : 12) * scale);
        const totalH = titleH + gapS + wH;
        const y0 = Math.max(Math.round(8 * scale), Math.round((ll - totalH) / 2) + offY);
        zpl.push('^FO' + colT + ',' + y0 + '^A0N,' + titleH + ',' + titleW + '^FD' + safeTitle + '^FS');
        zpl.push('^FO' + colT + ',' + (y0 + titleH + gapS) + '^A0N,' + wH + ',' + wW + '^FD' + safeWeight + '^FS');
      } else {
        const y0 = Math.max(Math.round(8 * scale), Math.round((ll - titleH) / 2) + offY);
        zpl.push('^FO' + colT + ',' + y0 + '^A0N,' + titleH + ',' + titleW + '^FD' + safeTitle + '^FS');
      }

      zpl.push('^PQ' + copies + ',0,1,Y');
      zpl.push('^XZ');
      return { zpl: zpl.join('\n') + '\n', count: copies, title: safeTitle, metrics: m };
    }

    // ---- PLANTILLA ENVÍO ----
    if (m.template === 'shipping') {
      const dest = sanitizeZplField(data.destination || 'Central Madeirense');
      const sender = sanitizeZplField(data.sender || 'Karla Montilla');
      const phone = sanitizeZplField(data.phone || '0424-7718497');
      const line1 = 'Envío a ' + dest;
      const line2 = 'Remite: ' + sender;
      const line3 = 'Tel: ' + phone;

      const h1 = Math.round((isLarge ? 38 : 25) * scale);
      const w1 = fitFontWidth(line1, (isLarge ? 25 : 18) * scale, fullRightWidth, Math.round(9 * scale));
      const h2 = Math.round((isLarge ? 30 : 20) * scale);
      const w2 = fitFontWidth(line2, (isLarge ? 21 : 15) * scale, fullRightWidth, Math.round(9 * scale));
      const h3 = Math.round((isLarge ? 30 : 20) * scale);
      const w3 = fitFontWidth(line3, (isLarge ? 21 : 15) * scale, fullRightWidth, Math.round(9 * scale));

      const step = Math.round((isLarge ? 58 : 34) * scale);
      const y0 = Math.max(Math.round(8 * scale), Math.round((ll - step * 3) / 2) + offY);

      zpl.push('^FO' + colT + ',' + y0 + '^A0N,' + h1 + ',' + w1 + '^FD' + line1 + '^FS');
      zpl.push('^FO' + colT + ',' + (y0 + step) + '^A0N,' + h2 + ',' + w2 + '^FD' + line2 + '^FS');
      zpl.push('^FO' + colT + ',' + (y0 + step * 2) + '^A0N,' + h3 + ',' + w3 + '^FD' + line3 + '^FS');
      zpl.push('^PQ' + copies + ',0,1,Y');
      zpl.push('^XZ');
      return { zpl: zpl.join('\n') + '\n', count: copies, title: line1, metrics: m };
    }

    // ---- PLANTILLA LOTE (50x20 mm Estándar vs 60x40 mm Grande) ----
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
    const isSixRows = nRows > 5;

    let rowStepDots;
    let titleTargetH;
    let titleTargetW;
    let subTargetH;
    let subTargetW;
    let fieldTargetH;
    let labelCharTargetW;

    if (isLarge) {
      // Preset 60 x 40 mm (320 dots de alto a 203 dpi) -> fuentes grandes y centrado amplio
      const extraHScale = Math.max(0.75, Math.min(1.6, m.heightMm / 40));
      rowStepDots = Math.round((isSixRows ? 39 : 46) * scale * extraHScale);
      titleTargetH = (isSixRows ? 30 : 34) * extraHScale;
      titleTargetW = (isSixRows ? 21 : 23) * extraHScale;
      subTargetH = 24 * extraHScale;
      subTargetW = 18 * extraHScale;
      fieldTargetH = (isSixRows ? 23 : 26) * extraHScale;
      labelCharTargetW = (isSixRows ? 17 : 19) * extraHScale;
    } else {
      // Preset 50 x 20 mm (160 dots de alto a 203 dpi) -> optimizado compacto sin recortes
      const extraHScale = Math.max(0.75, Math.min(1.5, m.heightMm / 20));
      rowStepDots = Math.round((isSixRows ? 22 : 26) * scale * extraHScale);
      titleTargetH = (isSixRows ? 19 : 22) * extraHScale;
      titleTargetW = (isSixRows ? 14.5 : 16.5) * extraHScale;
      subTargetH = 16 * extraHScale;
      subTargetW = 13 * extraHScale;
      fieldTargetH = (isSixRows ? 16 : 18) * extraHScale;
      labelCharTargetW = (isSixRows ? 12 : 14) * extraHScale;
    }

    const blockH = rowStepDots * nRows;
    const baseY = Math.max(Math.round((isLarge ? 16 : 5) * scale), Math.round((ll - blockH) / 2));

    const titleH = Math.round(titleTargetH * scale);
    const titleW = fitFontWidth(safeTitle, titleTargetW * scale, fullRightWidth, Math.round(8 * scale));

    const subH = Math.round(subTargetH * scale);
    const subW = fitFontWidth(safeSubtitle, subTargetW * scale, fullRightWidth, Math.round(7 * scale));

    const fieldH = Math.round(fieldTargetH * scale);
    const labelCharW = Math.round(labelCharTargetW * scale);

    const labelColW = Math.min(
      Math.round(fullRightWidth * 0.44),
      Math.round(12 * labelCharW * 0.56) + Math.round((isLarge ? 8 : 5) * scale)
    );
    const colV = colT + labelColW;
    const maxValWidth = Math.max(Math.round(50 * scale), fullRightWidth - labelColW);

    for (let i = 0; i < nRows; i++) {
      const row = rows[i];
      const y = Math.max(0, baseY + i * rowStepDots + offY);

      if (row.kind === 'title') {
        zpl.push('^FO' + colT + ',' + y + '^A0N,' + titleH + ',' + titleW + '^FD' + row.value + '^FS');
      } else if (row.kind === 'subtitle') {
        zpl.push('^FO' + colT + ',' + y + '^A0N,' + subH + ',' + subW + '^FD' + row.value + '^FS');
      } else {
        zpl.push('^FO' + colT + ',' + y + '^A0N,' + fieldH + ',' + labelCharW + '^FD' + row.label + '^FS');
        if (row.value) {
          const valBaseW = m.uniformBold ? labelCharW : Math.max(Math.round(7 * scale), labelCharW - Math.round(scale));
          const valW = fitFontWidth(row.value, valBaseW, maxValWidth, Math.round(7 * scale));
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
    PAPER_PRESETS: PAPER_PRESETS,
    loadLogo: loadLogo,
    setLogoSource: setLogoSource,
    buildLogoGfa: buildLogoGfa,
    computeLayoutMetrics: computeLayoutMetrics,
    generateLotZpl: generateLotZpl
  };
})(window);
