'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Html, useGLTF, useTexture } from '@react-three/drei'
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type Ref,
  type RefObject,
} from 'react'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import {
  LAJ,
  PAPELES_SALA,
  PITCH_MAX,
  TOTAL_PUBLICO,
  type MiradaSala,
  type MiradaTarget,
  type PapelSala,
} from '@/lib/sala-previa/salaVistasConfig'
import type { Distraccion, TipoDistraccion } from '@/lib/sala-previa/distracciones'
import { LuzSala3D } from './LuzSala3D'

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

/** Humanos low-poly Quaternius (CC0), meshopt ~150–165 KB. Pocos GLB, muchos clones. */
const PERSONAS = {
  hombreTraje: '/sala-previa/modelos/personas/hombre-traje.glb',
  hombreCasual: '/sala-previa/modelos/personas/hombre-casual.glb',
  hombreCasual2: '/sala-previa/modelos/personas/hombre-casual2.glb',
  hombreTrabajador: '/sala-previa/modelos/personas/hombre-trabajador.glb',
  mujerTraje: '/sala-previa/modelos/personas/mujer-traje.glb',
  mujerCasual: '/sala-previa/modelos/personas/mujer-casual.glb',
} as const

const PERSONAS_CASUAL = [
  PERSONAS.hombreCasual,
  PERSONAS.hombreCasual2,
  PERSONAS.hombreTrabajador,
  PERSONAS.mujerCasual,
] as const

const PERSONAS_TRAJE = [PERSONAS.hombreTraje, PERSONAS.mujerTraje] as const

const HDRI = '/sala-previa/hdri/sala-interior.hdr'

const MAT_PIEL = /skin/i
const MAT_FIJA = /eye|brow|hair|white|tie|shirt/i
const MAT_ROPA = /suit|black|grey|gray|purple|blue|orange|casual|brown|green|worker|pants|jacket|hoodie/i

function hashCorto(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h + s.charCodeAt(i) * (i + 3)) % 997
  return h
}

function urlPersona(toga: boolean, ropa: string): string {
  const h = hashCorto(ropa)
  if (toga) return PERSONAS_TRAJE[h % PERSONAS_TRAJE.length]
  return PERSONAS_CASUAL[h % PERSONAS_CASUAL.length]
}

/**
 * true = GLB Quaternius. false = cápsulas (fallback estable).
 * Quaternius: rest pose con quaternions no triviales + armature scale 100.
 * Deltas locales de sentado siguen inestables (estiraje / T-pose); cápsulas por defecto.
 */
const USAR_HUMANOIDES = false

const _deltaQ = new THREE.Quaternion()
const _deltaE = new THREE.Euler()

type RestPose = Map<string, THREE.Quaternion>

/**
 * Quaternius modular: 4 skins comparten el mismo armature.
 * Deduplicamos por uuid; Three sanitiza UpperLeg.L → UpperLegL.
 */
function huesosUnicos(root: THREE.Object3D): Map<string, THREE.Bone> {
  const map = new Map<string, THREE.Bone>()
  const vistos = new Set<string>()
  root.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (!mesh.isSkinnedMesh || !mesh.skeleton) return
    for (const b of mesh.skeleton.bones) {
      if (!b.name || vistos.has(b.uuid)) continue
      vistos.add(b.uuid)
      if (!map.has(b.name)) map.set(b.name, b)
    }
  })
  return map
}

function capturarRestPose(root: THREE.Object3D): RestPose {
  const rest: RestPose = new Map()
  for (const b of huesosUnicos(root).values()) {
    rest.set(b.uuid, b.quaternion.clone())
  }
  return rest
}

function restaurarRestPose(root: THREE.Object3D, rest: RestPose) {
  for (const b of huesosUnicos(root).values()) {
    const q = rest.get(b.uuid)
    if (q) b.quaternion.copy(q)
  }
}

function huesoPorAlias(huesos: Map<string, THREE.Bone>, nombreConPunto: string) {
  return huesos.get(nombreConPunto) ?? huesos.get(nombreConPunto.replace(/\./g, ''))
}

/** Delta local sobre la rest pose (nunca rotation.set absoluto). */
function deltaHueso(
  huesos: Map<string, THREE.Bone>,
  rest: RestPose,
  nombre: string,
  x: number,
  y = 0,
  z = 0
) {
  const h = huesoPorAlias(huesos, nombre)
  if (!h) return
  const base = rest.get(h.uuid)
  if (!base) return
  _deltaE.set(x, y, z, 'XYZ')
  _deltaQ.setFromEuler(_deltaE)
  h.quaternion.copy(base).multiply(_deltaQ)
}

function actualizarEsqueletos(root: THREE.Object3D) {
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    const mesh = obj as THREE.SkinnedMesh
    if (mesh.isSkinnedMesh && mesh.skeleton) mesh.skeleton.update()
  })
}

/** Baja brazos del T-pose con deltas relativos a la rest Quaternius. */
function poseBrazosAbajo(huesos: Map<string, THREE.Bone>, rest: RestPose) {
  deltaHueso(huesos, rest, 'UpperArm.L', 0, 0, 1.15)
  deltaHueso(huesos, rest, 'UpperArm.R', 0, 0, -1.15)
  deltaHueso(huesos, rest, 'LowerArm.L', 0.2, 0, 0.08)
  deltaHueso(huesos, rest, 'LowerArm.R', 0.2, 0, -0.08)
}

/** Sentarse: deltas locales; luego bajar el grupo (~cadera a asiento). */
function poseSentada(root: THREE.Object3D, rest: RestPose) {
  restaurarRestPose(root, rest)
  const huesos = huesosUnicos(root)
  poseBrazosAbajo(huesos, rest)
  // Muslos hacia delante / rodillas dobladas (ejes locales del armature Quaternius).
  deltaHueso(huesos, rest, 'UpperLeg.L', 0, 0, -1.35)
  deltaHueso(huesos, rest, 'UpperLeg.R', 0, 0, 1.35)
  deltaHueso(huesos, rest, 'LowerLeg.L', 0, 0, 1.45)
  deltaHueso(huesos, rest, 'LowerLeg.R', 0, 0, -1.45)
  deltaHueso(huesos, rest, 'Foot.L', 0.35, 0, 0)
  deltaHueso(huesos, rest, 'Foot.R', 0.35, 0, 0)
  deltaHueso(huesos, rest, 'Hips', -0.12, 0, 0)
  deltaHueso(huesos, rest, 'Abdomen', 0.08, 0, 0)
  deltaHueso(huesos, rest, 'Torso', 0.05, 0, 0)
  actualizarEsqueletos(root)
}

function poseDePie(root: THREE.Object3D, rest: RestPose) {
  restaurarRestPose(root, rest)
  const huesos = huesosUnicos(root)
  poseBrazosAbajo(huesos, rest)
  actualizarEsqueletos(root)
}

function tintarPersona(
  root: THREE.Object3D,
  tonoPiel: string,
  ropa: string,
  toga: boolean
) {
  const piel = new THREE.Color(tonoPiel)
  const cloth = new THREE.Color(toga ? ropa || '#121218' : ropa)
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh || !mesh.material) return
    mesh.castShadow = false
    mesh.receiveShadow = false
    const lista = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const clonadas = lista.map((m) => {
      const base = m as THREE.MeshStandardMaterial
      const mat = base.clone()
      const nombre = mat.name || ''
      if (MAT_PIEL.test(nombre)) {
        mat.color.copy(piel)
      } else if (toga && MAT_ROPA.test(nombre)) {
        mat.color.copy(cloth)
      } else if (!MAT_FIJA.test(nombre) && MAT_ROPA.test(nombre)) {
        mat.color.copy(cloth)
      } else if (!MAT_FIJA.test(nombre) && !MAT_PIEL.test(nombre) && nombre !== 'White') {
        // Materiales de ropa genéricos (Purple, LightBlue, Grey, Orange, Suit…)
        if (!/eye|hair|brow|skin/i.test(nombre)) mat.color.copy(cloth)
      }
      mat.roughness = Math.max(mat.roughness ?? 0.7, 0.55)
      mat.metalness = Math.min(mat.metalness ?? 0, 0.08)
      mat.envMapIntensity = 0.28
      return mat
    })
    mesh.material = clonadas.length === 1 ? clonadas[0] : clonadas
  })
}

function asignarRefCabeza(root: THREE.Object3D, cabezaRef?: Ref<THREE.Group>) {
  if (!cabezaRef) return
  const head = root.getObjectByName('Head') as THREE.Group | null
  if (!head) return
  if (typeof cabezaRef === 'function') cabezaRef(head)
  else (cabezaRef as MutableRefObject<THREE.Group | null>).current = head
}

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

/** Orientación del banquillo: mira en diagonal hacia el estrado. */
const BANQUILLO = { x: -4.45, z: -1.95, rot: -0.6435 }
const PAPELES_PENALES: PapelSala[] = ['testigo', 'investigado', 'victima']

function MueblesCC0({ papel }: { papel: PapelSala }) {
  const civil = papel === 'parte_civil'
  return (
    <group>
      <Modelo url={MODELOS.sillaJuez} position={[0, 0.7, -6.85]} scale={1} />
      <Modelo url={MODELOS.sillaJuez} position={[LAJ[0], 0.7, -6.85]} scale={1} />

      {[-1, 1].map((lado) => (
        <group key={lado}>
          <Modelo url={MODELOS.mesa} position={[lado * 1.85, 0, -3.2]} />
          <Modelo url={MODELOS.mesa} position={[lado * 2.98, 0, -3.2]} />
          {civil && lado === 1 ? (
            <>
              <Modelo url={MODELOS.sillon} position={[1.75, 0, -2.4]} scale={0.92} />
              <Modelo url={MODELOS.sillon} position={[2.95, 0, -2.45]} scale={0.92} />
            </>
          ) : (
            <Modelo
              url={MODELOS.sillon}
              position={[lado * 2.4, 0, -2.45]}
              scale={0.92}
            />
          )}
        </group>
      ))}

      {PAPELES_PENALES.includes(papel) && (
        <Modelo
          url={MODELOS.banco}
          position={[BANQUILLO.x, 0, BANQUILLO.z]}
          rotationY={BANQUILLO.rot}
        />
      )}

      {papel === 'victima' && (
        <>
          <Modelo url={MODELOS.sillon} position={[0.35, 0, -2.35]} scale={0.92} />
          <Modelo url={MODELOS.sillon} position={[1.15, 0, -2.1]} scale={0.92} />
        </>
      )}

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

/** Atril de testigos con vaso de agua (delante de la cámara del papel testigo). */
function AtrilTestigo() {
  return (
    <group position={[0, 0, -3.45]}>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color="#4a3324" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[0.16, 0.95, 0.16]} />
        <meshStandardMaterial color="#5c3d28" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.0, 0.02]} rotation={[-0.28, 0, 0]}>
        <boxGeometry args={[0.72, 0.05, 0.46]} />
        <meshStandardMaterial color="#8a5f3f" roughness={0.55} />
      </mesh>
      <mesh position={[0.05, 1.035, 0.04]} rotation={[-0.28, 0.08, 0]}>
        <boxGeometry args={[0.24, 0.006, 0.32]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.9} />
      </mesh>
      <mesh position={[0.48, 1.0, 0.05]}>
        <boxGeometry args={[0.26, 0.04, 0.26]} />
        <meshStandardMaterial color="#5c3d28" roughness={0.6} />
      </mesh>
      <mesh position={[0.48, 1.08, 0.05]}>
        <cylinderGeometry args={[0.035, 0.03, 0.12, 16, 1, true]} />
        <meshStandardMaterial
          color="#dfeef5"
          transparent
          opacity={0.35}
          roughness={0.05}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.48, 1.06, 0.05]}>
        <cylinderGeometry args={[0.031, 0.029, 0.07, 16]} />
        <meshStandardMaterial color="#9fc6d8" transparent opacity={0.45} roughness={0.1} />
      </mesh>
      <mesh position={[0.05, 1.12, -0.1]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
        <meshStandardMaterial color="#222228" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Mampara que tapa el lado de la persona investigada (papel víctima). */
function MamparaProteccion() {
  const paneles: { z: number; rot: number }[] = [
    { z: -3.35, rot: 0.12 },
    { z: -2.45, rot: -0.08 },
    { z: -1.55, rot: 0.1 },
  ]
  return (
    <group position={[-0.8, 0, 0]}>
      {paneles.map((p) => (
        <group key={p.z} position={[0, 0, p.z]} rotation={[0, Math.PI / 2 + p.rot, 0]}>
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[0.88, 1.8, 0.035]} />
            <meshStandardMaterial color="#c9d3d8" roughness={0.85} />
          </mesh>
          {[-0.45, 0.45].map((x) => (
            <mesh key={x} position={[x, 1.0, 0]}>
              <boxGeometry args={[0.03, 2.0, 0.05]} />
              <meshStandardMaterial color="#8a949a" metalness={0.5} roughness={0.35} />
            </mesh>
          ))}
          <mesh position={[0, 1.96, 0]}>
            <boxGeometry args={[0.92, 0.03, 0.05]} />
            <meshStandardMaterial color="#8a949a" metalness={0.5} roughness={0.35} />
          </mesh>
        </group>
      ))}
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

interface FiguraProps {
  position: [number, number, number]
  rotationY?: number
  scale?: number
  tonoPiel?: string
  ropa?: string
  visible?: number
  sentada?: boolean
  toga?: boolean
  /** Grupo con pivote en el cuello para girar o asentir con la cabeza. */
  cabezaRef?: Ref<THREE.Group>
  /** Nombre corto encima de la figura. */
  etiqueta?: string
}

function RotuloPapel({ texto, sentada }: { texto: string; sentada: boolean }) {
  return (
    <Html
      position={[0, sentada ? 1.72 : 2.05, 0]}
      center
      distanceFactor={7}
      zIndexRange={[12, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none rounded-md border border-court-300 bg-white/95 px-1.5 py-0.5 text-[11px] font-bold leading-tight text-court-900 ${
          texto.length > 16
            ? 'block max-w-[9.5rem] whitespace-normal text-center'
            : 'whitespace-nowrap'
        }`}
      >
        {texto}
      </span>
    </Html>
  )
}

function useOpacidadFigura(
  group: RefObject<THREE.Group | null>,
  visible: number,
  scale: number,
  opacidad: MutableRefObject<number>
) {
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
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        const o = opacidad.current
        const semi = o < 0.98
        for (const m of mats) {
          const mat = m as THREE.MeshStandardMaterial
          mat.transparent = semi
          mat.depthWrite = !semi
          mat.opacity = semi ? o : 1
        }
      }
    })
  })
}

/** Cápsulas geométricas (fallback estable). */
function FiguraPersonaCapsula({
  position,
  rotationY = 0,
  scale = 1,
  tonoPiel = '#c6866a',
  ropa = '#1a1a1e',
  visible = 1,
  sentada = false,
  toga = false,
  cabezaRef,
  etiqueta,
}: FiguraProps) {
  const group = useRef<THREE.Group>(null)
  const opacidad = useRef(Math.max(0.01, Math.min(1, visible)))
  useOpacidadFigura(group, visible, scale, opacidad)

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
      <mesh position={[0, torsoY, 0]}>
        <capsuleGeometry args={[ancho, sentada ? 0.38 : 0.58, 6, 12]} />
        <meshStandardMaterial color={ropa} roughness={0.72} metalness={0.04} />
      </mesh>
      {toga && (
        <mesh position={[0, sentada ? 0.42 : 0.55, 0]}>
          <cylinderGeometry args={[0.32, 0.38, sentada ? 0.55 : 0.85, 12]} />
          <meshStandardMaterial color={ropa} roughness={0.78} />
        </mesh>
      )}
      <mesh position={[0, torsoY + (sentada ? 0.2 : 0.26), 0]}>
        <boxGeometry args={[toga ? 0.62 : 0.5, 0.14, 0.26]} />
        <meshStandardMaterial color={ropa} roughness={0.75} />
      </mesh>
      <group ref={cabezaRef} position={[0, headY - 0.2, 0]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.07, 0.08, 0.12, 10]} />
          <meshStandardMaterial color={tonoPiel} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.155, 18, 18]} />
          <meshStandardMaterial color={tonoPiel} roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.26, -0.02]}>
          <sphereGeometry args={[0.14, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#2c241c" roughness={0.9} />
        </mesh>
      </group>
      {etiqueta ? <RotuloPapel texto={etiqueta} sentada={sentada} /> : null}
    </group>
  )
}

/** Humano low-poly (Quaternius CC0). Pose = rest + deltas locales. */
function FiguraPersonaHumanoide({
  position,
  rotationY = 0,
  scale = 1,
  tonoPiel = '#c6866a',
  ropa = '#1a1a1e',
  visible = 1,
  sentada = false,
  toga = false,
  cabezaRef,
  etiqueta,
}: FiguraProps) {
  const group = useRef<THREE.Group>(null)
  const opacidad = useRef(Math.max(0.01, Math.min(1, visible)))
  const url = useMemo(() => urlPersona(toga, ropa), [toga, ropa])
  const { scene } = useGLTF(url)

  const copia = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group
    c.updateMatrixWorld(true)
    tintarPersona(c, tonoPiel, ropa, toga)
    return c
  }, [scene, tonoPiel, ropa, toga])

  const restPose = useMemo(() => capturarRestPose(copia), [copia])

  useLayoutEffect(() => {
    if (sentada) poseSentada(copia, restPose)
    else poseDePie(copia, restPose)
    asignarRefCabeza(copia, cabezaRef)
  }, [copia, restPose, sentada, cabezaRef])

  useOpacidadFigura(group, visible, scale, opacidad)

  // Cadera en bind ~0.9 m; al sentar bajamos para apoyar en asiento (~0.45–0.5).
  const yOffset = sentada ? -0.42 : 0
  const modeloScale = toga ? 0.97 : 0.95

  return (
    <group
      ref={group}
      position={[position[0], position[1] + yOffset, position[2]]}
      rotation={[0, rotationY, 0]}
      scale={scale}
    >
      <primitive object={copia} scale={modeloScale} />
      {toga && (
        <mesh
          position={[0, sentada ? 0.48 : 0.55, 0.04]}
          castShadow={false}
          rotation={[sentada ? 0.08 : 0, 0, 0]}
        >
          <cylinderGeometry args={[0.2, sentada ? 0.36 : 0.32, sentada ? 0.55 : 0.95, 10]} />
          <meshStandardMaterial color={ropa} roughness={0.84} metalness={0.02} />
        </mesh>
      )}
      {etiqueta ? <RotuloPapel texto={etiqueta} sentada={sentada} /> : null}
    </group>
  )
}

function FiguraPersona(props: FiguraProps) {
  return USAR_HUMANOIDES ? (
    <FiguraPersonaHumanoide {...props} />
  ) : (
    <FiguraPersonaCapsula {...props} />
  )
}

function Mobiliario({ distraccion }: { distraccion: Distraccion | null }) {
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
      <mesh position={[1.05, 1.53, -5.9]} rotation={[0, -0.12, 0]}>
        <boxGeometry args={[0.32, 0.04, 0.24]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.9} />
      </mesh>
      <mesh position={[-0.85, 1.55, -5.95]}>
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

      <PuertaSala d={distraccion} material={matMaderaOsc} />
      <mesh position={[0, 1.5, 7.805]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.6, 2.8]} />
        <meshStandardMaterial color="#4a4038" roughness={1} />
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

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))

function suave(x: number): number {
  const c = clamp01(x)
  return c * c * (3 - 2 * c)
}

/** Sube de 0 a 1 tras `a`, se mantiene y baja antes de `b` (todo en progreso 0–1). */
function meseta(t: number, a: number, b: number, rampa = 0.12): number {
  if (t <= a || t >= b) return 0
  return Math.min(suave((t - a) / rampa), suave((b - t) / rampa))
}

/** Progreso 0–1 de la distracción activa medido con el reloj de la escena; -1 si no hay. */
function useProgreso(d: Distraccion | null | undefined) {
  const inicio = useRef<{ id: number; t: number } | null>(null)
  return (reloj: number) => {
    if (!d) {
      inicio.current = null
      return -1
    }
    if (inicio.current?.id !== d.id) inicio.current = { id: d.id, t: reloj }
    return clamp01((reloj - inicio.current.t) / d.duracion)
  }
}

function PuertaSala({ d, material }: { d: Distraccion | null; material: JSX.Element }) {
  const bisagra = useRef<THREE.Group>(null)
  const progreso = useProgreso(
    d && (d.tipo === 'entra-persona' || d.tipo === 'portazo') ? d : null
  )

  useFrame((state) => {
    if (!bisagra.current) return
    const t = progreso(state.clock.elapsedTime)
    let angulo = 0
    if (t >= 0 && d?.tipo === 'entra-persona') {
      angulo = 1.25 * meseta(t, 0, 0.97, 0.1)
    } else if (t >= 0 && d?.tipo === 'portazo') {
      angulo = t < 0.2 ? 0.4 * suave(t / 0.2) : 0.4 * (1 - suave((t - 0.2) / 0.035))
    }
    bisagra.current.rotation.y = angulo
  })

  return (
    <group ref={bisagra} position={[-0.8, 0, 7.78]}>
      <mesh position={[0.8, 1.5, 0]}>
        <boxGeometry args={[1.6, 2.8, 0.12]} />
        {material}
      </mesh>
      <mesh position={[1.35, 1.45, -0.06]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

const ASIENTOS_VISITA: [number, number][] = [
  [-0.6, 5.05],
  [1.2, 5.05],
]
const PUERTA_XZ: [number, number] = [0.25, 7.45]

function rumbo(dx: number, dz: number): number {
  return Math.atan2(dx, dz)
}

/** Persona que entra por la puerta: se sienta al fondo o se da la vuelta y se va. */
function Visitante({ d, reduced }: { d: Distraccion | null; reduced: boolean }) {
  const andando = useRef<THREE.Group>(null)
  const cabeza = useRef<THREE.Group>(null)
  const sentados = useRef<(THREE.Group | null)[]>([])
  const ocupados = useRef(0)
  const asignado = useRef<{ id: number; asiento: number } | null>(null)
  const ev = d?.tipo === 'entra-persona' ? d : null
  const progreso = useProgreso(ev)

  useFrame((state) => {
    const g = andando.current
    if (!g) return
    const reloj = state.clock.elapsedTime
    const t = progreso(reloj)
    const mostrarSentados = () => {
      sentados.current.forEach((s, i) => {
        if (s) s.visible = i < ocupados.current
      })
    }
    if (t < 0 || !ev) {
      g.visible = false
      mostrarSentados()
      return
    }
    if (asignado.current?.id !== ev.id) {
      const asiento =
        ev.variante === 0 && ocupados.current < ASIENTOS_VISITA.length ? ocupados.current : -1
      asignado.current = { id: ev.id, asiento }
    }
    const { asiento } = asignado.current
    const bob = reduced ? 0 : Math.abs(Math.sin(reloj * 7)) * 0.035
    if (cabeza.current) cabeza.current.rotation.y = 0
    g.position.y = 0

    const andar = (de: [number, number], a: [number, number], k: number) => {
      const kk = suave(k)
      g.position.x = de[0] + (a[0] - de[0]) * kk
      g.position.z = de[1] + (a[1] - de[1]) * kk
      g.rotation.y = rumbo(a[0] - de[0], a[1] - de[1])
      g.position.y = k > 0 && k < 1 ? bob : 0
    }

    if (asiento >= 0) {
      const [sx, sz] = ASIENTOS_VISITA[asiento]
      if (t < 0.1) {
        g.visible = false
      } else if (t < 0.62) {
        g.visible = true
        andar(PUERTA_XZ, [sx, sz + 0.55], (t - 0.1) / 0.52)
      } else {
        g.visible = false
        ocupados.current = Math.max(ocupados.current, asiento + 1)
      }
    } else {
      const fondo: [number, number] = [0.3, 5.9]
      if (t < 0.1 || t >= 0.88) {
        g.visible = false
      } else if (t < 0.45) {
        g.visible = true
        andar(PUERTA_XZ, fondo, (t - 0.1) / 0.35)
      } else if (t < 0.68) {
        g.visible = true
        g.position.x = fondo[0]
        g.position.z = fondo[1]
        const giro = suave((t - 0.6) / 0.08)
        g.rotation.y = Math.PI * (1 - giro)
        if (cabeza.current) cabeza.current.rotation.y = 0.6 * meseta(t, 0.45, 0.6, 0.05)
      } else {
        g.visible = true
        andar(fondo, PUERTA_XZ, (t - 0.68) / 0.2)
      }
    }
    mostrarSentados()
  })

  return (
    <group>
      <group ref={andando} visible={false}>
        <FiguraPersona
          position={[0, 0, 0]}
          tonoPiel="#b98563"
          ropa="#6b4f3a"
          cabezaRef={cabeza}
        />
      </group>
      {ASIENTOS_VISITA.map(([x, z], i) => (
        <group
          key={`${x}-${z}`}
          ref={(el) => {
            sentados.current[i] = el
          }}
          visible={false}
        >
          <FiguraPersona
            position={[x, 0, z]}
            rotationY={Math.PI}
            tonoPiel={i === 0 ? '#b98563' : '#e0b089'}
            ropa={i === 0 ? '#6b4f3a' : '#3f5a4a'}
            sentada
          />
        </group>
      ))}
    </group>
  )
}

/** Funcionario que cruza por delante del estrado. */
function FuncionarioCruza({ d, reduced }: { d: Distraccion | null; reduced: boolean }) {
  const g = useRef<THREE.Group>(null)
  const ev = d?.tipo === 'cruza-agente' ? d : null
  const progreso = useProgreso(ev)

  useFrame((state) => {
    if (!g.current) return
    const t = progreso(state.clock.elapsedTime)
    if (t < 0 || t <= 0.04 || t >= 0.96) {
      g.current.visible = false
      return
    }
    const k = (t - 0.04) / 0.92
    g.current.visible = true
    g.current.position.x = -5.2 + 10.4 * k
    g.current.position.y = reduced ? 0 : Math.abs(Math.sin(state.clock.elapsedTime * 7)) * 0.03
  })

  return (
    <group ref={g} position={[-5.2, 0, -4.35]} rotation={[0, Math.PI / 2, 0]} visible={false}>
      <FiguraPersona position={[0, 0, 0]} tonoPiel="#c6866a" ropa="#26324a" />
      <mesh position={[0.22, 0.95, 0.05]}>
        <boxGeometry args={[0.05, 0.3, 0.24]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.9} />
      </mesh>
    </group>
  )
}

type Gesto = 'habla' | 'movil' | 'tos' | 'levanta' | 'susurra' | 'postura'

const GESTO_PUBLICO: Partial<Record<TipoDistraccion, Gesto>> = {
  'habla-fondo': 'habla',
  movil: 'movil',
  'timbre-movil': 'movil',
  tos: 'tos',
  carraspeo: 'tos',
  estornudo: 'tos',
  'levanta-sienta': 'levanta',
  'silla-cruje': 'postura',
  'silla-arrastra': 'postura',
  'llaves-caen': 'postura',
  cremallera: 'postura',
  shh: 'susurra',
}

/** Figura que puede girar la cabeza, inclinarse, mirar el móvil o levantarse un momento. */
function FiguraAnimada({
  d,
  gesto,
  giro = 0.7,
  reduced,
  position,
  rotationY = 0,
  sentada,
  ...figura
}: FiguraProps & {
  d: Distraccion | null
  gesto: Gesto | null
  giro?: number
  reduced: boolean
}) {
  const cuerpo = useRef<THREE.Group>(null)
  const cabeza = useRef<THREE.Group>(null)
  const pantalla = useRef<THREE.MeshStandardMaterial>(null)
  const halo = useRef<THREE.MeshBasicMaterial>(null)
  const sentadaRef = useRef<THREE.Group>(null)
  const dePie = useRef<THREE.Group>(null)
  const progreso = useProgreso(gesto ? d : null)

  useFrame((state) => {
    const c = cuerpo.current
    const h = cabeza.current
    if (!c || !h) return
    const reloj = state.clock.elapsedTime
    const t = progreso(reloj)
    c.rotation.set(0, 0, 0)
    c.position.set(0, 0, 0)
    h.rotation.set(0, 0, 0)
    if (pantalla.current) pantalla.current.emissiveIntensity = 0
    if (halo.current) halo.current.opacity = 0
    if (sentadaRef.current) sentadaRef.current.visible = true
    if (dePie.current) dePie.current.visible = false
    if (t < 0 || !gesto) return
    const lado = Math.sign(giro) || 1
    switch (gesto) {
      case 'habla': {
        const e = meseta(t, 0.05, 0.95, 0.15)
        h.rotation.y = giro * e
        if (!reduced) h.rotation.x = 0.07 * e * Math.sin(reloj * 5)
        c.rotation.z = -0.06 * e * lado
        break
      }
      case 'susurra': {
        const e = meseta(t, 0.05, 0.95, 0.2)
        h.rotation.y = giro * e
        c.rotation.z = -0.12 * e * lado
        break
      }
      case 'movil': {
        const e = meseta(t, 0.05, 0.95, 0.12)
        h.rotation.x = 0.4 * e
        if (pantalla.current) pantalla.current.emissiveIntensity = 1.6 * e
        if (halo.current) halo.current.opacity = 0.28 * e
        break
      }
      case 'tos': {
        const e = reduced
          ? 0.5 * meseta(t, 0.1, 0.7, 0.2)
          : Math.max(meseta(t, 0.14, 0.3, 0.06), meseta(t, 0.27, 0.42, 0.06))
        c.rotation.x = 0.22 * e
        h.rotation.x = 0.2 * e
        break
      }
      case 'levanta': {
        const arriba = t > 0.22 && t < 0.78
        if (sentadaRef.current) sentadaRef.current.visible = !arriba
        if (dePie.current) dePie.current.visible = arriba
        if (arriba) h.rotation.y = 0.5 * meseta(t, 0.3, 0.7, 0.1) * lado
        break
      }
      case 'postura': {
        const e = meseta(t, 0.1, 0.9, 0.25)
        c.position.x = 0.15 * e
        h.rotation.y = giro * meseta(t, 0.3, 0.8, 0.15)
        break
      }
    }
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <group ref={cuerpo}>
        <group ref={sentadaRef}>
          <FiguraPersona
            {...figura}
            position={[0, 0, 0]}
            sentada={sentada}
            cabezaRef={gesto === 'levanta' ? undefined : cabeza}
          />
        </group>
        {gesto === 'levanta' && (
          <group ref={dePie} position={[0, 0, 0.3]} visible={false}>
            <FiguraPersona {...figura} position={[0, 0, 0]} cabezaRef={cabeza} />
          </group>
        )}
        {gesto === 'movil' && (
          <group position={[0.05, sentada ? 0.92 : 1.3, 0.3]} rotation={[-0.5, 0, 0]}>
            <mesh>
              <boxGeometry args={[0.085, 0.16, 0.012]} />
              <meshStandardMaterial
                ref={pantalla}
                color="#2a2d33"
                emissive="#d6e6ff"
                emissiveIntensity={0}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0, 0.02]}>
              <circleGeometry args={[0.17, 24]} />
              <meshBasicMaterial
                ref={halo}
                color="#cfe0ff"
                transparent
                opacity={0}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  )
}

/** Papeles y bolígrafo en la mesa del abogado más cercano. */
function PapelesMesa({ d, x, reduced }: { d: Distraccion | null; x: number; reduced: boolean }) {
  const hoja = useRef<THREE.Mesh>(null)
  const boli = useRef<THREE.Mesh>(null)
  const progreso = useProgreso(
    d && (d.tipo === 'papeles' || d.tipo === 'boli-cae') ? d : null
  )

  useFrame((state) => {
    const t = progreso(state.clock.elapsedTime)
    if (hoja.current) {
      const e = d?.tipo === 'papeles' && t >= 0 ? meseta(t, 0.05, 0.95, 0.2) : 0
      hoja.current.position.set(x + 0.15 + 0.22 * e, 0.84 + 0.06 * e, -3.12)
      hoja.current.rotation.set(0, 0.2 + 0.5 * e, -0.25 * e)
    }
    if (boli.current) {
      const enSuelo = d?.tipo === 'boli-cae' && t >= 0 && t < 0.85
      // Cae justo antes de que suene el golpe (0,3 s de 2,4 s ≈ t 0,125).
      const caida = enSuelo && !reduced ? Math.min(1, Math.max(0, (t - 0.03) / 0.095)) : enSuelo ? 1 : 0
      boli.current.position.set(x - 0.2 - 0.12 * caida, 0.86 - 0.84 * caida * caida, -3.0 + 0.18 * caida)
    }
  })

  return (
    <>
      <mesh ref={hoja} position={[x + 0.15, 0.84, -3.12]}>
        <boxGeometry args={[0.24, 0.005, 0.32]} />
        <meshStandardMaterial color="#f3eee2" roughness={0.9} />
      </mesh>
      <mesh ref={boli} position={[x - 0.2, 0.86, -3.0]} rotation={[0, 0.4, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
        <meshStandardMaterial color="#1f3b73" roughness={0.4} metalness={0.2} />
      </mesh>
    </>
  )
}

const PUBLICO = [
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
]

function PersonasEscena({
  gente,
  enfoque,
  personaEntrando,
  papel,
  distraccion,
  reduced,
}: {
  gente: number
  enfoque: MiradaSala | null
  personaEntrando?: boolean
  papel: PapelSala
  distraccion: Distraccion | null
  reduced: boolean
}) {
  const juezVis = enfoque === 'juez' || enfoque === null ? 1 : 0.55
  const aboVis = enfoque === 'abogados' || enfoque === null ? 1 : 0.5
  const pubBase = (gente / 100) * PAPELES_SALA[papel].publico
  const total = Math.min(TOTAL_PUBLICO, PUBLICO.length)
  const n = Math.round(pubBase * total)
  const d = distraccion
  const gestoDe = (tipo: TipoDistraccion) => (d?.tipo === tipo ? 'susurra' : null)
  const civil = papel === 'parte_civil'
  const penal = PAPELES_PENALES.includes(papel)

  return (
    <group>
      <PersonaQueEntra activo={personaEntrando} reduced={reduced} />
      <Visitante d={d} reduced={reduced} />
      <FuncionarioCruza d={d} reduced={reduced} />
      <PapelesMesa
        d={d}
        x={papel === 'investigado' || papel === 'publico' ? -2.4 : 2.4}
        reduced={reduced}
      />

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
        etiqueta="Juez"
      />

      {/* Misma mesa y misma altura que el juez, a su izquierda. */}
      <FiguraPersona
        position={[LAJ[0], 0.95, LAJ[2]]}
        rotationY={0}
        tonoPiel="#a67c52"
        ropa="#121218"
        visible={juezVis}
        scale={enfoque === 'juez' ? 1.12 : 1.05}
        sentada
        toga
        etiqueta="Letrado de la Administración de Justicia"
      />

      {/* Abogados en mesas */}
      <FiguraAnimada
        d={d}
        etiqueta="Abogada"
        gesto={papel === 'investigado' ? gestoDe('abogado-susurra') : null}
        giro={0.8}
        reduced={reduced}
        position={[-2.4, 0, -2.55]}
        rotationY={Math.PI}
        tonoPiel="#8d5524"
        ropa="#15151a"
        visible={aboVis}
        scale={enfoque === 'abogados' ? 1.08 : 1}
        sentada
        toga
      />
      <FiguraAnimada
        d={d}
        etiqueta={civil ? 'Abogado' : 'Fiscal'}
        gesto={civil ? gestoDe('abogado-susurra') : null}
        giro={0.8}
        reduced={reduced}
        position={civil ? [2.95, 0, -2.5] : [2.4, 0, -2.55]}
        rotationY={Math.PI}
        tonoPiel="#d4a574"
        ropa="#15151a"
        visible={aboVis}
        scale={enfoque === 'abogados' ? 1.08 : 1}
        sentada
        toga
      />
      {papel !== 'investigado' && (
        <FiguraPersona
          position={[-3.5, 0, -2.8]}
          rotationY={Math.PI * 0.85}
          tonoPiel="#c6866a"
          ropa="#1a1a22"
          visible={aboVis * (enfoque === 'abogados' ? 1 : 0.9)}
          toga
          etiqueta="Abogado"
        />
      )}
      {papel !== 'investigado' && (
        <FiguraPersona
          position={[3.5, 0, -2.8]}
          rotationY={-Math.PI * 0.85}
          tonoPiel="#b98a6a"
          ropa="#1a1a22"
          visible={aboVis * (enfoque === 'abogados' ? 1 : 0.9)}
          toga
          etiqueta="Procurador/a"
        />
      )}

      {penal && papel !== 'investigado' && (
        <FiguraPersona
          position={[BANQUILLO.x, 0, BANQUILLO.z]}
          rotationY={BANQUILLO.rot + Math.PI}
          tonoPiel="#c9a07e"
          ropa="#4b4b52"
          sentada
          etiqueta="Persona acusada"
        />
      )}
      {penal && (
        <FiguraAnimada
          d={d}
          etiqueta="Agente"
          gesto={papel === 'investigado' && d?.tipo === 'agente-postura' ? 'postura' : null}
          giro={0.7}
          reduced={reduced}
          position={[-5.05, 0, -1.3]}
          rotationY={Math.PI / 2}
          tonoPiel="#a0674b"
          ropa="#1f2b45"
        />
      )}

      {papel === 'testigo' && <AtrilTestigo />}
      {papel === 'victima' && (
        <>
          <MamparaProteccion />
          <FiguraAnimada
            d={d}
            gesto={gestoDe('acompanante-susurra')}
            giro={0.8}
            reduced={reduced}
            position={[1.15, 0, -2.2]}
            rotationY={Math.PI}
            tonoPiel="#e0b089"
            ropa="#5a6b7a"
            sentada
            etiqueta="Acompañante"
          />
        </>
      )}

      {/* Asistentes de público en bancos */}
      {PUBLICO.map((p, i) => {
        if (i >= n) return null
        const fuerza = i < n - 1 ? 1 : Math.max(0.2, pubBase * total - (n - 1))
        const gesto = d && d.indice === i ? GESTO_PUBLICO[d.tipo] ?? null : null
        return (
          <FiguraAnimada
            key={`${p.x}-${p.z}-${i}`}
            d={d}
            gesto={gesto}
            giro={i % 2 === 0 ? 0.7 : -0.7}
            reduced={reduced}
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

function CamaraLook({
  yaw,
  pitch,
  animando,
  destino,
  onAnimFin,
  reduced,
  papel,
}: {
  yaw: number
  pitch: number
  animando: boolean
  destino: MiradaTarget | null
  onAnimFin: (yaw: number, pitch: number) => void
  reduced: boolean
  papel: PapelSala
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
    camera.position.set(...PAPELES_SALA[papel].camara)
    camera.rotation.order = 'YXZ'
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 72
      camera.updateProjectionMatrix()
    }
    invalidate()
  }, [camera, invalidate, papel])

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

function Exposicion({ luz, d }: { luz: number; d: Distraccion | null }) {
  const { gl, invalidate } = useThree()
  const base = 0.88 + (luz / 100) * 0.45
  const progreso = useProgreso(d?.tipo === 'luz-suave' ? d : null)
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    // Exposición moderada: evita oscuridad y glare
    gl.toneMappingExposure = base
    gl.shadowMap.enabled = false
    invalidate()
  }, [gl, base, invalidate])
  useFrame((state) => {
    const t = progreso(state.clock.elapsedTime)
    // Una sola bajada lenta y su vuelta: nunca parpadeo (fotosensibilidad).
    gl.toneMappingExposure = t < 0 ? base : base * (1 - 0.2 * meseta(t, 0, 1, 0.4))
  })
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
  papel?: PapelSala
  distraccion?: Distraccion | null
  /** En calma la luz de fuera se queda estable y sin eventos. */
  enCalma?: boolean
}

function EscenaInterior(props: EscenaProps) {
  const papel = props.papel ?? 'publico'
  const distraccion = props.distraccion ?? null
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
          papel,
          distraccion?.id,
          props.enCalma,
        ]}
      />
      <CamaraLook
        yaw={props.yaw}
        pitch={props.pitch}
        animando={props.animando}
        destino={props.destino}
        onAnimFin={props.onAnimFin}
        reduced={props.reduced}
        papel={papel}
      />
      <Exposicion luz={props.luz} d={distraccion} />
      <LuzSala3D
        intensidad={props.luz}
        d={distraccion}
        enCalma={Boolean(props.enCalma)}
        reduced={props.reduced}
      />
      <Suspense fallback={null}>
        <Environment files={HDRI} environmentIntensity={0.32} />
        <Mobiliario distraccion={distraccion} />
        <MueblesCC0 papel={papel} />
        <ContactShadows
          position={[0, 0.02, 0]}
          scale={[12, 16]}
          resolution={512}
          far={2.2}
          blur={2.4}
          opacity={0.5}
          color="#2b2118"
        />
        <PersonasEscena
          gente={props.gente}
          enfoque={props.enfoque}
          personaEntrando={props.personaEntrando}
          papel={papel}
          distraccion={distraccion}
          reduced={props.reduced}
        />
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
  const activo =
    arrastrando || escena.animando || Boolean(escena.personaEntrando) || Boolean(escena.distraccion)

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
if (USAR_HUMANOIDES) {
  Object.values(PERSONAS).forEach((url) => useGLTF.preload(url))
}
