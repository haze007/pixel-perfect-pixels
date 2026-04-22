import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { LeatherSwatch } from "./LeatherSwatch";

interface LeatherViewerProps {
  lab: { l: number; a: number; b: number };
}

export function LeatherViewer({ lab }: LeatherViewerProps) {
  return (
    <div className="h-full w-full">
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
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
