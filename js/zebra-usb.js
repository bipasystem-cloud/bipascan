/**
 * BIPA Etiquetas QR · Conexión WebUSB para Zebra ZD410 y respaldo RawBT
 */
(function (global) {
  'use strict';

  const ZEBRA_VENDOR_ID = 0x0a5f;
  const USB_CLASS_PRINTER = 7;

  let activeDevice = null;
  let activeInterfaceNumber = null;
  let activeEndpointOut = null;
  let statusCallback = null;

  function isWebUsbSupported() {
    return typeof navigator !== 'undefined' && 'usb' in navigator && typeof navigator.usb.requestDevice === 'function';
  }

  function isConnected() {
    return Boolean(activeDevice && activeDevice.opened && activeEndpointOut !== null);
  }

  function getDeviceLabel(device) {
    if (!device) return '';
    const parts = [device.manufacturerName, device.productName].filter(Boolean);
    if (parts.length > 0) return parts.join(' ');
    const vid = device.vendorId ? '0x' + device.vendorId.toString(16).toUpperCase().padStart(4, '0') : 'USB';
    const pid = device.productId ? '0x' + device.productId.toString(16).toUpperCase().padStart(4, '0') : '';
    return 'Impresora Zebra (' + vid + (pid ? ':' + pid : '') + ')';
  }

  function notifyStatus(connected, reason) {
    if (typeof statusCallback === 'function') {
      statusCallback({
        connected: connected,
        deviceName: connected ? getDeviceLabel(activeDevice) : '',
        reason: reason || ''
      });
    }
  }

  /**
   * Traduce errores técnicos de WebUSB / Android OTG a mensajes claros en español.
   */
  function translateUsbError(err) {
    if (!err) return 'Error desconocido al comunicarse con la impresora USB.';
    const name = err.name || '';
    const msg = String(err.message || '');

    if (name === 'NotFoundError') {
      return 'No se seleccionó ninguna impresora. Verifica que el cable USB OTG esté bien conectado y la Zebra ZD410 encendida.';
    }
    if (name === 'SecurityError') {
      return 'No se otorgó permiso USB OTG. Vuelve a pulsar «Conectar Zebra (USB)» y acepta la solicitud en Android.';
    }
    if (name === 'NetworkError' || name === 'InvalidStateError') {
      if (/claim|interface|busy/i.test(msg)) {
        return 'La impresora está ocupada por otra app en el teléfono (como RawBT o el servicio de impresión). Ciérrala o usa «Imprimir vía RawBT».';
      }
      return 'Se interrumpió la conexión USB con la Zebra. Revisa el cable OTG y vuelve a conectarla.';
    }
    if (name === 'NotSupportedError') {
      return 'Este dispositivo USB no expone un canal de impresión compatible. Prueba «Imprimir vía RawBT».';
    }
    if (name === 'AbortError') {
      return 'La transferencia de datos hacia la impresora fue cancelada.';
    }
    if (/unable to claim interface/i.test(msg)) {
      return 'Android mantiene ocupada la interfaz USB de la impresora. Cierra otras apps de impresión o usa «Imprimir vía RawBT».';
    }
    return 'Error USB: ' + (msg || name);
  }

  /**
   * Busca la interfaz Printer Class (clase 7) con endpoint bulk OUT,
   * o en su defecto cualquier interfaz que exponga un endpoint bulk OUT.
   */
  function findPrinterEndpoint(device) {
    const config = device.configuration;
    if (!config || !config.interfaces) return null;

    let fallback = null;

    for (let i = 0; i < config.interfaces.length; i++) {
      const iface = config.interfaces[i];
      for (let j = 0; j < iface.alternates.length; j++) {
        const alt = iface.alternates[j];
        const outEp = alt.endpoints.find(function (ep) {
          return ep.direction === 'out' && ep.type === 'bulk';
        });
        if (!outEp) continue;

        const match = {
          interfaceNumber: iface.interfaceNumber,
          alternateSetting: alt.alternateSetting,
          endpointNumber: outEp.endpointNumber,
          packetSize: outEp.packetSize || 64
        };

        if (alt.interfaceClass === USB_CLASS_PRINTER) {
          return match;
        }
        if (!fallback) {
          fallback = match;
        }
      }
    }

    return fallback;
  }

  async function openAndClaim(device) {
    if (!device.opened) {
      await device.open();
    }
    if (device.configuration === null) {
      const firstConfig = device.configurations && device.configurations.length > 0
        ? device.configurations[0].configurationValue
        : 1;
      await device.selectConfiguration(firstConfig);
    }

    const found = findPrinterEndpoint(device);
    if (!found) {
      try { await device.close(); } catch (_e) {}
      throw new Error('El dispositivo seleccionado no tiene un puerto de salida de impresión (Bulk OUT).');
    }

    await device.claimInterface(found.interfaceNumber);
    if (typeof device.selectAlternateInterface === 'function' && found.alternateSetting !== undefined) {
      try {
        await device.selectAlternateInterface(found.interfaceNumber, found.alternateSetting);
      } catch (_ignore) {
        // Algunos dispositivos ya están en la configuración alterna activa
      }
    }

    activeDevice = device;
    activeInterfaceNumber = found.interfaceNumber;
    activeEndpointOut = found.endpointNumber;
    notifyStatus(true, 'connected');
    return getDeviceLabel(device);
  }

  async function disconnect() {
    const dev = activeDevice;
    const iface = activeInterfaceNumber;
    activeDevice = null;
    activeInterfaceNumber = null;
    activeEndpointOut = null;

    if (dev) {
      try {
        if (dev.opened && iface !== null) {
          await dev.releaseInterface(iface);
        }
      } catch (_e) {}
      try {
        if (dev.opened) {
          await dev.close();
        }
      } catch (_e) {}
    }

    notifyStatus(false, 'manual');
  }

  async function connect(options) {
    if (!isWebUsbSupported()) {
      throw new Error(
        'Este navegador no soporta WebUSB. Usa Google Chrome en Android (en HTTPS) o imprime con el botón «Imprimir vía RawBT».'
      );
    }

    const broadMode = Boolean(options && options.broadMode);
    const requestOpts = broadMode
      ? { filters: [] }
      : { filters: [{ vendorId: ZEBRA_VENDOR_ID }] };

    try {
      const device = await navigator.usb.requestDevice(requestOpts);
      if (activeDevice && activeDevice !== device) {
        await disconnect();
      }
      return await openAndClaim(device);
    } catch (err) {
      throw new Error(translateUsbError(err));
    }
  }

  /**
   * Intenta reconectar automáticamente una Zebra ya autorizada previamente.
   */
  async function tryAutoReconnect() {
    if (!isWebUsbSupported()) return false;
    try {
      const devices = await navigator.usb.getDevices();
      if (!devices || devices.length === 0) return false;
      const zebra = devices.find(function (d) { return d.vendorId === ZEBRA_VENDOR_ID; }) || devices[0];
      await openAndClaim(zebra);
      return true;
    } catch (_err) {
      return false;
    }
  }

  /**
   * Envía código ZPL II por WebUSB en bloques seguros para adaptadores OTG.
   */
  async function printZpl(zplString) {
    if (!isConnected()) {
      throw new Error('No hay ninguna impresora Zebra conectada. Pulsa «Conectar Zebra (USB)» primero.');
    }

    const bytes = new TextEncoder().encode(String(zplString));
    const chunkSize = 4096;

    try {
      for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length));
        const result = await activeDevice.transferOut(activeEndpointOut, chunk);
        if (result.status !== 'ok') {
          throw new Error('La impresora devolvió estado «' + result.status + '» al recibir los datos.');
        }
      }
    } catch (err) {
      // Si el cable se desconectó durante el envío, limpiar estado
      if (err && (err.name === 'NetworkError' || err.name === 'InvalidStateError')) {
        activeDevice = null;
        activeInterfaceNumber = null;
        activeEndpointOut = null;
        notifyStatus(false, 'disconnected');
      }
      throw new Error(translateUsbError(err));
    }
  }

  /**
   * Codifica UTF-8 a Base64 de forma segura (soporta ·, ñ y acentos).
   */
  function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(String(text));
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  /**
   * Plan B: abre el esquema rawbt:base64,... con el mismo código ZPL II.
   */
  function printViaRawBT(zplString) {
    const base64 = utf8ToBase64(zplString);
    const uri = 'rawbt:base64,' + base64;

    const link = document.createElement('a');
    link.href = uri;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(function () {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 300);

    return uri;
  }

  function init(onStatusChange) {
    statusCallback = onStatusChange;

    if (isWebUsbSupported()) {
      navigator.usb.addEventListener('disconnect', function (event) {
        if (activeDevice && event.device === activeDevice) {
          activeDevice = null;
          activeInterfaceNumber = null;
          activeEndpointOut = null;
          notifyStatus(false, 'unplugged');
        }
      });
    }
  }

  global.BipaZebraUSB = {
    ZEBRA_VENDOR_ID: ZEBRA_VENDOR_ID,
    init: init,
    isWebUsbSupported: isWebUsbSupported,
    isConnected: isConnected,
    connect: connect,
    disconnect: disconnect,
    tryAutoReconnect: tryAutoReconnect,
    printZpl: printZpl,
    printViaRawBT: printViaRawBT
  };
})(window);
