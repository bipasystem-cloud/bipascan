/**
 * BIPA Etiquetas · Catálogo completo de ETIQUETAS LOTES con permisos por perfil
 * - Visibles para Encargado y Admin (adminOnly: false):
 *   1. ETIQUETAS CONTROL AROMAS (12)
 *   2. ETIQUETAS CONTROL INTENCIONES (4)
 *   3. ETIQUETAS CONTROL PACK X2 (15)
 * - Exclusivas de Administrador (adminOnly: true):
 *   4. ETIQUETAS SOLO AROMA (12)
 *   5. SOLO AROMAS 240 G (12)
 *   6. Muestras MM (Ander Fig, Andrés Mist, Bejuma Bitter, Cattleya, Colonial Limit, Criollo Cacao, Monte Claro, Pampata) (14)
 *   7. MECHAS (3)
 *   8. ENVIOS (1)
 *   9. CÓDIGOS DE BARRAS VELAS AROMÁTICAS (12 productos × 9 formatos)
 */
(function (global) {
  'use strict';

  const DEFAULT_LOT_DATA = Object.freeze({
    lot: '02062658001L7',
    elaboration: '15/10/2026',
    expiry: '15/10/2028'
  });

  const CATEGORIES = Object.freeze([
    { id: 'aromas', label: 'Aromas', count: 12, adminOnly: false, template: 'lot' },
    { id: 'intenciones', label: 'Intenciones', count: 4, adminOnly: false, template: 'lot' },
    { id: 'packx2', label: 'Pack x2', count: 15, adminOnly: false, template: 'lot' },
    { id: 'solo_aroma', label: 'Solo Aroma', count: 12, adminOnly: true, template: 'simple' },
    { id: 'solo_aroma_240', label: 'Aroma 240 g', count: 12, adminOnly: true, template: 'simple' },
    { id: 'muestras', label: 'Muestras MM', count: 14, adminOnly: true, template: 'simple' },
    { id: 'mechas', label: 'Mechas', count: 3, adminOnly: true, template: 'simple' },
    { id: 'envios', label: 'Envíos', count: 1, adminOnly: true, template: 'shipping' },
    { id: 'barras', label: 'Cód. Barras', count: 12, adminOnly: true, template: 'barcode' }
  ]);

  const AROMAS_130G = Object.freeze([
    'Cata 11:11',
    'Coco Glow Nº 3',
    'Mandarina de Araira',
    'Palo Santo & Salvia',
    'Manzana & Canela',
    'Blueberry Glacé'
  ]);

  const BARCODE_FORMATS = Object.freeze([
    { id: 'gs1', label: 'Estándar GS1 (57 × 19 mm)', widthMm: 0, heightMm: 0, perLabel: 1 },
    { id: '25x9', label: '2.5 cm × 9 mm (25 × 9 mm)', widthMm: 25, heightMm: 9, perLabel: 1 },
    { id: '28x8', label: '28 mm × 8 mm', widthMm: 28, heightMm: 8, perLabel: 1 },
    { id: '29x9', label: '29 mm × 9 mm', widthMm: 29, heightMm: 9, perLabel: 1 },
    { id: '30x9', label: '3 cm × 9 mm (30 × 9 mm)', widthMm: 30, heightMm: 9, perLabel: 1 },
    { id: '30x10', label: '3 cm × 1 cm (30 × 10 mm)', widthMm: 30, heightMm: 10, perLabel: 1 },
    { id: '32x12', label: '3.2 cm × 1.2 cm (32 × 12 mm)', widthMm: 32, heightMm: 12, perLabel: 1 },
    { id: '35x9', label: '3.5 cm × 9 mm (35 × 9 mm)', widthMm: 35, heightMm: 9, perLabel: 1 },
    { id: 'x4', label: '4 por etiqueta (2.5 cm × 8.5 mm c/u)', widthMm: 25, heightMm: 8.5, perLabel: 4 }
  ]);

  const BASE_AROMAS = [
    { sourceId: 1, name: 'Mahogany Teak Wood & Coconut', moment: 'Noche', netContent: '190 g / 6.70 oz', ean13: '7596246002876', cpe: '1026622516' },
    { sourceId: 2, name: 'Vainilla & Canela', moment: 'Tarde', netContent: '190 g / 6.70 oz', ean13: '7596246002890', cpe: '1026622513' },
    { sourceId: 3, name: 'Coco Francisquí', moment: 'Tarde', netContent: '190 g / 6.70 oz', ean13: '7596246002906', cpe: '1026622511' },
    { sourceId: 4, name: 'Petals After Dark Nº 11', moment: 'Noche', netContent: '190 g / 6.70 oz', ean13: '7596246002517', cpe: '1026622517' },
    { sourceId: 5, name: 'Cata 11:11', moment: 'Mañana', netContent: '130 g / 4.59 oz', ean13: '7596246002944', cpe: '1026622509' },
    { sourceId: 6, name: 'Coco Glow Nº 3', moment: 'Mañana', netContent: '130 g / 4.59 oz', ean13: '7596246002937', cpe: '1026622510' },
    { sourceId: 7, name: 'Mandarina de Araira', moment: 'Noche', netContent: '130 g / 4.59 oz', ean13: '7596246002920', cpe: '1026622508' },
    { sourceId: 8, name: 'Palo Santo & Salvia', moment: 'Tarde', netContent: '130 g / 4.59 oz', ean13: '7596246002913', cpe: '1026622515' },
    { sourceId: 9, name: 'Eucalipto & Menta Glaciar', moment: 'Mañana', netContent: '190 g / 6.70 oz', ean13: '7596246002883', cpe: '1026622506' },
    { sourceId: 10, name: 'Frutos Rojos & Madera Oscura', moment: 'Mañana', netContent: '190 g / 6.70 oz', ean13: '7596246002869', cpe: '1026622507' },
    { sourceId: 11, name: 'Manzana & Canela', moment: 'Tarde', netContent: '130 g / 4.59 oz', ean13: '7590022001749', cpe: '0418440544' },
    { sourceId: 12, name: 'Blueberry Glacé', moment: 'Noche', netContent: '130 g / 4.59 oz', ean13: '7590022001817', cpe: '0418440540' }
  ];

  const PACK_COMBOS = [
    [5, 12], [5, 6], [5, 7], [5, 11], [5, 8],
    [6, 12], [6, 7], [6, 11], [6, 8],
    [7, 12], [7, 11], [7, 8],
    [11, 12], [8, 12], [8, 11]
  ];

  const aromaById = {};
  BASE_AROMAS.forEach(function (a) { aromaById[a.sourceId] = a; });

  const PRODUCTS_LIST = [];

  // 1. ETIQUETAS CONTROL AROMAS (12) — Encargado y Admin
  BASE_AROMAS.forEach(function (a) {
    PRODUCTS_LIST.push({
      id: 'aroma-' + a.sourceId,
      sourceId: a.sourceId,
      category: 'aromas',
      categoryLabel: 'Aromas',
      adminOnly: false,
      template: 'lot',
      moment: a.moment,
      name: a.name,
      labelTitle: a.name,
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: a.netContent,
      weightText: '',
      compactLogo: false,
      uniformBold: false
    });
  });

  // 2. ETIQUETAS CONTROL INTENCIONES (4) — Encargado y Admin
  [
    { sourceId: 14, name: 'Nuevos Comienzos' },
    { sourceId: 15, name: 'Renovación' },
    { sourceId: 16, name: 'Prosperidad' },
    { sourceId: 17, name: 'Amor' }
  ].forEach(function (item) {
    PRODUCTS_LIST.push({
      id: 'intencion-' + item.sourceId,
      sourceId: item.sourceId,
      category: 'intenciones',
      categoryLabel: 'Intenciones',
      adminOnly: false,
      template: 'lot',
      moment: '',
      name: item.name,
      labelTitle: 'Vela Aromática ' + item.name,
      intentionName: item.name,
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      weightText: '',
      compactLogo: true,
      uniformBold: true
    });
  });

  // 3. ETIQUETAS CONTROL PACK X2 (15) — Encargado y Admin
  PACK_COMBOS.forEach(function (pair) {
    const a1 = aromaById[pair[0]].name;
    const a2 = aromaById[pair[1]].name;
    PRODUCTS_LIST.push({
      id: 'packx2-' + pair[0] + '-' + pair[1],
      sourceId: 13,
      combo: pair[0] + ',' + pair[1],
      category: 'packx2',
      categoryLabel: 'Pack x2',
      adminOnly: false,
      template: 'lot',
      moment: '',
      name: a1 + ' y ' + a2,
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: a1 + ' y ' + a2,
      comboAromas: [a1, a2],
      netContent: '2 velas de 130 g / 4.59 oz',
      weightText: '',
      compactLogo: true,
      uniformBold: true
    });
  });

  // 4. ETIQUETAS SOLO AROMA (12) — Solo Admin
  BASE_AROMAS.forEach(function (a) {
    PRODUCTS_LIST.push({
      id: 'solo-aroma-' + a.sourceId,
      sourceId: a.sourceId,
      category: 'solo_aroma',
      categoryLabel: 'Solo Aroma',
      adminOnly: true,
      template: 'simple',
      moment: a.moment,
      name: a.name,
      labelTitle: a.name,
      weightText: '',
      compactLogo: true
    });
  });

  // 5. SOLO AROMAS 240 G (12) — Solo Admin
  BASE_AROMAS.forEach(function (a) {
    PRODUCTS_LIST.push({
      id: 'solo-aroma-240-' + a.sourceId,
      sourceId: a.sourceId,
      category: 'solo_aroma_240',
      categoryLabel: 'Aroma 240 g',
      adminOnly: true,
      template: 'simple',
      moment: a.moment,
      name: a.name + ' (240 g)',
      labelTitle: a.name,
      weightText: '240 g',
      compactLogo: true
    });
  });

  // 6. Muestras MM (14) — Solo Admin
  [
    { id: 'mm-ander-1', name: 'Ander Fig MM1', line: 'Ander Fig' },
    { id: 'mm-ander-2', name: 'Ander Fig MM2', line: 'Ander Fig' },
    { id: 'mm-andres-1', name: 'Andrés Mist MM1', line: 'Andrés Mist' },
    { id: 'mm-andres-2', name: 'Andrés Mist MM2', line: 'Andrés Mist' },
    { id: 'mm-bejuma-1', name: 'Bejuma Bitter MM1', line: 'Bejuma Bitter' },
    { id: 'mm-cattleya-1', name: 'Cattleya MM1', line: 'Cattleya' },
    { id: 'mm-cattleya-2', name: 'Cattleya MM2', line: 'Cattleya' },
    { id: 'mm-colonial-1', name: 'Colonial Limit MM1', line: 'Colonial Limit' },
    { id: 'mm-colonial-2', name: 'Colonial Limit MM2', line: 'Colonial Limit' },
    { id: 'mm-criollo-2', name: 'Criollo Cacao MM2', line: 'Criollo Cacao' },
    { id: 'mm-monte-1', name: 'Monte Claro MM1', line: 'Monte Claro' },
    { id: 'mm-monte-2', name: 'Monte Claro MM2', line: 'Monte Claro' },
    { id: 'mm-pampata-1', name: 'Pampata MM1', line: 'Pampata' },
    { id: 'mm-pampata-2', name: 'Pampata MM2', line: 'Pampata' }
  ].forEach(function (m) {
    PRODUCTS_LIST.push({
      id: m.id,
      category: 'muestras',
      categoryLabel: 'Muestras MM',
      adminOnly: true,
      template: 'simple',
      moment: m.line,
      name: m.name,
      labelTitle: m.name,
      weightText: '',
      compactLogo: true
    });
  });

  // 7. MECHAS (3) — Solo Admin
  [
    { id: 'mecha-1', name: 'MECHA HP 147 NF', code: 'HP 147 NF' },
    { id: 'mecha-2', name: 'MECHA HP 156 NF', code: 'HP 156 NF' },
    { id: 'mecha-3', name: 'MECHA HP 816 SP', code: 'HP 816 SP' }
  ].forEach(function (mc) {
    PRODUCTS_LIST.push({
      id: mc.id,
      category: 'mechas',
      categoryLabel: 'Mechas',
      adminOnly: true,
      template: 'simple',
      moment: 'Mecha',
      name: mc.name,
      labelTitle: mc.name,
      weightText: '',
      compactLogo: true
    });
  });

  // 8. ENVIOS (1) — Solo Admin
  PRODUCTS_LIST.push({
    id: 'envio-1',
    sourceId: 1,
    category: 'envios',
    categoryLabel: 'Envíos',
    adminOnly: true,
    template: 'shipping',
    moment: 'Despacho',
    name: 'Envío a Central Madeirense',
    labelTitle: 'Envío a Central Madeirense',
    destination: 'Central Madeirense',
    sender: 'Karla Montilla',
    phone: '0424-7718497',
    compactLogo: true
  });

  // 9. CÓDIGOS DE BARRAS VELAS AROMÁTICAS (12) — Solo Admin
  BASE_AROMAS.forEach(function (a) {
    PRODUCTS_LIST.push({
      id: 'barra-' + a.sourceId,
      sourceId: a.sourceId,
      category: 'barras',
      categoryLabel: 'Cód. Barras',
      adminOnly: true,
      template: 'barcode',
      moment: 'EAN-13',
      name: a.name,
      labelTitle: a.name,
      ean13: a.ean13,
      cpe: a.cpe,
      barcodeFormat: 'gs1'
    });
  });

  const PRODUCTS = Object.freeze(PRODUCTS_LIST);

  function normalizeText(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[º°]/g, '')
      .trim();
  }

  function getCategoriesForRole(isAdmin) {
    return CATEGORIES.filter(function (c) {
      return isAdmin || !c.adminOnly;
    });
  }

  function getProductsForRole(isAdmin) {
    return PRODUCTS.filter(function (p) {
      return isAdmin || !p.adminOnly;
    });
  }

  function getById(id, isAdmin) {
    const found = PRODUCTS.find(function (p) { return p.id === id; });
    if (found && (isAdmin || !found.adminOnly)) {
      return found;
    }
    return PRODUCTS[0];
  }

  function getFirstByCategory(category, isAdmin) {
    const allowed = getProductsForRole(isAdmin);
    return allowed.find(function (p) { return p.category === category; }) || allowed[0];
  }

  function matchesQuery(prod, normalizedQuery) {
    if (!normalizedQuery) return true;
    const haystack = normalizeText(
      [
        prod.name,
        prod.labelTitle,
        prod.subtitle,
        prod.netContent,
        prod.weightText,
        prod.categoryLabel,
        prod.moment,
        prod.ean13,
        prod.cpe,
        prod.destination,
        prod.sender
      ].join(' ')
    );
    return normalizedQuery.split(/\s+/).every(function (term) {
      return haystack.indexOf(term) !== -1;
    });
  }

  function filterProducts(query, category, isAdmin) {
    const q = normalizeText(query);
    const cat = category || 'aromas';
    return getProductsForRole(isAdmin).filter(function (p) {
      if (p.category !== cat) return false;
      return matchesQuery(p, q);
    });
  }

  function searchAllCategories(query, isAdmin) {
    const q = normalizeText(query);
    if (!q) return [];
    const summary = [];
    getCategoriesForRole(isAdmin).forEach(function (cat) {
      const count = getProductsForRole(isAdmin).filter(function (p) {
        return p.category === cat.id && matchesQuery(p, q);
      }).length;
      if (count > 0) {
        summary.push({ id: cat.id, label: cat.label, count: count });
      }
    });
    return summary;
  }

  function getBarcodeFormat(formatId) {
    return BARCODE_FORMATS.find(function (f) { return f.id === formatId; }) || BARCODE_FORMATS[0];
  }

  global.BipaCatalog = {
    DEFAULT_LOT_DATA: DEFAULT_LOT_DATA,
    CATEGORIES: CATEGORIES,
    AROMAS_130G: AROMAS_130G,
    BARCODE_FORMATS: BARCODE_FORMATS,
    PRODUCTS: PRODUCTS,
    getCategoriesForRole: getCategoriesForRole,
    getProductsForRole: getProductsForRole,
    getById: getById,
    getFirstByCategory: getFirstByCategory,
    filterProducts: filterProducts,
    searchAllCategories: searchAllCategories,
    getBarcodeFormat: getBarcodeFormat
  };
})(window);
