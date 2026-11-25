/**
 * BIPA Etiquetas de Lote · Controlador principal de la aplicación
 * Maneja las 3 pestañas exclusivas (Aromas, Intenciones, Pack x2), formulario dinámico
 * por categoría, vista previa blanca en proporción real, modal ampliado, WebUSB y RawBT.
 */
(function () {
  'use strict';

  const CATEGORY_NAMES = {
    aromas: 'Aromas',
    intenciones: 'Intenciones',
    packx2: 'Pack x2'
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
    previewLogoBtn: document.getElementById('previewLogoBtn'),
    previewTitle: document.getElementById('previewTitle'),
    previewSubtitle: document.getElementById('previewSubtitle'),
    previewRowNet: document.getElementById('previewRowNet'),
    previewNetContent: document.getElementById('previewNetContent'),
    previewRowLot: document.getElementById('previewRowLot'),
    previewLot: document.getElementById('previewLot'),
    previewRowElab: document.getElementById('previewRowElab'),
    previewElaboration: document.getElementById('previewElaboration'),
    previewRowExp: document.getElementById('previewRowExp'),
    previewExpiry: document.getElementById('previewExpiry'),

    zoomModal: document.getElementById('zoomModal'),
    zoomModalTitle: document.getElementById('zoomModalTitle'),
    btnToggleRotate: document.getElementById('btnToggleRotate'),
    btnRotateLabel: document.getElementById('btnRotateLabel'),
    btnCloseZoom: document.getElementById('btnCloseZoom'),
    zoomStage: document.getElementById('zoomStage'),
    zoomLabelFrame: document.getElementById('zoomLabelFrame'),
    zoomThermalLabel: document.getElementById('zoomThermalLabel'),
    zoomTitle: document.getElementById('zoomTitle'),
    zoomSubtitle: document.getElementById('zoomSubtitle'),
    zoomNetContent: document.getElementById('zoomNetContent'),
    zoomLot: document.getElementById('zoomLot'),
    zoomElaboration: document.getElementById('zoomElaboration'),
    zoomExpiry: document.getElementById('zoomExpiry'),

    catalogSection: document.getElementById('catalogSection'),
    catalogCount: document.getElementById('catalogCount'),
    catalogTabs: document.getElementById('catalogTabs'),
    inputProductSearch: document.getElementById('inputProductSearch'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    productList: document.getElementById('productList'),
    catalogCrossHint: document.getElementById('catalogCrossHint'),

    activeTemplateBadge: document.getElementById('activeTemplateBadge'),
    groupAromaField: document.getElementById('groupAromaField'),
    inputLabelTitle: document.getElementById('inputLabelTitle'),
    groupIntentionField: document.getElementById('groupIntentionField'),
    inputIntentionName: document.getElementById('inputIntentionName'),
    groupPackFields: document.getElementById('groupPackFields'),
    inputPackTitle: document.getElementById('inputPackTitle'),
    selectPackAroma1: document.getElementById('selectPackAroma1'),
    selectPackAroma2: document.getElementById('selectPackAroma2'),
    inputSubtitle: document.getElementById('inputSubtitle'),

    inputNetContent: document.getElementById('inputNetContent'),
    inputLot: document.getElementById('inputLot'),
    inputElaboration: document.getElementById('inputElaboration'),
    inputExpiry: document.getElementById('inputExpiry'),
    btnResetLotDefaults: document.getElementById('btnResetLotDefaults'),
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
    inputDarkness: document.getElementById('inputDarkness'),
    darknessValue: document.getElementById('darknessValue'),
    inputSpeed: document.getElementById('inputSpeed'),
    speedValue: document.getElementById('speedValue'),
    btnToggleZpl: document.getElementById('btnToggleZpl'),
    btnCopyZpl: document.getElementById('btnCopyZpl'),
    zplCodeContainer: document.getElementById('zplCodeContainer'),
    zplStats: document.getElementById('zplStats'),
    zplCodeOutput: document.getElementById('zplCodeOutput'),
    btnResetCalibration: document.getElementById('btnResetCalibration'),

    toast: document.getElementById('toast')
  };

  let calibration = BipaStorage.loadCalibration();
  const savedLot = BipaStorage.loadLotState();
  const initialProduct = BipaCatalog.getById(savedLot.productId);

  let formState = {
    productId: initialProduct.id,
    category: initialProduct.category,
    labelTitle: initialProduct.labelTitle,
    intentionName: initialProduct.intentionName || '',
    subtitle: initialProduct.subtitle || '',
    comboAroma1: initialProduct.comboAromas ? initialProduct.comboAromas[0] : BipaCatalog.AROMAS_130G[0],
    comboAroma2: initialProduct.comboAromas ? initialProduct.comboAromas[1] : BipaCatalog.AROMAS_130G[5],
    netContent: initialProduct.netContent,
    compactLogo: initialProduct.compactLogo,
    uniformBold: initialProduct.uniformBold,
    lot: savedLot.lot,
    elaboration: savedLot.elaboration,
    expiry: savedLot.expiry,
    quantity: 1
  };

  const lastSelectedByCategory = {
    aromas: BipaCatalog.getFirstByCategory('aromas').id,
    intenciones: BipaCatalog.getFirstByCategory('intenciones').id,
    packx2: BipaCatalog.getFirstByCategory('packx2').id
  };
  lastSelectedByCategory[initialProduct.category] = initialProduct.id;

  let activeCategory = initialProduct.category;
  let searchQuery = '';
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
     Catálogo: 3 pestañas, selector rápido y formulario dinámico
     ------------------------------------------------------------------------ */
  function populatePackAromaSelects() {
    const optionsHtml = BipaCatalog.AROMAS_130G.map(function (name) {
      return '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>';
    }).join('');
    els.selectPackAroma1.innerHTML = optionsHtml;
    els.selectPackAroma2.innerHTML = optionsHtml;
  }

  function renderCategoryTabs() {
    els.catalogTabs.querySelectorAll('.segmented-btn').forEach(function (tab) {
      const active = tab.dataset.category === activeCategory;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  }

  function switchCategory(nextCategory) {
    if (!CATEGORY_NAMES[nextCategory]) return;
    activeCategory = nextCategory;
    renderCategoryTabs();

    // Si hay texto de búsqueda que no tiene resultados en la nueva pestaña, igual filtramos
    const filtered = BipaCatalog.filterProducts(searchQuery, activeCategory);
    if (filtered.length > 0 && formState.category !== activeCategory) {
      const rememberedId = lastSelectedByCategory[activeCategory];
      const target = filtered.find(function (p) { return p.id === rememberedId; }) || filtered[0];
      selectProduct(target.id, false);
    } else if (formState.category !== activeCategory) {
      const targetId = lastSelectedByCategory[activeCategory] || BipaCatalog.getFirstByCategory(activeCategory).id;
      selectProduct(targetId, false);
    } else {
      renderCatalogList();
    }
  }

  function selectProduct(productId, notifyUser) {
    const prod = BipaCatalog.getById(productId);
    activeCategory = prod.category;
    lastSelectedByCategory[prod.category] = prod.id;

    formState.productId = prod.id;
    formState.category = prod.category;
    formState.labelTitle = prod.labelTitle;
    formState.intentionName = prod.intentionName || '';
    formState.subtitle = prod.subtitle || '';
    formState.comboAroma1 = prod.comboAromas ? prod.comboAromas[0] : BipaCatalog.AROMAS_130G[0];
    formState.comboAroma2 = prod.comboAromas ? prod.comboAromas[1] : BipaCatalog.AROMAS_130G[5];
    formState.netContent = prod.netContent;
    formState.compactLogo = prod.compactLogo;
    formState.uniformBold = prod.uniformBold;

    renderCategoryTabs();
    applyFormStateToInputs();
    persistLotState();
    renderCatalogList();
    renderLivePreview();

    if (notifyUser) {
      showToast('Cargado: ' + prod.name);
    }
  }

  function renderCatalogList() {
    const catMeta = BipaCatalog.CATEGORIES.find(function (c) { return c.id === activeCategory; }) || BipaCatalog.CATEGORIES[0];
    const filtered = BipaCatalog.filterProducts(searchQuery, activeCategory);
    els.catalogCount.textContent = filtered.length + ' de ' + catMeta.count;
    els.btnClearSearch.hidden = searchQuery.length === 0;

    if (filtered.length === 0) {
      els.productList.innerHTML =
        '<div class="product-empty">Sin coincidencias en «' +
        escapeHtml(catMeta.label) +
        '» para «' +
        escapeHtml(searchQuery) +
        '».</div>';

      const cross = BipaCatalog.searchAllCategories(searchQuery).filter(function (c) {
        return c.id !== activeCategory;
      });
      if (cross.length > 0) {
        els.catalogCrossHint.innerHTML =
          '<span>Encontrado en:</span>' +
          cross
            .map(function (c) {
              return (
                '<button type="button" class="cross-hint-btn" data-jump-category="' +
                escapeHtml(c.id) +
                '">' +
                escapeHtml(c.label) +
                ' (' +
                c.count +
                ')</button>'
              );
            })
            .join('');
        els.catalogCrossHint.hidden = false;
      } else {
        els.catalogCrossHint.hidden = true;
      }
      return;
    }

    els.catalogCrossHint.hidden = true;

    const html = filtered.map(function (prod) {
      const selected = prod.id === formState.productId;
      const metaParts = [];
      if (prod.category === 'intenciones') {
        metaParts.push('<span class="product-tag">Vela Aromática</span>');
      } else if (prod.category === 'packx2') {
        metaParts.push('<span class="product-tag">Pack x2</span>');
      } else if (prod.moment) {
        metaParts.push('<span class="product-tag">' + escapeHtml(prod.moment) + '</span>');
      }
      metaParts.push('<span>' + escapeHtml(prod.netContent) + '</span>');

      return (
        '<button type="button" class="product-item' +
        (selected ? ' is-selected' : '') +
        '" role="option" aria-selected="' +
        String(selected) +
        '" data-product-id="' +
        escapeHtml(prod.id) +
        '">' +
        '<span class="product-item-main">' +
        '<span class="product-item-name">' +
        escapeHtml(prod.name) +
        '</span>' +
        '<span class="product-item-meta">' +
        metaParts.join('') +
        '</span>' +
        '</span>' +
        '<span class="product-item-check" aria-hidden="true">' +
        (selected ? '✓' : '') +
        '</span>' +
        '</button>'
      );
    }).join('');

    els.productList.innerHTML = html;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------------
     Formulario dinámico según categoría (Aromas / Intenciones / Pack x2)
     ------------------------------------------------------------------------ */
  function syncDynamicFormVisibility() {
    const cat = formState.category;
    els.activeTemplateBadge.textContent = 'Plantilla: ' + (CATEGORY_NAMES[cat] || 'Aromas');
    els.groupAromaField.hidden = cat !== 'aromas';
    els.groupIntentionField.hidden = cat !== 'intenciones';
    els.groupPackFields.hidden = cat !== 'packx2';
  }

  function applyFormStateToInputs() {
    syncDynamicFormVisibility();

    els.inputLabelTitle.value = formState.labelTitle;
    els.inputIntentionName.value = formState.intentionName;
    els.inputPackTitle.value = formState.labelTitle;
    els.selectPackAroma1.value = formState.comboAroma1;
    els.selectPackAroma2.value = formState.comboAroma2;
    els.inputSubtitle.value = formState.subtitle;

    els.inputNetContent.value = formState.netContent;
    els.inputLot.value = formState.lot;
    els.inputElaboration.value = formState.elaboration;
    els.inputExpiry.value = formState.expiry;
    els.inputQuantity.value = String(formState.quantity);
  }

  function applyCalibrationToInputs() {
    setDpiButtons(calibration.dpi);
    els.inputWidthMm.value = String(calibration.widthMm);
    els.inputHeightMm.value = String(calibration.heightMm);
    els.inputOffsetX.value = String(calibration.offsetX);
    els.inputOffsetY.value = String(calibration.offsetY);
    els.inputDarkness.value = String(calibration.darkness);
    els.darknessValue.textContent = String(calibration.darkness);
    els.inputSpeed.value = String(calibration.speed);
    els.speedValue.textContent = String(calibration.speed);
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
    if (formState.category === 'aromas') {
      formState.labelTitle = els.inputLabelTitle.value;
      formState.subtitle = '';
    } else if (formState.category === 'intenciones') {
      formState.intentionName = els.inputIntentionName.value;
      const cleanInt = formState.intentionName.trim();
      formState.labelTitle = cleanInt ? 'Vela Aromática ' + cleanInt : 'Vela Aromática';
      formState.subtitle = '';
    } else if (formState.category === 'packx2') {
      formState.labelTitle = els.inputPackTitle.value;
      formState.subtitle = els.inputSubtitle.value;
    }

    formState.netContent = els.inputNetContent.value;
    formState.lot = els.inputLot.value;
    formState.elaboration = els.inputElaboration.value;
    formState.expiry = els.inputExpiry.value;
    formState.quantity = Number.isFinite(qtyRaw) ? Math.max(1, Math.min(999, qtyRaw)) : 1;
  }

  function readCalibrationFromInputs() {
    calibration = BipaStorage.saveCalibration({
      dpi: calibration.dpi,
      widthMm: parseFloat(els.inputWidthMm.value) || 57,
      heightMm: parseFloat(els.inputHeightMm.value) || 19,
      offsetX: parseInt(els.inputOffsetX.value, 10) || 0,
      offsetY: parseInt(els.inputOffsetY.value, 10) || 0,
      darkness: parseInt(els.inputDarkness.value, 10) || 25,
      speed: parseInt(els.inputSpeed.value, 10) || 3
    });
    els.darknessValue.textContent = String(calibration.darkness);
    els.speedValue.textContent = String(calibration.speed);
  }

  function persistLotState() {
    BipaStorage.saveLotState({
      productId: formState.productId,
      lot: formState.lot,
      elaboration: formState.elaboration,
      expiry: formState.expiry
    });
  }

  /* ------------------------------------------------------------------------
     Render en vivo: Vista previa principal, Modal ampliado y ZPL
     ------------------------------------------------------------------------ */
  function applyLabelSurfaceGeometry(labelEl, metrics, hasSubtitle) {
    labelEl.style.aspectRatio = calibration.widthMm + ' / ' + calibration.heightMm;
    labelEl.style.setProperty('--logo-col-w', metrics.previewLogoColPct + '%');
    labelEl.classList.toggle('has-subtitle', Boolean(hasSubtitle));
    labelEl.classList.toggle('is-uniform-bold', Boolean(metrics.uniformBold));
  }

  function renderLivePreview() {
    const batch = BipaZPL.generateLotZpl(formState, calibration);
    const metrics = batch.metrics;
    const subText = formState.category === 'packx2' ? formState.subtitle.trim() : '';
    const hasSubtitle = Boolean(subText);
    const metaLabel = calibration.widthMm + ' × ' + calibration.heightMm + ' mm · ' + calibration.dpi + ' dpi';

    applyLabelSurfaceGeometry(els.thermalLabel, metrics, hasSubtitle);
    applyLabelSurfaceGeometry(els.zoomThermalLabel, metrics, hasSubtitle);

    els.previewMetaChip.textContent = metaLabel;
    els.zoomModalTitle.textContent = metaLabel;

    const titleText = formState.labelTitle.trim() || 'Producto BIPA';
    const netText = formState.netContent.trim() || '—';
    const lotText = formState.lot.trim() || '—';
    const elabText = formState.elaboration.trim() || '—';
    const expText = formState.expiry.trim() || '—';

    els.previewTitle.textContent = titleText;
    els.previewSubtitle.hidden = !hasSubtitle;
    els.previewSubtitle.textContent = subText;
    els.previewNetContent.textContent = netText;
    els.previewLot.textContent = lotText;
    els.previewElaboration.textContent = elabText;
    els.previewExpiry.textContent = expText;

    // Sincronizar copia del modal ampliado
    els.zoomTitle.textContent = titleText;
    els.zoomSubtitle.hidden = !hasSubtitle;
    els.zoomSubtitle.textContent = subText;
    els.zoomNetContent.textContent = netText;
    els.zoomLot.textContent = lotText;
    els.zoomElaboration.textContent = elabText;
    els.zoomExpiry.textContent = expText;

    if (!isPrinting) {
      els.btnPrintUsbLabel.textContent =
        formState.quantity > 1
          ? 'Imprimir ' + formState.quantity + ' etiquetas en Zebra'
          : 'Imprimir en Zebra';
    }

    if (!els.zplCodeContainer.hidden) {
      renderZplPreview(batch);
    }

    return batch;
  }

  function renderZplPreview(batchObj) {
    const batch = batchObj || BipaZPL.generateLotZpl(formState, calibration);
    const labelWord = batch.count === 1 ? 'etiqueta' : 'etiquetas';
    els.zplStats.textContent =
      batch.count +
      ' ' +
      labelWord +
      ' · ' +
      (CATEGORY_NAMES[formState.category] || 'Aromas') +
      ' · ' +
      calibration.dpi +
      ' dpi · ' +
      calibration.widthMm +
      '×' +
      calibration.heightMm +
      ' mm';
    els.zplCodeOutput.textContent = batch.zpl;
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
    await BipaZPL.loadLogo('./assets/logo-bipa.png');
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
          ? 'Etiqueta «' + batch.title + '» enviada a Zebra.'
          : batch.count + ' etiquetas de «' + batch.title + '» enviadas a Zebra.';
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
    await BipaZPL.loadLogo('./assets/logo-bipa.png');
    const batch = renderLivePreview();

    try {
      BipaZebraUSB.printViaRawBT(batch.zpl);
      const msg =
        batch.count === 1
          ? 'Abriendo RawBT (' + batch.title + ')…'
          : 'Abriendo RawBT (' + batch.count + ' etiquetas · ' + batch.title + ')…';
      showToast(msg);
    } catch (err) {
      showAlert('No se pudo abrir RawBT: ' + err.message, 'error');
    }
  }

  async function handleCopyZpl() {
    await BipaZPL.loadLogo('./assets/logo-bipa.png');
    const batch = BipaZPL.generateLotZpl(formState, calibration);
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
    els.previewLogoBtn.addEventListener('click', function () {
      focusAndScrollTo(els.inputProductSearch, els.catalogSection, false);
    });
    els.previewTitle.addEventListener('click', function () {
      if (formState.category === 'intenciones') {
        focusAndScrollTo(els.inputIntentionName, els.groupIntentionField, true);
      } else if (formState.category === 'packx2') {
        focusAndScrollTo(els.inputPackTitle, els.groupPackFields, true);
      } else {
        focusAndScrollTo(els.inputLabelTitle, els.groupAromaField, true);
      }
    });
    els.previewSubtitle.addEventListener('click', function () {
      focusAndScrollTo(els.inputSubtitle, els.groupPackFields, true);
    });
    els.previewRowNet.addEventListener('click', function () {
      focusAndScrollTo(els.inputNetContent, null, true);
    });
    els.previewRowLot.addEventListener('click', function () {
      focusAndScrollTo(els.inputLot, null, true);
    });
    els.previewRowElab.addEventListener('click', function () {
      focusAndScrollTo(els.inputElaboration, null, true);
    });
    els.previewRowExp.addEventListener('click', function () {
      focusAndScrollTo(els.inputExpiry, null, true);
    });

    // 3 pestañas de catálogo + búsqueda
    els.catalogTabs.addEventListener('click', function (ev) {
      const btn = ev.target.closest('.segmented-btn');
      if (!btn) return;
      switchCategory(btn.dataset.category);
    });

    els.catalogCrossHint.addEventListener('click', function (ev) {
      const btn = ev.target.closest('[data-jump-category]');
      if (!btn) return;
      switchCategory(btn.dataset.jumpCategory);
    });

    els.inputProductSearch.addEventListener('input', function () {
      searchQuery = els.inputProductSearch.value;
      renderCatalogList();
    });
    els.btnClearSearch.addEventListener('click', function () {
      searchQuery = '';
      els.inputProductSearch.value = '';
      renderCatalogList();
      els.inputProductSearch.focus();
    });

    els.productList.addEventListener('click', function (ev) {
      const item = ev.target.closest('[data-product-id]');
      if (!item) return;
      selectProduct(item.dataset.productId, true);
    });

    // Selectores rápidos de Aroma 1 y Aroma 2 para Pack x2
    function handlePackComboSelectChange() {
      formState.comboAroma1 = els.selectPackAroma1.value;
      formState.comboAroma2 = els.selectPackAroma2.value;
      formState.subtitle = formState.comboAroma1 + ' y ' + formState.comboAroma2;
      els.inputSubtitle.value = formState.subtitle;
      renderLivePreview();
    }
    els.selectPackAroma1.addEventListener('change', handlePackComboSelectChange);
    els.selectPackAroma2.addEventListener('change', handlePackComboSelectChange);

    // Campos editables dinámicos en tiempo real
    const textInputs = [
      els.inputLabelTitle,
      els.inputIntentionName,
      els.inputPackTitle,
      els.inputSubtitle,
      els.inputNetContent,
      els.inputLot,
      els.inputElaboration,
      els.inputExpiry
    ];
    textInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        readFormStateFromInputs();
        if (input === els.inputLot || input === els.inputElaboration || input === els.inputExpiry) {
          persistLotState();
        }
        renderLivePreview();
      });
    });

    // Restaurar lote base (lote.txt) y datos de plantilla del producto actual
    els.btnResetLotDefaults.addEventListener('click', function () {
      formState.lot = BipaCatalog.DEFAULT_LOT_DATA.lot;
      formState.elaboration = BipaCatalog.DEFAULT_LOT_DATA.elaboration;
      formState.expiry = BipaCatalog.DEFAULT_LOT_DATA.expiry;
      const prod = BipaCatalog.getById(formState.productId);
      formState.labelTitle = prod.labelTitle;
      formState.intentionName = prod.intentionName || '';
      formState.subtitle = prod.subtitle || '';
      formState.comboAroma1 = prod.comboAromas ? prod.comboAromas[0] : BipaCatalog.AROMAS_130G[0];
      formState.comboAroma2 = prod.comboAromas ? prod.comboAromas[1] : BipaCatalog.AROMAS_130G[5];
      formState.netContent = prod.netContent;
      formState.compactLogo = prod.compactLogo;
      formState.uniformBold = prod.uniformBold;

      applyFormStateToInputs();
      persistLotState();
      renderLivePreview();
      showToast('Lote base restaurado');
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
      formState.quantity = Math.min(999, formState.quantity + 1);
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
        calibration.dpi = nextDpi;
        setDpiButtons(nextDpi);
        readCalibrationFromInputs();
        renderLivePreview();
        showToast('Resolución cambiada a ' + nextDpi + ' dpi');
      });
    });

    // Calibración: medidas, offsets, oscuridad y velocidad
    [
      els.inputWidthMm,
      els.inputHeightMm,
      els.inputOffsetX,
      els.inputOffsetY,
      els.inputDarkness,
      els.inputSpeed
    ].forEach(function (input) {
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
        await BipaZPL.loadLogo('./assets/logo-bipa.png');
        renderZplPreview();
      }
    });
    els.btnCopyZpl.addEventListener('click', handleCopyZpl);

    // Restablecer calibración
    els.btnResetCalibration.addEventListener('click', function () {
      calibration = BipaStorage.resetCalibration();
      applyCalibrationToInputs();
      renderLivePreview();
      showToast('Calibración restablecida (57 × 19 mm · 203 dpi)');
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
    populatePackAromaSelects();
    renderCategoryTabs();
    applyFormStateToInputs();
    applyCalibrationToInputs();
    renderCatalogList();
    bindEvents();
    renderLivePreview();

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
