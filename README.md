# BIPA · Etiquetas de Lote (Zebra ZD410)

Aplicación web estática (PWA) diseñada con la identidad visual oficial de **Productos BIPA** para generar e imprimir etiquetas térmicas de lote (**57 × 19 mm**) desde un teléfono Android conectado a una impresora **Zebra ZD410** por cable USB OTG (vía **WebUSB** con código **ZPL II** nativo o plan B mediante **RawBT**).

Sin frameworks, sin Node.js y sin pasos de compilación: lista para servir directamente en **GitHub Pages**.

---

## Catálogo incluido (3 categorías)

El catálogo reúne exclusivamente las 3 líneas de control de lotes:

1. **Aromas (12):** *Mahogany Teak Wood & Coconut*, *Vainilla & Canela*, *Coco Francisquí*, *Petals After Dark Nº 11*, *Cata 11:11*, *Coco Glow Nº 3*, *Mandarina de Araira*, *Palo Santo & Salvia*, *Eucalipto & Menta Glaciar*, *Frutos Rojos & Madera Oscura*, *Manzana & Canela* y *Blueberry Glacé*.
2. **Intenciones (4):** *Nuevos Comienzos*, *Renovación*, *Prosperidad* y *Amor* (plantilla `Vela Aromática <Intención>` con logo compacto).
3. **Pack x2 (15):** todas las combinaciones de 2 velas de `130 g / 4.59 oz` (plantilla de 6 filas con subtítulo de los dos aromas).

El formulario se adapta dinámicamente a la categoría seleccionada y permite editar cualquier campo (`Cont. Neto`, `Lote`, `Elaboración`, `Vencimiento`) antes de imprimir.

---

## Estructura del proyecto

```text
bipa-etiquetas-qr/
├── index.html          # Aplicación principal (mobile-first)
├── manifest.json       # Configuración PWA standalone (rutas relativas)
├── sw.js               # Service Worker (caché bipa-lotes-v5)
├── css/
│   └── styles.css      # Identidad visual oficial BIPA
├── js/
│   ├── catalog.js      # Catálogo de 3 categorías (Aromas, Intenciones, Pack x2)
│   ├── storage.js      # Persistencia en localStorage (calibración y lote activo)
│   ├── zpl.js          # Motor ZPL II (^GFA del logo, ^GB, ^A0N, 203/300 dpi)
│   ├── zebra-usb.js    # Controlador WebUSB (VID 0x0A5F + modo amplio) y RawBT
│   └── app.js          # Lógica de interfaz, 3 pestañas, formulario dinámico y zoom
└── assets/
    ├── logo-bipa.png
    ├── favicon.png
    ├── apple-touch-icon.png
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

---

## Cómo publicarla en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo, `bipa-etiquetas-lotes`).
2. Sube todos los archivos de esta carpeta a la rama `main` (conservando `assets/`, `css/` y `js/`).
3. En el repositorio, ve a **Settings → Pages**.
4. En **Build and deployment → Source**, elige **Deploy from a branch**.
5. Selecciona la rama **`main`** y la carpeta **`/ (root)`**, y pulsa **Save**.
6. En 1 a 2 minutos tu enlace estará activo en:
   `https://<tu-usuario>.github.io/<nombre-del-repo>/`

---

## Cómo agregar el acceso directo en Android

1. Abre el enlace de GitHub Pages en **Google Chrome** desde el teléfono Android.
2. Toca el menú de tres puntos (**⋮**) en la esquina superior derecha.
3. Selecciona **«Agregar a la pantalla principal»** (o **«Instalar aplicación»**).
4. Confirma tocando **Instalar** / **Agregar**.
5. La app abrirá en modo `standalone` con el ícono de **BIPA** y guardará tu último lote y calibración automáticamente.
