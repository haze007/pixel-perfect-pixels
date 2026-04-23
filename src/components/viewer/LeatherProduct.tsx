import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { labToRgbValues } from "@/lib/lab-to-rgb";
import { getLeatherTextures } from "@/lib/leather-textures";
import type { LeatherProfile } from "@/lib/process-conditions";

export type ProductType =
  | "swatch"
  | "wallet"
  | "cardholder"
  | "belt"
  | "tote"
  | "notebook";

const DEFAULT_PROFILE: LeatherProfile = {
  roughness: 0.72,
  normalScale: 0.55,
  sheen: 0.35,
  sheenRoughness: 0.65,
  clearcoat: 0.04,
  clearcoatRoughness: 0.70,
  aoIntensity: 0.80,
};

interface Props {
  lab: { l: number; a: number; b: number };
  product: ProductType;
  profile?: LeatherProfile;
}

/* ── Shared leather material ────────────────────────────────────── */

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function useLeatherMaterial(
  lab: { l: number; a: number; b: number },
  profile: LeatherProfile = DEFAULT_PROFILE,
) {
  const meshRef = useRef<THREE.Mesh | null>(null);

  // Recompute target colour whenever Lab changes
  const targetColor = useMemo(() => {
    const rgb = labToRgbValues(lab.l, lab.a, lab.b);
    return new THREE.Color(rgb.r, rgb.g, rgb.b);
  }, [lab.l, lab.a, lab.b]);

  // Store profile values in a ref so useFrame can read latest without re-subscribing
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // Animate colour AND all material properties each frame
  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    const p   = profileRef.current;
    const t   = 0.06; // lerp speed

    mat.color.lerp(targetColor, 0.08);
    mat.roughness          = lerp(mat.roughness,          p.roughness,          t);
    mat.normalScale.set(
      lerp(mat.normalScale.x, p.normalScale, t),
      lerp(mat.normalScale.y, p.normalScale, t),
    );
    mat.sheen              = lerp(mat.sheen,              p.sheen,              t);
    mat.sheenRoughness     = lerp(mat.sheenRoughness,     p.sheenRoughness,     t);
    mat.clearcoat          = lerp(mat.clearcoat,          p.clearcoat,          t);
    mat.clearcoatRoughness = lerp(mat.clearcoatRoughness, p.clearcoatRoughness, t);
    mat.aoMapIntensity     = lerp(mat.aoMapIntensity,     p.aoIntensity,        t);
    mat.needsUpdate = false; // properties update inline — no full recompile needed
  });

  const textures  = useMemo(() => getLeatherTextures(), []);
  const initColor = useMemo(() => {
    const rgb = labToRgbValues(lab.l, lab.a, lab.b);
    return new THREE.Color(rgb.r, rgb.g, rgb.b);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color:              initColor,
        roughness:          DEFAULT_PROFILE.roughness,
        roughnessMap:       textures.roughnessMap,
        normalMap:          textures.normalMap,
        normalScale:        new THREE.Vector2(DEFAULT_PROFILE.normalScale, DEFAULT_PROFILE.normalScale),
        aoMap:              textures.aoMap,
        aoMapIntensity:     DEFAULT_PROFILE.aoIntensity,
        metalness:          0,
        clearcoat:          DEFAULT_PROFILE.clearcoat,
        clearcoatRoughness: DEFAULT_PROFILE.clearcoatRoughness,
        sheen:              DEFAULT_PROFILE.sheen,
        sheenRoughness:     DEFAULT_PROFILE.sheenRoughness,
        sheenColor:         new THREE.Color(0.18, 0.12, 0.08),
        side:               THREE.DoubleSide,
        envMapIntensity:    1.1,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { meshRef, material };
}

/* ── Swatch ─────────────────────────────────────────────────────── */

function Swatch({ lab, profile }: { lab: Props["lab"]; profile?: LeatherProfile }) {
  const { meshRef, material } = useLeatherMaterial(lab, profile);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2.6, 1.75, 60, 40);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z =
        Math.sin(x * 1.4) * 0.045 +
        Math.cos(y * 1.9) * 0.03 +
        Math.sin(x * 5 + y * 3) * 0.007;
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} rotation={[-0.08, 0.05, 0]} castShadow receiveShadow />
  );
}

/* ── Bifold Wallet ──────────────────────────────────────────────── */

function Wallet({ lab, profile }: { lab: Props["lab"]; profile?: LeatherProfile }) {
  const { meshRef, material } = useLeatherMaterial(lab, profile);

  return (
    <group rotation={[0.12, -0.25, 0.04]}>
      <mesh ref={meshRef} material={material} castShadow receiveShadow>
        <boxGeometry args={[1.9, 1.15, 0.18]} />
      </mesh>
      <mesh position={[0, 0, 0.092]} material={material} castShadow>
        <boxGeometry args={[0.018, 1.15, 0.004]} />
      </mesh>
      {([-0.93, 0.93] as const).map((ox) => (
        <mesh key={ox} position={[ox, 0, 0.092]} material={material}>
          <boxGeometry args={[0.012, 1.05, 0.002]} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Card Holder ────────────────────────────────────────────────── */

function CardHolder({ lab, profile }: { lab: Props["lab"]; profile?: LeatherProfile }) {
  const { meshRef, material } = useLeatherMaterial(lab, profile);

  return (
    <group rotation={[0.1, -0.2, 0.03]}>
      <mesh ref={meshRef} material={material} castShadow receiveShadow>
        <boxGeometry args={[1.55, 1.0, 0.07]} />
      </mesh>
      <mesh position={[0, 0.45, 0.037]} material={material}>
        <boxGeometry args={[1.3, 0.06, 0.002]} />
      </mesh>
    </group>
  );
}

/* ── Belt ───────────────────────────────────────────────────────── */

function Belt({ lab, profile }: { lab: Props["lab"]; profile?: LeatherProfile }) {
  const { meshRef, material } = useLeatherMaterial(lab, profile);

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(4.2, 0.22, 80, 4);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = -Math.pow(x / 2.1, 2) * 0.38;
      pos.setZ(i, z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group rotation={[0.05, 0, 0]}>
      <mesh ref={meshRef} geometry={geo} material={material} castShadow receiveShadow />
      <mesh position={[-1.95, 0, 0.05]}>
        <boxGeometry args={[0.28, 0.3, 0.04]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

/* ── Tote Bag ───────────────────────────────────────────────────── */

function ToteBag({ lab, profile }: { lab: Props["lab"]; profile?: LeatherProfile }) {
  const { meshRef, material } = useLeatherMaterial(lab, profile);

  const handleCurve = useMemo(() => {
    const pts = [
      new THREE.Vector3(-0.45, 1.0, 0),
      new THREE.Vector3(-0.45, 1.45, 0.1),
      new THREE.Vector3(0, 1.65, 0.14),
      new THREE.Vector3(0.45, 1.45, 0.1),
      new THREE.Vector3(0.45, 1.0, 0),
    ];
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  const handleGeo = useMemo(
    () => new THREE.TubeGeometry(handleCurve, 24, 0.04, 8, false),
    [handleCurve]
  );

  return (
    <group rotation={[0.06, -0.18, 0]}>
      <mesh ref={meshRef} material={material} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.55, 0.55]} />
      </mesh>
      <mesh position={[0, -0.82, 0]} material={material}>
        <boxGeometry args={[1.82, 0.1, 0.56]} />
      </mesh>
      <mesh geometry={handleGeo} material={material} castShadow />
      <mesh geometry={handleGeo} material={material} castShadow position={[0, 0, 0]} scale={[-1, 1, 1]} />
    </group>
  );
}

/* ── Notebook Cover ─────────────────────────────────────────────── */

function Notebook({ lab, profile }: { lab: Props["lab"]; profile?: LeatherProfile }) {
  const { meshRef, material } = useLeatherMaterial(lab, profile);

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1.7, 2.3, 40, 56);
    const pos = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin(x * 2.2) * 0.05 + Math.cos(y * 0.9) * 0.03;
      pos.setZ(i, z);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group rotation={[-0.1, 0.3, 0.05]}>
      <mesh ref={meshRef} geometry={geo} material={material} castShadow receiveShadow />
      <mesh position={[-0.86, 0, -0.015]} material={material}>
        <boxGeometry args={[0.04, 2.32, 0.03]} />
      </mesh>
    </group>
  );
}

/* ── Dispatcher ─────────────────────────────────────────────────── */

export function LeatherProduct({ lab, product, profile }: Props) {
  switch (product) {
    case "wallet":      return <Wallet      lab={lab} profile={profile} />;
    case "cardholder":  return <CardHolder  lab={lab} profile={profile} />;
    case "belt":        return <Belt        lab={lab} profile={profile} />;
    case "tote":        return <ToteBag     lab={lab} profile={profile} />;
    case "notebook":    return <Notebook    lab={lab} profile={profile} />;
    default:            return <Swatch      lab={lab} profile={profile} />;
  }
}
