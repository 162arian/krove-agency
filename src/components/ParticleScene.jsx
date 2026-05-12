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
    float t = uTime * 0.22;

    pos.x += sin(pos.y * 0.65 + t       + aRandom.x * 6.28318) * 0.14;
    pos.y += cos(pos.x * 0.50 + t * 0.8 + aRandom.y * 6.28318) * 0.14;
    pos.z += sin(pos.z * 0.38 + t * 0.6 + aRandom.z * 6.28318) * 0.10;

    // Mouse repulsion
    vec2 m = uMouse * vec2(3.6, 2.2);
    float d = length(pos.xy - m);
    float str = smoothstep(2.0, 0.0, d) * 0.5;
    if (d > 0.001) pos.xy += normalize(pos.xy - m) * str;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position  = projectionMatrix * mvPos;
    // Larger points in the foreground (depth cue)
    gl_PointSize = aScale * (200.0 / -mvPos.z);
  }
`

/* ─── Particle fragment shader ────────────────────────────────────────────── */
const fragmentShader = `
  void main() {
    vec2  uv   = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.18, 0.5, dist);
    // Distinct ice-blue — visible as individual dots, not a blown-out blob
    gl_FragColor = vec4(0.55, 0.80, 1.0, alpha * 0.65);
  }
`

/* ─── Particle system ─────────────────────────────────────────────────────── */
function Particles({ count = 5500 }) {
  const meshRef = useRef()
  const mouseTarget = useRef(new THREE.Vector2(0, 0))
  const mouseSmooth = useRef(new THREE.Vector2(0, 0))

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales    = new Float32Array(count)
    const randoms   = new Float32Array(count * 3)

    const phi = Math.PI * (Math.sqrt(5) - 1)           // golden angle
    for (let i = 0; i < count; i++) {
      const y      = 1 - (i / (count - 1)) * 2
      const r      = Math.sqrt(1 - y * y)
      const theta  = phi * i
      const radius = 3.0 + (Math.random() - 0.5) * 2.4

      positions[i * 3]     = Math.cos(theta) * r * radius
      positions[i * 3 + 1] = y * radius
      positions[i * 3 + 2] = Math.sin(theta) * r * radius * 0.58

      scales[i]          = Math.random() * 1.8 + 0.3
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
      mouseTarget.current.x = (e.clientX / window.innerWidth)  * 2 - 1
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

/* ─── Central wireframe icosahedron ───────────────────────────────────────── */
function CoreFrame() {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.04
    ref.current.rotation.y += delta * 0.025
    ref.current.rotation.z += delta * 0.012
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[2.0, 2]} />
      <meshBasicMaterial color="#0d1e3a" wireframe transparent opacity={0.55} />
    </mesh>
  )
}

/* ─── Inner nested icosahedron (counter-rotates) ──────────────────────────── */
function InnerFrame() {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.x -= delta * 0.07
    ref.current.rotation.z += delta * 0.05
    ref.current.rotation.y -= delta * 0.03
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.95, 1]} />
      <meshBasicMaterial color="#163260" wireframe transparent opacity={0.5} />
    </mesh>
  )
}

/* ─── Large orbital rings ─────────────────────────────────────────────────── */
function OrbitalRing({ radius, tilt, speedX, speedY, speedZ, color, opacity }) {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.x += delta * speedX
    ref.current.rotation.y += delta * speedY
    ref.current.rotation.z += delta * speedZ
  })
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, 0.018, 3, 180]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  )
}

/* ─── Orbital debris ──────────────────────────────────────────────────────── */
function OrbitalDebris() {
  const groupRef = useRef()
  const innerRef  = useRef()

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.18
    groupRef.current.rotation.x += delta * 0.06
    innerRef.current.rotation.z  -= delta * 0.22
    innerRef.current.rotation.x  += delta * 0.10
  })

  const debrisA = useMemo(() =>
    [0, 72, 144, 216, 288].map((deg) => {
      const rad = (deg * Math.PI) / 180
      const r   = 5.6
      return new THREE.Vector3(
        Math.cos(rad) * r,
        Math.sin(rad * 0.8) * 1.2,
        Math.sin(rad) * r * 0.45
      )
    }), [])

  const debrisB = useMemo(() =>
    [36, 108, 180, 252, 324].map((deg) => {
      const rad = (deg * Math.PI) / 180
      const r   = 4.6
      return new THREE.Vector3(
        Math.cos(rad) * r * 0.7,
        Math.sin(rad * 1.2) * 1.8,
        Math.sin(rad) * r * 0.6
      )
    }), [])

  return (
    <>
      <group ref={groupRef}>
        {debrisA.map((pos, i) => (
          <mesh key={i} position={pos}>
            <octahedronGeometry args={[0.07, 0]} />
            <meshBasicMaterial color="#1e4070" transparent opacity={0.75} />
          </mesh>
        ))}
      </group>
      <group ref={innerRef}>
        {debrisB.map((pos, i) => (
          <mesh key={i} position={pos}>
            <tetrahedronGeometry args={[0.05, 0]} />
            <meshBasicMaterial color="#2a5888" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </>
  )
}

/* ─── Background grid plane ───────────────────────────────────────────────── */
function GridPlane() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const verts = []
    const size  = 24
    const divs  = 24

    for (let i = 0; i <= divs; i++) {
      const t = (i / divs) * size - size / 2
      // horizontal lines
      verts.push(-size / 2, t, 0,  size / 2, t, 0)
      // vertical lines
      verts.push(t, -size / 2, 0,  t,  size / 2, 0)
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return g
  }, [])

  return (
    <lineSegments geometry={geo} position={[0, 0, -9]}>
      <lineBasicMaterial color="#06102a" transparent opacity={0.5} />
    </lineSegments>
  )
}

/* ─── Post-processing ─────────────────────────────────────────────────────── */
function Effects() {
  return (
    <EffectComposer>
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new THREE.Vector2(0.0009, 0.0007)}
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={0.72}
        luminanceSmoothing={0.4}
        intensity={0.22}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.05}
      />
    </EffectComposer>
  )
}

/* ─── Scene root ──────────────────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      {/* Dark background lives inside the canvas, page background is white */}
      <color attach="background" args={['#000004']} />
      <GridPlane />

      {/* Outer orbital rings */}
      <OrbitalRing
        radius={5.2} tilt={[0.4, 0, 0.2]}
        speedX={0.05} speedY={0.08} speedZ={0.02}
        color="#1a4060" opacity={0.5}
      />
      <OrbitalRing
        radius={4.6} tilt={[-0.6, 0.3, 0]}
        speedX={-0.04} speedY={0.06} speedZ={0.05}
        color="#0e3050" opacity={0.45}
      />
      <OrbitalRing
        radius={6.0} tilt={[1.2, 0.1, 0.4]}
        speedX={0.02} speedY={-0.05} speedZ={0.03}
        color="#0a2040" opacity={0.3}
      />

      {/* Core geometry */}
      <CoreFrame />
      <InnerFrame />

      {/* Orbiting debris */}
      <OrbitalDebris />

      {/* Particle cloud */}
      <Particles count={5500} />

      <Effects />
    </>
  )
}

/* ─── Canvas export ───────────────────────────────────────────────────────── */
export default function ParticleScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 56 }}
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
