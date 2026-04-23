import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  type ProcessConditions,
  SUBSTRATE_ORIGIN_LABELS,
  TANNING_TYPE_LABELS,
  estimateDyeUptake,
  type SubstrateOrigin,
  type TanningType,
} from "@/lib/process-conditions";

interface Props {
  conditions: ProcessConditions;
  onChange: (c: ProcessConditions) => void;
}

function set<K extends keyof ProcessConditions>(
  prev: ProcessConditions,
  key: K,
  value: ProcessConditions[K]
): ProcessConditions {
  return { ...prev, [key]: value };
}

function UptakeBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? "#16A34A" : pct >= 40 ? "#D97706" : "#DC2626";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-medium">
        <span className="text-muted-foreground">Est. Dye Uptake</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[9px] text-muted-foreground leading-tight">
        {pct >= 70
          ? "Optimal — high exhaustion expected"
          : pct >= 40
          ? "Moderate — adjust pH or temperature"
          : "Low — dye may not fully penetrate"}
      </p>
    </div>
  );
}

export function ProcessConditionsPanel({ conditions, onChange }: Props) {
  const uptake = estimateDyeUptake(conditions);

  const row = (
    label: string,
    value: number | string,
    unit: string,
    children: React.ReactNode
  ) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-mono text-foreground">
          {typeof value === "number" ? value.toFixed(value < 10 ? 1 : 0) : value}
          {unit && <span className="text-muted-foreground ml-0.5">{unit}</span>}
        </span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Process Conditions
      </p>

      {/* Dye uptake estimator */}
      <UptakeBar value={uptake} />

      <div className="border-t border-border pt-3 space-y-4">
        {row("pH (float end)", conditions.pH, "", (
          <Slider
            value={[conditions.pH]}
            onValueChange={([v]) => onChange(set(conditions, "pH", v))}
            min={2.5} max={9.0} step={0.1}
          />
        ))}
        {row("Temperature", conditions.temperature_c, "°C", (
          <Slider
            value={[conditions.temperature_c]}
            onValueChange={([v]) => onChange(set(conditions, "temperature_c", v))}
            min={20} max={80} step={1}
          />
        ))}
        {row("Float ratio", conditions.float_ratio, ":1", (
          <Slider
            value={[conditions.float_ratio]}
            onValueChange={([v]) => onChange(set(conditions, "float_ratio", v))}
            min={0.5} max={10} step={0.5}
          />
        ))}
        {row("Drum speed", conditions.drum_speed_rpm, "rpm", (
          <Slider
            value={[conditions.drum_speed_rpm]}
            onValueChange={([v]) => onChange(set(conditions, "drum_speed_rpm", v))}
            min={2} max={18} step={1}
          />
        ))}
        {row("Dyeing time", conditions.dyeing_time_min, "min", (
          <Slider
            value={[conditions.dyeing_time_min]}
            onValueChange={([v]) => onChange(set(conditions, "dyeing_time_min", v))}
            min={10} max={180} step={5}
          />
        ))}
        {row("Fixation pH", conditions.fixation_ph, "", (
          <Slider
            value={[conditions.fixation_ph]}
            onValueChange={([v]) => onChange(set(conditions, "fixation_ph", v))}
            min={2.5} max={6.0} step={0.1}
          />
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-2.5">
        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Substrate Origin</span>
          <Select
            value={conditions.substrate_origin}
            onValueChange={(v) => onChange(set(conditions, "substrate_origin", v as SubstrateOrigin))}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.entries(SUBSTRATE_ORIGIN_LABELS) as [SubstrateOrigin, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Tanning System</span>
          <Select
            value={conditions.tanning_type}
            onValueChange={(v) => onChange(set(conditions, "tanning_type", v as TanningType))}
          >
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.entries(TANNING_TYPE_LABELS) as [TanningType, string][]).map(([k, v]) => (
                <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <label className="text-xs font-medium text-muted-foreground block mb-1">Trial Notes</label>
        <textarea
          value={conditions.notes}
          onChange={(e) => onChange(set(conditions, "notes", e.target.value))}
          rows={3}
          placeholder="Drum ID, hide batch, special observations…"
          className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition"
        />
      </div>
    </div>
  );
}
