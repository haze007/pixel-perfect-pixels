import * as THREE from "three";

/* ── Deterministic noise helpers ─────────────────────────────────── */

function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  const ux = smoothstep(fx);
  const uy = smoothstep(fy);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x: number, y: number, octaves = 5): number {
  let v = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += valueNoise(x * freq, y * freq) * amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return v;
}

/** Worley/cell noise – produces the pore pattern */
function worley(x: number, y: number, freq: number): number {
  const px = x * freq;
  const py = y * freq;
  const cx = Math.floor(px);
  const cy = Math.floor(py);
  let minDist = 9999;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const h1 = hash(cx + dx, cy + dy);
      const h2 = hash(cx + dx + 53, cy + dy + 71);
      const ptX = cx + dx + h1;
      const ptY = cy + dy + h2;
      const dist = Math.sqrt((px - ptX) ** 2 + (py - ptY) ** 2);
      if (dist < minDist) minDist = dist;
    }
  }
  return Math.min(1, minDist);
}

/* ── Main generator ──────────────────────────────────────────────── */

export interface LeatherTextures {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  aoMap: THREE.CanvasTexture;
}

let cached: LeatherTextures | null = null;

export function getLeatherTextures(): LeatherTextures {
  if (cached) return cached;

  const SIZE = 512;
  const GRAIN_SCALE = 6;

  const nCanvas = document.createElement("canvas");
  const rCanvas = document.createElement("canvas");
  const aCanvas = document.createElement("canvas");
  nCanvas.width = nCanvas.height = SIZE;
  rCanvas.width = rCanvas.height = SIZE;
  aCanvas.width = aCanvas.height = SIZE;

  const nCtx = nCanvas.getContext("2d")!;
  const rCtx = rCanvas.getContext("2d")!;
  const aCtx = aCanvas.getContext("2d")!;

  const nData = nCtx.createImageData(SIZE, SIZE);
  const rData = rCtx.createImageData(SIZE, SIZE);
  const aData = aCtx.createImageData(SIZE, SIZE);

  /** Sample height at (sx, sy) in scaled space */
  const sampleHeight = (sx: number, sy: number): number => {
    const grain = fbm(sx, sy, 6);
    const fiber = (Math.sin(sy * 8 + fbm(sx * 0.4, sy * 0.4, 3) * 5) * 0.5 + 0.5) * 0.15;
    const pore  = Math.max(0, 1 - worley(sx / GRAIN_SCALE, sy / GRAIN_SCALE, 22) * 4) * 0.55;
    return grain * 0.7 + fiber - pore;
  };

  const EPS = 2.0 / SIZE;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const sx = (x / SIZE) * GRAIN_SCALE;
      const sy = (y / SIZE) * GRAIN_SCALE;

      const h  = sampleHeight(sx, sy);
      const hL = sampleHeight(sx - EPS * GRAIN_SCALE, sy);
      const hR = sampleHeight(sx + EPS * GRAIN_SCALE, sy);
      const hD = sampleHeight(sx, sy - EPS * GRAIN_SCALE);
      const hU = sampleHeight(sx, sy + EPS * GRAIN_SCALE);

      // Pore depth for AO/roughness
      const pore = Math.max(0, 1 - worley(sx / GRAIN_SCALE, sy / GRAIN_SCALE, 22) * 4) * 0.55;

      // Normal from finite-difference gradient
      const STRENGTH = 5.0;
      const nX = (hL - hR) * STRENGTH;
      const nY = (hD - hU) * STRENGTH;
      const nZ = 1.0;
      const len = Math.sqrt(nX * nX + nY * nY + nZ * nZ);

      const idx = (y * SIZE + x) * 4;

      // Normal map
      nData.data[idx]     = Math.floor((nX / len * 0.5 + 0.5) * 255);
      nData.data[idx + 1] = Math.floor((nY / len * 0.5 + 0.5) * 255);
      nData.data[idx + 2] = Math.floor((nZ / len * 0.5 + 0.5) * 255);
      nData.data[idx + 3] = 255;

      // Roughness: pores rougher, grain peaks slightly shinier
      const rough = Math.max(0, Math.min(1, 0.62 + pore * 0.25 - h * 0.08));
      const rv = Math.floor(rough * 255);
      rData.data[idx] = rData.data[idx + 1] = rData.data[idx + 2] = rv;
      rData.data[idx + 3] = 255;

      // AO: darker in pores and grain crevices
      const ao = Math.max(0, Math.min(1, 1 - pore * 0.45 - Math.max(0, 0.35 - h) * 0.3));
      const av = Math.floor(ao * 255);
      aData.data[idx] = aData.data[idx + 1] = aData.data[idx + 2] = av;
      aData.data[idx + 3] = 255;
    }
  }

  nCtx.putImageData(nData, 0, 0);
  rCtx.putImageData(rData, 0, 0);
  aCtx.putImageData(aData, 0, 0);

  const make = (canvas: HTMLCanvasElement, repeatX = 4, repeatY = 4) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.needsUpdate = true;
    return tex;
  };

  cached = {
    normalMap:    make(nCanvas, 5, 5),
    roughnessMap: make(rCanvas, 5, 5),
    aoMap:        make(aCanvas, 5, 5),
  };

  return cached;
}
