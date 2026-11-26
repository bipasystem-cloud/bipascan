/**
 * BIPA Etiquetas · Motor ZPL II nativo para Zebra ZD410
 * Soporta todas las plantillas extraídas de ETIQUETAS LOTES (57 x 19 mm):
 * - 'lot': Aromas (logo ancho 172/456, 5 filas), Intenciones y Pack x2 (logo compacto 138/456)
 * - 'simple': Solo Aroma, Aroma 240 g, Muestras MM y Mechas (logo ^GFA + título grande + peso opcional)
 * - 'shipping': Etiquetas de Envío (logo ^GFA + Envío a / Remite / Tel)
 * - 'barcode': Códigos de barras EAN-13 (^BEN) + CPE (formato estándar GS1, medidas o 4 por etiqueta)
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
    const widthMm = Number(cal.widthMm) || 57;
    const heightMm = Number(cal.heightMm) || 19;

    const pw = Math.max(200, Math.round(widthMm * dotsPerMm));
    const ll = Math.max(80, Math.round(heightMm * dotsPerMm));

    const template = data.template || 'lot';
    const category = data.category || 'aromas';
    const hasSubtitle = category === 'packx2' || Boolean(String(data.subtitle || '').trim());
    const compactLogo = template !== 'lot' || category !== 'aromas' || Boolean(data.compactLogo || hasSubtitle);
    const uniformBold = template === 'lot' && (category !== 'aromas' || Boolean(data.uniformBold));

    const logoWidthRatio = template === 'lot'
      ? (compactLogo ? (138 / 456) : (172 / 456))
      : (146 / 456);
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

  function buildBarcodeCellZpl(lines, data, cal, cellX, cellY, cellW, cellH, scale, isCompactCell) {
    const safeName = sanitizeZplField(data.labelTitle || data.name || 'BIPA');
    const cleanEan = String(data.ean13 || '').replace(/\D/g, '').slice(0, 13) || '7596246002876';
    const safeCpe = sanitizeZplField(data.cpe || '');

    const padX = Math.round((isCompactCell ? 6 : 16) * scale);
    const padY = Math.round((isCompactCell ? 3 : 8) * scale);
    const innerW = Math.max(Math.round(80 * scale), cellW - padX * 2);

    const nameH = Math.round((isCompactCell ? 13 : 22) * scale);
    const nameW = fitFontWidth(safeName, (isCompactCell ? 11 : 17) * scale, innerW, Math.round(7 * scale));

    const cpeText = safeCpe ? ('CPE ' + safeCpe) : '';
    const cpeH = Math.round((isCompactCell ? 12 : 19) * scale);
    const cpeW = fitFontWidth(cpeText, (isCompactCell ? 10 : 15) * scale, innerW, Math.round(7 * scale));

    // EAN-13 tiene 95 módulos + dígitos; módulo 2 dots en estándar (190 dots) o 1 dot en celdas pequeñas
    const moduleW = isCompactCell || cellW < Math.round(230 * scale)
      ? Math.max(1, Math.round(1 * scale))
      : Math.max(2, Math.round(2 * scale));
    const barcodeVisualW = moduleW * 105;
    const barX = cellX + Math.max(padX, Math.round((cellW - barcodeVisualW) / 2));

    const nameY = cellY + padY;
    const cpeY = cellY + cellH - padY - cpeH;
    const barY = nameY + nameH + Math.round((isCompactCell ? 3 : 6) * scale);
    const barH = Math.max(
      Math.round((isCompactCell ? 24 : 44) * scale),
      cpeY - barY - Math.round((isCompactCell ? 10 : 18) * scale)
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
              cal,
              Math.max(0, c * halfW + offX),
              Math.max(0, r * halfH + offY),
              halfW,
              halfH,
              scale,
              true
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
        buildBarcodeCellZpl(zpl, data, cal, startX, startY, areaW, areaH, scale, areaH < Math.round(105 * scale));
      }

      zpl.push('^PQ' + copies + ',0,1,Y');
      zpl.push('^XZ');
      return { zpl: zpl.join('\n') + '\n', count: copies, title: safeTitle, metrics: m };
    }

    // ---- BLOQUE IZQUIERDO COMPARTIDO: LOGO ^GFA + LÍNEA DIVISORIA ^GB ----
    const marginLeft = Math.round(2 * scale);
    const logoX = Math.max(0, marginLeft + offX);
    const logoY = Math.max(0, Math.round((ll - m.logoH) / 2) + offY);
    const logoGfa = buildLogoGfa(m.logoW, m.logoH);

    const dividerGap = Math.round(4 * scale);
    const dividerThick = Math.max(2, Math.round(2 * scale));
    const dividerPadY = Math.round(6 * scale);
    const dividerX = Math.max(0, marginLeft + m.logoW + dividerGap + offX);
    const dividerY = Math.max(0, dividerPadY + offY);
    const dividerH = Math.max(20, ll - dividerPadY * 2);

    const colT = Math.max(0, dividerX + dividerThick + Math.round(6 * scale));
    const marginRight = Math.round(4 * scale);
    const fullRightWidth = Math.max(
      Math.round(100 * scale),
      pw - (colT - offX) - marginRight
    );

    if (logoGfa) {
      zpl.push('^FO' + logoX + ',' + logoY + logoGfa.command + '^FS');
    }
    zpl.push('^FO' + dividerX + ',' + dividerY + '^GB' + dividerThick + ',' + dividerH + ',' + dividerThick + '^FS');

    // ---- PLANTILLA SIMPLE (Solo Aroma, Aroma 240 g, Muestras MM, Mechas) ----
    if (m.template === 'simple') {
      const safeWeight = sanitizeZplField(data.weightText || '');
      const titleH = Math.round((safeWeight ? 30 : 34) * scale);
      const titleW = fitFontWidth(safeTitle, (safeWeight ? 22 : 25) * scale, fullRightWidth, Math.round(10 * scale));
      if (safeWeight) {
        const wH = Math.round(24 * scale);
        const wW = fitFontWidth(safeWeight, 19 * scale, fullRightWidth, Math.round(10 * scale));
        const totalH = titleH + Math.round(12 * scale) + wH;
        const y0 = Math.max(Math.round(8 * scale), Math.round((ll - totalH) / 2) + offY);
        zpl.push('^FO' + colT + ',' + y0 + '^A0N,' + titleH + ',' + titleW + '^FD' + safeTitle + '^FS');
        zpl.push('^FO' + colT + ',' + (y0 + titleH + Math.round(12 * scale)) + '^A0N,' + wH + ',' + wW + '^FD' + safeWeight + '^FS');
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

      const h1 = Math.round(26 * scale);
      const w1 = fitFontWidth(line1, 19 * scale, fullRightWidth, Math.round(9 * scale));
      const h2 = Math.round(21 * scale);
      const w2 = fitFontWidth(line2, 16 * scale, fullRightWidth, Math.round(9 * scale));
      const h3 = Math.round(21 * scale);
      const w3 = fitFontWidth(line3, 16 * scale, fullRightWidth, Math.round(9 * scale));

      const step = Math.round(36 * scale);
      const y0 = Math.max(Math.round(8 * scale), Math.round((ll - step * 3) / 2) + offY);

      zpl.push('^FO' + colT + ',' + y0 + '^A0N,' + h1 + ',' + w1 + '^FD' + line1 + '^FS');
      zpl.push('^FO' + colT + ',' + (y0 + step) + '^A0N,' + h2 + ',' + w2 + '^FD' + line2 + '^FS');
      zpl.push('^FO' + colT + ',' + (y0 + step * 2) + '^A0N,' + h3 + ',' + w3 + '^FD' + line3 + '^FS');
      zpl.push('^PQ' + copies + ',0,1,Y');
      zpl.push('^XZ');
      return { zpl: zpl.join('\n') + '\n', count: copies, title: line1, metrics: m };
    }

    // ---- PLANTILLA LOTE (Aromas, Intenciones, Pack x2) ----
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

    const labelColW = Math.min(
      Math.round(fullRightWidth * 0.43),
      Math.round(12 * labelCharW * 0.56) + Math.round(6 * scale)
    );
    const colV = colT + labelColW;
    const maxValWidth = Math.max(Math.round(60 * scale), fullRightWidth - labelColW);

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
