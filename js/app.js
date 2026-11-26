/**
 * BIPA Etiquetas · Controlador principal con perfiles (Encargado / Administrador),
 * catálogo filtrado por rol, vista previa multi-plantilla, WebUSB y RawBT.
 */
(function () {
  'use strict';

  const CATEGORY_NAMES = {
    aromas: 'Aromas',
    intenciones: 'Intenciones',
    packx2: 'Pack x2',
    solo_aroma: 'Solo Aroma',
    solo_aroma_240: 'Aroma 240 g',
    muestras: 'Muestras MM',
    mechas: 'Mechas',
    envios: 'Envíos',
    barras: 'Cód. Barras'
  };

  const els = {
    roleScreen: document.getElementById('roleScreen'),
    btnSelectOperator: document.getElementById('btnSelectOperator'),
    btnSelectAdmin: document.getElementById('btnSelectAdmin'),
    adminPinBox: document.getElementById('adminPinBox'),
    inputAdminPin: document.getElementById('inputAdminPin'),
    btnTogglePinVisibility: document.getElementById('btnTogglePinVisibility'),
    adminPinError: document.getElementById('adminPinError'),
    btnSubmitAdminPin: document.getElementById('btnSubmitAdminPin'),

    appShell: document.getElementById('appShell'),
    printerStatusBadge: document.getElementById('printerStatusBadge'),
    printerStatusText: document.getElementById('printerStatusText'),
    printerDeviceInfo: document.getElementById('printerDeviceInfo'),
    adminModeBadge: document.getElementById('adminModeBadge'),
    btnSwitchProfile: document.getElementById('btnSwitchProfile'),
    btnConnectUsb: document.getElementById('btnConnectUsb'),
    btnConnectLabel: document.getElementById('btnConnectLabel'),
    btnConnectAny: document.getElementById('btnConnectAny'),

    alertBanner: document.getElementById('alertBanner'),
    alertIcon: document.getElementById('alertIcon'),
    alertMessage: document.getElementById('alertMessage'),
    btnCloseAlert: document.getElementById('btnCloseAlert'),

    previewMetaChip: document.getElementById('previewMetaChip'),
    previewTapHint: document.getElementById('previewTapHint'),
    btnOpenZoom: document.getElementById('btnOpenZoom'),
    thermalLabel: document.getElementById('thermalLabel'),
    previewStandardLayout: document.getElementById('previewStandardLayout'),
    previewBarcodeLayout: document.getElementById('previewBarcodeLayout'),
    previewLogoBtn: document.getElementById('previewLogoBtn'),
    previewTitle: document.getElementById('previewTitle'),
    previewSubtitle: document.getElementById('previewSubtitle'),
    previewSimpleWeight: document.getElementById('previewSimpleWeight'),
    previewShippingLines: document.getElementById('previewShippingLines'),
    previewShipLine2: document.getElementById('previewShipLine2'),
    previewShipLine3: document.getElementById('previewShipLine3'),
    previewLotGrid: document.getElementById('previewLotGrid'),
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
    zoomStandardLayout: document.getElementById('zoomStandardLayout'),
    zoomBarcodeLayout: document.getElementById('zoomBarcodeLayout'),
    zoomTitle: document.getElementById('zoomTitle'),
    zoomSubtitle: document.getElementById('zoomSubtitle'),
    zoomSimpleWeight: document.getElementById('zoomSimpleWeight'),
    zoomShippingLines: document.getElementById('zoomShippingLines'),
    zoomShipLine2: document.getElementById('zoomShipLine2'),
    zoomShipLine3: document.getElementById('zoomShipLine3'),
    zoomLotGrid: document.getElementById('zoomLotGrid'),
    zoomNetContent: document.getElementById('zoomNetContent'),
    zoomLot: document.getElementById('zoomLot'),
    zoomElaboration: document.getElementById('zoomElaboration'),
    zoomExpiry: document.getElementById('zoomExpiry'),

    catalogSection: document.getElementById('catalogSection'),
    catalogCount: document.getElementById('catalogCount'),
    catalogTabs: document.getElementById('catalogTabs'),
    adminCategoryTabs: document.getElementById('adminCategoryTabs'),
    inputProductSearch: document.getElementById('inputProductSearch'),
    btnClearSearch: document.getElementById('btnClearSearch'),
    productList: document.getElementById('productList'),
    catalogCrossHint: document.getElementById('catalogCrossHint'),

    adminEditSection: document.getElementById('adminEditSection'),
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
    groupLotCommonFields: document.getElementById('groupLotCommonFields'),
    inputNetContent: document.getElementById('inputNetContent'),
    inputLot: document.getElementById('inputLot'),
    inputElaboration: document.getElementById('inputElaboration'),
    inputExpiry: document.getElementById('inputExpiry'),
    btnResetLotDefaults: document.getElementById('btnResetLotDefaults'),

    groupSimpleFields: document.getElementById('groupSimpleFields'),
    inputSimpleTitle: document.getElementById('inputSimpleTitle'),
    inputSimpleWeight: document.getElementById('inputSimpleWeight'),
    groupShippingFields: document.getElementById('groupShippingFields'),
    inputShipDest: document.getElementById('inputShipDest'),
    inputShipSender: document.getElementById('inputShipSender'),
    inputShipPhone: document.getElementById('inputShipPhone'),
    groupBarcodeFields: document.getElementById('groupBarcodeFields'),
    inputBarcodeTitle: document.getElementById('inputBarcodeTitle'),
    selectBarcodeFormat: document.getElementById('selectBarcodeFormat'),
    inputBarcodeEan: document.getElementById('inputBarcodeEan'),
    inputBarcodeCpe: document.getElementById('inputBarcodeCpe'),

    inputQuantity: document.getElementById('inputQuantity'),
    btnQtyMinus: document.getElementById('btnQtyMinus'),
    btnQtyPlus: document.getElementById('btnQtyPlus'),

    btnPrintUsb: document.getElementById('btnPrintUsb'),
    btnPrintUsbLabel: document.getElementById('btnPrintUsbLabel'),
    btnPrintUsbSub: document.getElementById('btnPrintUsbSub'),
    btnPrintRawbt: document.getElementById('btnPrintRawbt'),

    calibrationPanel: document.getElementById('calibrationPanel'),
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

  let currentRole = BipaAuth.loadRole(); // 'operator' | 'admin' | null
  let calibration = BipaStorage.loadCalibration();
  const savedLot = BipaStorage.loadLotState();
  const initialProduct = BipaCatalog.getById(savedLot.productId, currentRole === 'admin');

  let formState = {
    productId: initialProduct.id,
    category: initialProduct.category,
    template: initialProduct.template || 'lot',
    labelTitle: initialProduct.labelTitle,
    intentionName: initialProduct.intentionName || '',
    subtitle: initialProduct.subtitle || '',
    comboAroma1: initialProduct.comboAromas ? initialProduct.comboAromas[0] : BipaCatalog.AROMAS_130G[0],
    comboAroma2: initialProduct.comboAromas ? initialProduct.comboAromas[1] : BipaCatalog.AROMAS_130G[5],
    netContent: initialProduct.netContent || '',
    weightText: initialProduct.weightText || '',
    destination: initialProduct.destination || 'Central Madeirense',
    sender: initialProduct.sender || 'Karla Montilla',
    phone: initialProduct.phone || '0424-7718497',
    ean13: initialProduct.ean13 || '7596246002876',
    cpe: initialProduct.cpe || '1026622516',
    barcodeFormat: initialProduct.barcodeFormat || 'gs1',
    compactLogo: initialProduct.compactLogo,
    uniformBold: initialProduct.uniformBold,
    lot: savedLot.lot,
    elaboration: savedLot.elaboration,
    expiry: savedLot.expiry,
    quantity: 1
  };

  const lastSelectedByCategory = {};
  BipaCatalog.CATEGORIES.forEach(function (c) {
    const first = BipaCatalog.getFirstByCategory(c.id, true);
    if (first) lastSelectedByCategory[c.id] = first.id;
  });
  lastSelectedByCategory[initialProduct.category] = initialProduct.id;

  let activeCategory = initialProduct.category;
  let searchQuery = '';
  let toastTimer = null;
  let isPrinting = false;
  let isZoomRotated = false;

  function isAdmin() {
    return currentRole === 'admin';
  }

  /* ------------------------------------------------------------------------
     Pantalla de perfiles y transición Encargado / Admin
     ------------------------------------------------------------------------ */
  function showRoleScreen(expandAdminPin) {
    els.roleScreen.hidden = false;
    els.appShell.hidden = true;
    document.body.classList.remove('role-operator', 'role-admin');
    els.adminPinError.hidden = true;
    els.inputAdminPin.value = '';
    els.adminPinBox.hidden = !expandAdminPin;
    els.btnSelectAdmin.setAttribute('aria-expanded', String(Boolean(expandAdminPin)));
    if (expandAdminPin) {
      setTimeout(function () { els.inputAdminPin.focus(); }, 60);
    }
  }

  function applyRoleUI(role) {
    currentRole = role;
    const admin = role === 'admin';

    els.roleScreen.hidden = true;
    els.appShell.hidden = false;
    document.body.classList.toggle('role-admin', admin);
    document.body.classList.toggle('role-operator', !admin);

    els.adminModeBadge.hidden = !admin;
    els.btnSwitchProfile.textContent = admin ? 'Salir' : 'Modo Admin';
    els.adminCategoryTabs.hidden = !admin;
    els.adminEditSection.hidden = !admin;
    els.btnPrintRawbt.hidden = !admin;
    els.calibrationPanel.hidden = !admin;

    // Si es Encargado y tenía seleccionada una categoría exclusiva de Admin, volver a Aromas
    const prod = BipaCatalog.getById(formState.productId, admin);
    if (!admin && prod.id !== formState.productId) {
      selectProduct(prod.id, false);
    } else if (!admin && activeCategory !== 'aromas' && activeCategory !== 'intenciones' && activeCategory !== 'packx2') {
      selectProduct(BipaCatalog.getFirstByCategory('aromas', false).id, false);
    } else {
      renderCategoryTabs();
      renderCatalogList();
      applyFormStateToInputs();
      renderLivePreview();
    }

    // Desactivar tabindex en la vista previa cuando es solo lectura (Encargado)
    const previewControls = els.thermalLabel.querySelectorAll('button');
    previewControls.forEach(function (btn) {
      if (admin) {
        btn.removeAttribute('tabindex');
      } else {
        btn.setAttribute('tabindex', '-1');
      }
    });
  }

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
    if (!isAdmin()) return;
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
     Catálogo y selector
     ------------------------------------------------------------------------ */
  function populateSelectOptions() {
    els.selectPackAroma1.innerHTML = BipaCatalog.AROMAS_130G.map(function (name) {
      return '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + '</option>';
    }).join('');
    els.selectPackAroma2.innerHTML = els.selectPackAroma1.innerHTML;

    els.selectBarcodeFormat.innerHTML = BipaCatalog.BARCODE_FORMATS.map(function (fmt) {
      return '<option value="' + escapeHtml(fmt.id) + '">' + escapeHtml(fmt.label) + '</option>';
    }).join('');
  }

  function renderCategoryTabs() {
    els.catalogTabs.querySelectorAll('.segmented-btn').forEach(function (tab) {
      const active = tab.dataset.category === activeCategory;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    els.adminCategoryTabs.querySelectorAll('.cat-chip').forEach(function (chip) {
      const active = chip.dataset.category === activeCategory;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-selected', String(active));
    });
  }

  function switchCategory(nextCategory) {
    const allowedCats = BipaCatalog.getCategoriesForRole(isAdmin()).map(function (c) { return c.id; });
    if (allowedCats.indexOf(nextCategory) === -1) return;

    activeCategory = nextCategory;
    renderCategoryTabs();

    const filtered = BipaCatalog.filterProducts(searchQuery, activeCategory, isAdmin());
    if (filtered.length > 0 && formState.category !== activeCategory) {
      const rememberedId = lastSelectedByCategory[activeCategory];
      const target = filtered.find(function (p) { return p.id === rememberedId; }) || filtered[0];
      selectProduct(target.id, false);
    } else if (formState.category !== activeCategory) {
      const target = BipaCatalog.getFirstByCategory(activeCategory, isAdmin());
      selectProduct(target.id, false);
    } else {
      renderCatalogList();
    }
  }

  function selectProduct(productId, notifyUser) {
    const prod = BipaCatalog.getById(productId, isAdmin());
    activeCategory = prod.category;
    lastSelectedByCategory[prod.category] = prod.id;

    formState.productId = prod.id;
    formState.category = prod.category;
    formState.template = prod.template || 'lot';
    formState.labelTitle = prod.labelTitle || prod.name;
    formState.intentionName = prod.intentionName || '';
    formState.subtitle = prod.subtitle || '';
    formState.comboAroma1 = prod.comboAromas ? prod.comboAromas[0] : BipaCatalog.AROMAS_130G[0];
    formState.comboAroma2 = prod.comboAromas ? prod.comboAromas[1] : BipaCatalog.AROMAS_130G[5];
    formState.netContent = prod.netContent || '';
    formState.weightText = prod.weightText || '';
    formState.destination = prod.destination || formState.destination;
    formState.sender = prod.sender || formState.sender;
    formState.phone = prod.phone || formState.phone;
    formState.ean13 = prod.ean13 || formState.ean13;
    formState.cpe = prod.cpe || formState.cpe;
    formState.barcodeFormat = prod.barcodeFormat || 'gs1';
    formState.compactLogo = Boolean(prod.compactLogo);
    formState.uniformBold = Boolean(prod.uniformBold);

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
    const allowedCats = BipaCatalog.getCategoriesForRole(isAdmin());
    const catMeta = allowedCats.find(function (c) { return c.id === activeCategory; }) || allowedCats[0];
    const filtered = BipaCatalog.filterProducts(searchQuery, activeCategory, isAdmin());

    els.catalogCount.textContent = filtered.length + ' de ' + catMeta.count;
    els.btnClearSearch.hidden = searchQuery.length === 0;

    if (filtered.length === 0) {
      els.productList.innerHTML =
        '<div class="product-empty">Sin coincidencias en «' +
        escapeHtml(catMeta.label) +
        '» para «' +
        escapeHtml(searchQuery) +
        '».</div>';

      const cross = BipaCatalog.searchAllCategories(searchQuery, isAdmin()).filter(function (c) {
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

      if (prod.netContent) metaParts.push('<span>' + escapeHtml(prod.netContent) + '</span>');
      if (prod.weightText) metaParts.push('<span>' + escapeHtml(prod.weightText) + '</span>');
      if (prod.ean13) metaParts.push('<span class="font-mono">' + escapeHtml(prod.ean13) + '</span>');
      if (prod.destination) metaParts.push('<span>' + escapeHtml(prod.sender) + '</span>');

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
     Formulario dinámico según categoría / plantilla (Admin)
     ------------------------------------------------------------------------ */
  function syncDynamicFormVisibility() {
    const cat = formState.category;
    const tpl = formState.template;
    els.activeTemplateBadge.textContent = 'Plantilla: ' + (CATEGORY_NAMES[cat] || 'Aromas');

    els.groupAromaField.hidden = !(tpl === 'lot' && cat === 'aromas');
    els.groupIntentionField.hidden = !(tpl === 'lot' && cat === 'intenciones');
    els.groupPackFields.hidden = !(tpl === 'lot' && cat === 'packx2');
    els.groupLotCommonFields.hidden = tpl !== 'lot';
    els.btnResetLotDefaults.hidden = tpl !== 'lot';

    els.groupSimpleFields.hidden = tpl !== 'simple';
    els.groupShippingFields.hidden = tpl !== 'shipping';
    els.groupBarcodeFields.hidden = tpl !== 'barcode';
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

    els.inputSimpleTitle.value = formState.labelTitle;
    els.inputSimpleWeight.value = formState.weightText;

    els.inputShipDest.value = formState.destination;
    els.inputShipSender.value = formState.sender;
    els.inputShipPhone.value = formState.phone;

    els.inputBarcodeTitle.value = formState.labelTitle;
    els.selectBarcodeFormat.value = formState.barcodeFormat;
    els.inputBarcodeEan.value = formState.ean13;
    els.inputBarcodeCpe.value = formState.cpe;

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
    const tpl = formState.template;

    if (tpl === 'lot') {
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
    } else if (tpl === 'simple') {
      formState.labelTitle = els.inputSimpleTitle.value;
      formState.weightText = els.inputSimpleWeight.value;
    } else if (tpl === 'shipping') {
      formState.destination = els.inputShipDest.value;
      formState.sender = els.inputShipSender.value;
      formState.phone = els.inputShipPhone.value;
      formState.labelTitle = 'Envío a ' + formState.destination;
    } else if (tpl === 'barcode') {
      formState.labelTitle = els.inputBarcodeTitle.value;
      formState.barcodeFormat = els.selectBarcodeFormat.value;
      formState.ean13 = els.inputBarcodeEan.value;
      formState.cpe = els.inputBarcodeCpe.value;
    }

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
     Render en vivo de los 4 templates visuales
     ------------------------------------------------------------------------ */
  function buildBarcodePreviewHtml() {
    const isX4 = formState.barcodeFormat === 'x4';
    const title = escapeHtml(formState.labelTitle.trim() || 'BIPA');
    const digits = escapeHtml(formState.ean13.trim() || '7596246002876');
    const cpe = escapeHtml(formState.cpe.trim());
    const cell =
      '<div class="barcode-cell">' +
      '<div class="barcode-title">' + title + '</div>' +
      '<div class="barcode-bars" aria-hidden="true"></div>' +
      '<div class="barcode-digits">' + digits + '</div>' +
      (cpe ? '<div class="barcode-cpe">CPE ' + cpe + '</div>' : '') +
      '</div>';
    return isX4 ? (cell + cell + cell + cell) : cell;
  }

  function syncPreviewSurface(opts) {
    const labelEl = opts.labelEl;
    const metrics = opts.metrics;
    const tpl = formState.template;
    const isBarcode = tpl === 'barcode';
    const isSimple = tpl === 'simple';
    const isShipping = tpl === 'shipping';
    const isLot = tpl === 'lot';
    const subText = isLot && formState.category === 'packx2' ? formState.subtitle.trim() : '';

    labelEl.style.aspectRatio = calibration.widthMm + ' / ' + calibration.heightMm;
    labelEl.style.setProperty('--logo-col-w', metrics.previewLogoColPct + '%');
    labelEl.classList.toggle('has-subtitle', Boolean(subText));
    labelEl.classList.toggle('is-uniform-bold', Boolean(metrics.uniformBold));
    labelEl.classList.toggle('is-simple-template', isSimple);

    opts.standardLayout.hidden = isBarcode;
    opts.barcodeLayout.hidden = !isBarcode;

    if (isBarcode) {
      opts.barcodeLayout.classList.toggle('is-x4', formState.barcodeFormat === 'x4');
      opts.barcodeLayout.innerHTML = buildBarcodePreviewHtml();
      return;
    }

    opts.titleEl.textContent = isShipping
      ? ('Envío a ' + (formState.destination.trim() || '—'))
      : (formState.labelTitle.trim() || 'Producto BIPA');

    opts.subtitleEl.hidden = !subText;
    opts.subtitleEl.textContent = subText;

    const wText = formState.weightText.trim();
    opts.simpleWeightEl.hidden = !(isSimple && wText);
    opts.simpleWeightEl.textContent = wText;

    opts.shippingLinesEl.hidden = !isShipping;
    if (isShipping) {
      opts.shipLine2El.textContent = 'Remite: ' + (formState.sender.trim() || '—');
      opts.shipLine3El.textContent = 'Tel: ' + (formState.phone.trim() || '—');
    }

    opts.lotGridEl.hidden = !isLot;
    if (isLot) {
      opts.netEl.textContent = formState.netContent.trim() || '—';
      opts.lotEl.textContent = formState.lot.trim() || '—';
      opts.elabEl.textContent = formState.elaboration.trim() || '—';
      opts.expEl.textContent = formState.expiry.trim() || '—';
    }
  }

  function renderLivePreview() {
    const batch = BipaZPL.generateLotZpl(formState, calibration);
    const metrics = batch.metrics;
    const metaLabel = calibration.widthMm + ' × ' + calibration.heightMm + ' mm · ' + calibration.dpi + ' dpi';

    els.previewMetaChip.textContent = metaLabel;
    els.zoomModalTitle.textContent = metaLabel;

    syncPreviewSurface({
      labelEl: els.thermalLabel,
      metrics: metrics,
      standardLayout: els.previewStandardLayout,
      barcodeLayout: els.previewBarcodeLayout,
      titleEl: els.previewTitle,
      subtitleEl: els.previewSubtitle,
      simpleWeightEl: els.previewSimpleWeight,
      shippingLinesEl: els.previewShippingLines,
      shipLine2El: els.previewShipLine2,
      shipLine3El: els.previewShipLine3,
      lotGridEl: els.previewLotGrid,
      netEl: els.previewNetContent,
      lotEl: els.previewLot,
      elabEl: els.previewElaboration,
      expEl: els.previewExpiry
    });

    syncPreviewSurface({
      labelEl: els.zoomThermalLabel,
      metrics: metrics,
      standardLayout: els.zoomStandardLayout,
      barcodeLayout: els.zoomBarcodeLayout,
      titleEl: els.zoomTitle,
      subtitleEl: els.zoomSubtitle,
      simpleWeightEl: els.zoomSimpleWeight,
      shippingLinesEl: els.zoomShippingLines,
      shipLine2El: els.zoomShipLine2,
      shipLine3El: els.zoomShipLine3,
      lotGridEl: els.zoomLotGrid,
      netEl: els.zoomNetContent,
      lotEl: els.zoomLot,
      elabEl: els.zoomElaboration,
      expEl: els.zoomExpiry
    });

    if (!isPrinting) {
      els.btnPrintUsbLabel.textContent =
        formState.quantity > 1
          ? 'Imprimir ' + formState.quantity + ' etiquetas en Zebra'
          : 'Imprimir en Zebra';
    }

    if (!els.zplCodeContainer.hidden && isAdmin()) {
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
        isAdmin()
          ? 'Este navegador no soporta WebUSB. Usa Google Chrome en Android (HTTPS) o pulsa «Imprimir vía RawBT».'
          : 'Este navegador no soporta WebUSB. Abre la app en Google Chrome desde Android con el cable USB OTG conectado.',
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
    if (!isAdmin()) return;
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
    if (!isAdmin()) return;
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
    // Selección de perfil
    els.btnSelectOperator.addEventListener('click', function () {
      BipaAuth.saveRole('operator');
      applyRoleUI('operator');
      showToast('Sesión iniciada: Encargado de impresión');
    });

    els.btnSelectAdmin.addEventListener('click', function () {
      const opening = els.adminPinBox.hidden;
      els.adminPinBox.hidden = !opening;
      els.btnSelectAdmin.setAttribute('aria-expanded', String(opening));
      els.adminPinError.hidden = true;
      if (opening) {
        setTimeout(function () { els.inputAdminPin.focus(); }, 60);
      }
    });

    els.btnTogglePinVisibility.addEventListener('click', function () {
      const showing = els.inputAdminPin.type === 'text';
      els.inputAdminPin.type = showing ? 'password' : 'text';
      els.btnTogglePinVisibility.textContent = showing ? 'Mostrar' : 'Ocultar';
    });

    els.adminPinBox.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      els.adminPinError.hidden = true;
      const pin = els.inputAdminPin.value.trim();
      const ok = await BipaAuth.verifyAdminPin(pin);
      if (!ok) {
        els.adminPinError.textContent = 'PIN incorrecto. Verifica los dígitos e inténtalo de nuevo.';
        els.adminPinError.hidden = false;
        els.inputAdminPin.select();
        return;
      }
      BipaAuth.saveRole('admin');
      applyRoleUI('admin');
      showToast('Bienvenido, Administrador');
    });

    els.btnSwitchProfile.addEventListener('click', function () {
      const wasOperator = !isAdmin();
      BipaAuth.clearRole();
      showRoleScreen(wasOperator);
    });

    // Conexión USB
    els.btnConnectUsb.addEventListener('click', function () {
      handleConnectUsb(false);
    });
    els.btnConnectAny.addEventListener('click', function () {
      if (!isAdmin()) return;
      handleConnectUsb(true);
    });
    els.btnCloseAlert.addEventListener('click', hideAlert);

    // Vista ampliada
    els.btnOpenZoom.addEventListener('click', openZoomModal);
    els.btnCloseZoom.addEventListener('click', closeZoomModal);
    els.btnToggleRotate.addEventListener('click', function () {
      applyZoomRotation(!isZoomRotated);
    });
    els.zoomStage.addEventListener('click', function (ev) {
      if (ev.target === els.zoomStage) closeZoomModal();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !els.zoomModal.hidden) closeZoomModal();
    });

    // Interactividad en vista previa (solo activa para Admin)
    els.previewLogoBtn.addEventListener('click', function () {
      focusAndScrollTo(els.inputProductSearch, els.catalogSection, false);
    });
    els.previewTitle.addEventListener('click', function () {
      if (formState.template === 'simple') {
        focusAndScrollTo(els.inputSimpleTitle, els.groupSimpleFields, true);
      } else if (formState.template === 'shipping') {
        focusAndScrollTo(els.inputShipDest, els.groupShippingFields, true);
      } else if (formState.category === 'intenciones') {
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

    // Pestañas y buscador
    els.catalogTabs.addEventListener('click', function (ev) {
      const btn = ev.target.closest('.segmented-btn');
      if (!btn) return;
      switchCategory(btn.dataset.category);
    });
    els.adminCategoryTabs.addEventListener('click', function (ev) {
      if (!isAdmin()) return;
      const btn = ev.target.closest('.cat-chip');
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

    // Pack x2 selects rápidos
    function handlePackComboSelectChange() {
      formState.comboAroma1 = els.selectPackAroma1.value;
      formState.comboAroma2 = els.selectPackAroma2.value;
      formState.subtitle = formState.comboAroma1 + ' y ' + formState.comboAroma2;
      els.inputSubtitle.value = formState.subtitle;
      renderLivePreview();
    }
    els.selectPackAroma1.addEventListener('change', handlePackComboSelectChange);
    els.selectPackAroma2.addEventListener('change', handlePackComboSelectChange);

    // Formato de código de barras
    els.selectBarcodeFormat.addEventListener('change', function () {
      formState.barcodeFormat = els.selectBarcodeFormat.value;
      renderLivePreview();
    });

    // Campos editables de Admin
    const textInputs = [
      els.inputLabelTitle,
      els.inputIntentionName,
      els.inputPackTitle,
      els.inputSubtitle,
      els.inputNetContent,
      els.inputLot,
      els.inputElaboration,
      els.inputExpiry,
      els.inputSimpleTitle,
      els.inputSimpleWeight,
      els.inputShipDest,
      els.inputShipSender,
      els.inputShipPhone,
      els.inputBarcodeTitle,
      els.inputBarcodeEan,
      els.inputBarcodeCpe
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

    // Restaurar lote base
    els.btnResetLotDefaults.addEventListener('click', function () {
      formState.lot = BipaCatalog.DEFAULT_LOT_DATA.lot;
      formState.elaboration = BipaCatalog.DEFAULT_LOT_DATA.elaboration;
      formState.expiry = BipaCatalog.DEFAULT_LOT_DATA.expiry;
      const prod = BipaCatalog.getById(formState.productId, isAdmin());
      formState.labelTitle = prod.labelTitle || prod.name;
      formState.intentionName = prod.intentionName || '';
      formState.subtitle = prod.subtitle || '';
      formState.comboAroma1 = prod.comboAromas ? prod.comboAromas[0] : BipaCatalog.AROMAS_130G[0];
      formState.comboAroma2 = prod.comboAromas ? prod.comboAromas[1] : BipaCatalog.AROMAS_130G[5];
      formState.netContent = prod.netContent || '';
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

    // Impresión
    els.btnPrintUsb.addEventListener('click', handlePrintUsb);
    els.btnPrintRawbt.addEventListener('click', handlePrintRawbt);

    // Calibración (Admin)
    [els.btnDpi203, els.btnDpi300].forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!isAdmin()) return;
        const nextDpi = Number(btn.dataset.dpi) === 300 ? 300 : 203;
        if (nextDpi === calibration.dpi) return;
        calibration.dpi = nextDpi;
        setDpiButtons(nextDpi);
        readCalibrationFromInputs();
        renderLivePreview();
        showToast('Resolución cambiada a ' + nextDpi + ' dpi');
      });
    });

    [
      els.inputWidthMm,
      els.inputHeightMm,
      els.inputOffsetX,
      els.inputOffsetY,
      els.inputDarkness,
      els.inputSpeed
    ].forEach(function (input) {
      input.addEventListener('input', function () {
        if (!isAdmin()) return;
        readCalibrationFromInputs();
        renderLivePreview();
      });
    });

    document.querySelectorAll('.mini-step-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!isAdmin()) return;
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

    els.btnToggleZpl.addEventListener('click', async function () {
      if (!isAdmin()) return;
      const opening = els.zplCodeContainer.hidden;
      els.zplCodeContainer.hidden = !opening;
      els.btnToggleZpl.textContent = opening ? 'Ocultar código ZPL II' : 'Ver código ZPL II';
      if (opening) {
        await BipaZPL.loadLogo('./assets/logo-bipa.png');
        renderZplPreview();
      }
    });
    els.btnCopyZpl.addEventListener('click', handleCopyZpl);

    els.btnResetCalibration.addEventListener('click', function () {
      if (!isAdmin()) return;
      calibration = BipaStorage.resetCalibration();
      applyCalibrationToInputs();
      renderLivePreview();
      showToast('Calibración restablecida (57 × 19 mm · 203 dpi)');
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    }
  }

  function init() {
    populateSelectOptions();
    applyCalibrationToInputs();
    bindEvents();

    if (currentRole === 'operator' || currentRole === 'admin') {
      applyRoleUI(currentRole);
    } else {
      showRoleScreen(false);
    }

    BipaZPL.loadLogo('./assets/logo-bipa.png').then(function () {
      if (!els.zplCodeContainer.hidden && isAdmin()) {
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
