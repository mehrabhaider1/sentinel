import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Points, Line, Text } from "@react-three/drei";
import * as THREE from "three";

function CyberShield() {
  const meshRef = useRef<THREE.Mesh>(null);
  const shieldRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const orbitRingRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    const targetX = pointer.x * 0.3;
    const targetY = pointer.y * 0.2;

    // Main shield gentle rotation following pointer
    meshRef.current.rotation.x += (Math.sin(t * 0.12) * 0.08 + targetY - meshRef.current.rotation.x) * 0.02;
    meshRef.current.rotation.y += (Math.sin(t * 0.08) * 0.08 + targetX - meshRef.current.rotation.y) * 0.02;
    meshRef.current.position.y = Math.sin(t * 0.25) * 0.08;

    // Shield inner glow pulse
    //if (shieldRef.current) {
      //shieldRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.008);
    //}

    // Orbital rings at different angles
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.12;
    if (ring1Ref.current) ring1Ref.current.rotation.x = Math.sin(t * 0.1) * 0.1;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.18;
    if (ring2Ref.current) ring2Ref.current.rotation.z = Math.sin(t * 0.08) * 0.1;
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.08;
    if (ring3Ref.current) ring3Ref.current.rotation.x = Math.sin(t * 0.06) * 0.15;

    // Orbit ring rotation
    if (orbitRingRef.current) {
      orbitRingRef.current.rotation.x = Math.PI / 3;
      orbitRingRef.current.rotation.z = t * 0.15;
    }
  });

  return (
    <group>
      {/* Outer glowing orbital rings */}
      <mesh ref={ring1Ref} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[2.6, 0.015, 16, 80]} />
        <meshBasicMaterial color="#00c880" transparent opacity={0.25} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[0.5, 0.3, 0]}>
        <torusGeometry args={[2.8, 0.012, 16, 80]} />
        <meshBasicMaterial color="#306afa" transparent opacity={0.2} />
      </mesh>
      <mesh ref={ring3Ref} rotation={[1.2, 0, 0.5]}>
        <torusGeometry args={[2.4, 0.01, 16, 80]} />
        <meshBasicMaterial color="#5699ff" transparent opacity={0.15} />
      </mesh>

      {/* Horizontal orbit ring with orbiting dots */}
      <mesh ref={orbitRingRef}>
        <ringGeometry args={[1.8, 2.0, 64]} />
        <meshBasicMaterial color="#00c880" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>

      {/* Orbiting security nodes */}
      {[0, 1, 2, 3].map((i) => (
        <OrbitingNode key={i} index={i} count={4} radius={1.9} />
      ))}

      {/* Main shield/globe - the core */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.4, 2]} />
          <MeshDistortMaterial
            color="#00c880"
            emissive="#00c880"
            emissiveIntensity={0.12}
            roughness={0.2}
            metalness={0.85}
            distort={0.12}
            speed={1.2}
            transparent
            opacity={0.65}
          />
        </mesh>
      </Float>

      {/* Inner glowing core */}
      <mesh ref={shieldRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial color="#00c880" transparent opacity={0.5} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>

      {/* Energy shield ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.3, 64]} />
        <meshBasicMaterial color="#00c880" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Second shield ring offset */}
      <mesh rotation={[Math.PI / 3, 0.5, 0]}>
        <ringGeometry args={[0.6, 1.2, 48]} />
        <meshBasicMaterial color="#306afa" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function OrbitingNode({ index, count, radius }: { index: number; count: number; radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = (index / count) * Math.PI * 2;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.4;
    const a = angle + t;
    ref.current.position.x = Math.cos(a) * radius;
    ref.current.position.z = Math.sin(a) * radius;
    ref.current.position.y = Math.sin(a * 2) * 0.1;
  });

  return (
    <mesh ref={ref} position={[radius, 0, 0]}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color="#00c880" transparent opacity={0.6} />
    </mesh>
  );
}

function NetworkConnections() {
  const linesRef = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.6 + Math.random() * 0.8;
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
    }
    return pts;
  }, []);

  const connections = useMemo(() => {
    const conns: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        if (Math.random() > 0.85) {
          conns.push([points[i], points[j]]);
        }
      }
    }
    return conns;
  }, [points]);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={linesRef}>
      {connections.map(([start, end], i) => (
        <Line
          key={i}
          points={[start, end]}
          color="#00c880"
          lineWidth={0.5}
          transparent
          opacity={0.12}
        />
      ))}
    </group>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      const t = Math.random();
      if (t > 0.6) {
        cols[i * 3] = 0; cols[i * 3 + 1] = 0.78; cols[i * 3 + 2] = 0.5;
      } else if (t > 0.3) {
        cols[i * 3] = 0.19; cols[i * 3 + 1] = 0.42; cols[i * 3 + 2] = 0.98;
      } else {
        cols[i * 3] = 1; cols[i * 3 + 1] = 0.56; cols[i * 3 + 2] = 0.27;
      }
    }
    return [pos, cols];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.012;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.008) * 0.03;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial size={0.035} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function DataStreams() {
  const count = 8;

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => (
        <DataStream key={i} index={i} total={count} />
      ))}
    </group>
  );
}

function DataStream({ index, total }: { index: number; total: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = (index / total) * Math.PI * 2;

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.3 + index;
    const r = 2.2 + Math.sin(t * 0.5) * 0.3;
    const a = angle + t * 0.2;
    ref.current.position.x = Math.cos(a) * r;
    ref.current.position.z = Math.sin(a) * r;
    ref.current.position.y = Math.sin(a * 1.5 + t) * 0.5;
    ref.current.scale.setScalar(0.5 + Math.sin(t * 2) * 0.3);
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.03, 0.03, 0.03]} />
      <meshBasicMaterial color="#00c880" transparent opacity={0.5} />
    </mesh>
  );
}

function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0.5, 7);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0.5, 7], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
          });
          canvas.addEventListener("webglcontextrestored", () => {});
        }}
      >
        <CameraController />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#00c880" />
        <pointLight position={[-5, -3, 3]} intensity={0.6} color="#306afa" />
        <pointLight position={[0, -5, 5]} intensity={0.3} color="#5699ff" />
        <CyberShield />
        <NetworkConnections />
        <ParticleField />
        <DataStreams />
        {/* Glow background */}
        <mesh>
          <sphereGeometry args={[3.5, 32, 32]} />
          <meshBasicMaterial color="#00c880" transparent opacity={0.03} />
        </mesh>
      </Canvas>
    </div>
  );
}
