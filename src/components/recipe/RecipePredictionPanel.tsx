import { labToHex } from "@/lib/lab-to-rgb";
import { deltaE76 } from "@/lib/color-science";
import { Badge } from "@/components/ui/badge";

interface RecipePredictionPanelProps {
  targetLab: { l: number; a: number; b: number } | null;
  predictedLab: { l: number; a: number; b: number };
}

export function RecipePredictionPanel({ targetLab, predictedLab }: RecipePredictionPanelProps) {
  const predictedHex = labToHex(predictedLab.l, predictedLab.a, predictedLab.b);
  const targetHex = targetLab ? labToHex(targetLab.l, targetLab.a, targetLab.b) : null;
  const dE = targetLab
    ? deltaE76(targetLab.l, targetLab.a, targetLab.b, predictedLab.l, predictedLab.a, predictedLab.b)
    : null;

  const deLabel = dE != null
    ? dE < 1 ? "Excellent" : dE < 2 ? "Good" : dE < 3.5 ? "Acceptable" : "Poor"
    : null;
  const deColor = dE != null
    ? dE < 2 ? "text-success" : dE < 3.5 ? "text-warning" : "text-destructive"
    : "";

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Colour Prediction</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Predicted</span>
          <div className="h-16 rounded-lg border border-border" style={{ backgroundColor: predictedHex }} />
          <p className="text-xs font-mono text-muted-foreground">{predictedHex}</p>
          <p className="text-xs font-mono text-muted-foreground">
            L*{predictedLab.l.toFixed(1)} a*{predictedLab.a.toFixed(1)} b*{predictedLab.b.toFixed(1)}
          </p>
        </div>
        {targetLab && targetHex && (
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Target</span>
            <div className="h-16 rounded-lg border border-border" style={{ backgroundColor: targetHex }} />
            <p className="text-xs font-mono text-muted-foreground">{targetHex}</p>
            <p className="text-xs font-mono text-muted-foreground">
              L*{targetLab.l.toFixed(1)} a*{targetLab.a.toFixed(1)} b*{targetLab.b.toFixed(1)}
            </p>
          </div>
        )}
      </div>

      {dE != null && (
        <div className="rounded-lg border border-border bg-surface-1 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">ΔE (CIE76)</span>
            <span className={`text-lg font-bold font-mono ${deColor}`}>{dE.toFixed(2)}</span>
          </div>
          <Badge variant="secondary" className={`text-xs ${deColor}`}>{deLabel}</Badge>
        </div>
      )}
    </div>
  );
}
