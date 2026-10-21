'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  PITCH_MAX,
  type MiradaTarget,
} from '@/lib/sala-previa/salaVistasConfig'
import type { Distraccion } from '@/lib/sala-previa/distracciones'

/** Equirectangular optimizado (JPG ~0,2–0,8 MB). WebP también en /panorama/. */
const PANORAMA_HI = '/sala-previa/panorama/sala-real-4096.jpg'
const PANORAMA_LO = '/sala-previa/panorama/sala-real-2048.jpg'

function urlPanorama(): string {
  if (typeof window === 'undefined') return PANORAMA_LO
  return window.innerWidth < 900 ? PANORAMA_LO : PANORAMA_HI
}

function lerpAngle(a: number, b: number, t: number): number {
  const diff = ((((b - a) % 360) + 540) % 360) - 180
  return a + diff * t
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
    if (!animando) estado.current = { yaw, pitch }
    invalidate()
  }, [yaw, pitch, animando, invalidate])

  useEffect(() => {
    destRef.current = destino
  }, [destino])

  useEffect(() => {
    camera.position.set(0, 0, 0)
    camera.rotation.order = 'YXZ'
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 75
      camera.near = 0.1
      camera.far = 2000
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
      if (dy < 0.6 && Math.abs(estado.current.pitch - destRef.current.pitch) < 0.4) {
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

function EsferaPanorama({ url }: { url: string }) {
  const tex = useTexture(url)
  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    tex.needsUpdate = true
  }, [tex])
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 64, 40]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  )
}

function PedirFrame({ deps }: { deps: unknown[] }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps explícitos
  }, deps)
  return null
}

/** Capas suaves CSS: no sustituyen a la escena 3D, solo refuerzan audio/avisos. */
function CapasSuaves({
  luz,
  enCalma,
  distraccion,
}: {
  luz: number
  enCalma: boolean
  distraccion: Distraccion | null
}) {
  const oscuridad = enCalma
    ? 0.08
    : Math.max(0, (55 - luz) / 100) * 0.35
  const tipo = distraccion?.tipo

  let tinte = 'transparent'
  let opacidad = 0
  if (tipo === 'luz-suave' || tipo === 'nube-tapa-sol' || tipo === 'fluorescente-zumba') {
    tinte = 'rgba(20, 24, 32, 0.28)'
    opacidad = 1
  } else if (tipo === 'sale-sol') {
    tinte = 'rgba(255, 236, 200, 0.18)'
    opacidad = 1
  } else if (tipo === 'movil' || tipo === 'timbre-movil') {
    tinte = 'rgba(255, 255, 255, 0.12)'
    opacidad = 1
  } else if (tipo === 'portazo' || tipo === 'entra-persona') {
    tinte = 'rgba(30, 28, 24, 0.1)'
    opacidad = 1
  }

  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: `rgba(18, 16, 14, ${oscuridad})` }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 pointer-events-none z-[2] transition-opacity duration-700 ease-out"
        style={{ background: tinte, opacity: opacidad }}
        aria-hidden="true"
      />
    </>
  )
}

export interface SalaFoto360Props {
  yaw: number
  pitch: number
  luz: number
  animando: boolean
  destino: MiradaTarget | null
  onAnimFin: (yaw: number, pitch: number) => void
  reduced: boolean
  arrastrando?: boolean
  distraccion?: Distraccion | null
  enCalma?: boolean
  className?: string
}

function EscenaFoto(props: Omit<SalaFoto360Props, 'className' | 'arrastrando'>) {
  const url = useMemo(() => urlPanorama(), [])
  return (
    <>
      <color attach="background" args={['#1a1814']} />
      <PedirFrame
        deps={[
          props.yaw,
          props.pitch,
          props.luz,
          props.animando,
          props.distraccion?.id,
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
      />
      <Suspense fallback={null}>
        <EsferaPanorama url={url} />
      </Suspense>
    </>
  )
}

export function SalaFoto360(props: SalaFoto360Props) {
  const {
    className,
    arrastrando = false,
    distraccion = null,
    enCalma = false,
    luz,
    ...escena
  } = props
  const activo = arrastrando || escena.animando || Boolean(distraccion)

  return (
    <div className={className ?? 'absolute inset-0'}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={activo ? 'always' : 'demand'}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 75, near: 0.1, far: 2000, position: [0, 0, 0] }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
        }}
      >
        <EscenaFoto
          {...escena}
          luz={luz}
          distraccion={distraccion}
          enCalma={enCalma}
        />
      </Canvas>
      <CapasSuaves luz={luz} enCalma={enCalma} distraccion={distraccion} />
    </div>
  )
}
