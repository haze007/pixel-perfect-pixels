import { converter, formatHex } from "culori";

const labToRgb = converter("rgb");

export function labToHex(l: number, a: number, b: number): string {
  const color = labToRgb({ mode: "lab", l, a, b });
  if (!color) return "#808080";
  return formatHex(color) ?? "#808080";
}

export function labToRgbValues(l: number, a: number, b: number): { r: number; g: number; b: number } {
  const color = labToRgb({ mode: "lab", l, a, b });
  if (!color) return { r: 0.5, g: 0.5, b: 0.5 };
  return {
    r: Math.max(0, Math.min(1, color.r)),
    g: Math.max(0, Math.min(1, color.g)),
    b: Math.max(0, Math.min(1, color.b)),
  };
}
