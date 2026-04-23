import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Grid } from "@react-three/drei";
import { useState, Suspense, Component } from "react";
import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeatherProduct, type ProductType } from "./LeatherProduct";

/* ── Config ─────────────────────────────────────────────────────── */

const ENV_PRESETS = [
  { value: "studio",    label: "Studio" },
  { value: "warehouse", label: "Warehouse" },
  { value: "sunset",    label: "Sunset" },
  { value: "dawn",      label: "Dawn" },
  { value: "forest",    label: "Forest" },
  { value: "lobby",     label: "Lobby" },
] as const;

const PRODUCTS: { value: ProductType; label: string }[] = [
  { value: "swatch",     label: "Leather Swatch" },
  { value: "wallet",     label: "Bifold Wallet" },
  { value: "cardholder", label: "Card Holder" },
  { value: "belt",       label: "Belt" },
  { value: "tote",       label: "Tote Bag" },
  { value: "notebook",   label: "Notebook Cover" },
];

/* ── Error boundary ─────────────────────────────────────────────── */

class CanvasErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-surface-1 text-muted-foreground text-sm">
          3D preview unavailable
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── Scene ──────────────────────────────────────────────────────── */

function Scene({
  lab,
  product,
  envPreset,
}: {
  lab: { l: number; a: number; b: number };
  product: ProductType;
  envPreset: string;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 5]}  intensity={1.1} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 3, -3]} intensity={0.3} />
      <directionalLight position={[0, -2, 4]}  intensity={0.15} />
      <pointLight position={[0, 4, 2]} intensity={0.45} color="#fff8f0" />

      <LeatherProduct lab={lab} product={product} />

      <ContactShadows
        position={[0, -1.08, 0]}
        opacity={0.3}
        scale={7}
        blur={2.5}
        far={3}
        color="#1e1a14"
      />

      <Grid
        position={[0, -1.09, 0]}
        args={[12, 12]}
        cellSize={0.4}
        cellThickness={0.4}
        cellColor="#d4d0ca"
        sectionSize={1.2}
        sectionThickness={0.8}
        sectionColor="#c8c4be"
        fadeDistance={7}
        fadeStrength={1.5}
        infiniteGrid
      />

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={1.2}
        maxDistance={7}
        maxPolarAngle={Math.PI / 1.85}
        makeDefault
      />

      <Suspense fallback={null}>
        <Environment preset={envPreset as any} />
      </Suspense>
    </>
  );
}

/* ── Public component ───────────────────────────────────────────── */

interface LeatherViewerProps {
  lab: { l: number; a: number; b: number };
}

export function LeatherViewer({ lab }: LeatherViewerProps) {
  const [envPreset, setEnvPreset] = useState("studio");
  const [product, setProduct]     = useState<ProductType>("swatch");

  return (
    <div className="relative h-full w-full" style={{ background: "oklch(0.968 0.004 255)" }}>
      <CanvasErrorBoundary>
        <Canvas
          shadows
          camera={{ position: [0, 0.3, 3.2], fov: 42 }}
          gl={{ antialias: true, alpha: true, toneMapping: 3 }}
          style={{ width: "100%", height: "100%", background: "transparent" }}
        >
          <Suspense fallback={null}>
            <Scene lab={lab} product={product} envPreset={envPreset} />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>

      {/* Bottom controls */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          <Select value={product} onValueChange={(v) => setProduct(v as ProductType)}>
            <SelectTrigger className="h-7 w-36 text-xs bg-background/85 backdrop-blur border-border shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCTS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1" />
        <div className="pointer-events-auto">
          <Select value={envPreset} onValueChange={setEnvPreset}>
            <SelectTrigger className="h-7 w-28 text-xs bg-background/85 backdrop-blur border-border shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENV_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interaction hint */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="text-[10px] text-muted-foreground/70 bg-background/70 backdrop-blur px-2.5 py-0.5 rounded-full">
          Drag · Scroll to zoom · Right-drag to pan
        </span>
      </div>
    </div>
  );
}
