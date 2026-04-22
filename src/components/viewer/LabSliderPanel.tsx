import { Slider } from "@/components/ui/slider";
import { labToHex } from "@/lib/lab-to-rgb";

interface LabSliderPanelProps {
  lab: { l: number; a: number; b: number };
  onChange: (lab: { l: number; a: number; b: number }) => void;
}

export function LabSliderPanel({ lab, onChange }: LabSliderPanelProps) {
  const hex = labToHex(lab.l, lab.a, lab.b);

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-1">Colour Preview</h2>
        <div className="flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-lg border border-border"
            style={{ backgroundColor: hex }}
          />
          <div>
            <p className="text-xs font-mono text-muted-foreground">{hex}</p>
            <p className="text-xs font-mono text-muted-foreground">
              L*{lab.l.toFixed(0)} a*{lab.a.toFixed(0)} b*{lab.b.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">L* (Lightness)</span>
            <span className="font-mono text-foreground">{lab.l.toFixed(0)}</span>
          </div>
          <Slider
            value={[lab.l]}
            onValueChange={([v]) => onChange({ ...lab, l: v })}
            min={0}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">a* (Green–Red)</span>
            <span className="font-mono text-foreground">{lab.a.toFixed(0)}</span>
          </div>
          <Slider
            value={[lab.a]}
            onValueChange={([v]) => onChange({ ...lab, a: v })}
            min={-128}
            max={128}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">b* (Blue–Yellow)</span>
            <span className="font-mono text-foreground">{lab.b.toFixed(0)}</span>
          </div>
          <Slider
            value={[lab.b]}
            onValueChange={([v]) => onChange({ ...lab, b: v })}
            min={-128}
            max={128}
            step={1}
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Material</h3>
        <p className="text-xs text-muted-foreground">
          MeshPhysicalMaterial with roughness 0.65, clearcoat 0.1, sheen 0.3
        </p>
      </div>
    </div>
  );
}
