'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, useGLTF, useTexture } from '@react-three/drei'
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

// Muebles CC0 de Poly Haven (GLB con meshopt y texturas webp 512 px).
const MODELOS = {
  sillaJuez: '/sala-previa/modelos/WoodenChair_01.glb',
  sillon: '/sala-previa/modelos/modern_arm_chair_01.glb',
  mesa: '/sala-previa/modelos/wooden_table_02.glb',
  banco: '/sala-previa/modelos/painted_wooden_bench.glb',
  lampara: '/sala-previa/modelos/modern_ceiling_lamp_01.glb',
  reloj: '/sala-previa/modelos/wall_clock.glb',
} as const

const HDRI = '/sala-previa/hdri/sala-interior.hdr'

function Modelo({
  url,
  position,
  rotationY = 0,
  scale = 1,
}: {
  url: string
  position: [number, number, number]
  rotationY?: number
  scale?: number | [number, number, number]
}) {
  const { scene } = useGLTF(url)
  const copia = useMemo(() => scene.clone(true), [scene])
  return (
    <primitive
      object={copia}
      position={position}
      rotation={[0, rotationY, 0]}
      scale={scale}
    />
  )
}

const X_BANCOS = [-2.9, -1.74, -0.58, 0.58, 1.74, 2.9]
const Z_FILAS = [1.85, 3.45, 5.05]
const LAMPARAS: [number, number][] = [
  [-2.2, -4.2],
  [2.2, -4.2],
  [-2.2, 1.2],
  [2.2, 1.2],
  [0, 4.8],
]

function MueblesCC0() {
  return (
    <group>
      <Modelo url={MODELOS.sillaJuez} position={[0, 0.7, -6.85]} scale={1} />

      {[-1, 1].map((lado) => (
        <group key={lado}>
          <Modelo url={MODELOS.mesa} position={[lado * 1.85, 0, -3.2]} />
          <Modelo url={MODELOS.mesa} position={[lado * 2.98, 0, -3.2]} />
          <Modelo
            url={MODELOS.sillon}
            position={[lado * 2.4, 0, -2.45]}
            scale={0.92}
          />
        </group>
      ))}

      {Z_FILAS.map((z) =>
        X_BANCOS.map((x) => (
          <Modelo
            key={`${x}-${z}`}
            url={MODELOS.banco}
            position={[x, 0, z + 0.05]}
          />
        ))
      )}

      {[
        { x: -3.6, z: -0.2, rot: Math.PI * 0.15 },
        { x: 3.6, z: -0.2, rot: -Math.PI * 0.15 },
        { x: -3.4, z: 0.9, rot: Math.PI * 0.1 },
        { x: 3.4, z: 0.9, rot: -Math.PI * 0.1 },
      ].map((s) => (
        <Modelo
          key={`${s.x}-${s.z}`}
          url={MODELOS.sillon}
          position={[s.x, 0, s.z]}
          rotationY={s.rot + Math.PI}
          scale={0.9}
        />
      ))}

      {LAMPARAS.map(([x, z]) => (
        <Modelo key={`${x}-${z}`} url={MODELOS.lampara} position={[x, 2.95, z]} />
      ))}

      <Modelo
        url={MODELOS.reloj}
        position={[5.79, 2.9, -3.4]}
        rotationY={-Math.PI / 2}
        scale={1.1}
      />
    </group>
  )
}

// Muñecos 3D geométricos estilizados para máxima fluidez y accesibilidad

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

/** Muñeco 3D estilizado (cápsulas y geometrías puras, 60+ FPS sin texturas pesadas). */
function FiguraPersona({
  position,
  rotationY = 0,
  scale = 1,
  tonoPiel = '#c6866a',
  ropa = '#1a1a1e',
  visible = 1,
  sentada = false,
  toga = false,
}: {
  position: [number, number, number]
  rotationY?: number
  scale?: number
  tonoPiel?: string
  ropa?: string
  visible?: number
  sentada?: boolean
  toga?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const opacidad = useRef(Math.max(0.01, Math.min(1, visible)))

  useFrame((_, dt) => {
    if (!group.current) return
    const objetivo = Math.max(0, Math.min(1, visible))
    opacidad.current = THREE.MathUtils.damp(
      opacidad.current,
      Math.max(0.01, objetivo),
      5,
      dt
    )
    group.current.visible = objetivo > 0.02 || opacidad.current > 0.04
    const s = THREE.MathUtils.damp(
      group.current.scale.x,
      scale * (0.88 + objetivo * 0.12),
      6,
      dt
    )
    group.current.scale.setScalar(s)
    group.current.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && mesh.material && 'opacity' in (mesh.material as object)) {
        const mat = mesh.material as THREE.MeshStandardMaterial
        const o = opacidad.current
        const semi = o < 0.98
        mat.transparent = semi
        mat.depthWrite = !semi
        mat.opacity = semi ? o : 1
      }
    })
  })

  const torsoY = sentada ? 0.58 : 0.92
  const headY = sentada ? 1.22 : 1.62
  const ancho = toga ? 0.28 : 0.2

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {!sentada && (
        <>
          <mesh position={[-0.11, 0.38, 0]}>
            <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
            <meshStandardMaterial color="#222228" roughness={0.85} />
          </mesh>
          <mesh position={[0.11, 0.38, 0]}>
            <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
            <meshStandardMaterial color="#222228" roughness={0.85} />
          </mesh>
        </>
      )}
      {sentada && (
        <>
          <mesh position={[-0.12, 0.22, 0.12]}>
            <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
            <meshStandardMaterial color="#222228" roughness={0.85} />
          </mesh>
          <mesh position={[0.12, 0.22, 0.12]}>
            <capsuleGeometry args={[0.08, 0.35, 4, 8]} />
            <meshStandardMaterial color="#222228" roughness={0.85} />
          </mesh>
        </>
      )}
      {/* Torso */}
      <mesh position={[0, torsoY, 0]}>
        <capsuleGeometry args={[ancho, sentada ? 0.38 : 0.58, 6, 12]} />
        <meshStandardMaterial color={ropa} roughness={0.72} metalness={0.04} />
      </mesh>
      {/* Falda de toga si procede */}
      {toga && (
        <mesh position={[0, sentada ? 0.42 : 0.55, 0]}>
          <cylinderGeometry args={[0.32, 0.38, sentada ? 0.55 : 0.85, 12]} />
          <meshStandardMaterial color={ropa} roughness={0.78} />
        </mesh>
      )}
      {/* Hombros */}
      <mesh position={[0, torsoY + (sentada ? 0.2 : 0.26), 0]}>
        <boxGeometry args={[toga ? 0.62 : 0.5, 0.14, 0.26]} />
        <meshStandardMaterial color={ropa} roughness={0.75} />
      </mesh>
      {/* Cuello + cabeza */}
      <mesh position={[0, headY - 0.14, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.12, 10]} />
        <meshStandardMaterial color={tonoPiel} roughness={0.7} />
      </mesh>
      <mesh position={[0, headY, 0]}>
        <sphereGeometry args={[0.155, 18, 18]} />
        <meshStandardMaterial color={tonoPiel} roughness={0.65} />
      </mesh>
      {/* Cabello */}
      <mesh position={[0, headY + 0.06, -0.02]}>
        <sphereGeometry args={[0.14, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#2c241c" roughness={0.9} />
      </mesh>
    </group>
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

      {/* Estrado: tarima, mesa con frontal y peana, y panel de fondo con molduras */}
      <mesh position={[0, 0.35, -6.4]}>
        <boxGeometry args={[6, 0.7, 2.8]} />
        {matMaderaOsc}
      </mesh>
      <mesh position={[0, 0.12, -4.85]}>
        <boxGeometry args={[2.2, 0.24, 0.5]} />
        {matMaderaOsc}
      </mesh>
      <mesh position={[0, 0.47, -5.25]}>
        <boxGeometry args={[2.2, 0.24, 0.5]} />
        {matMaderaOsc}
      </mesh>
      <mesh position={[0, 1.08, -5.6]}>
        <boxGeometry args={[4.6, 0.76, 0.12]} />
        {matMadera}
      </mesh>
      <mesh position={[0, 1.48, -5.85]}>
        <boxGeometry args={[4.8, 0.06, 0.7]} />
        {matMaderaOsc}
      </mesh>
      {[-1.7, -0.57, 0.57, 1.7].map((x) => (
        <mesh key={x} position={[x, 1.08, -5.53]}>
          <boxGeometry args={[0.95, 0.5, 0.03]} />
          {matMadera}
        </mesh>
      ))}
      <mesh position={[-1.4, 1.53, -5.9]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.32, 0.04, 0.24]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.9} />
      </mesh>
      <mesh position={[1.3, 1.55, -5.95]}>
        <boxGeometry args={[0.24, 0.08, 0.3]} />
        <meshStandardMaterial color="#7a1f2b" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.2, -7.72]}>
        <boxGeometry args={[4.4, 3, 0.12]} />
        {matMadera}
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, 2.2, -7.62]}>
          <boxGeometry args={[0.18, 3, 0.1]} />
          {matMaderaOsc}
        </mesh>
      ))}
      <mesh position={[0, 3.75, -7.62]}>
        <boxGeometry args={[4.6, 0.16, 0.16]} />
        {matMadera}
      </mesh>

      <mesh position={[0, 3.3, -7.65]}>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial color="#c9a227" metalness={0.45} roughness={0.3} />
      </mesh>
      <mesh position={[0, 3.3, -7.64]}>
        <circleGeometry args={[0.22, 24]} />
        <meshStandardMaterial color="#8b1e2d" roughness={0.5} />
      </mesh>

      <group position={[-2.9, 2.6, -7.75]}>
        <mesh>
          <planeGeometry args={[0.7, 0.45]} />
          <meshStandardMaterial color="#c60b1e" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.7, 0.15]} />
          <meshStandardMaterial color="#ffc400" side={THREE.DoubleSide} />
        </mesh>
      </group>

      {[-2.4, 2.4].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.42, -3.54]}>
            <boxGeometry args={[2.3, 0.72, 0.04]} />
            {matMaderaOsc}
          </mesh>
          <mesh position={[x - 0.5, 0.82, -3.3]} rotation={[0, -0.2, 0]}>
            <boxGeometry args={[0.3, 0.03, 0.22]} />
            <meshStandardMaterial color="#efe9dc" roughness={0.9} />
          </mesh>
          <mesh position={[x + 0.6, 0.83, -3.25]}>
            <boxGeometry args={[0.26, 0.05, 0.32]} />
            <meshStandardMaterial color="#2f3e57" roughness={0.6} />
          </mesh>
        </group>
      ))}

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

      {[-1, 1].map((lado) =>
        [-6, -3, 0, 3, 6].map((z) => (
          <mesh key={`${lado}-${z}`} position={[lado * 5.76, 2.05, z]}>
            <boxGeometry args={[0.14, 4.1, 0.35]} />
            {matMadera}
          </mesh>
        ))
      )}
      {[
        [0, 3.98, -7.75, 11.6, 0.18, 0.18],
        [0, 3.98, 7.75, 11.6, 0.18, 0.18],
        [-5.75, 3.98, 0, 0.18, 0.18, 15.6],
        [5.75, 3.98, 0, 0.18, 0.18, 15.6],
      ].map((v, i) => (
        <mesh key={i} position={[v[0], v[1], v[2]]}>
          <boxGeometry args={[v[3], v[4], v[5]]} />
          <meshStandardMaterial color="#e6dfd2" roughness={0.9} />
        </mesh>
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

function PersonaQueEntra({ activo, reduced }: { activo?: boolean; reduced?: boolean }) {
  const group = useRef<THREE.Group>(null)
  const zPos = useRef(7.2)

  useFrame((state, dt) => {
    if (!group.current) return
    if (!activo) {
      group.current.visible = false
      zPos.current = 7.2
      return
    }
    group.current.visible = true
    if (zPos.current > 3.4) {
      zPos.current -= dt * 1.1
      group.current.position.z = zPos.current
      group.current.position.y = reduced ? 0 : Math.sin(state.clock.elapsedTime * 8) * 0.04
    }
  })

  return (
    <group ref={group} position={[0.4, 0, 7.2]}>
      <FiguraPersona
        position={[0, 0, 0]}
        rotationY={Math.PI}
        tonoPiel="#d4a574"
        ropa="#3d4f5c"
        visible={activo ? 1 : 0}
      />
    </group>
  )
}

function PersonasEscena({
  gente,
  enfoque,
  personaEntrando,
}: {
  gente: number
  enfoque: MiradaSala | null
  personaEntrando?: boolean
}) {
  const juezVis = enfoque === 'juez' || enfoque === null ? 1 : 0.55
  const aboVis = enfoque === 'abogados' || enfoque === null ? 1 : 0.5
  const pubBase = gente / 100

  const publico = useMemo(
    () => [
      { x: -3.6, z: -0.2, piel: '#c6866a', ropa: '#3d4f5c', rot: Math.PI * 0.15 },
      { x: 3.6, z: -0.2, piel: '#8d5524', ropa: '#4a5560', rot: -Math.PI * 0.15 },
      { x: -3.4, z: 0.9, piel: '#d4a574', ropa: '#2c3e50', rot: Math.PI * 0.1 },
      { x: 3.4, z: 0.9, piel: '#e0b089', ropa: '#5c4a3a', rot: -Math.PI * 0.1 },
      { x: -2.8, z: 1.85, piel: '#c6866a', ropa: '#3d4f5c', rot: Math.PI },
      { x: -1.4, z: 1.85, piel: '#8d5524', ropa: '#4a5560', rot: Math.PI },
      { x: 0.2, z: 1.85, piel: '#d4a574', ropa: '#2c3e50', rot: Math.PI },
      { x: 1.6, z: 1.85, piel: '#e0b089', ropa: '#5c4a3a', rot: Math.PI },
      { x: -2.2, z: 3.45, piel: '#a0674b', ropa: '#34495e', rot: Math.PI },
      { x: -0.6, z: 3.45, piel: '#c6866a', ropa: '#3a3a42', rot: Math.PI },
      { x: 1.0, z: 3.45, piel: '#8d5524', ropa: '#4b6584', rot: Math.PI },
      { x: 2.6, z: 3.45, piel: '#d4a574', ropa: '#2f3640', rot: Math.PI },
      { x: -1.8, z: 5.05, piel: '#b57a50', ropa: '#57606f', rot: Math.PI },
      { x: 0.4, z: 5.05, piel: '#c6866a', ropa: '#2c2c34', rot: Math.PI },
      { x: 2.0, z: 5.05, piel: '#8d5524', ropa: '#485460', rot: Math.PI },
    ],
    []
  )

  const n = Math.round(pubBase * publico.length)

  return (
    <group>
      <PersonaQueEntra activo={personaEntrando} />

      {/* Juez en el estrado con toga mirando hacia la sala (+Z) */}
      <FiguraPersona
        position={[0, 0.95, -6.6]}
        rotationY={0}
        tonoPiel="#c6866a"
        ropa="#121218"
        visible={juezVis}
        scale={enfoque === 'juez' ? 1.18 : 1.1}
        sentada
        toga
      />

      {/* Abogados en mesas */}
      <FiguraPersona
        position={[-2.4, 0, -2.55]}
        rotationY={Math.PI}
        tonoPiel="#8d5524"
        ropa="#15151a"
        visible={aboVis}
        scale={enfoque === 'abogados' ? 1.08 : 1}
        sentada
        toga
      />
      <FiguraPersona
        position={[2.4, 0, -2.55]}
        rotationY={Math.PI}
        tonoPiel="#d4a574"
        ropa="#15151a"
        visible={aboVis}
        scale={enfoque === 'abogados' ? 1.08 : 1}
        sentada
        toga
      />
      <FiguraPersona
        position={[-3.5, 0, -2.8]}
        rotationY={Math.PI * 0.85}
        tonoPiel="#c6866a"
        ropa="#1a1a22"
        visible={aboVis * (enfoque === 'abogados' ? 1 : 0.9)}
        toga
      />

      {/* Asistentes de público en bancos */}
      {publico.map((p, i) => {
        if (i >= n) return null
        const fuerza =
          i < n - 1 ? 1 : Math.max(0.2, pubBase * publico.length - (n - 1))
        return (
          <FiguraPersona
            key={`${p.x}-${p.z}-${i}`}
            position={[p.x, 0, p.z]}
            rotationY={p.rot}
            tonoPiel={p.piel}
            ropa={p.ropa}
            visible={Math.min(1, fuerza)}
            sentada
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
  personaEntrando?: boolean
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
        <MueblesCC0 />
        <ContactShadows
          position={[0, 0.02, 0]}
          scale={[12, 16]}
          resolution={512}
          far={2.2}
          blur={2.4}
          opacity={0.5}
          color="#2b2118"
        />
        <PersonasEscena gente={props.gente} enfoque={props.enfoque} personaEntrando={props.personaEntrando} />
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

Object.values(MODELOS).forEach((url) => useGLTF.preload(url))
