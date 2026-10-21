'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  PITCH_MAX,
  type MiradaSala,
  type MiradaTarget,
} from '@/lib/sala-previa/salaVistasConfig'

const MADERA = '#6b4a32'
const MADERA_OSCURA = '#3d2a1c'
const PARED = '#e8e0d4'
const TECHO = '#f2efe8'
const SUELO = '#8a6548'
const TEAL_CALMA = '#2f6f6a'

function lerpAngle(from: number, to: number, t: number): number {
  let d = ((to - from + 540) % 360) - 180
  return from + d * t
}

/** Persona estilizada (mallas simples, bien iluminadas — sin cutouts). */
function FiguraPersona({
  position,
  rotationY = 0,
  scale = 1,
  tonoPiel = '#c6866a',
  ropa = '#1a1a1e',
  visible = 1,
  sentada = false,
}: {
  position: [number, number, number]
  rotationY?: number
  scale?: number
  tonoPiel?: string
  ropa?: string
  visible?: number
  sentada?: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const opacidad = useRef(Math.max(0.01, Math.min(1, visible)))

  useFrame((_, dt) => {
    if (!group.current) return
    const objetivo = Math.max(0, Math.min(1, visible))
    opacidad.current = THREE.MathUtils.damp(opacidad.current, Math.max(0.01, objetivo), 5, dt)
    group.current.visible = objetivo > 0.02 || opacidad.current > 0.04
    const s = THREE.MathUtils.damp(
      group.current.scale.x,
      scale * (0.85 + objetivo * 0.15),
      6,
      dt
    )
    group.current.scale.setScalar(s)
    group.current.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && mesh.material && 'opacity' in (mesh.material as object)) {
        const mat = mesh.material as THREE.MeshStandardMaterial
        mat.transparent = true
        mat.depthWrite = opacidad.current > 0.85
        mat.opacity = opacidad.current
      }
    })
  })

  const h = sentada ? 0.95 : 1.55
  const torsoY = sentada ? 0.55 : 0.85
  const headY = sentada ? 1.15 : 1.55

  return (
    <group ref={group} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Piernas / base */}
      {!sentada && (
        <>
          <mesh position={[-0.12, 0.35, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
            <meshStandardMaterial color="#2a2a30" roughness={0.85} />
          </mesh>
          <mesh position={[0.12, 0.35, 0]} castShadow>
            <capsuleGeometry args={[0.09, 0.45, 4, 8]} />
            <meshStandardMaterial color="#2a2a30" roughness={0.85} />
          </mesh>
        </>
      )}
      {sentada && (
        <mesh position={[0, 0.28, 0.05]} castShadow>
          <boxGeometry args={[0.42, 0.35, 0.4]} />
          <meshStandardMaterial color={ropa} roughness={0.8} />
        </mesh>
      )}
      {/* Torso / toga */}
      <mesh position={[0, torsoY, 0]} castShadow>
        <capsuleGeometry args={[0.22, sentada ? 0.35 : 0.55, 4, 10]} />
        <meshStandardMaterial color={ropa} roughness={0.75} metalness={0.05} />
      </mesh>
      {/* Cabeza */}
      <mesh position={[0, headY, 0]} castShadow>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color={tonoPiel} roughness={0.7} />
      </mesh>
      {/* Hombros toga */}
      <mesh position={[0, torsoY + (sentada ? 0.22 : 0.28), 0]} castShadow>
        <boxGeometry args={[0.55, 0.12, 0.28]} />
        <meshStandardMaterial color={ropa} roughness={0.8} />
      </mesh>
      {/* Altura de referencia invisible */}
      <mesh position={[0, h, 0]} visible={false}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}

function Mobiliario() {
  return (
    <group>
      {/* Suelo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 16]} />
        <meshStandardMaterial color={SUELO} roughness={0.9} />
      </mesh>
      {/* Alfombra central */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -1]} receiveShadow>
        <planeGeometry args={[4.2, 8]} />
        <meshStandardMaterial color="#5c3a2e" roughness={1} />
      </mesh>

      {/* Techo */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4.1, 0]}>
        <planeGeometry args={[12, 16]} />
        <meshStandardMaterial color={TECHO} roughness={0.95} />
      </mesh>

      {/* Paredes */}
      <mesh position={[0, 2.05, -7.9]} receiveShadow>
        <boxGeometry args={[12, 4.1, 0.2]} />
        <meshStandardMaterial color={PARED} roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.05, 7.9]} receiveShadow>
        <boxGeometry args={[12, 4.1, 0.2]} />
        <meshStandardMaterial color={PARED} roughness={0.92} />
      </mesh>
      <mesh position={[-5.9, 2.05, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.1, 16]} />
        <meshStandardMaterial color={PARED} roughness={0.92} />
      </mesh>
      <mesh position={[5.9, 2.05, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.1, 16]} />
        <meshStandardMaterial color={PARED} roughness={0.92} />
      </mesh>

      {/* Zócalo madera */}
      {[
        [0, 0.4, -7.78, 11.6, 0.8, 0.12],
        [0, 0.4, 7.78, 11.6, 0.8, 0.12],
        [-5.78, 0.4, 0, 0.12, 0.8, 15.6],
        [5.78, 0.4, 0, 0.12, 0.8, 15.6],
      ].map((v, i) => (
        <mesh key={i} position={[v[0], v[1], v[2]]}>
          <boxGeometry args={[v[3], v[4], v[5]]} />
          <meshStandardMaterial color={MADERA} roughness={0.7} />
        </mesh>
      ))}

      {/* Estrado / tribuna del juez */}
      <mesh position={[0, 0.35, -6.2]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 0.7, 2.2]} />
        <meshStandardMaterial color={MADERA_OSCURA} roughness={0.65} />
      </mesh>
      {/* Banco del juez */}
      <mesh position={[0, 1.05, -6.55]} castShadow>
        <boxGeometry args={[4.2, 0.7, 0.9]} />
        <meshStandardMaterial color={MADERA} roughness={0.55} />
      </mesh>
      {/* Respaldo alto */}
      <mesh position={[0, 1.85, -6.95]} castShadow>
        <boxGeometry args={[3.6, 1.4, 0.18]} />
        <meshStandardMaterial color={MADERA_OSCURA} roughness={0.6} />
      </mesh>
      {/* Silla del juez */}
      <mesh position={[0, 1.35, -6.85]} castShadow>
        <boxGeometry args={[0.7, 1.1, 0.55]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.8} />
      </mesh>

      {/* Escudo (simplificado) */}
      <mesh position={[0, 2.85, -7.75]}>
        <circleGeometry args={[0.35, 24]} />
        <meshStandardMaterial color="#c9a227" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 2.85, -7.74]}>
        <circleGeometry args={[0.22, 24]} />
        <meshStandardMaterial color="#8b1e2d" roughness={0.5} />
      </mesh>

      {/* Bandera ES (plano simple) */}
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

      {/* Mesas de abogados */}
      <mesh position={[-2.4, 0.55, -3.2]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.12, 1.1]} />
        <meshStandardMaterial color={MADERA} roughness={0.5} />
      </mesh>
      <mesh position={[-2.4, 0.25, -3.2]}>
        <boxGeometry args={[2.0, 0.5, 0.9]} />
        <meshStandardMaterial color={MADERA_OSCURA} roughness={0.7} />
      </mesh>
      <mesh position={[2.4, 0.55, -3.2]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.12, 1.1]} />
        <meshStandardMaterial color={MADERA} roughness={0.5} />
      </mesh>
      <mesh position={[2.4, 0.25, -3.2]}>
        <boxGeometry args={[2.0, 0.5, 0.9]} />
        <meshStandardMaterial color={MADERA_OSCURA} roughness={0.7} />
      </mesh>

      {/* Barandilla */}
      <mesh position={[0, 0.55, -1.6]} castShadow>
        <boxGeometry args={[7, 0.08, 0.08]} />
        <meshStandardMaterial color="#b08d57" metalness={0.5} roughness={0.35} />
      </mesh>
      {[-3, -1.5, 0, 1.5, 3].map((x) => (
        <mesh key={x} position={[x, 0.28, -1.6]}>
          <cylinderGeometry args={[0.04, 0.04, 0.55, 8]} />
          <meshStandardMaterial color="#b08d57" metalness={0.45} roughness={0.4} />
        </mesh>
      ))}

      {/* Banquillos del público */}
      {[1.8, 3.4, 5.0].map((z, row) => (
        <group key={z}>
          <mesh position={[0, 0.28, z]} castShadow receiveShadow>
            <boxGeometry args={[7.5, 0.12, 0.55]} />
            <meshStandardMaterial color={MADERA} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.55, z + 0.22]}>
            <boxGeometry args={[7.5, 0.45, 0.08]} />
            <meshStandardMaterial color={MADERA_OSCURA} roughness={0.75} />
          </mesh>
          {/* Separadores de fila */}
          {row === 0 && (
            <mesh position={[0, 0.12, z]} visible={false}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshBasicMaterial />
            </mesh>
          )}
        </group>
      ))}

      {/* Puerta de entrada (pared trasera +Z) */}
      <mesh position={[0, 1.5, 7.78]} castShadow>
        <boxGeometry args={[1.6, 2.8, 0.12]} />
        <meshStandardMaterial color={MADERA_OSCURA} roughness={0.55} />
      </mesh>
      <mesh position={[0.55, 1.45, 7.72]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Marco puerta */}
      <mesh position={[0, 1.5, 7.85]}>
        <boxGeometry args={[1.85, 3.0, 0.08]} />
        <meshStandardMaterial color={MADERA} roughness={0.6} />
      </mesh>
      {/* Cartel «Entrada» */}
      <mesh position={[0, 3.15, 7.76]}>
        <planeGeometry args={[1.2, 0.28]} />
        <meshStandardMaterial color={TEAL_CALMA} />
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
      { x: -2.8, z: 1.85, piel: '#c6866a', ropa: '#3d4f5c' },
      { x: -1.4, z: 1.85, piel: '#8d5524', ropa: '#4a5560' },
      { x: 0.2, z: 1.85, piel: '#d4a574', ropa: '#2c3e50' },
      { x: 1.6, z: 1.85, piel: '#e0b089', ropa: '#5c4a3a' },
      { x: -2.2, z: 3.45, piel: '#a0674b', ropa: '#34495e' },
      { x: -0.6, z: 3.45, piel: '#c6866a', ropa: '#3a3a42' },
      { x: 1.0, z: 3.45, piel: '#8d5524', ropa: '#4b6584' },
      { x: 2.6, z: 3.45, piel: '#d4a574', ropa: '#2f3640' },
      { x: -1.8, z: 5.05, piel: '#b57a50', ropa: '#57606f' },
      { x: 0.4, z: 5.05, piel: '#c6866a', ropa: '#2c2c34' },
      { x: 2.0, z: 5.05, piel: '#8d5524', ropa: '#485460' },
    ],
    []
  )

  const n = Math.round(pubBase * publico.length)

  return (
    <group>
      {/* Juez en el estrado, mirando hacia la sala (+Z) */}
      <FiguraPersona
        position={[0, 0.7, -6.5]}
        rotationY={0}
        tonoPiel="#c6866a"
        ropa="#121218"
        visible={juezVis}
        scale={enfoque === 'juez' ? 1.08 : 1}
      />

      {/* Abogados en mesas */}
      <FiguraPersona
        position={[-2.4, 0, -2.55]}
        rotationY={Math.PI}
        tonoPiel="#8d5524"
        ropa="#15151a"
        visible={aboVis}
        scale={enfoque === 'abogados' ? 1.06 : 1}
        sentada
      />
      <FiguraPersona
        position={[2.4, 0, -2.55]}
        rotationY={Math.PI}
        tonoPiel="#d4a574"
        ropa="#15151a"
        visible={aboVis}
        scale={enfoque === 'abogados' ? 1.06 : 1}
        sentada
      />
      {/* Abogado de pie junto a mesa izquierda cuando enfoque */}
      <FiguraPersona
        position={[-3.5, 0, -2.8]}
        rotationY={Math.PI * 0.85}
        tonoPiel="#c6866a"
        ropa="#1a1a22"
        visible={aboVis * (enfoque === 'abogados' ? 1 : 0.85)}
      />

      {publico.map((p, i) => {
        if (i >= n) return null
        const fuerza =
          i < n - 1
            ? 1
            : Math.max(0.2, pubBase * publico.length - (n - 1))
        return (
          <FiguraPersona
            key={`${p.x}-${p.z}`}
            position={[p.x, 0, p.z]}
            rotationY={Math.PI}
            tonoPiel={p.piel}
            ropa={p.ropa}
            visible={Math.min(1, fuerza)}
            sentada
            scale={0.95}
          />
        )
      })}
    </group>
  )
}

function Luces({ intensidad }: { intensidad: number }) {
  const t = intensidad / 100
  const amb = 0.22 + t * 0.55
  const dir = 0.35 + t * 1.1
  const fluo = 0.15 + t * 0.7

  return (
    <>
      <ambientLight intensity={amb} color="#fff6ea" />
      <hemisphereLight args={['#e8f0f4', '#6b5344', 0.35 + t * 0.35]} />
      {/* Ventana / luz principal desde un lateral */}
      <directionalLight
        position={[4, 6, 2]}
        intensity={dir}
        color="#fff5e0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={24}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      {/* Fluorescentes suaves del techo */}
      <pointLight position={[-2, 3.7, -2]} intensity={fluo} color="#f5f0e0" distance={14} decay={2} />
      <pointLight position={[2, 3.7, -2]} intensity={fluo} color="#f5f0e0" distance={14} decay={2} />
      <pointLight position={[0, 3.7, 3]} intensity={fluo * 0.85} color="#eef4f6" distance={12} decay={2} />
      {/* Luz de acento en el estrado */}
      <spotLight
        position={[0, 3.8, -4.5]}
        angle={0.55}
        penumbra={0.5}
        intensity={0.4 + t * 0.9}
        color="#ffe8c8"
        castShadow
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
  const { camera } = useThree()
  const estado = useRef({ yaw, pitch })
  const destRef = useRef(destino)

  useEffect(() => {
    if (!animando) {
      estado.current = { yaw, pitch }
    }
  }, [yaw, pitch, animando])

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
  }, [camera])

  useFrame((_, dt) => {
    if (animando && destRef.current) {
      const speed = reduced ? 1 : Math.min(1, dt * 2.4)
      estado.current.yaw = lerpAngle(estado.current.yaw, destRef.current.yaw, speed)
      estado.current.pitch = THREE.MathUtils.lerp(
        estado.current.pitch,
        destRef.current.pitch,
        speed
      )
      const dy = Math.abs((((estado.current.yaw - destRef.current.yaw) % 360) + 540) % 360 - 180)
      if (dy < 0.6 && Math.abs(estado.current.pitch - destRef.current.pitch) < 0.4) {
        estado.current = { ...destRef.current }
        onAnimFin(destRef.current.yaw, destRef.current.pitch)
      }
    } else {
      estado.current.yaw = yaw
      estado.current.pitch = pitch
    }

    const y = ((estado.current.yaw % 360) + 360) % 360
    const p = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, estado.current.pitch))
    // yaw 0 mira al juez (−Z); yaw 180 mira la entrada (+Z)
    camera.rotation.y = THREE.MathUtils.degToRad(y)
    camera.rotation.x = THREE.MathUtils.degToRad(p)
    camera.rotation.z = 0
  })

  return null
}

function Exposicion({ luz }: { luz: number }) {
  const { gl } = useThree()
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 0.72 + (luz / 100) * 0.85
  }, [gl, luz])
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
      <color attach="background" args={['#c8c2b6']} />
      <fog attach="fog" args={['#c8c2b6', 14, 28]} />
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
      <Mobiliario />
      <PersonasEscena gente={props.gente} enfoque={props.enfoque} />
    </>
  )
}

export interface SalaVistas3DProps extends EscenaProps {
  className?: string
}

export function SalaVistas3D(props: SalaVistas3DProps) {
  const { className, ...escena } = props
  return (
    <div className={className ?? 'absolute inset-0'}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
        camera={{ fov: 72, near: 0.1, far: 40, position: [0, 1.55, 0.8] }}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      >
        <EscenaInterior {...escena} />
      </Canvas>
    </div>
  )
}
