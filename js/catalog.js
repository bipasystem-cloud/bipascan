/**
 * BIPA Etiquetas de Lote · Catálogo exclusivo de las 3 carpetas de control:
 * 1. ETIQUETAS CONTROL AROMAS (12 fragancias)
 * 2. ETIQUETAS CONTROL INTENCIONES (4 velas)
 * 3. ETIQUETAS CONTROL PACK X2 (15 combinaciones)
 */
(function (global) {
  'use strict';

  const DEFAULT_LOT_DATA = Object.freeze({
    lot: '02062658001L7',
    elaboration: '15/10/2026',
    expiry: '15/10/2028'
  });

  const CATEGORIES = Object.freeze([
    { id: 'aromas', label: 'Aromas', count: 12 },
    { id: 'intenciones', label: 'Intenciones', count: 4 },
    { id: 'packx2', label: 'Pack x2', count: 15 }
  ]);

  const AROMAS_130G = Object.freeze([
    'Cata 11:11',
    'Coco Glow Nº 3',
    'Mandarina de Araira',
    'Palo Santo & Salvia',
    'Manzana & Canela',
    'Blueberry Glacé'
  ]);

  const PRODUCTS = Object.freeze([
    // ---- 1. ETIQUETAS CONTROL AROMAS (12 archivos) ----
    {
      id: 'aroma-1',
      sourceId: 1,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Noche',
      name: 'Mahogany Teak Wood & Coconut',
      labelTitle: 'Mahogany Teak Wood & Coconut',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-2',
      sourceId: 2,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Tarde',
      name: 'Vainilla & Canela',
      labelTitle: 'Vainilla & Canela',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-3',
      sourceId: 3,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Tarde',
      name: 'Coco Francisquí',
      labelTitle: 'Coco Francisquí',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-4',
      sourceId: 4,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Noche',
      name: 'Petals After Dark Nº 11',
      labelTitle: 'Petals After Dark Nº 11',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-5',
      sourceId: 5,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Mañana',
      name: 'Cata 11:11',
      labelTitle: 'Cata 11:11',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '130 g / 4.59 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-6',
      sourceId: 6,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Mañana',
      name: 'Coco Glow Nº 3',
      labelTitle: 'Coco Glow Nº 3',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '130 g / 4.59 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-7',
      sourceId: 7,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Noche',
      name: 'Mandarina de Araira',
      labelTitle: 'Mandarina de Araira',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '130 g / 4.59 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-8',
      sourceId: 8,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Tarde',
      name: 'Palo Santo & Salvia',
      labelTitle: 'Palo Santo & Salvia',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '130 g / 4.59 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-9',
      sourceId: 9,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Mañana',
      name: 'Eucalipto & Menta Glaciar',
      labelTitle: 'Eucalipto & Menta Glaciar',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-10',
      sourceId: 10,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Mañana',
      name: 'Frutos Rojos & Madera Oscura',
      labelTitle: 'Frutos Rojos & Madera Oscura',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-11',
      sourceId: 11,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Tarde',
      name: 'Manzana & Canela',
      labelTitle: 'Manzana & Canela',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '130 g / 4.59 oz',
      compactLogo: false,
      uniformBold: false
    },
    {
      id: 'aroma-12',
      sourceId: 12,
      category: 'aromas',
      categoryLabel: 'Aromas',
      moment: 'Noche',
      name: 'Blueberry Glacé',
      labelTitle: 'Blueberry Glacé',
      intentionName: '',
      subtitle: '',
      comboAromas: null,
      netContent: '130 g / 4.59 oz',
      compactLogo: false,
      uniformBold: false
    },

    // ---- 2. ETIQUETAS CONTROL INTENCIONES (4 archivos) ----
    {
      id: 'intencion-14',
      sourceId: 14,
      category: 'intenciones',
      categoryLabel: 'Intenciones',
      moment: '',
      name: 'Nuevos Comienzos',
      labelTitle: 'Vela Aromática Nuevos Comienzos',
      intentionName: 'Nuevos Comienzos',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'intencion-15',
      sourceId: 15,
      category: 'intenciones',
      categoryLabel: 'Intenciones',
      moment: '',
      name: 'Renovación',
      labelTitle: 'Vela Aromática Renovación',
      intentionName: 'Renovación',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'intencion-16',
      sourceId: 16,
      category: 'intenciones',
      categoryLabel: 'Intenciones',
      moment: '',
      name: 'Prosperidad',
      labelTitle: 'Vela Aromática Prosperidad',
      intentionName: 'Prosperidad',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'intencion-17',
      sourceId: 17,
      category: 'intenciones',
      categoryLabel: 'Intenciones',
      moment: '',
      name: 'Amor',
      labelTitle: 'Vela Aromática Amor',
      intentionName: 'Amor',
      subtitle: '',
      comboAromas: null,
      netContent: '190 g / 6.70 oz',
      compactLogo: true,
      uniformBold: true
    },

    // ---- 3. ETIQUETAS CONTROL PACK X2 (15 archivos) ----
    {
      id: 'packx2-5-12',
      sourceId: 13,
      combo: '5,12',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Cata 11:11 y Blueberry Glacé',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Cata 11:11 y Blueberry Glacé',
      comboAromas: ['Cata 11:11', 'Blueberry Glacé'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-5-6',
      sourceId: 13,
      combo: '5,6',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Cata 11:11 y Coco Glow Nº 3',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Cata 11:11 y Coco Glow Nº 3',
      comboAromas: ['Cata 11:11', 'Coco Glow Nº 3'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-5-7',
      sourceId: 13,
      combo: '5,7',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Cata 11:11 y Mandarina de Araira',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Cata 11:11 y Mandarina de Araira',
      comboAromas: ['Cata 11:11', 'Mandarina de Araira'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-5-11',
      sourceId: 13,
      combo: '5,11',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Cata 11:11 y Manzana & Canela',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Cata 11:11 y Manzana & Canela',
      comboAromas: ['Cata 11:11', 'Manzana & Canela'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-5-8',
      sourceId: 13,
      combo: '5,8',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Cata 11:11 y Palo Santo & Salvia',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Cata 11:11 y Palo Santo & Salvia',
      comboAromas: ['Cata 11:11', 'Palo Santo & Salvia'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-6-12',
      sourceId: 13,
      combo: '6,12',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Coco Glow Nº 3 y Blueberry Glacé',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Coco Glow Nº 3 y Blueberry Glacé',
      comboAromas: ['Coco Glow Nº 3', 'Blueberry Glacé'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-6-7',
      sourceId: 13,
      combo: '6,7',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Coco Glow Nº 3 y Mandarina de Araira',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Coco Glow Nº 3 y Mandarina de Araira',
      comboAromas: ['Coco Glow Nº 3', 'Mandarina de Araira'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-6-11',
      sourceId: 13,
      combo: '6,11',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Coco Glow Nº 3 y Manzana & Canela',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Coco Glow Nº 3 y Manzana & Canela',
      comboAromas: ['Coco Glow Nº 3', 'Manzana & Canela'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-6-8',
      sourceId: 13,
      combo: '6,8',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Coco Glow Nº 3 y Palo Santo & Salvia',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Coco Glow Nº 3 y Palo Santo & Salvia',
      comboAromas: ['Coco Glow Nº 3', 'Palo Santo & Salvia'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-7-12',
      sourceId: 13,
      combo: '7,12',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Mandarina de Araira y Blueberry Glacé',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Mandarina de Araira y Blueberry Glacé',
      comboAromas: ['Mandarina de Araira', 'Blueberry Glacé'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-7-11',
      sourceId: 13,
      combo: '7,11',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Mandarina de Araira y Manzana & Canela',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Mandarina de Araira y Manzana & Canela',
      comboAromas: ['Mandarina de Araira', 'Manzana & Canela'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-7-8',
      sourceId: 13,
      combo: '7,8',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Mandarina de Araira y Palo Santo & Salvia',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Mandarina de Araira y Palo Santo & Salvia',
      comboAromas: ['Mandarina de Araira', 'Palo Santo & Salvia'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-11-12',
      sourceId: 13,
      combo: '11,12',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Manzana & Canela y Blueberry Glacé',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Manzana & Canela y Blueberry Glacé',
      comboAromas: ['Manzana & Canela', 'Blueberry Glacé'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-8-12',
      sourceId: 13,
      combo: '8,12',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Palo Santo & Salvia y Blueberry Glacé',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Palo Santo & Salvia y Blueberry Glacé',
      comboAromas: ['Palo Santo & Salvia', 'Blueberry Glacé'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    },
    {
      id: 'packx2-8-11',
      sourceId: 13,
      combo: '8,11',
      category: 'packx2',
      categoryLabel: 'Pack x2',
      moment: '',
      name: 'Palo Santo & Salvia y Manzana & Canela',
      labelTitle: 'Velas aromáticas Pack X2',
      intentionName: '',
      subtitle: 'Palo Santo & Salvia y Manzana & Canela',
      comboAromas: ['Palo Santo & Salvia', 'Manzana & Canela'],
      netContent: '2 velas de 130 g / 4.59 oz',
      compactLogo: true,
      uniformBold: true
    }
  ]);

  function normalizeText(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[º°]/g, '')
      .trim();
  }

  function getById(id) {
    return PRODUCTS.find(function (p) { return p.id === id; }) || PRODUCTS[0];
  }

  function getFirstByCategory(category) {
    return PRODUCTS.find(function (p) { return p.category === category; }) || PRODUCTS[0];
  }

  function matchesQuery(prod, normalizedQuery) {
    if (!normalizedQuery) return true;
    const haystack = normalizeText(
      [prod.name, prod.labelTitle, prod.subtitle, prod.netContent, prod.categoryLabel, prod.moment].join(' ')
    );
    return normalizedQuery.split(/\s+/).every(function (term) {
      return haystack.indexOf(term) !== -1;
    });
  }

  function filterProducts(query, category) {
    const q = normalizeText(query);
    const cat = category || 'aromas';
    return PRODUCTS.filter(function (p) {
      if (p.category !== cat) return false;
      return matchesQuery(p, q);
    });
  }

  function searchAllCategories(query) {
    const q = normalizeText(query);
    if (!q) return [];
    const summary = [];
    CATEGORIES.forEach(function (cat) {
      const count = PRODUCTS.filter(function (p) {
        return p.category === cat.id && matchesQuery(p, q);
      }).length;
      if (count > 0) {
        summary.push({ id: cat.id, label: cat.label, count: count });
      }
    });
    return summary;
  }

  global.BipaCatalog = {
    DEFAULT_LOT_DATA: DEFAULT_LOT_DATA,
    CATEGORIES: CATEGORIES,
    AROMAS_130G: AROMAS_130G,
    PRODUCTS: PRODUCTS,
    getById: getById,
    getFirstByCategory: getFirstByCategory,
    filterProducts: filterProducts,
    searchAllCategories: searchAllCategories
  };
})(window);
