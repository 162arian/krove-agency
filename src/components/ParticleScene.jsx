import { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, ChromaticAberration, Bloom, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

/* ─── Particle vertex shader ──────────────────────────────────────────────── */
const vertexShader = `
  uniform float uTime;
  uniform vec2  uMouse;
  attribute float aScale;
  attribute vec3  aRandom;

  void main() {
    vec3 pos = position;
    float t = uTime * 0.18;

    pos.x += sin(pos.y * 0.55 + t       + aRandom.x * 6.28318) * 0.18;
    pos.y += cos(pos.x * 0.42 + t * 0.7 + aRandom.y * 6.28318) * 0.16;
    pos.z += sin(pos.z * 0.30 + t * 0.5 + aRandom.z * 6.28318) * 0.12;

    vec2 m = uMouse * vec2(3.8, 2.4);
    float d = length(pos.xy - m);
    float str = smoothstep(2.2, 0.0, d) * 0.55;
    if (d > 0.001) pos.xy += normalize(pos.xy - m) * str;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position  = projectionMatrix * mvPos;
    gl_PointSize = aScale * (210.0 / -mvPos.z);
  }
`

/* ─── Particle fragment shader ────────────────────────────────────────────── */
const fragmentShader = `
  void main() {
    vec2  uv   = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.14, 0.5, dist);
    gl_FragColor = vec4(0.42, 0.72, 1.0, alpha * 0.72);
  }
`

/* ─── Particles — wide scattered cloud, not dense sphere ─────────────────── */
function Particles({ count = 5500 }) {
  const meshRef  = useRef()
  const mouseTarget = useRef(new THREE.Vector2(0, 0))
  const mouseSmooth = useRef(new THREE.Vector2(0, 0))

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales    = new Float32Array(count)
    const randoms   = new Float32Array(count * 3)

    const phi = Math.PI * (Math.sqrt(5) - 1)
    for (let i = 0; i < count; i++) {
      // Layered distribution: inner dense + outer sparse for depth
      const layer  = Math.random()
      const radius = layer < 0.3
        ? 1.8 + Math.random() * 1.4          // inner halo
        : 3.2 + Math.random() * 2.8          // outer cloud

      const y     = 1 - (i / (count - 1)) * 2
      const r     = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = phi * i

      positions[i * 3]     = Math.cos(theta) * r * radius
      positions[i * 3 + 1] = y * radius * 0.85
      positions[i * 3 + 2] = Math.sin(theta) * r * radius * 0.55

      scales[i]          = Math.random() * 1.9 + 0.4
      randoms[i * 3]     = Math.random()
      randoms[i * 3 + 1] = Math.random()
      randoms[i * 3 + 2] = Math.random()
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('aScale',   new THREE.BufferAttribute(scales, 1))
    geo.setAttribute('aRandom',  new THREE.BufferAttribute(randoms, 3))

    const uni = {
      uTime:  { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }
    return { geometry: geo, uniforms: uni }
  }, [count])

  useEffect(() => {
    const onMove = (e) => {
      mouseTarget.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouseTarget.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    mouseSmooth.current.x += (mouseTarget.current.x - mouseSmooth.current.x) * 0.04
    mouseSmooth.current.y += (mouseTarget.current.y - mouseSmooth.current.y) * 0.04
    uniforms.uMouse.value.copy(mouseSmooth.current)
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  )
}

/* ─── Crystal core — octahedron (ice shard, not sphere) ──────────────────── */
function CrystalCore() {
  const outer  = useRef()
  const wire   = useRef()
  const inner  = useRef()

  useFrame((_, delta) => {
    outer.current.rotation.y += delta * 0.06
    outer.current.rotation.x += delta * 0.018
    wire.current.rotation.y  += delta * 0.06
    wire.current.rotation.x  += delta * 0.018
    inner.current.rotation.y -= delta * 0.10
    inner.current.rotation.z += delta * 0.055
  })

  return (
    <>
      {/* Solid inner fill — deep ice blue */}
      <mesh ref={outer}>
        <octahedronGeometry args={[2.3, 0]} />
        <meshBasicMaterial color="#061a38" transparent opacity={0.82} />
      </mesh>
      {/* Sharp wireframe overlay */}
      <mesh ref={wire}>
        <octahedronGeometry args={[2.32, 0]} />
        <meshBasicMaterial color="#1e60a8" wireframe transparent opacity={0.50} />
      </mesh>
      {/* Inner spinning icosahedron */}
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial color="#2878cc" wireframe transparent opacity={0.55} />
      </mesh>
    </>
  )
}

/* ─── Floating crystal shards around the core ────────────────────────────── */
function CrystalShards() {
  const shards = useMemo(() => [
    { pos: [ 3.8,  1.2, -0.8], rx: 0.05, ry: 0.12, rz: 0.03, size: 0.18, color: '#1858a0' },
    { pos: [-3.5,  0.4,  1.0], rx:-0.04, ry:-0.08, rz: 0.06, size: 0.14, color: '#1858a0' },
    { pos: [ 1.2,  3.2, -1.5], rx: 0.07, ry: 0.05, rz:-0.04, size: 0.16, color: '#2070b8' },
    { pos: [-1.8, -3.4,  0.6], rx:-0.06, ry: 0.10, rz: 0.05, size: 0.12, color: '#1858a0' },
    { pos: [ 2.6, -2.2,  2.0], rx: 0.03, ry:-0.07, rz:-0.08, size: 0.20, color: '#2878c8' },
    { pos: [-2.8,  2.8, -1.2], rx:-0.08, ry: 0.04, rz: 0.07, size: 0.15, color: '#1858a0' },
    { pos: [ 4.2, -0.6,  1.8], rx: 0.06, ry:-0.05, rz: 0.04, size: 0.11, color: '#2070b8' },
    { pos: [-1.0,  4.0,  1.0], rx:-0.03, ry: 0.09, rz:-0.06, size: 0.13, color: '#2878c8' },
  ], [])

  const refs = useRef(shards.map(() => null))

  useFrame((_, delta) => {
    refs.current.forEach((ref, i) => {
      if (!ref) return
      ref.rotation.x += delta * shards[i].rx
      ref.rotation.y += delta * shards[i].ry
      ref.rotation.z += delta * shards[i].rz
    })
  })

  return (
    <>
      {shards.map((s, i) => (
        <mesh
          key={i}
          ref={el => refs.current[i] = el}
          position={s.pos}
        >
          <octahedronGeometry args={[s.size, 0]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.70} />
        </mesh>
      ))}
    </>
  )
}

/* ─── Two clean orbital rings ─────────────────────────────────────────────── */
function OrbitalRing({ radius, tilt, speedX, speedY, speedZ, color, opacity }) {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * speedX
    ref.current.rotation.y += delta * speedY
    ref.current.rotation.z += delta * speedZ
  })
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, 0.016, 3, 200]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

/* ─── Post-processing ─────────────────────────────────────────────────────── */
function Effects() {
  return (
    <EffectComposer>
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0008, 0.0006)}
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={0.70}
        luminanceSmoothing={0.4}
        intensity={0.28}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.04}
      />
    </EffectComposer>
  )
}

/* ─── Scene ───────────────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      {/* Deep cold navy — more blue than before */}
      <color attach="background" args={['#000c1c']} />

      {/* Two clean rings at different angles */}
      <OrbitalRing
        radius={5.4}  tilt={[0.5, 0, 0.15]}
        speedX={0.04} speedY={0.07} speedZ={0.02}
        color="#1a5080" opacity={0.48}
      />
      <OrbitalRing
        radius={4.2}  tilt={[-0.7, 0.2, 0.3]}
        speedX={-0.05} speedY={0.04} speedZ={0.06}
        color="#0e3868" opacity={0.38}
      />

      <CrystalCore />
      <CrystalShards />
      <Particles count={5500} />
      <Effects />
    </>
  )
}

/* ─── Canvas ──────────────────────────────────────────────────────────────── */
export default function ParticleScene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 10.5], fov: 52 }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
