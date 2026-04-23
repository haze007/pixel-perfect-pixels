/**
 * Delta E (CIE76) — Euclidean distance in L*a*b* space
 */
export function deltaE76(
  l1: number, a1: number, b1: number,
  l2: number, a2: number, b2: number
): number {
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Simple additive LAB mix: weighted average by percentage.
 * Returns predicted LAB for a multi-step recipe.
 */
export function predictRecipeLab(
  steps: Array<{ lab_l: number | null; lab_a: number | null; lab_b: number | null; percentage: number }>,
  baseLab: { l: number; a: number; b: number }
): { l: number; a: number; b: number } {
  if (steps.length === 0) return baseLab;

  let totalPct = 0;
  let sumL = 0, sumA = 0, sumB = 0;

  for (const step of steps) {
    if (step.lab_l == null) continue;
    totalPct += step.percentage;
    sumL += (step.lab_l ?? 0) * step.percentage;
    sumA += (step.lab_a ?? 0) * step.percentage;
    sumB += (step.lab_b ?? 0) * step.percentage;
  }

  if (totalPct === 0) return baseLab;

  // Blend: base * (1 - influence) + chemicals * influence
  // influence = clamp(totalPct / 100, 0, 1)
  const influence = Math.min(totalPct / 100, 1);
  const chemL = sumL / totalPct;
  const chemA = sumA / totalPct;
  const chemB = sumB / totalPct;

  return {
    l: baseLab.l * (1 - influence) + chemL * influence,
    a: baseLab.a * (1 - influence) + chemA * influence,
    b: baseLab.b * (1 - influence) + chemB * influence,
  };
}
