/**
 * BIPA Etiquetas QR · Generador QR ISO/IEC 18004 sin dependencias (Byte Mode, EC Level M)
 * Soporta versiones 1 a 12 (hasta 287 bytes UTF-8) con renderizado SVG nítido negro sobre blanco.
 */
(function (global) {
  'use strict';

  // Tablas GF(256) con polinomio primitivo 0x11D (x^8 + x^4 + x^3 + x^2 + 1)
  const EXP_TABLE = new Uint8Array(512);
  const LOG_TABLE = new Uint8Array(256);
  (function initGalois() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP_TABLE[i] = x;
      LOG_TABLE[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
      EXP_TABLE[i] = EXP_TABLE[i - 255];
    }
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
  }

  function rsGeneratorPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = new Array(poly.length + 1).fill(0);
      const factor = EXP_TABLE[i];
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], factor);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecCount) {
    const gen = rsGeneratorPoly(ecCount);
    const res = new Uint8Array(ecCount);
    for (let i = 0; i < data.length; i++) {
      const factor = data[i] ^ res[0];
      for (let j = 0; j < ecCount - 1; j++) {
        res[j] = res[j + 1];
      }
      res[ecCount - 1] = 0;
      if (factor !== 0) {
        for (let j = 0; j < ecCount; j++) {
          res[j] ^= gfMul(gen[j + 1], factor);
        }
      }
    }
    return res;
  }

  // Especificación ISO/IEC 18004 para Error Correction Level M (Versiones 1..12)
  // [totalCodewords, ecPerBlock, g1Blocks, g1Data, g2Blocks, g2Data]
  const VERSION_M = [
    null,
    [26, 10, 1, 16, 0, 0],     // v1  (21x21)  max 14 bytes
    [44, 16, 1, 28, 0, 0],     // v2  (25x25)  max 26 bytes
    [70, 26, 1, 44, 0, 0],     // v3  (29x29)  max 42 bytes
    [100, 18, 2, 32, 0, 0],    // v4  (33x33)  max 62 bytes
    [134, 24, 2, 43, 0, 0],    // v5  (37x37)  max 84 bytes
    [172, 16, 4, 27, 0, 0],    // v6  (41x41)  max 106 bytes
    [196, 18, 4, 31, 0, 0],    // v7  (45x45)  max 122 bytes
    [242, 22, 2, 38, 2, 39],   // v8  (49x49)  max 152 bytes
    [292, 22, 3, 36, 2, 37],   // v9  (53x53)  max 180 bytes
    [346, 26, 4, 43, 1, 44],   // v10 (57x57)  max 213 bytes
    [404, 30, 1, 50, 4, 51],   // v11 (61x61)  max 251 bytes
    [466, 22, 6, 36, 2, 37]    // v12 (65x65)  max 287 bytes
  ];

  // Posiciones de patrones de alineación por versión
  const ALIGN_POS = [
    null,
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58]
  ];

  // Bits de información de formato precalculados para EC Level M (00) + máscaras 0..7 con BCH + XOR 0x5412
  const FORMAT_BITS_M = [
    0x5412, // mask 0
    0x5125, // mask 1
    0x5e7c, // mask 2
    0x5b4b, // mask 3
    0x45f9, // mask 4
    0x40ce, // mask 5
    0x4f97, // mask 6
    0x4aa0  // mask 7
  ];

  // Bits de información de versión (18 bits BCH) para versiones 7..12
  const VERSION_BITS = {
    7: 0x07c94,
    8: 0x085bc,
    9: 0x09a99,
    10: 0x0a4d3,
    11: 0x0bbf6,
    12: 0x0c762
  };

  function encodeUtf8(text) {
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(text);
    }
    const encoded = unescape(encodeURIComponent(text));
    const arr = new Uint8Array(encoded.length);
    for (let i = 0; i < encoded.length; i++) arr[i] = encoded.charCodeAt(i);
    return arr;
  }

  function chooseVersion(byteLen) {
    for (let v = 1; v < VERSION_M.length; v++) {
      const spec = VERSION_M[v];
      const totalDataBytes = spec[2] * spec[3] + spec[4] * spec[5];
      const countBits = v <= 9 ? 8 : 16;
      const neededBits = 4 + countBits + byteLen * 8;
      if (neededBits <= totalDataBytes * 8) {
        return v;
      }
    }
    return VERSION_M.length - 1;
  }

  function buildCodewords(bytes, version) {
    const spec = VERSION_M[version];
    const ecPerBlock = spec[1];
    const g1Blocks = spec[2];
    const g1Data = spec[3];
    const g2Blocks = spec[4];
    const g2Data = spec[5];
    const totalDataBytes = g1Blocks * g1Data + g2Blocks * g2Data;

    const bits = [];
    function pushBits(val, len) {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((val >>> i) & 1);
      }
    }

    // Modo Byte: 0100
    pushBits(0b0100, 4);
    const countBits = version <= 9 ? 8 : 16;
    const maxPayload = Math.min(bytes.length, totalDataBytes - (countBits === 8 ? 2 : 3));
    pushBits(maxPayload, countBits);
    for (let i = 0; i < maxPayload; i++) {
      pushBits(bytes[i], 8);
    }

    // Terminador (hasta 4 ceros)
    const maxBits = totalDataBytes * 8;
    const termLen = Math.min(4, maxBits - bits.length);
    for (let i = 0; i < termLen; i++) bits.push(0);

    // Alinear a múltiplo de 8
    while (bits.length % 8 !== 0) bits.push(0);

    // Relleno alterno 0xEC, 0x11
    const dataBytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      dataBytes.push(b);
    }
    const padBytes = [0xec, 0x11];
    let p = 0;
    while (dataBytes.length < totalDataBytes) {
      dataBytes.push(padBytes[p % 2]);
      p++;
    }

    // Dividir en bloques y calcular Reed-Solomon
    const blocksData = [];
    const blocksEc = [];
    let offset = 0;

    for (let i = 0; i < g1Blocks; i++) {
      const slice = dataBytes.slice(offset, offset + g1Data);
      offset += g1Data;
      blocksData.push(slice);
      blocksEc.push(rsEncode(slice, ecPerBlock));
    }
    for (let i = 0; i < g2Blocks; i++) {
      const slice = dataBytes.slice(offset, offset + g2Data);
      offset += g2Data;
      blocksData.push(slice);
      blocksEc.push(rsEncode(slice, ecPerBlock));
    }

    // Intercalar bloques de datos y bloques EC
    const result = [];
    const maxDataLen = Math.max(g1Data, g2Data);
    for (let i = 0; i < maxDataLen; i++) {
      for (let b = 0; b < blocksData.length; b++) {
        if (i < blocksData[b].length) result.push(blocksData[b][i]);
      }
    }
    for (let i = 0; i < ecPerBlock; i++) {
      for (let b = 0; b < blocksEc.length; b++) {
        result.push(blocksEc[b][i]);
      }
    }

    return result;
  }

  function createBaseMatrix(version) {
    const size = version * 4 + 17;
    // -1 = libre, 0 = blanco fijo, 1 = negro fijo
    const modules = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
    const isFunc = Array.from({ length: size }, () => new Uint8Array(size));

    function setFunc(r, c, dark) {
      if (r < 0 || c < 0 || r >= size || c >= size) return;
      modules[r][c] = dark ? 1 : 0;
      isFunc[r][c] = 1;
    }

    function placeFinder(top, left) {
      for (let dr = -1; dr <= 7; dr++) {
        for (let dc = -1; dc <= 7; dc++) {
          const r = top + dr;
          const c = left + dc;
          if (r < 0 || c < 0 || r >= size || c >= size) continue;
          const dist = Math.max(Math.abs(dr - 3), Math.abs(dc - 3));
          const dark = dist !== 2 && dist !== 4;
          setFunc(r, c, dark);
        }
      }
    }

    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    // Patrones de sincronización (timing)
    for (let i = 8; i < size - 8; i++) {
      setFunc(6, i, i % 2 === 0);
      setFunc(i, 6, i % 2 === 0);
    }

    // Patrones de alineación
    const aligns = ALIGN_POS[version];
    for (let i = 0; i < aligns.length; i++) {
      for (let j = 0; j < aligns.length; j++) {
        const cr = aligns[i];
        const cc = aligns[j];
        if (isFunc[cr][cc]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const dist = Math.max(Math.abs(dr), Math.abs(dc));
            setFunc(cr + dr, cc + dc, dist !== 1);
          }
        }
      }
    }

    // Reservar áreas de formato (se llenan luego según máscara)
    for (let i = 0; i <= 8; i++) {
      if (i !== 6) {
        setFunc(8, i, false);
        setFunc(i, 8, false);
      }
    }
    for (let i = 0; i < 8; i++) {
      setFunc(8, size - 1 - i, false);
    }
    for (let i = 0; i < 7; i++) {
      setFunc(size - 1 - i, 8, false);
    }
    // Módulo oscuro obligatorio
    setFunc(size - 8, 8, true);

    // Información de versión (v7+)
    if (version >= 7 && VERSION_BITS[version] !== undefined) {
      const vbits = VERSION_BITS[version];
      for (let i = 0; i < 18; i++) {
        const bit = ((vbits >>> i) & 1) === 1;
        const a = Math.floor(i / 3);
        const b = size - 11 + (i % 3);
        setFunc(a, b, bit);
        setFunc(b, a, bit);
      }
    }

    return { size, modules, isFunc };
  }

  function applyFormatBits(modules, size, maskPattern) {
    const bits = FORMAT_BITS_M[maskPattern];
    const bitAt = (i) => ((bits >>> i) & 1);

    // Copia 1 alrededor del finder superior-izquierdo
    for (let i = 0; i <= 5; i++) modules[8][i] = bitAt(14 - i);
    modules[8][7] = bitAt(8);
    modules[8][8] = bitAt(7);
    modules[7][8] = bitAt(6);
    for (let i = 9; i <= 14; i++) modules[14 - i][8] = bitAt(14 - i);

    // Copia 2 (inferior-izquierdo y superior-derecho)
    for (let i = 0; i <= 6; i++) modules[size - 1 - i][8] = bitAt(14 - i);
    for (let i = 0; i <= 7; i++) modules[8][size - 8 + i] = bitAt(7 - i);
  }

  function maskCondition(mask, r, c) {
    switch (mask) {
      case 0: return (r + c) % 2 === 0;
      case 1: return r % 2 === 0;
      case 2: return c % 3 === 0;
      case 3: return (r + c) % 3 === 0;
      case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
      case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
      case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
      case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      default: return false;
    }
  }

  function fillDataWithMask(base, codewords, maskPattern) {
    const size = base.size;
    const modules = base.modules.map((row) => new Int8Array(row));
    const isFunc = base.isFunc;

    let bitIdx = 0;
    const totalBits = codewords.length * 8;
    let upward = true;

    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5; // saltar columna de timing
      for (let step = 0; step < size; step++) {
        const r = upward ? size - 1 - step : step;
        for (let colOffset = 0; colOffset < 2; colOffset++) {
          const c = right - colOffset;
          if (isFunc[r][c]) continue;
          let dark = 0;
          if (bitIdx < totalBits) {
            dark = (codewords[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1;
            bitIdx++;
          }
          if (maskCondition(maskPattern, r, c)) {
            dark ^= 1;
          }
          modules[r][c] = dark;
        }
      }
      upward = !upward;
    }

    applyFormatBits(modules, size, maskPattern);
    return modules;
  }

  function evaluatePenalty(modules, size) {
    let penalty = 0;

    // Regla 1: 5+ módulos iguales consecutivos en filas y columnas
    for (let r = 0; r < size; r++) {
      let runColor = modules[r][0];
      let runLen = 1;
      for (let c = 1; c < size; c++) {
        if (modules[r][c] === runColor) {
          runLen++;
        } else {
          if (runLen >= 5) penalty += 3 + (runLen - 5);
          runColor = modules[r][c];
          runLen = 1;
        }
      }
      if (runLen >= 5) penalty += 3 + (runLen - 5);
    }

    for (let c = 0; c < size; c++) {
      let runColor = modules[0][c];
      let runLen = 1;
      for (let r = 1; r < size; r++) {
        if (modules[r][c] === runColor) {
          runLen++;
        } else {
          if (runLen >= 5) penalty += 3 + (runLen - 5);
          runColor = modules[r][c];
          runLen = 1;
        }
      }
      if (runLen >= 5) penalty += 3 + (runLen - 5);
    }

    // Regla 2: Bloques 2x2 del mismo color
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const v = modules[r][c];
        if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) {
          penalty += 3;
        }
      }
    }

    // Regla 3: Patrón tipo finder (1:1:3:1:1 con 4 blancos antes o después)
    const pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    const pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - 11; c++) {
        let m1 = true;
        let m2 = true;
        for (let k = 0; k < 11; k++) {
          if (modules[r][c + k] !== pat1[k]) m1 = false;
          if (modules[r][c + k] !== pat2[k]) m2 = false;
        }
        if (m1 || m2) penalty += 40;
      }
    }
    for (let c = 0; c < size; c++) {
      for (let r = 0; r <= size - 11; r++) {
        let m1 = true;
        let m2 = true;
        for (let k = 0; k < 11; k++) {
          if (modules[r + k][c] !== pat1[k]) m1 = false;
          if (modules[r + k][c] !== pat2[k]) m2 = false;
        }
        if (m1 || m2) penalty += 40;
      }
    }

    // Regla 4: Balance de módulos oscuros
    let darkCount = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (modules[r][c] === 1) darkCount++;
      }
    }
    const percent = (darkCount * 100) / (size * size);
    const deviation = Math.floor(Math.abs(percent - 50) / 5);
    penalty += deviation * 10;

    return penalty;
  }

  function generateMatrix(text) {
    const safeText = text && text.length > 0 ? String(text) : ' ';
    const bytes = encodeUtf8(safeText);
    const version = chooseVersion(bytes.length);
    const codewords = buildCodewords(bytes, version);
    const base = createBaseMatrix(version);

    let bestModules = null;
    let bestPenalty = Infinity;

    for (let mask = 0; mask < 8; mask++) {
      const candidate = fillDataWithMask(base, codewords, mask);
      const score = evaluatePenalty(candidate, base.size);
      if (score < bestPenalty) {
        bestPenalty = score;
        bestModules = candidate;
      }
    }

    return {
      version: version,
      size: base.size,
      modules: bestModules
    };
  }

  function toSvg(text, quietZone) {
    const margin = typeof quietZone === 'number' ? quietZone : 2;
    const qr = generateMatrix(text);
    const dim = qr.size + margin * 2;
    const paths = [];

    for (let r = 0; r < qr.size; r++) {
      let c = 0;
      while (c < qr.size) {
        if (qr.modules[r][c] === 1) {
          let run = 1;
          while (c + run < qr.size && qr.modules[r][c + run] === 1) {
            run++;
          }
          paths.push('M' + (c + margin) + ',' + (r + margin) + 'h' + run + 'v1h-' + run + 'z');
          c += run;
        } else {
          c++;
        }
      }
    }

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      dim +
      ' ' +
      dim +
      '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Código QR">' +
      '<rect width="100%" height="100%" fill="#FFFFFF"/>' +
      '<path d="' +
      paths.join('') +
      '" fill="#000000"/>' +
      '</svg>'
    );
  }

  global.BipaQR = {
    generateMatrix: generateMatrix,
    toSvg: toSvg
  };
})(window);
