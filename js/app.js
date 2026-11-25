/**
 * BIPA Etiquetas QR · Controlador principal de la aplicación
 */
(function () {
  'use strict';

  const QR_MODE_LABELS = {
    serial: 'Solo correlativo',
    all: 'Todos los datos',
    custom: 'Personalizado'
  };

  const els = {
    printerStatusBadge: document.getElementById('printerStatusBadge'),
    printerStatusText: document.getElementById('printerStatusText'),
    printerDeviceInfo: document.getElementById('printerDeviceInfo'),
    btnConnectUsb: document.getElementById('btnConnectUsb'),
    btnConnectLabel: document.getElementById('btnConnectLabel'),
    btnConnectAny: document.getElementById('btnConnectAny'),

    alertBanner: document.getElementById('alertBanner'),
    alertIcon: document.getElementById('alertIcon'),
    alertMessage: document.getElementById('alertMessage'),
    btnCloseAlert: document.getElementById('btnCloseAlert'),

    previewMetaChip: document.getElementById('previewMetaChip'),
    btnOpenZoom: document.getElementById('btnOpenZoom'),
    thermalLabel: document.getElementById('thermalLabel'),
    previewTapQr: document.getElementById('previewTapQr'),
    qrCanvasWrap: document.getElementById('qrCanvasWrap'),
    previewBrandHeader: document.getElementById('previewBrandHeader'),
    previewSloganText: document.getElementById('previewSloganText'),
    previewLine1: document.getElementById('previewLine1'),
    previewLine2: document.getElementById('previewLine2'),
    previewLine3: document.getElementById('previewLine3'),
    previewQrModeBadge: document.getElementById('previewQrModeBadge'),
    previewQrChars: document.getElementById('previewQrChars'),
    btnQuickEditQr: document.getElementById('btnQuickEditQr'),
    previewQrPayload: document.getElementById('previewQrPayload'),
    previewBatchWrap: document.getElementById('previewBatchWrap'),
    previewBatchBadge: document.getElementById('previewBatchBadge'),

    zoomModal: document.getElementById('zoomModal'),
    zoomModalTitle: document.getElementById('zoomModalTitle'),
    btnToggleRotate: document.getElementById('btnToggleRotate'),
    btnRotateLabel: document.getElementById('btnRotateLabel'),
    btnCloseZoom: document.getElementById('btnCloseZoom'),
    zoomStage: document.getElementById('zoomStage'),
    zoomLabelFrame: document.getElementById('zoomLabelFrame'),
    zoomThermalLabel: document.getElementById('zoomThermalLabel'),
    zoomQrCanvasWrap: document.getElementById('zoomQrCanvasWrap'),
    zoomBrandHeader: document.getElementById('zoomBrandHeader'),
    zoomSloganText: document.getElementById('zoomSloganText'),
    zoomLine1: document.getElementById('zoomLine1'),
    zoomLine2: document.getElementById('zoomLine2'),
    zoomLine3: document.getElementById('zoomLine3'),
    zoomQrPayload: document.getElementById('zoomQrPayload'),

    qrEditorSection: document.getElementById('qrEditorSection'),
    qrModeSerial: document.getElementById('qrModeSerial'),
    qrModeAll: document.getElementById('qrModeAll'),
    qrModeCustom: document.getElementById('qrModeCustom'),
    qrAutoInfoBox: document.getElementById('qrAutoInfoBox'),
    qrAutoInfoText: document.getElementById('qrAutoInfoText'),
    qrCustomPanel: document.getElementById('qrCustomPanel'),
    inputCustomQr: document.getElementById('inputCustomQr'),
    btnPasteQr: document.getElementById('btnPasteQr'),
    btnClearQr: document.getElementById('btnClearQr'),
    customQrCharCount: document.getElementById('customQrCharCount'),
    customQrLengthHint: document.getElementById('customQrLengthHint'),

    inputPrefix: document.getElementById('inputPrefix'),
    inputSerial: document.getElementById('inputSerial'),
    toggleAutoincrement: document.getElementById('toggleAutoincrement'),
    autoincrementHint: document.getElementById('autoincrementHint'),
    sloganToggleCard: document.getElementById('sloganToggleCard'),
    toggleSlogan: document.getElementById('toggleSlogan'),
    inputCode: document.getElementById('inputCode'),
    inputLot: document.getElementById('inputLot'),
    inputWeight: document.getElementById('inputWeight'),
    inputExpiry: document.getElementById('inputExpiry'),
    inputQuantity: document.getElementById('inputQuantity'),
    btnQtyMinus: document.getElementById('btnQtyMinus'),
    btnQtyPlus: document.getElementById('btnQtyPlus'),

    btnPrintUsb: document.getElementById('btnPrintUsb'),
    btnPrintUsbLabel: document.getElementById('btnPrintUsbLabel'),
    btnPrintUsbSub: document.getElementById('btnPrintUsbSub'),
    btnPrintRawbt: document.getElementById('btnPrintRawbt'),

    btnDpi203: document.getElementById('btnDpi203'),
    btnDpi300: document.getElementById('btnDpi300'),
    inputWidthMm: document.getElementById('inputWidthMm'),
    inputHeightMm: document.getElementById('inputHeightMm'),
    inputOffsetX: document.getElementById('inputOffsetX'),
    inputOffsetY: document.getElementById('inputOffsetY'),
    inputQrMag: document.getElementById('inputQrMag'),
    qrMagValue: document.getElementById('qrMagValue'),
    btnToggleZpl: document.getElementById('btnToggleZpl'),
    btnCopyZpl: document.getElementById('btnCopyZpl'),
    zplCodeContainer: document.getElementById('zplCodeContainer'),
    zplStats: document.getElementById('zplStats'),
    zplCodeOutput: document.getElementById('zplCodeOutput'),
    btnResetCalibration: document.getElementById('btnResetCalibration'),

    toast: document.getElementById('toast')
  };

  let calibration = BipaStorage.loadCalibration();
  let formState = Object.assign({}, BipaStorage.DEFAULT_FORM, BipaStorage.loadCorrelativeState());
  let lastQrPayloadRendered = null;
  let lastQrSvg = '';
  let toastTimer = null;
  let isPrinting = false;
  let isZoomRotated = false;

  /* ------------------------------------------------------------------------
     Avisos, Toast y enfoque interactivo
     ------------------------------------------------------------------------ */
  function showAlert(message, type) {
    const kind = type || 'error';
    els.alertBanner.className = 'alert-banner is-' + kind;
    els.alertIcon.textContent = kind === 'success' ? '✓' : kind === 'warning' ? '!' : '⚠';
    els.alertMessage.textContent = message;
    els.alertBanner.hidden = false;
  }

  function hideAlert() {
    els.alertBanner.hidden = true;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      els.toast.hidden = true;
    }, 2800);
  }

  function pulseElement(el) {
    if (!el) return;
    el.classList.remove('is-highlighted');
    void el.offsetWidth;
    el.classList.add('is-highlighted');
  }

  function focusAndScrollTo(inputEl, containerEl, selectAll) {
    const scrollTarget = containerEl || inputEl;
    if (scrollTarget && typeof scrollTarget.scrollIntoView === 'function') {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    pulseElement(containerEl || inputEl);
    if (inputEl && typeof inputEl.focus === 'function') {
      setTimeout(function () {
        inputEl.focus({ preventScroll: true });
        if (selectAll && typeof inputEl.select === 'function') {
          inputEl.select();
        }
      }, 220);
    }
  }

  /* ------------------------------------------------------------------------
     Modal de vista ampliada
     ------------------------------------------------------------------------ */
  function applyZoomRotation(rotated) {
    isZoomRotated = Boolean(rotated);
    els.zoomLabelFrame.classList.toggle('is-rotated', isZoomRotated);
    els.btnToggleRotate.setAttribute('aria-pressed', String(isZoomRotated));
    els.btnRotateLabel.textContent = isZoomRotated ? 'Horizontal' : 'Rotar 90°';
  }

  function openZoomModal() {
    renderLivePreview();
    // En teléfonos verticales, rotar 90° aprovecha toda la altura de la pantalla
    const isPortraitMobile = window.innerHeight > window.innerWidth && window.innerWidth < 680;
    applyZoomRotation(isPortraitMobile);
    els.zoomModal.hidden = false;
    document.body.classList.add('modal-open');
    els.btnCloseZoom.focus();
  }

  function closeZoomModal() {
    if (els.zoomModal.hidden) return;
    els.zoomModal.hidden = true;
    document.body.classList.remove('modal-open');
    els.btnOpenZoom.focus();
  }

  /* ------------------------------------------------------------------------
     Estado de impresora
     ------------------------------------------------------------------------ */
  function renderPrinterStatus(info) {
    const connected = Boolean(info && info.connected);

    els.printerStatusBadge.classList.toggle('is-connected', connected);
    els.printerStatusBadge.classList.toggle('is-disconnected', !connected);
    els.printerStatusText.textContent = connected ? 'Conectada' : 'Desconectada';

    els.btnConnectUsb.classList.toggle('is-connected', connected);
    els.btnConnectLabel.textContent = connected ? 'Desconectar Zebra' : 'Conectar Zebra (USB)';

    if (connected) {
      els.printerDeviceInfo.textContent = info.deviceName || 'Zebra ZD410 conectada por USB';
      els.btnConnectAny.textContent = 'Cambiar USB';
      els.btnPrintUsbSub.textContent = 'Lista para enviar ZPL II directo por USB';
    } else {
      els.printerDeviceInfo.textContent = BipaZebraUSB.isWebUsbSupported()
        ? 'Cable USB OTG · VID 0x0A5F'
        : 'WebUSB no disponible · Usa RawBT';
      els.btnConnectAny.textContent = 'Otro USB';
      els.btnPrintUsbSub.textContent = 'Envío directo ZPL II por WebUSB';
    }

    if (info && info.reason === 'unplugged') {
      showAlert('Se desconectó el cable USB OTG de la impresora Zebra. Vuelve a conectarlo para imprimir.', 'warning');
    }
  }

  /* ------------------------------------------------------------------------
     Sincronización UI <-> Estado
     ------------------------------------------------------------------------ */
  function applyStateToInputs() {
    els.inputPrefix.value = formState.prefix;
    els.inputSerial.value = formState.serial;
    els.toggleAutoincrement.checked = formState.autoincrement;
    els.toggleSlogan.checked = formState.showSlogan;
    els.inputCode.value = formState.code;
    els.inputLot.value = formState.lot;
    els.inputWeight.value = formState.weight;
    els.inputExpiry.value = formState.expiry;
    els.inputCustomQr.value = formState.customQrText;
    els.inputQuantity.value = String(formState.quantity);

    setQrModeButtons(formState.qrMode);

    // Calibración
    setDpiButtons(calibration.dpi);
    els.inputWidthMm.value = String(calibration.widthMm);
    els.inputHeightMm.value = String(calibration.heightMm);
    els.inputOffsetX.value = String(calibration.offsetX);
    els.inputOffsetY.value = String(calibration.offsetY);
    els.inputQrMag.value = String(calibration.qrMag);
    els.qrMagValue.textContent = String(calibration.qrMag);
  }

  function setQrModeButtons(mode) {
    const normalized = mode === 'all' || mode === 'custom' ? mode : 'serial';
    const buttons = [
      { el: els.qrModeSerial, key: 'serial' },
      { el: els.qrModeAll, key: 'all' },
      { el: els.qrModeCustom, key: 'custom' }
    ];

    buttons.forEach(function (item) {
      const active = item.key === normalized;
      item.el.classList.toggle('is-active', active);
      item.el.setAttribute('aria-selected', String(active));
    });

    const isCustom = normalized === 'custom';
    els.qrCustomPanel.hidden = !isCustom;
    els.qrAutoInfoBox.hidden = isCustom;

    if (normalized === 'serial') {
      els.qrAutoInfoText.textContent = 'Codifica únicamente el correlativo actual (ej. PAR-0000009). Máxima rapidez de lectura.';
    } else if (normalized === 'all') {
      els.qrAutoInfoText.textContent = 'Concatena automáticamente correlativo, código, lote, peso y vencimiento separados por «|».';
    }
  }

  function setDpiButtons(dpi) {
    const is203 = Number(dpi) !== 300;
    els.btnDpi203.classList.toggle('is-active', is203);
    els.btnDpi203.setAttribute('aria-checked', String(is203));
    els.btnDpi300.classList.toggle('is-active', !is203);
    els.btnDpi300.setAttribute('aria-checked', String(!is203));
  }

  function readFormStateFromInputs() {
    const qtyRaw = parseInt(els.inputQuantity.value, 10);
    formState.prefix = els.inputPrefix.value;
    formState.serial = els.inputSerial.value;
    formState.autoincrement = els.toggleAutoincrement.checked;
    formState.showSlogan = els.toggleSlogan.checked;
    formState.code = els.inputCode.value;
    formState.lot = els.inputLot.value;
    formState.weight = els.inputWeight.value;
    formState.expiry = els.inputExpiry.value;
    formState.customQrText = els.inputCustomQr.value;
    formState.quantity = Number.isFinite(qtyRaw) ? Math.max(1, Math.min(500, qtyRaw)) : 1;
  }

  function readCalibrationFromInputs() {
    calibration = BipaStorage.saveCalibration({
      dpi: calibration.dpi,
      widthMm: parseFloat(els.inputWidthMm.value) || 50,
      heightMm: parseFloat(els.inputHeightMm.value) || 20,
      offsetX: parseInt(els.inputOffsetX.value, 10) || 0,
      offsetY: parseInt(els.inputOffsetY.value, 10) || 0,
      qrMag: parseInt(els.inputQrMag.value, 10) || 4
    });
    els.qrMagValue.textContent = String(calibration.qrMag);
  }

  /* ------------------------------------------------------------------------
     Contador y aviso de longitud para el QR personalizado
     ------------------------------------------------------------------------ */
  function renderCustomQrMetrics() {
    const len = formState.customQrText.trim().length;
    const labelSizeText = calibration.widthMm + ' × ' + calibration.heightMm + ' mm';
    els.customQrCharCount.textContent = len === 1 ? '1 carácter' : len + ' caracteres';

    els.customQrLengthHint.classList.remove('is-ok', 'is-medium', 'is-warning');

    if (len === 0) {
      els.customQrLengthHint.classList.add('is-medium');
      els.customQrLengthHint.textContent = 'Vacío: mientras escribes se usará el correlativo.';
    } else if (len <= 45) {
      els.customQrLengthHint.classList.add('is-ok');
      els.customQrLengthHint.textContent = 'Tamaño ideal para QR en ' + labelSizeText + '.';
    } else if (len <= 85) {
      els.customQrLengthHint.classList.add('is-medium');
      els.customQrLengthHint.textContent = 'Texto mediano: prueba el escaneo en ' + labelSizeText + '.';
    } else {
      els.customQrLengthHint.classList.add('is-warning');
      els.customQrLengthHint.textContent = 'Muy largo para ' + labelSizeText + ': el QR saldrá denso y puede costar leerlo.';
    }
  }

  /* ------------------------------------------------------------------------
     Render en vivo: Vista previa principal, Modal ampliado y ZPL
     ------------------------------------------------------------------------ */
  function applyLabelSurfaceGeometry(labelEl, metrics) {
    labelEl.style.aspectRatio = calibration.widthMm + ' / ' + calibration.heightMm;
    labelEl.style.setProperty('--qr-col-w', metrics.previewQrWidthPercent + '%');
  }

  function renderLivePreview() {
    const lines = BipaZPL.buildLabelLines(formState);
    const metrics = BipaZPL.computeLayoutMetrics(lines, calibration);
    const batch = BipaZPL.generateBatchZpl(formState, calibration);
    const metaLabel = calibration.widthMm + ' × ' + calibration.heightMm + ' mm · ' + calibration.dpi + ' dpi';

    // Proporción exacta en mm y ancho dinámico de la columna QR según calibración (^BQN)
    applyLabelSurfaceGeometry(els.thermalLabel, metrics);
    applyLabelSurfaceGeometry(els.zoomThermalLabel, metrics);

    els.previewMetaChip.textContent = metaLabel;
    els.zoomModalTitle.textContent = metaLabel;

    // Encabezado de marca monocromático (logo + eslogan) y 3 líneas térmicas
    const showBrand = Boolean(lines.showSlogan);
    const line1Text = lines.line1 || '—';
    const line2Text = lines.line2 || '\u00A0';
    const line3Text = lines.line3 || '\u00A0';

    els.previewBrandHeader.hidden = !showBrand;
    els.previewSloganText.textContent = BipaZPL.BIPA_SLOGAN;
    els.previewLine1.textContent = line1Text;
    els.previewLine2.textContent = line2Text;
    els.previewLine3.textContent = line3Text;

    // Sincronizar copia del modal ampliado
    els.zoomBrandHeader.hidden = !showBrand;
    els.zoomSloganText.textContent = BipaZPL.BIPA_SLOGAN;
    els.zoomLine1.textContent = line1Text;
    els.zoomLine2.textContent = line2Text;
    els.zoomLine3.textContent = line3Text;

    // Código QR SVG nítido (solo regenera si cambió el payload)
    if (lines.qrPayload !== lastQrPayloadRendered) {
      lastQrSvg = BipaQR.toSvg(lines.qrPayload, 2);
      els.qrCanvasWrap.innerHTML = lastQrSvg;
      els.zoomQrCanvasWrap.innerHTML = lastQrSvg;
      lastQrPayloadRendered = lines.qrPayload;
    }

    // Recuadro compacto con el texto exacto del QR en tiempo real
    els.previewQrModeBadge.textContent = QR_MODE_LABELS[formState.qrMode] || QR_MODE_LABELS.serial;
    els.previewQrChars.textContent = lines.qrPayload.length + ' car.';
    els.previewQrPayload.textContent = lines.qrPayload;
    els.zoomQrPayload.textContent = lines.qrPayload;

    // Métricas del panel Personalizado
    renderCustomQrMetrics();

    // Indicador de lote correlativo
    if (formState.quantity > 1 && formState.autoincrement) {
      els.previewBatchBadge.textContent =
        formState.quantity + ' uds: ' + batch.firstCorrelative + ' → ' + batch.lastCorrelative;
      els.previewBatchWrap.hidden = false;
      els.autoincrementHint.textContent =
        'Imprimirá del ' +
        batch.firstCorrelative +
        ' al ' +
        batch.lastCorrelative +
        ' y dejará listo el ' +
        formState.prefix +
        batch.nextSerial +
        '.';
    } else if (formState.autoincrement) {
      els.previewBatchWrap.hidden = true;
      els.autoincrementHint.textContent =
        'Al imprimir avanzará automáticamente al ' + formState.prefix + batch.nextSerial + '.';
    } else {
      els.previewBatchWrap.hidden = true;
      els.autoincrementHint.textContent =
        'Desactivado: todas las copias saldrán con ' + lines.correlative + '.';
    }

    // Etiqueta del botón principal de impresión
    if (!isPrinting) {
      els.btnPrintUsbLabel.textContent =
        formState.quantity > 1
          ? 'Imprimir ' + formState.quantity + ' etiquetas en Zebra'
          : 'Imprimir en Zebra';
    }

    // Actualizar visor ZPL si está abierto
    if (!els.zplCodeContainer.hidden) {
      renderZplPreview(batch);
    }

    return batch;
  }

  function renderZplPreview(batchObj) {
    const batch = batchObj || BipaZPL.generateBatchZpl(formState, calibration);
    const labelWord = batch.count === 1 ? 'etiqueta' : 'etiquetas';
    els.zplStats.textContent =
      batch.count +
      ' ' +
      labelWord +
      ' · ' +
      calibration.dpi +
      ' dpi · ' +
      calibration.widthMm +
      '×' +
      calibration.heightMm +
      ' mm';
    els.zplCodeOutput.textContent = batch.zpl;
  }

  function persistState() {
    BipaStorage.saveCorrelativeState({
      prefix: formState.prefix,
      serial: formState.serial,
      autoincrement: formState.autoincrement,
      showSlogan: formState.showSlogan,
      qrMode: formState.qrMode,
      customQrText: formState.customQrText
    });
  }

  function advanceSerialAfterPrint(batch) {
    if (!formState.autoincrement) return;
    formState.serial = batch.nextSerial;
    els.inputSerial.value = formState.serial;
    persistState();
    renderLivePreview();
  }

  /* ------------------------------------------------------------------------
     Acciones del editor QR (Pegar / Limpiar / Tocar en vista previa)
     ------------------------------------------------------------------------ */
  function openQrEditorForEdit(preferCustom) {
    if (preferCustom && formState.qrMode !== 'custom') {
      if (!formState.customQrText.trim()) {
        const currentLines = BipaZPL.buildLabelLines(formState);
        formState.customQrText = currentLines.qrPayload;
        els.inputCustomQr.value = formState.customQrText;
      }
      formState.qrMode = 'custom';
      setQrModeButtons('custom');
      persistState();
      renderLivePreview();
    }

    if (formState.qrMode === 'custom') {
      focusAndScrollTo(els.inputCustomQr, els.qrEditorSection, false);
    } else {
      focusAndScrollTo(els.qrModeCustom, els.qrEditorSection, false);
    }
  }

  async function handlePasteQr() {
    if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
      els.inputCustomQr.focus();
      showToast('Mantén presionado el campo para pegar desde tu teléfono');
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        showToast('El portapapeles está vacío');
        return;
      }
      formState.customQrText = text.slice(0, 280);
      els.inputCustomQr.value = formState.customQrText;
      persistState();
      renderLivePreview();
      els.inputCustomQr.focus();
      showToast('Texto pegado en el QR');
    } catch (_err) {
      els.inputCustomQr.focus();
      showToast('Permite acceso al portapapeles o pega manualmente en el campo');
    }
  }

  function handleClearQr() {
    formState.customQrText = '';
    els.inputCustomQr.value = '';
    persistState();
    renderLivePreview();
    els.inputCustomQr.focus();
    showToast('Texto personalizado limpiado');
  }

  /* ------------------------------------------------------------------------
     Acciones USB y RawBT
     ------------------------------------------------------------------------ */
  async function handleConnectUsb(broadMode) {
    hideAlert();

    if (!broadMode && BipaZebraUSB.isConnected()) {
      await BipaZebraUSB.disconnect();
      showToast('Impresora desconectada');
      return;
    }

    els.btnConnectUsb.disabled = true;
    els.btnConnectAny.disabled = true;
    try {
      const name = await BipaZebraUSB.connect({ broadMode: broadMode });
      showToast('Conectada: ' + name);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      els.btnConnectUsb.disabled = false;
      els.btnConnectAny.disabled = false;
    }
  }

  async function handlePrintUsb() {
    hideAlert();
    readFormStateFromInputs();
    if (formState.showSlogan) {
      await BipaZPL.loadLogo();
    }
    const batch = renderLivePreview();

    if (!BipaZebraUSB.isWebUsbSupported()) {
      showAlert(
        'Este navegador no soporta WebUSB. Abre esta app en Google Chrome en Android (HTTPS) o pulsa «Imprimir vía RawBT».',
        'warning'
      );
      return;
    }

    if (!BipaZebraUSB.isConnected()) {
      try {
        await BipaZebraUSB.connect({ broadMode: false });
      } catch (err) {
        showAlert(err.message, 'error');
        return;
      }
    }

    isPrinting = true;
    els.btnPrintUsb.disabled = true;
    els.btnPrintUsbLabel.textContent = 'Enviando a Zebra…';

    try {
      await BipaZebraUSB.printZpl(batch.zpl);
      const msg =
        batch.count === 1
          ? 'Etiqueta ' + batch.firstCorrelative + ' enviada a Zebra.'
          : batch.count + ' etiquetas (' + batch.firstCorrelative + ' a ' + batch.lastCorrelative + ') enviadas a Zebra.';
      advanceSerialAfterPrint(batch);
      showToast(msg);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      isPrinting = false;
      els.btnPrintUsb.disabled = false;
      renderLivePreview();
    }
  }

  async function handlePrintRawbt() {
    hideAlert();
    readFormStateFromInputs();
    if (formState.showSlogan) {
      await BipaZPL.loadLogo();
    }
    const batch = renderLivePreview();

    try {
      BipaZebraUSB.printViaRawBT(batch.zpl);
      const msg =
        batch.count === 1
          ? 'Abriendo RawBT con ' + batch.firstCorrelative + '…'
          : 'Abriendo RawBT (' + batch.count + ' etiquetas: ' + batch.firstCorrelative + ' → ' + batch.lastCorrelative + ')…';
      advanceSerialAfterPrint(batch);
      showToast(msg);
    } catch (err) {
      showAlert('No se pudo abrir RawBT: ' + err.message, 'error');
    }
  }

  async function handleCopyZpl() {
    if (formState.showSlogan) {
      await BipaZPL.loadLogo();
    }
    const batch = BipaZPL.generateBatchZpl(formState, calibration);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(batch.zpl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = batch.zpl;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast('Código ZPL II copiado al portapapeles');
    } catch (_err) {
      showAlert('No se pudo copiar automáticamente. Abre «Ver código ZPL II» para seleccionarlo.', 'warning');
    }
  }

  /* ------------------------------------------------------------------------
     Eventos del DOM
     ------------------------------------------------------------------------ */
  function bindEvents() {
    // Conexión USB
    els.btnConnectUsb.addEventListener('click', function () {
      handleConnectUsb(false);
    });
    els.btnConnectAny.addEventListener('click', function () {
      handleConnectUsb(true);
    });
    els.btnCloseAlert.addEventListener('click', hideAlert);

    // Vista ampliada (modal fullscreen)
    els.btnOpenZoom.addEventListener('click', openZoomModal);
    els.btnCloseZoom.addEventListener('click', closeZoomModal);
    els.btnToggleRotate.addEventListener('click', function () {
      applyZoomRotation(!isZoomRotated);
    });
    els.zoomStage.addEventListener('click', function (ev) {
      if (ev.target === els.zoomStage) {
        closeZoomModal();
      }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !els.zoomModal.hidden) {
        closeZoomModal();
      }
    });

    // Interactividad directa en la vista previa térmica
    els.previewTapQr.addEventListener('click', function () {
      openQrEditorForEdit(false);
    });
    els.btnQuickEditQr.addEventListener('click', function () {
      openQrEditorForEdit(true);
    });
    els.previewBrandHeader.addEventListener('click', function () {
      focusAndScrollTo(els.toggleSlogan, els.sloganToggleCard, false);
    });
    els.previewLine1.addEventListener('click', function () {
      focusAndScrollTo(els.inputSerial, null, true);
    });
    els.previewLine2.addEventListener('click', function () {
      focusAndScrollTo(els.inputCode, null, true);
    });
    els.previewLine3.addEventListener('click', function () {
      focusAndScrollTo(els.inputWeight, null, true);
    });

    // Pestañas del bloque "Contenido del código QR" (3 modos)
    [els.qrModeSerial, els.qrModeAll, els.qrModeCustom].forEach(function (btn) {
      btn.addEventListener('click', function () {
        const nextMode = btn.dataset.qrMode;
        formState.qrMode = nextMode === 'all' || nextMode === 'custom' ? nextMode : 'serial';
        setQrModeButtons(formState.qrMode);
        persistState();
        renderLivePreview();
        if (formState.qrMode === 'custom') {
          setTimeout(function () {
            els.inputCustomQr.focus();
          }, 80);
        }
      });
    });

    // Edición del QR personalizado + Pegar / Limpiar
    els.inputCustomQr.addEventListener('input', function () {
      readFormStateFromInputs();
      persistState();
      renderLivePreview();
    });
    els.btnPasteQr.addEventListener('click', handlePasteQr);
    els.btnClearQr.addEventListener('click', handleClearQr);

    // Campos de texto en tiempo real
    const textInputs = [
      els.inputPrefix,
      els.inputSerial,
      els.inputCode,
      els.inputLot,
      els.inputWeight,
      els.inputExpiry
    ];
    textInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        readFormStateFromInputs();
        if (input === els.inputPrefix || input === els.inputSerial) {
          persistState();
        }
        renderLivePreview();
      });
    });

    // Switches autoincremento y encabezado de marca
    els.toggleAutoincrement.addEventListener('change', function () {
      readFormStateFromInputs();
      persistState();
      renderLivePreview();
    });
    els.toggleSlogan.addEventListener('change', function () {
      readFormStateFromInputs();
      persistState();
      renderLivePreview();
    });

    // Stepper cantidad
    els.btnQtyMinus.addEventListener('click', function () {
      readFormStateFromInputs();
      formState.quantity = Math.max(1, formState.quantity - 1);
      els.inputQuantity.value = String(formState.quantity);
      renderLivePreview();
    });
    els.btnQtyPlus.addEventListener('click', function () {
      readFormStateFromInputs();
      formState.quantity = Math.min(500, formState.quantity + 1);
      els.inputQuantity.value = String(formState.quantity);
      renderLivePreview();
    });
    els.inputQuantity.addEventListener('input', function () {
      readFormStateFromInputs();
      renderLivePreview();
    });
    els.inputQuantity.addEventListener('blur', function () {
      readFormStateFromInputs();
      els.inputQuantity.value = String(formState.quantity);
      renderLivePreview();
    });

    // Botones de impresión
    els.btnPrintUsb.addEventListener('click', handlePrintUsb);
    els.btnPrintRawbt.addEventListener('click', handlePrintRawbt);

    // Calibración: DPI
    [els.btnDpi203, els.btnDpi300].forEach(function (btn) {
      btn.addEventListener('click', function () {
        const nextDpi = Number(btn.dataset.dpi) === 300 ? 300 : 203;
        if (nextDpi === calibration.dpi) return;

        const prevDpi = calibration.dpi;
        calibration.dpi = nextDpi;
        setDpiButtons(nextDpi);

        const scaledMag = Math.max(1, Math.min(10, Math.round(calibration.qrMag * (nextDpi / prevDpi))));
        els.inputQrMag.value = String(scaledMag);
        readCalibrationFromInputs();
        renderLivePreview();
        showToast('Resolución cambiada a ' + nextDpi + ' dpi');
      });
    });

    // Calibración: medidas, offsets y factor QR (^BQN)
    [els.inputWidthMm, els.inputHeightMm, els.inputOffsetX, els.inputOffsetY, els.inputQrMag].forEach(function (input) {
      input.addEventListener('input', function () {
        readCalibrationFromInputs();
        renderLivePreview();
      });
    });

    // Botones -/+ de desplazamiento X e Y
    document.querySelectorAll('.mini-step-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = document.getElementById(btn.dataset.stepTarget);
        const delta = parseInt(btn.dataset.stepDelta, 10) || 0;
        if (!target) return;
        const current = parseInt(target.value, 10) || 0;
        const next = Math.max(-120, Math.min(120, current + delta));
        target.value = String(next);
        readCalibrationFromInputs();
        renderLivePreview();
      });
    });

    // Ver / Copiar ZPL
    els.btnToggleZpl.addEventListener('click', async function () {
      const opening = els.zplCodeContainer.hidden;
      els.zplCodeContainer.hidden = !opening;
      els.btnToggleZpl.textContent = opening ? 'Ocultar código ZPL II' : 'Ver código ZPL II';
      if (opening) {
        if (formState.showSlogan) {
          await BipaZPL.loadLogo();
        }
        renderZplPreview();
      }
    });
    els.btnCopyZpl.addEventListener('click', handleCopyZpl);

    // Restablecer calibración
    els.btnResetCalibration.addEventListener('click', function () {
      calibration = BipaStorage.resetCalibration();
      applyStateToInputs();
      renderLivePreview();
      showToast('Calibración restablecida (50 × 20 mm · 203 dpi)');
    });
  }

  /* ------------------------------------------------------------------------
     Registro de Service Worker (PWA standalone con rutas relativas)
     ------------------------------------------------------------------------ */
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('./sw.js').catch(function () {
        // Ignorar silenciosamente si el entorno bloquea SW
      });
    }
  }

  /* ------------------------------------------------------------------------
     Inicio
     ------------------------------------------------------------------------ */
  function init() {
    applyStateToInputs();
    bindEvents();
    renderLivePreview();

    // Precargar logo oficial para generar el mapa de bits ^GFA en tiempo real
    BipaZPL.loadLogo('./assets/logo-bipa.png').then(function () {
      if (!els.zplCodeContainer.hidden) {
        renderZplPreview();
      }
    });

    BipaZebraUSB.init(renderPrinterStatus);
    renderPrinterStatus({ connected: false });

    BipaZebraUSB.tryAutoReconnect();
    registerServiceWorker();
  }

  init();
})();
