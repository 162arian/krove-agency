import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import { EffectComposer, ChromaticAberration, Bloom } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

/* ─── Hyper-realistisches Glas-Material ────────────────────────── */
function makeGlassMat({ color = '#dff0ff', attenColor = '#4488ff', thick = 1.8 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color:                     new THREE.Color(color),
    transmission:              0.88,
    roughness:                 0.0,
    metalness:                 0.0,
    ior:                       1.52,          // Borosilikat-Glas
    thickness:                 thick,
    transparent:               true,
    envMapIntensity:           1.0,
    clearcoat:                 1.0,           // Hochglanz-Klarlack-Schicht
    clearcoatRoughness:        0.0,
    attenuationColor:          new THREE.Color(attenColor),
    attenuationDistance:       4.5,
    iridescence:               0.45,          // Prismatisches Schimmern
    iridescenceIOR:            1.9,
    iridescenceThicknessRange: [80, 700],
    side:                      THREE.FrontSide,
    specularIntensity:         1.0,
    specularColor:             new THREE.Color('#ffffff'),
  })
}

/* ─── Einzelner Glas-Kristall ───────────────────────────────────── */
function GlassGem({ position, scale, rotation, spinSpeed, geoType, color, attenColor, floatSpeed, floatIntensity }) {
  const meshRef = useRef()
  const mat = useMemo(
    () => makeGlassMat({ color, attenColor, thick: scale[1] * 0.9 }),
    [color, attenColor, scale]
  )
  const geo = useMemo(() => {
    if (geoType === 'ico') return new THREE.IcosahedronGeometry(1, 0)
    if (geoType === 'dod') return new THREE.DodecahedronGeometry(1, 0)
    return new THREE.OctahedronGeometry(1, 0)  // Diamant-Oktaeder (Standard)
  }, [geoType])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * spinSpeed
  })

  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={0.15}
      floatIntensity={floatIntensity}
    >
      <mesh
        ref={meshRef}
        geometry={geo}
        material={mat}
        position={position}
        scale={scale}
        rotation={rotation}
      />
    </Float>
  )
}

/* ─── Maus-reaktiver Kristall-Cluster ───────────────────────────── */
function GemCluster({ mouseRef }) {
  const groupRef = useRef()

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const tx = mouseRef.current.x * 0.32
    const ty = -mouseRef.current.y * 0.18
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, tx, delta * 1.6)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, ty, delta * 1.6)
  })

  /* position, scale [x,y,z], rotation, spinSpeed, geoType, color, attenColor, floatSpeed, floatIntensity */
  const gems = [
    // — Großer Zentral-Kristall
    { pos: [ 0.4,  0.2,  0.0], scl: [0.62, 2.4, 0.62], rot: [ 0.00,  0.10,  0.03], spd: 0.004, t: 'oct', c: '#e8f6ff', a: '#3366ff', fs: 0.6, fi: 0.4 },
    // — Zweiter großer Kristall links
    { pos: [-1.8, -0.4, -0.6], scl: [0.54, 2.0, 0.54], rot: [ 0.05,  0.35,  0.07], spd: 0.006, t: 'oct', c: '#d8eeff', a: '#2255ee', fs: 0.7, fi: 0.5 },
    // — Dritter rechts
    { pos: [ 2.2, -0.2, -0.9], scl: [0.48, 1.75, 0.48],rot: [-0.04, -0.25,  0.05], spd: 0.007, t: 'oct', c: '#def4ff', a: '#4477ff', fs: 0.8, fi: 0.5 },
    // — Hinterer Kristall
    { pos: [-0.5,  0.8, -2.2], scl: [0.42, 1.5,  0.42], rot: [ 0.08,  0.55, -0.06], spd: 0.009, t: 'oct', c: '#cce8ff', a: '#1144dd', fs: 0.6, fi: 0.6 },
    // — Vorderer Akzent
    { pos: [ 1.3,  0.5, -1.6], scl: [0.36, 1.25, 0.36], rot: [ 0.10, -0.30,  0.08], spd: 0.008, t: 'oct', c: '#d4eeff', a: '#3366ee', fs: 0.9, fi: 0.4 },
    // — Kleiner links außen
    { pos: [-3.0,  0.1,  0.0], scl: [0.30, 1.05, 0.30], rot: [ 0.06,  0.42,  0.09], spd: 0.011, t: 'oct', c: '#c8e4ff', a: '#2244cc', fs: 1.0, fi: 0.5 },
    // — Kleiner rechts außen — Ikosaeder
    { pos: [ 3.2, -0.9, -0.4], scl: [0.28, 0.28, 0.28], rot: [-0.05,  0.22, -0.09], spd: 0.013, t: 'ico', c: '#e0f4ff', a: '#4488ff', fs: 1.1, fi: 0.7 },
    // — Schwebendes Dodekaeder oben
    { pos: [ 0.5,  2.0, -1.0], scl: [0.22, 0.22, 0.22], rot: [ 0.15, -0.12,  0.11], spd: 0.016, t: 'dod', c: '#eef8ff', a: '#4488ff', fs: 1.4, fi: 0.8 },
    // — Kleiner Diamant unten links
    { pos: [-1.3, -1.6,  0.4], scl: [0.26, 0.88, 0.26], rot: [-0.08,  0.38,  0.05], spd: 0.012, t: 'oct', c: '#d0ecff', a: '#1133bb', fs: 0.8, fi: 0.6 },
    // — Winziger Akzent — Ikosaeder Mitte rechts
    { pos: [ 1.8,  1.2, -0.5], scl: [0.16, 0.16, 0.16], rot: [ 0.20,  0.18, -0.14], spd: 0.020, t: 'ico', c: '#f0faff', a: '#5599ff', fs: 1.6, fi: 0.9 },
    // — Winziger Akzent links unten
    { pos: [-2.2, -0.8,  0.6], scl: [0.14, 0.46, 0.14], rot: [ 0.12, -0.44,  0.18], spd: 0.018, t: 'oct', c: '#ddf2ff', a: '#3377ff', fs: 1.3, fi: 0.7 },
  ]

  return (
    <group ref={groupRef}>
      {gems.map((g, i) => (
        <GlassGem
          key={i}
          position={g.pos}
          scale={g.scl}
          rotation={g.rot}
          spinSpeed={g.spd}
          geoType={g.t}
          color={g.c}
          attenColor={g.a}
          floatSpeed={g.fs}
          floatIntensity={g.fi}
        />
      ))}
    </group>
  )
}

/* ─── Schwebender Glasstaub ─────────────────────────────────────── */
function GlassDust() {
  const ref = useRef()
  const geo = useMemo(() => {
    const count = 1800
    const pos   = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return g
  }, [])

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.007
    ref.current.rotation.x += delta * 0.003
  })

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.022} color="#90c8f8" transparent opacity={0.28} sizeAttenuation />
    </points>
  )
}

/* ─── Kühle Beleuchtung ─────────────────────────────────────────── */
function ColdLights() {
  return (
    <>
      <ambientLight color="#4477aa" intensity={0.25} />
      {/* Hartes Hauptlicht — erzeugt scharfe Facettenreflexe auf Glas */}
      <directionalLight color="#ffffff" intensity={7.0} position={[6, 12, 5]} />
      {/* Zweites Hauptlicht von rechts */}
      <directionalLight color="#cce8ff" intensity={4.0} position={[-5, 8, 4]} />
      {/* Tiefes Eisblau links */}
      <pointLight color="#1144cc" intensity={6.0} distance={40} position={[-8, 6, 9]} />
      {/* Rim-Licht von hinten */}
      <pointLight color="#4466dd" intensity={4.0} distance={30} position={[ 4, 1, -12]} />
      {/* Magisches Unterlicht */}
      <pointLight color="#88ccff" intensity={5.0} distance={22} position={[ 0.5, -8, 5]} />
      {/* Enger Spot direkt auf Kristalle — erzeugt Glasglitzer */}
      <pointLight color="#ffffff" intensity={8.0} distance={10} position={[ 2, 6,  4]} />
      {/* Akzent hinten links */}
      <pointLight color="#5588ff" intensity={2.5} distance={24} position={[-4, 2, -7]} />
    </>
  )
}

/* ─── Szene ─────────────────────────────────────────────────────── */
function Scene({ mouseRef }) {
  return (
    <>
      <color attach="background" args={['#010d1f']} />

      {/* Environment liefert Reflexionen für Glas-Transmission */}
      <Environment preset="apartment" background={false} environmentIntensity={0.18} />

      <ColdLights />
      <GlassDust />
      <GemCluster mouseRef={mouseRef} />

      <EffectComposer>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.55}
          luminanceSmoothing={0.40}
          intensity={0.65}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0012, 0.0009)}
        />
      </EffectComposer>
    </>
  )
}

/* ─── Canvas  ────────────────────────────────────────────────────── */
export default function ParticleScene() {
  // Maus-Position normiert -1…1, geteilt über ref (kein Re-render)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth)  * 2 - 1
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    // passive → kein Scroll-Overhead; pointerEvents:none auf Canvas
    // → window-Event feuert trotzdem, Cursor.jsx läuft weiter
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <Canvas
      camera={{ position: [0, 0.5, 11], fov: 50 }}
      style={{
        position:      'absolute',
        inset:         0,
        width:         '100%',
        height:        '100%',
        pointerEvents: 'none',   // Cursor.jsx & Scroll laufen durch
      }}
      gl={{
        antialias:           true,
        alpha:               true,
        powerPreference:     'high-performance',
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      dpr={[1, 1.5]}
    >
      <Scene mouseRef={mouseRef} />
    </Canvas>
  )
}
