import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { labToRgbValues } from "@/lib/lab-to-rgb";

interface LeatherSwatchProps {
  lab: { l: number; a: number; b: number };
}

export function LeatherSwatch({ lab }: LeatherSwatchProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const color = useMemo(() => {
    const rgb = labToRgbValues(lab.l, lab.a, lab.b);
    return new THREE.Color(rgb.r, rgb.g, rgb.b);
  }, [lab.l, lab.a, lab.b]);

  useFrame(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      mat.color.lerp(color, 0.1);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-0.1, 0, 0]}>
      <planeGeometry args={[2.4, 1.6, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.65}
        metalness={0}
        clearcoat={0.1}
        clearcoatRoughness={0.4}
        sheen={0.3}
        sheenRoughness={0.5}
        sheenColor={new THREE.Color(0.3, 0.2, 0.15)}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
