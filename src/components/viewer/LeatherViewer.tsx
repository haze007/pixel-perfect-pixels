import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { LeatherSwatch } from "./LeatherSwatch";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRESETS = [
  { value: "studio", label: "Studio" },
  { value: "warehouse", label: "Warehouse" },
  { value: "city", label: "City" },
  { value: "sunset", label: "Sunset" },
  { value: "dawn", label: "Dawn" },
  { value: "night", label: "Night" },
  { value: "forest", label: "Forest" },
  { value: "lobby", label: "Lobby" },
] as const;

type EnvPreset = typeof PRESETS[number]["value"];

interface LeatherViewerProps {
  lab: { l: number; a: number; b: number };
}

export function LeatherViewer({ lab }: LeatherViewerProps) {
  const [preset, setPreset] = useState<EnvPreset>("studio");

  return (
    <div className="relative h-full w-full">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <LeatherSwatch lab={lab} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={1.5}
          maxDistance={6}
        />
        <Environment preset={preset} />
      </Canvas>
      {/* Environment preset selector */}
      <div className="absolute bottom-3 left-3">
        <Select value={preset} onValueChange={(v) => setPreset(v as EnvPreset)}>
          <SelectTrigger className="h-7 w-32 text-xs bg-surface-1/80 backdrop-blur border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
