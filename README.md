# BIPA · Etiquetas QR (Zebra ZD410)

Aplicación web estática (PWA) diseñada con la identidad visual oficial de **Productos BIPA** para generar e imprimir etiquetas térmicas con código QR desde un teléfono Android conectado a una impresora **Zebra ZD410** por cable USB OTG (vía **WebUSB** con código **ZPL II** nativo o plan B mediante **RawBT**).

Sin frameworks, sin Node.js y sin pasos de compilación: lista para servir directamente en **GitHub Pages**.

---

## Estructura del proyecto

```text
bipa-etiquetas-qr/
├── index.html          # Aplicación principal (mobile-first)
├── manifest.json       # Configuración PWA standalone (rutas relativas)
├── sw.js               # Service Worker para carga rápida y uso sin conexión
├── css/
│   └── styles.css      # Identidad visual oficial BIPA
├── js/
│   ├── qrcode.js       # Generador QR ISO/IEC 18004 local (sin dependencias)
│   ├── storage.js      # Persistencia en localStorage (calibración y correlativo)
│   ├── zpl.js          # Generador ZPL II (^BQN, ^A0, 203/300 dpi, offsets)
│   ├── zebra-usb.js    # Controlador WebUSB (VID 0x0A5F + modo amplio) y RawBT
│   └── app.js          # Lógica de interfaz y vista previa en vivo
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

1. Crea un repositorio nuevo en GitHub (por ejemplo, `bipa-etiquetas-qr`).
2. Sube todos los archivos de esta carpeta a la rama `main` (asegúrate de conservar la estructura de carpetas `assets/`, `css/` y `js/`).
3. En el repositorio, ve a **Settings → Pages**.
4. En **Build and deployment → Source**, elige **Deploy from a branch**.
5. Selecciona la rama **`main`** y la carpeta **`/ (root)`**, y pulsa **Save**.
6. En 1 a 2 minutos tu enlace estará activo en:
   `https://<tu-usuario>.github.io/<nombre-del-repo>/`

> **Nota:** GitHub Pages sirve la app por **HTTPS**, requisito indispensable para que **WebUSB** y la instalación como acceso directo (PWA) funcionen en Android.

---

## Cómo agregar el acceso directo en Android

1. Abre el enlace de GitHub Pages en **Google Chrome** desde el teléfono Android.
2. Toca el menú de tres puntos (**⋮**) en la esquina superior derecha.
3. Selecciona **«Agregar a la pantalla principal»** (o **«Instalar aplicación»**).
4. Confirma tocando **Instalar** / **Agregar**.
5. La aplicación aparecerá con el ícono de **BIPA** y abrirá en pantalla completa (modo `standalone`), guardando tu calibración y último correlativo automáticamente.

---

## Uso con impresora Zebra ZD410

- **Impresión directa (WebUSB):** conecta la Zebra ZD410 al teléfono con un cable/adaptador **USB OTG**, abre la app en Chrome y pulsa **«Conectar Zebra (USB)»**. Si el adaptador reporta otro identificador USB, usa **«Otro USB»**.
- **Plan B (RawBT):** si el navegador restringe WebUSB o Android mantiene ocupada la interfaz USB, instala **RawBT** en Android y usa el botón **«Imprimir vía RawBT»** para enviar exactamente el mismo código ZPL II.
- **Calibración:** abre el panel **«Calibración y ZPL»** para cambiar entre `203 dpi` y `300 dpi`, ajustar las medidas de etiqueta en mm (`50 × 20 mm` por defecto), corregir desplazamientos X/Y en dots, cambiar el factor del QR (`^BQN`) o copiar el ZPL II generado.
