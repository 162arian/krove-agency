import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, ChromaticAberration, Bloom, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

/* ─── Hexagonale Eiskristall-Geometrie (Ih-Kristallstruktur) ──────── */
function createIceCrystalGeo(height = 4, radius = 0.5, capFrac = 0.14) {
  const capH = height * capFrac
  const N    = 6
  const pts  = []

  // 0–5  : unterer Ring
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius)
  }
  // 6–11 : oberer Ring
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    pts.push(Math.cos(a) * radius, height, Math.sin(a) * radius)
  }
  // 12   : Spitze (Pyramiden-Abschluss)
  pts.push(0, height + capH, 0)
  // 13   : Bodenmitte
  pts.push(0, 0, 0)

  const idx = []
  for (let i = 0; i < N; i++) {
    const n = (i + 1) % N
    idx.push(13, i, n)           // Bodenfläche
    idx.push(i, 6 + i, n)       // Seitenwand unten
    idx.push(n, 6 + i, 6 + n)   // Seitenwand oben
    idx.push(6 + i, 12, 6 + n)  // Pyramidenkappe
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  geo.setIndex(idx)
  geo.computeVertexNormals()
  return geo
}

/* ─── Einzelner Eiskristall mit physikalisch korrektem Glas-Material ─ */
function IceCrystal({ height, radius, position, rotation, speed = 0.007 }) {
  const ref = useRef()
  const geo = useMemo(() => createIceCrystalGeo(height, radius), [height, radius])

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:               new THREE.Color('#c2dff5'),
    transmission:        0.92,       // fast komplett transparent
    roughness:           0.035,      // sehr glatte Eisfläche
    metalness:           0.0,
    ior:                 1.31,       // echter Brechungsindex von Eis
    thickness:           radius * 4,
    transparent:         true,
    side:                THREE.DoubleSide,
    envMapIntensity:     1.0,
    attenuationColor:    new THREE.Color('#88c0f0'),
    attenuationDistance: 3.0,        // Licht wird blau eingefärbt
  }), [radius])

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * speed
  })

  return (
    <mesh ref={ref} geometry={geo} material={mat} position={position} rotation={rotation} />
  )
}

/* ─── Zweite transparentere Innenstruktur für Tiefe ─────────────────  */
function IceCrystalInner({ height, radius, position, rotation }) {
  const ref = useRef()
  const geo = useMemo(() => createIceCrystalGeo(height * 0.7, radius * 0.6, 0.18), [height, radius])

  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:            new THREE.Color('#d8eeff'),
    transmission:     0.96,
    roughness:        0.01,
    metalness:        0.02,
    ior:              1.31,
    thickness:        radius * 2,
    transparent:      true,
    side:             THREE.DoubleSide,
    envMapIntensity:  1.2,
  }), [radius])

  useFrame((_, delta) => {
    ref.current.rotation.y -= delta * 0.012
    ref.current.rotation.x += delta * 0.005
  })

  return (
    <mesh ref={ref} geometry={geo} material={mat} position={position} rotation={rotation} />
  )
}

/* ─── Eisnebel — feine Partikel für Atmosphäre ───────────────────── */
function IceMist() {
  const ref = useRef()

  const geo = useMemo(() => {
    const count = 2800
    const pos   = new Float32Array(count * 3)
    const sz    = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 24
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14
      sz[i] = Math.random() * 0.018 + 0.006
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('size',     new THREE.Float32BufferAttribute(sz, 1))
    return g
  }, [])

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.012
    ref.current.rotation.x += delta * 0.004
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={0.018}
        color="#90c8f0"
        transparent
        opacity={0.25}
        sizeAttenuation
      />
    </points>
  )
}

/* ─── Eisoberfläche — flache Grundplatte ─────────────────────────── */
function IceBase() {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:        new THREE.Color('#a0ccee'),
    transmission: 0.70,
    roughness:    0.15,
    metalness:    0.0,
    ior:          1.31,
    thickness:    0.5,
    transparent:  true,
    side:         THREE.DoubleSide,
    opacity:      0.55,
  }), [])

  return (
    <mesh position={[0.5, -2.2, 0]} rotation={[-0.04, 0.1, 0]}>
      <cylinderGeometry args={[5.5, 5.5, 0.06, 6]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

/* ─── Beleuchtung — kalte Mehrpunkt-Inszenierung ────────────────── */
function ColdLights() {
  return (
    <>
      {/* Sehr dunkles, kaltes Ambiente */}
      <ambientLight color="#0d1f38" intensity={2.0} />
      {/* Hauptlicht — oben rechts, kaltes Weiß */}
      <directionalLight color="#cce8ff" intensity={3.5} position={[7, 10, 5]} />
      {/* Fülllicht links — Eisblau */}
      <pointLight color="#3a7acc" intensity={5.0} distance={30} position={[-6, 4, 7]} />
      {/* Gegenlicht — schafft Silhouette-Glow */}
      <pointLight color="#6699ee" intensity={3.0} distance={22} position={[3, -1, -8]} />
      {/* Unterlicht — magisches Aufleuchten der Kristalle von unten */}
      <pointLight color="#b0d8ff" intensity={4.5} distance={16} position={[0.5, -6, 3]} />
      {/* Akzentlicht — rechts oben, Facetten-Highlights */}
      <pointLight color="#ffffff" intensity={2.0} distance={12} position={[4, 6, 2]} />
    </>
  )
}

/* ─── Post-Processing ────────────────────────────────────────────── */
function Effects() {
  return (
    <EffectComposer>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.50}
        luminanceSmoothing={0.35}
        intensity={0.55}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0014, 0.0010)}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.03}
      />
    </EffectComposer>
  )
}

/* ─── Szene — Kristall-Cluster ───────────────────────────────────── */
function Scene() {
  // [height, radius, position, rotation, speed]
  const crystals = [
    { h: 6.2, r: 0.66, pos: [ 0.9, -0.4,  0.0], rot: [-0.03,  0.18,  0.04], spd: 0.006 },
    { h: 5.4, r: 0.58, pos: [-1.5, -0.7, -1.8], rot: [ 0.07, -0.28,  0.11], spd: 0.008 },
    { h: 4.2, r: 0.48, pos: [ 2.5, -1.0,  0.8], rot: [ 0.11,  0.45, -0.07], spd: 0.009 },
    { h: 5.0, r: 0.54, pos: [ 1.8,  0.5, -2.5], rot: [ 0.14, -0.22,  0.06], spd: 0.007 },
    { h: 3.0, r: 0.38, pos: [-0.3, -1.2,  1.8], rot: [-0.09,  0.12,  0.13], spd: 0.011 },
    { h: 2.6, r: 0.32, pos: [-3.2, -0.2,  0.4], rot: [-0.05,  0.38,  0.10], spd: 0.010 },
    { h: 2.0, r: 0.26, pos: [ 3.5, -1.8, -0.6], rot: [ 0.19,  0.28, -0.16], spd: 0.013 },
    { h: 1.6, r: 0.20, pos: [-1.0,  1.4,  0.8], rot: [ 0.22, -0.12,  0.09], spd: 0.016 },
  ]

  return (
    <>
      <color attach="background" args={['#010d1f']} />

      <ColdLights />
      <IceBase />
      <IceMist />

      {crystals.map((c, i) => (
        <IceCrystal
          key={i}
          height={c.h}
          radius={c.r}
          position={c.pos}
          rotation={c.rot}
          speed={c.spd}
        />
      ))}

      {/* Innere Kristallstrukturen auf den drei großen */}
      <IceCrystalInner height={6.2} radius={0.66} position={[ 0.9, -0.4,  0.0]} rotation={[-0.03, 0.18, 0.04]} />
      <IceCrystalInner height={5.4} radius={0.58} position={[-1.5, -0.7, -1.8]} rotation={[ 0.07,-0.28, 0.11]} />
      <IceCrystalInner height={5.0} radius={0.54} position={[ 1.8,  0.5, -2.5]} rotation={[ 0.14,-0.22, 0.06]} />

      <Effects />
    </>
  )
}

/* ─── Canvas ─────────────────────────────────────────────────────── */
export default function ParticleScene() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 13], fov: 48 }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      gl={{
        antialias:         true,
        alpha:             true,
        powerPreference:   'high-performance',
        toneMapping:       THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      dpr={[1, 1.5]}
    >
      <Scene />
    </Canvas>
  )
}
