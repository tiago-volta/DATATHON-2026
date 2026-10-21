'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  PITCH_MAX,
  type MiradaSala,
  type MiradaTarget,
} from '@/lib/sala-previa/salaVistasConfig'

const TEX = {
  suelo: '/sala-previa/texturas/suelo-madera.jpg',
  sueloRough: '/sala-previa/texturas/suelo-madera-rough.jpg',
  pared: '/sala-previa/texturas/pared-yeso.jpg',
  paredRough: '/sala-previa/texturas/pared-yeso-rough.jpg',
  madera: '/sala-previa/texturas/madera-mueble.jpg',
  maderaRough: '/sala-previa/texturas/madera-mueble-rough.jpg',
  marmol: '/sala-previa/texturas/marmol.jpg',
  marmolRough: '/sala-previa/texturas/marmol-rough.jpg',
} as const

const PERSONA = {
  juez: '/sala-previa/personas/juez.webp',
  abogadoA: '/sala-previa/personas/abogado-a.webp',
  abogadoB: '/sala-previa/personas/abogado-b.webp',
  abogadoC: '/sala-previa/personas/abogado-c.webp',
  p1: '/sala-previa/personas/publico-1.webp',
  p2: '/sala-previa/personas/publico-2.webp',
  p3: '/sala-previa/personas/publico-3.webp',
  p4: '/sala-previa/personas/publico-4.webp',
  p5: '/sala-previa/personas/publico-5.webp',
} as const

const HDRI = '/sala-previa/hdri/sala-interior.hdr'

function lerpAngle(from: number, to: number, t: number): number {
  let d = ((to - from + 540) % 360) - 180
  return from + d * t
}

function configurarMapa(
  map: THREE.Texture,
  repeat: [number, number],
  color = true
) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.set(repeat[0], repeat[1])
  map.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  map.anisotropy = 4
  return map
}

/** Cutout fotográfico en plano (alpha limpio). */
function PersonaCutout({
  url,
  position,
  rotationY = 0,
  height = 1.55,
  visible = 1,
}: {
  url: string
  position: [number, number, number]
  rotationY?: number
  height?: number
  visible?: number
}) {
  const tex = useTexture(url)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const opacidad = useRef(Math.max(0.01, Math.min(1, visible)))

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 2
  }, [tex])

  const aspect = tex.image
    ? (tex.image as HTMLImageElement).width /
      Math.max(1, (tex.image as HTMLImageElement).height)
    : 0.55
  const width = height * aspect

  useFrame((_, dt) => {
    if (!meshRef.current || !matRef.current) return
    const objetivo = Math.max(0, Math.min(1, visible))
    opacidad.current = THREE.MathUtils.damp(
      opacidad.current,
      Math.max(0.01, objetivo),
      5,
      dt
    )
    meshRef.current.visible = objetivo > 0.02 || opacidad.current > 0.04
    matRef.current.opacity = opacidad.current
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[0, rotationY, 0]}
      castShadow={false}
      receiveShadow={false}
    >
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        transparent
        alphaTest={0.35}
        depthWrite={false}
        side={THREE.DoubleSide}
        toneMapped
      />
    </mesh>
  )
}

function Mobiliario() {
  const [suelo, sueloR, pared, paredR, madera, maderaR, marmol, marmolR] =
    useTexture([
      TEX.suelo,
      TEX.sueloRough,
      TEX.pared,
      TEX.paredRough,
      TEX.madera,
      TEX.maderaRough,
      TEX.marmol,
      TEX.marmolRough,
    ])

  useLayoutEffect(() => {
    configurarMapa(suelo, [4, 5])
    configurarMapa(sueloR, [4, 5], false)
    configurarMapa(pared, [3, 1.2])
    configurarMapa(paredR, [3, 1.2], false)
    configurarMapa(madera, [2, 1])
    configurarMapa(maderaR, [2, 1], false)
    configurarMapa(marmol, [2.5, 3])
    configurarMapa(marmolR, [2.5, 3], false)
  }, [suelo, sueloR, pared, paredR, madera, maderaR, marmol, marmolR])

  const matSuelo = (
    <meshStandardMaterial
      map={suelo}
      roughnessMap={sueloR}
      roughness={0.85}
      metalness={0.02}
    />
  )
  const matPared = (
    <meshStandardMaterial
      map={pared}
      roughnessMap={paredR}
      roughness={0.92}
      metalness={0}
    />
  )
  const matMadera = (
    <meshStandardMaterial
      map={madera}
      roughnessMap={maderaR}
      roughness={0.55}
      metalness={0.04}
    />
  )
  const matMaderaOsc = (
    <meshStandardMaterial
      map={madera}
      roughnessMap={maderaR}
      color="#6b4a32"
      roughness={0.65}
      metalness={0.05}
    />
  )
  const matMarmol = (
    <meshStandardMaterial
      map={marmol}
      roughnessMap={marmolR}
      roughness={0.35}
      metalness={0.08}
    />
  )

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 16]} />
        {matSuelo}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -1]}>
        <planeGeometry args={[4.2, 8]} />
        {matMarmol}
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.1, 0]}>
        <planeGeometry args={[12, 16]} />
        <meshStandardMaterial color="#f4f1ea" roughness={0.95} />
      </mesh>

      <mesh position={[0, 2.05, -7.9]}>{/* fondo */}
        <boxGeometry args={[12, 4.1, 0.2]} />
        {matPared}
      </mesh>
      <mesh position={[0, 2.05, 7.9]}>
        <boxGeometry args={[12, 4.1, 0.2]} />
        {matPared}
      </mesh>
      <mesh position={[-5.9, 2.05, 0]}>
        <boxGeometry args={[0.2, 4.1, 16]} />
        {matPared}
      </mesh>
      <mesh position={[5.9, 2.05, 0]}>
        <boxGeometry args={[0.2, 4.1, 16]} />
        {matPared}
      </mesh>

      {[
        [0, 0.4, -7.78, 11.6, 0.8, 0.12],
        [0, 0.4, 7.78, 11.6, 0.8, 0.12],
        [-5.78, 0.4, 0, 0.12, 0.8, 15.6],
        [5.78, 0.4, 0, 0.12, 0.8, 15.6],
      ].map((v, i) => (
        <mesh key={i} position={[v[0], v[1], v[2]]}>
          <boxGeometry args={[v[3], v[4], v[5]]} />
          {matMadera}
        </mesh>
      ))}

      <mesh position={[0, 0.35, -6.2]}>
        <boxGeometry args={[5.5, 0.7, 2.2]} />
        {matMaderaOsc}
      </mesh>
      <mesh position={[0, 1.05, -6.55]}>
        <boxGeometry args={[4.2, 0.7, 0.9]} />
        {matMadera}
      </mesh>
      <mesh position={[0, 1.85, -6.95]}>
        <boxGeometry args={[3.6, 1.4, 0.18]} />
        {matMaderaOsc}
      </mesh>
      <mesh position={[0, 1.35, -6.85]}>
        <boxGeometry args={[0.7, 1.1, 0.55]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.8} />
      </mesh>

      <mesh position={[0, 2.85, -7.75]}>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial color="#c9a227" metalness={0.45} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.85, -7.74]}>
        <circleGeometry args={[0.22, 24]} />
        <meshStandardMaterial color="#8b1e2d" roughness={0.5} />
      </mesh>

      <group position={[-2.2, 2.6, -7.75]}>
        <mesh>
          <planeGeometry args={[0.7, 0.45]} />
          <meshStandardMaterial color="#c60b1e" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.7, 0.15]} />
          <meshStandardMaterial color="#ffc400" side={THREE.DoubleSide} />
        </mesh>
      </group>

      <mesh position={[-2.4, 0.55, -3.2]}>
        <boxGeometry args={[2.2, 0.12, 1.1]} />
        {matMadera}
      </mesh>
      <mesh position={[-2.4, 0.25, -3.2]}>
        <boxGeometry args={[2.0, 0.5, 0.9]} />
        {matMaderaOsc}
      </mesh>
      <mesh position={[2.4, 0.55, -3.2]}>
        <boxGeometry args={[2.2, 0.12, 1.1]} />
        {matMadera}
      </mesh>
      <mesh position={[2.4, 0.25, -3.2]}>
        <boxGeometry args={[2.0, 0.5, 0.9]} />
        {matMaderaOsc}
      </mesh>

      <mesh position={[0, 0.55, -1.6]}>
        <boxGeometry args={[7, 0.08, 0.08]} />
        <meshStandardMaterial color="#b08d57" metalness={0.5} roughness={0.35} />
      </mesh>
      {[-3, -1.5, 0, 1.5, 3].map((x) => (
        <mesh key={x} position={[x, 0.28, -1.6]}>
          <cylinderGeometry args={[0.04, 0.04, 0.55, 8]} />
          <meshStandardMaterial color="#b08d57" metalness={0.45} roughness={0.4} />
        </mesh>
      ))}

      {[1.8, 3.4, 5.0].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.28, z]}>
            <boxGeometry args={[7.5, 0.12, 0.55]} />
            {matMadera}
          </mesh>
          <mesh position={[0, 0.55, z + 0.22]}>
            <boxGeometry args={[7.5, 0.45, 0.08]} />
            {matMaderaOsc}
          </mesh>
        </group>
      ))}

      <mesh position={[0, 1.5, 7.78]}>
        <boxGeometry args={[1.6, 2.8, 0.12]} />
        {matMaderaOsc}
      </mesh>
      <mesh position={[0.55, 1.45, 7.72]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.5, 7.85]}>
        <boxGeometry args={[1.85, 3.0, 0.08]} />
        {matMadera}
      </mesh>
      <mesh position={[0, 3.15, 7.76]}>
        <planeGeometry args={[1.2, 0.28]} />
        <meshStandardMaterial color="#1d1d1f" />
      </mesh>
    </group>
  )
}

function PersonasEscena({
  gente,
  enfoque,
}: {
  gente: number
  enfoque: MiradaSala | null
}) {
  const juezVis = enfoque === 'juez' || enfoque === null ? 1 : 0.55
  const aboVis = enfoque === 'abogados' || enfoque === null ? 1 : 0.5
  const pubBase = gente / 100

  const publico = useMemo(
    () => [
      { url: PERSONA.p1, x: -3.6, z: -0.2, rot: Math.PI * 0.12, h: 1.35 },
      { url: PERSONA.p2, x: 3.6, z: -0.2, rot: -Math.PI * 0.12, h: 1.35 },
      { url: PERSONA.p3, x: -2.8, z: 1.85, rot: Math.PI, h: 1.28 },
      { url: PERSONA.p4, x: -0.8, z: 1.85, rot: Math.PI, h: 1.28 },
      { url: PERSONA.p5, x: 1.2, z: 1.85, rot: Math.PI, h: 1.28 },
      { url: PERSONA.p1, x: 2.8, z: 1.85, rot: Math.PI, h: 1.28 },
      { url: PERSONA.p2, x: -2.2, z: 3.45, rot: Math.PI, h: 1.26 },
      { url: PERSONA.p3, x: 0.2, z: 3.45, rot: Math.PI, h: 1.26 },
      { url: PERSONA.p4, x: 2.4, z: 3.45, rot: Math.PI, h: 1.26 },
      { url: PERSONA.p5, x: -1.6, z: 5.05, rot: Math.PI, h: 1.24 },
      { url: PERSONA.p1, x: 0.6, z: 5.05, rot: Math.PI, h: 1.24 },
      { url: PERSONA.p2, x: 2.2, z: 5.05, rot: Math.PI, h: 1.24 },
    ],
    []
  )

  const n = Math.round(pubBase * publico.length)

  return (
    <group>
      {/* Juez: plano frente a la sala (+Z) */}
      <PersonaCutout
        url={PERSONA.juez}
        position={[0, 1.55, -6.35]}
        rotationY={0}
        height={enfoque === 'juez' ? 1.75 : 1.65}
        visible={juezVis}
      />

      <PersonaCutout
        url={PERSONA.abogadoA}
        position={[-2.4, 1.15, -2.55]}
        rotationY={Math.PI}
        height={enfoque === 'abogados' ? 1.45 : 1.35}
        visible={aboVis}
      />
      <PersonaCutout
        url={PERSONA.abogadoB}
        position={[2.4, 1.15, -2.55]}
        rotationY={Math.PI}
        height={enfoque === 'abogados' ? 1.45 : 1.35}
        visible={aboVis}
      />
      <PersonaCutout
        url={PERSONA.abogadoC}
        position={[-3.45, 1.35, -2.85]}
        rotationY={Math.PI * 0.85}
        height={1.5}
        visible={aboVis * (enfoque === 'abogados' ? 1 : 0.9)}
      />

      {publico.map((p, i) => {
        if (i >= n) return null
        const fuerza =
          i < n - 1 ? 1 : Math.max(0.2, pubBase * publico.length - (n - 1))
        return (
          <PersonaCutout
            key={`${p.x}-${p.z}-${i}`}
            url={p.url}
            position={[p.x, p.h * 0.48, p.z]}
            rotationY={p.rot}
            height={p.h}
            visible={Math.min(1, fuerza)}
          />
        )
      })}
    </group>
  )
}

function Luces({ intensidad }: { intensidad: number }) {
  const t = intensidad / 100
  // Iluminación de sala: base clara; el estímulo solo sube un poco (sin glare).
  const amb = 0.42 + t * 0.38
  const dir = 0.55 + t * 0.7
  const fluo = 0.35 + t * 0.55

  return (
    <>
      <ambientLight intensity={amb} color="#fff8ef" />
      <hemisphereLight args={['#f2f5f8', '#8a6d55', 0.4 + t * 0.25]} />
      <directionalLight position={[3.5, 6.5, 1.5]} intensity={dir} color="#fff4e4" />
      <directionalLight
        position={[-2.5, 4.5, -1.5]}
        intensity={0.22 + t * 0.2}
        color="#e8eef4"
      />
      <pointLight
        position={[-2, 3.7, -2]}
        intensity={fluo}
        color="#f5f0e0"
        distance={16}
        decay={2}
      />
      <pointLight
        position={[2, 3.7, -2]}
        intensity={fluo}
        color="#f5f0e0"
        distance={16}
        decay={2}
      />
      <pointLight
        position={[0, 3.7, 3]}
        intensity={fluo * 0.75}
        color="#eef4f6"
        distance={14}
        decay={2}
      />
    </>
  )
}

function CamaraLook({
  yaw,
  pitch,
  animando,
  destino,
  onAnimFin,
  reduced,
}: {
  yaw: number
  pitch: number
  animando: boolean
  destino: MiradaTarget | null
  onAnimFin: (yaw: number, pitch: number) => void
  reduced: boolean
}) {
  const { camera, invalidate } = useThree()
  const estado = useRef({ yaw, pitch })
  const destRef = useRef(destino)

  useEffect(() => {
    if (!animando) {
      estado.current = { yaw, pitch }
    }
    invalidate()
  }, [yaw, pitch, animando, invalidate])

  useEffect(() => {
    destRef.current = destino
  }, [destino])

  useEffect(() => {
    camera.position.set(0, 1.55, 0.8)
    camera.rotation.order = 'YXZ'
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 72
      camera.updateProjectionMatrix()
    }
    invalidate()
  }, [camera, invalidate])

  useFrame((_, dt) => {
    if (animando && destRef.current) {
      const speed = reduced ? 1 : Math.min(1, dt * 2.4)
      estado.current.yaw = lerpAngle(estado.current.yaw, destRef.current.yaw, speed)
      estado.current.pitch = THREE.MathUtils.lerp(
        estado.current.pitch,
        destRef.current.pitch,
        speed
      )
      const dy = Math.abs(
        (((estado.current.yaw - destRef.current.yaw) % 360) + 540) % 360 - 180
      )
      if (
        dy < 0.6 &&
        Math.abs(estado.current.pitch - destRef.current.pitch) < 0.4
      ) {
        estado.current = { ...destRef.current }
        onAnimFin(destRef.current.yaw, destRef.current.pitch)
      } else {
        invalidate()
      }
    } else {
      estado.current.yaw = yaw
      estado.current.pitch = pitch
    }

    const y = ((estado.current.yaw % 360) + 360) % 360
    const p = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, estado.current.pitch))
    camera.rotation.y = THREE.MathUtils.degToRad(y)
    camera.rotation.x = THREE.MathUtils.degToRad(p)
    camera.rotation.z = 0
  })

  return null
}

function Exposicion({ luz }: { luz: number }) {
  const { gl, invalidate } = useThree()
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    // Exposición moderada: evita oscuridad y glare
    gl.toneMappingExposure = 0.88 + (luz / 100) * 0.45
    gl.shadowMap.enabled = false
    invalidate()
  }, [gl, luz, invalidate])
  return null
}

function PedirFrame({ deps }: { deps: unknown[] }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps explícitos
  }, deps)
  return null
}

interface EscenaProps {
  yaw: number
  pitch: number
  luz: number
  gente: number
  enfoque: MiradaSala | null
  animando: boolean
  destino: MiradaTarget | null
  onAnimFin: (yaw: number, pitch: number) => void
  reduced: boolean
}

function EscenaInterior(props: EscenaProps) {
  return (
    <>
      <color attach="background" args={['#d4cec2']} />
      <fog attach="fog" args={['#d4cec2', 20, 40]} />
      <PedirFrame
        deps={[
          props.yaw,
          props.pitch,
          props.luz,
          props.gente,
          props.enfoque,
          props.animando,
        ]}
      />
      <CamaraLook
        yaw={props.yaw}
        pitch={props.pitch}
        animando={props.animando}
        destino={props.destino}
        onAnimFin={props.onAnimFin}
        reduced={props.reduced}
      />
      <Exposicion luz={props.luz} />
      <Luces intensidad={props.luz} />
      <Suspense fallback={null}>
        <Environment files={HDRI} environmentIntensity={0.32} />
        <Mobiliario />
        <PersonasEscena gente={props.gente} enfoque={props.enfoque} />
      </Suspense>
    </>
  )
}

export interface SalaVistas3DProps extends EscenaProps {
  className?: string
  /** Mientras se arrastra, render continuo. */
  arrastrando?: boolean
}

export function SalaVistas3D(props: SalaVistas3DProps) {
  const { className, arrastrando = false, ...escena } = props
  const activo = arrastrando || escena.animando

  return (
    <div className={className ?? 'absolute inset-0'}>
      <Canvas
        dpr={[1, 1.35]}
        frameloop={activo ? 'always' : 'demand'}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 72, near: 0.1, far: 40, position: [0, 1.55, 0.8] }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
        }}
      >
        <EscenaInterior {...escena} />
      </Canvas>
    </div>
  )
}
