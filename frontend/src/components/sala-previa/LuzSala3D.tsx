'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Distraccion, TipoDistraccion } from '@/lib/sala-previa/distracciones'

/** Banda de ventanas altas en la pared izquierda (x = -5.8), entre las pilastras. */
const VENTANAS_Z = [-4.5, -1.5, 1.5, 4.5]
const VENTANA = { x: -5.79, y0: 3.04, y1: 3.8, ancho: 2.3 }
const ALTO_VENTANA = VENTANA.y1 - VENTANA.y0
/** Fracción bajada de cada persiana cuando nadie la toca (como en una sala real). */
const PERSIANA_BASE = [0.2, 0.42, 0, 0.3]
const PERSIANA_BAJADA = 0.9
const PERSIANA_ESPERA_S = 45
const LAMAS = 14

/** Dirección de los rayos de sol (de fuera hacia dentro y hacia abajo). */
const SOL_DIR = new THREE.Vector3(0.68, -0.7, 0.2).normalize()
const Y_SUELO_LUZ = 0.03

const PANELES: [number, number][] = []
for (const z of [-5.6, -2.8, 0, 2.8, 5.6]) for (const x of [-3.4, 0, 3.4]) PANELES.push([x, z])
/** Paneles delante de las cámaras habituales: el que zumba debe poder verse. */
const PANELES_VISIBLES = PANELES.map((p, i) => [p, i] as const)
  .filter(([[, z]]) => z <= 0)
  .map(([, i]) => i)

const FLUO_POS: [number, number, number][] = [
  [-2, 3.7, -2],
  [2, 3.7, -2],
  [0, 3.7, 3],
]

const TIPOS_LUZ: TipoDistraccion[] = ['nube-tapa-sol', 'sale-sol', 'fluorescente-zumba', 'persiana-baja']

const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
function suave(x: number) {
  const c = clamp01(x)
  return c * c * (3 - 2 * c)
}
/** Sube en `subida` s, se mantiene y baja en `bajada` s antes de `dur`. */
function envolvente(tt: number, dur: number, subida: number, bajada: number) {
  if (tt <= 0 || tt >= dur) return 0
  return Math.min(suave(tt / subida), suave((dur - tt) / bajada))
}

/** Nubes que pasan: suma de senos lentos (periodos de 26 a 67 s), en [-1, 1]. Sin saltos. */
function derivaNubes(t: number) {
  const w = (p: number) => (t * Math.PI * 2) / p
  return 0.45 * Math.sin(w(41) + 0.7) + 0.35 * Math.sin(w(26) + 2.1) + 0.2 * Math.sin(w(67) + 4.2)
}

function lienzo(ancho: number, alto: number) {
  const c = document.createElement('canvas')
  c.width = ancho
  c.height = alto
  return [c, c.getContext('2d')!] as const
}

/** Cielo esmerilado con nubes difuminadas, continuo a lo largo de las cuatro ventanas. */
function texturaCielo() {
  const [c, g] = lienzo(768, 64)
  const grad = g.createLinearGradient(0, 0, 0, 64)
  grad.addColorStop(0, '#7fadd6')
  grad.addColorStop(0.6, '#b9d3e8')
  grad.addColorStop(1, '#e4eef3')
  g.fillStyle = grad
  g.fillRect(0, 0, 768, 64)
  g.filter = 'blur(7px)'
  let semilla = 7
  const azar = () => {
    semilla = (semilla * 16807) % 2147483647
    return semilla / 2147483647
  }
  for (let i = 0; i < 16; i++) {
    const x = azar() * 768
    g.fillStyle = `rgba(255,255,255,${0.45 + azar() * 0.45})`
    g.beginPath()
    g.ellipse(x, 10 + azar() * 34, 30 + azar() * 60, 7 + azar() * 9, 0, 0, Math.PI * 2)
    g.fill()
    if (x > 690) {
      g.beginPath()
      g.ellipse(x - 768, 10 + azar() * 34, 40, 9, 0, 0, Math.PI * 2)
      g.fill()
    }
  }
  g.filter = 'none'
  g.fillStyle = 'rgba(255,255,255,0.14)'
  g.fillRect(0, 0, 768, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  return t
}

/** Rectángulo de luz de bordes suaves; con `parteluces`, las dos barras verticales de la ventana. */
function texturaMancha(parteluces: boolean) {
  const [c, g] = lienzo(192, 64)
  g.fillStyle = '#000'
  g.fillRect(0, 0, 192, 64)
  g.filter = 'blur(5px)'
  g.fillStyle = '#fff'
  g.fillRect(12, 10, 168, 44)
  if (parteluces) {
    g.fillStyle = '#000'
    g.fillRect(62, 0, 5, 64)
    g.fillRect(125, 0, 5, 64)
  }
  g.filter = 'none'
  return new THREE.CanvasTexture(c)
}

/** Lamas de persiana: franjas opacas con rendijas por las que pasa algo de luz. */
function texturaLamas() {
  const [c, g] = lienzo(4, 32)
  g.fillStyle = 'rgba(236,230,216,1)'
  g.fillRect(0, 0, 4, 32)
  g.fillStyle = 'rgba(160,150,135,0.25)'
  g.fillRect(0, 24, 4, 8)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.magFilter = THREE.LinearFilter
  return t
}

function puntoEnSuelo(p: THREE.Vector3) {
  const k = (p.y - Y_SUELO_LUZ) / -SOL_DIR.y
  return p.clone().addScaledVector(SOL_DIR, k)
}

/** Haz de luz desde la ventana hasta el suelo (prisma abierto) y su mancha en el suelo. */
function geometriasSol(zc: number) {
  const za = zc - VENTANA.ancho / 2
  const zb = zc + VENTANA.ancho / 2
  const x = VENTANA.x + 0.02
  const A = new THREE.Vector3(x, VENTANA.y0, za)
  const B = new THREE.Vector3(x, VENTANA.y1, za)
  const C = new THREE.Vector3(x, VENTANA.y1, zb)
  const D = new THREE.Vector3(x, VENTANA.y0, zb)
  const [A2, B2, C2, D2] = [A, B, C, D].map(puntoEnSuelo)

  const pos: number[] = []
  const uv: number[] = []
  const cara = (p: THREE.Vector3, q: THREE.Vector3, p2: THREE.Vector3, q2: THREE.Vector3) => {
    const base = pos.length / 3
    for (const v of [p, q, q2, p2]) pos.push(v.x, v.y, v.z)
    uv.push(0, 0, 1, 0, 1, 1, 0, 1)
    return [base, base + 1, base + 2, base, base + 2, base + 3]
  }
  const indices = [
    ...cara(A, B, A2, B2),
    ...cara(D, C, D2, C2),
    ...cara(A, D, A2, D2),
    ...cara(B, C, B2, C2),
  ]
  const haz = new THREE.BufferGeometry()
  haz.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  haz.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  haz.setIndex(indices)

  const mancha = new THREE.BufferGeometry()
  mancha.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([A2, D2, C2, B2].flatMap((v) => [v.x, v.y, v.z]), 3)
  )
  mancha.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2))
  mancha.setIndex([0, 1, 2, 0, 2, 3])
  mancha.computeVertexNormals()
  return { haz, mancha }
}

function materialHaz() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uIntensidad: { value: 0 },
      uColor: { value: new THREE.Color('#fff0d6') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uIntensidad;
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float borde = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
        float largo = mix(1.0, 0.25, vUv.y) * smoothstep(1.0, 0.8, vUv.y) * smoothstep(0.0, 0.06, vUv.y);
        gl_FragColor = vec4(uColor * uIntensidad * borde * largo, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  })
}

interface EstadoLuz {
  directo: number
  cielo: number
  calma: number
  persianas: number[]
  /** Reloj hasta el que cada persiana se queda bajada tras el evento. */
  bajadaHasta: number[]
  evento: { id: number; tipo: TipoDistraccion; t0: number; panel: number } | null
}

export function LuzSala3D({
  intensidad,
  d,
  enCalma,
  reduced,
}: {
  intensidad: number
  d: Distraccion | null
  enCalma: boolean
  reduced: boolean
}) {
  const invalidate = useThree((s) => s.invalidate)
  const t = intensidad / 100
  const amb = 0.42 + t * 0.38
  const hemi = 0.4 + t * 0.25
  const fluo = 0.35 + t * 0.55

  const ambRef = useRef<THREE.AmbientLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const solRef = useRef<THREE.DirectionalLight>(null)
  const fluoRefs = useRef<(THREE.PointLight | null)[]>([])
  const persianaRefs = useRef<(THREE.Mesh | null)[]>([])
  const barraRefs = useRef<(THREE.Mesh | null)[]>([])

  const recursos = useMemo(() => {
    const cielo = texturaCielo()
    const vidrio = new THREE.MeshBasicMaterial({ map: cielo, fog: false })
    const halo = new THREE.MeshBasicMaterial({
      map: texturaMancha(false),
      color: '#fff6e6',
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
    const texMancha = texturaMancha(true)
    const lamas = texturaLamas()
    const ventanas = VENTANAS_Z.map((zc, i) => {
      const geoVidrio = new THREE.PlaneGeometry(VENTANA.ancho, ALTO_VENTANA)
      const uvs = geoVidrio.getAttribute('uv') as THREE.BufferAttribute
      for (let k = 0; k < uvs.count; k++) uvs.setX(k, (i + uvs.getX(k)) / VENTANAS_Z.length)
      const texLamas = lamas.clone()
      texLamas.needsUpdate = true
      return {
        zc,
        geoVidrio,
        ...geometriasSol(zc),
        matHaz: materialHaz(),
        matMancha: new THREE.MeshBasicMaterial({
          map: texMancha,
          color: '#ffe3b8',
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          fog: false,
        }),
        matPersiana: new THREE.MeshStandardMaterial({
          map: texLamas,
          color: '#e9e3d6',
          roughness: 0.8,
          transparent: true,
          side: THREE.DoubleSide,
        }),
      }
    })
    const paneles = PANELES.map(
      () => new THREE.MeshBasicMaterial({ color: '#f6f7f2', fog: false })
    )
    return { cielo, vidrio, halo, ventanas, paneles }
  }, [])

  useEffect(
    () => () => {
      recursos.cielo.dispose()
      recursos.vidrio.dispose()
      recursos.halo.dispose()
      for (const v of recursos.ventanas) {
        v.geoVidrio.dispose()
        v.haz.dispose()
        v.mancha.dispose()
        v.matHaz.dispose()
        v.matMancha.dispose()
        v.matPersiana.map?.dispose()
        v.matPersiana.dispose()
      }
      for (const m of recursos.paneles) m.dispose()
    },
    [recursos]
  )

  const estado = useRef<EstadoLuz>({
    directo: 0.8,
    cielo: 0.92,
    calma: enCalma ? 1 : 0,
    persianas: [...PERSIANA_BASE],
    bajadaHasta: PERSIANA_BASE.map(() => -1),
    evento: null,
  })

  // Las nubes se mueven despacio: con frameloop «demand» basta un fotograma cada ~160 ms.
  useEffect(() => {
    if (enCalma) return
    const id = window.setInterval(() => invalidate(), reduced ? 250 : 160)
    return () => window.clearInterval(id)
  }, [enCalma, reduced, invalidate])

  useFrame((state, delta) => {
    const e = estado.current
    const reloj = state.clock.elapsedTime
    const dt = Math.min(delta, 0.25)
    let moviendo = false

    if (d && !enCalma && TIPOS_LUZ.includes(d.tipo)) {
      if (e.evento?.id !== d.id) {
        e.evento = {
          id: d.id,
          tipo: d.tipo,
          t0: reloj,
          panel: PANELES_VISIBLES[Math.floor(Math.random() * PANELES_VISIBLES.length)],
        }
        if (d.tipo === 'persiana-baja') {
          const libres = e.persianas
            .map((p, i) => ({ p, i }))
            .filter(({ i }) => e.bajadaHasta[i] < reloj)
          const elegida = (libres.length > 0 ? libres : e.persianas.map((p, i) => ({ p, i }))).sort(
            (a, b) => a.p - b.p
          )[0].i
          e.bajadaHasta[elegida] = reloj + d.duracion + PERSIANA_ESPERA_S
        }
      }
    } else {
      e.evento = null
    }
    if (enCalma) e.bajadaHasta.fill(-1)

    const ampl = reduced ? 0.14 : 0.3
    const n = derivaNubes(reduced ? reloj * 0.55 : reloj)
    let directo = 0.82 + ampl * n
    let cielo = 0.92 + ampl * 0.3 * n
    let caidaPanel = 0

    const ev = e.evento
    if (ev && d) {
      const tt = reloj - ev.t0
      const dur = d.duracion
      if (ev.tipo === 'nube-tapa-sol') {
        const k = envolvente(tt, dur, reduced ? 3.5 : 2.6, reduced ? 4 : 3.2)
        directo *= 1 - (reduced ? 0.55 : 0.85) * k
        cielo *= 1 - (reduced ? 0.15 : 0.26) * k
      } else if (ev.tipo === 'sale-sol') {
        const k = envolvente(tt, dur, reduced ? 3 : 1.5, 3.5)
        directo += ((reduced ? 1.08 : 1.3) - directo) * k
        cielo += (reduced ? 0.08 : 0.16) * k
      } else if (ev.tipo === 'fluorescente-zumba') {
        caidaPanel = (reduced ? 0.35 : 0.5) * envolvente(tt, dur, 1, 1.4)
      }
    }

    const objetivoCalma = enCalma ? 1 : 0
    e.calma = THREE.MathUtils.damp(e.calma, objetivoCalma, 1.4, dt)
    if (Math.abs(e.calma - objetivoCalma) > 0.003) moviendo = true
    directo = THREE.MathUtils.lerp(directo, 0.7, e.calma)
    cielo = THREE.MathUtils.lerp(cielo, 0.9, e.calma)
    caidaPanel *= 1 - e.calma

    // Suavizado de seguridad: ningún cambio brusco aunque el evento se corte (p. ej. al pulsar calma).
    const dir0 = e.directo
    const cie0 = e.cielo
    e.directo = THREE.MathUtils.damp(e.directo, directo, 3, dt)
    e.cielo = THREE.MathUtils.damp(e.cielo, cielo, 3, dt)
    if (Math.abs(e.directo - directo) > 0.01 || Math.abs(e.cielo - cielo) > 0.01) moviendo = true
    if (Math.abs(e.directo - dir0) + Math.abs(e.cielo - cie0) > 0.004 && !ev) moviendo = true

    const velBajar = reduced ? 0.2 : 0.32
    const velSubir = reduced ? 0.08 : 0.12
    e.persianas.forEach((p, i) => {
      const objetivo = e.bajadaHasta[i] > reloj ? PERSIANA_BAJADA : PERSIANA_BASE[i]
      const paso = (objetivo > p ? velBajar : velSubir) * dt
      const nuevo = Math.abs(objetivo - p) <= paso ? objetivo : p + Math.sign(objetivo - p) * paso
      if (nuevo !== p) moviendo = true
      e.persianas[i] = nuevo
    })

    const sol = Math.max(0, e.directo - 0.12)
    if (ambRef.current) ambRef.current.intensity = amb * (0.78 + 0.26 * e.cielo)
    if (hemiRef.current) hemiRef.current.intensity = hemi * (0.75 + 0.3 * e.cielo)
    if (solRef.current) solRef.current.intensity = 0.62 * sol * (0.6 + 0.4 * t)

    recursos.vidrio.color.setScalar(0.5 + 0.3 * e.cielo + 0.26 * sol)
    recursos.halo.opacity = 0.12 + 0.2 * sol
    if (!reduced && !enCalma) recursos.cielo.offset.x = (reloj * 0.0035) % 1

    recursos.ventanas.forEach((v, i) => {
      const bajada = e.persianas[i]
      const paso = 1 - 0.88 * bajada
      ;(v.matHaz.uniforms.uIntensidad as { value: number }).value = 0.17 * sol * paso
      v.matMancha.opacity = 0.62 * sol * paso
      const persiana = persianaRefs.current[i]
      if (persiana) {
        persiana.visible = bajada > 0.01
        persiana.scale.y = Math.max(0.001, bajada)
        persiana.position.y = VENTANA.y1 - (bajada * ALTO_VENTANA) / 2
        const mapa = v.matPersiana.map
        if (mapa) {
          mapa.repeat.y = bajada * LAMAS
          mapa.offset.y = -mapa.repeat.y
        }
      }
      const barra = barraRefs.current[i]
      if (barra) {
        barra.visible = bajada > 0.01
        barra.position.y = VENTANA.y1 - bajada * ALTO_VENTANA
      }
    })

    recursos.paneles.forEach((m, i) => {
      const k = ev?.panel === i ? 1 - caidaPanel : 1
      m.color.setRGB(1.18 * k, 1.2 * k, 1.16 * k)
    })
    const panelCaido = ev ? PANELES[ev.panel] : null
    fluoRefs.current.forEach((l, i) => {
      if (!l) return
      let k = 1
      if (panelCaido && caidaPanel > 0) {
        const [px, pz] = panelCaido
        const [lx, , lz] = FLUO_POS[i]
        const cerca = Math.exp(-((px - lx) ** 2 + (pz - lz) ** 2) / 10)
        k = 1 - 0.45 * caidaPanel * cerca
      }
      l.intensity = (i === 2 ? fluo * 0.75 : fluo) * k
    })

    if (moviendo) invalidate()
  })

  const solPos = SOL_DIR.clone().multiplyScalar(-10)

  return (
    <>
      <ambientLight ref={ambRef} intensity={amb} color="#fff8ef" />
      <hemisphereLight ref={hemiRef} args={['#f2f5f8', '#8a6d55', hemi]} />
      <directionalLight position={[-3.5, 6.5, 1.5]} intensity={0.45 + t * 0.6} color="#fff4e4" />
      <directionalLight position={[2.5, 4.5, -1.5]} intensity={0.2 + t * 0.18} color="#e8eef4" />
      <directionalLight
        ref={solRef}
        position={[solPos.x, solPos.y, solPos.z]}
        intensity={0.5}
        color="#ffe7c4"
      />
      {FLUO_POS.map((p, i) => (
        <pointLight
          key={p.join()}
          ref={(l) => {
            fluoRefs.current[i] = l
          }}
          position={p}
          intensity={i === 2 ? fluo * 0.75 : fluo}
          color={i === 2 ? '#eef4f6' : '#f5f0e0'}
          distance={16}
          decay={2}
        />
      ))}

      {PANELES.map(([x, z], i) => (
        <group key={`${x}-${z}`} position={[x, 4.085, z]}>
          <mesh>
            <boxGeometry args={[0.68, 0.02, 1.28]} />
            <meshStandardMaterial color="#d6d7d3" metalness={0.35} roughness={0.45} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.012, 0]} material={recursos.paneles[i]}>
            <planeGeometry args={[0.6, 1.2]} />
          </mesh>
        </group>
      ))}

      {recursos.ventanas.map((v, i) => (
        <group key={v.zc}>
          <mesh
            position={[VENTANA.x + 0.005, (VENTANA.y0 + VENTANA.y1) / 2, v.zc]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[1.35, 1.9, 1]}
            material={recursos.halo}
          >
            <planeGeometry args={[VENTANA.ancho, ALTO_VENTANA]} />
          </mesh>
          <mesh
            position={[VENTANA.x + 0.01, (VENTANA.y0 + VENTANA.y1) / 2, v.zc]}
            rotation={[0, Math.PI / 2, 0]}
            geometry={v.geoVidrio}
            material={recursos.vidrio}
          />
          <MarcoVentana zc={v.zc} />
          <mesh
            ref={(m) => {
              persianaRefs.current[i] = m
            }}
            position={[VENTANA.x + 0.085, VENTANA.y1, v.zc]}
            rotation={[0, Math.PI / 2, 0]}
            material={v.matPersiana}
          >
            <planeGeometry args={[VENTANA.ancho, ALTO_VENTANA]} />
          </mesh>
          <mesh
            ref={(m) => {
              barraRefs.current[i] = m
            }}
            position={[VENTANA.x + 0.085, VENTANA.y1, v.zc]}
          >
            <boxGeometry args={[0.03, 0.022, VENTANA.ancho]} />
            <meshStandardMaterial color="#cfc8b8" roughness={0.6} />
          </mesh>
          <mesh geometry={v.haz} material={v.matHaz} renderOrder={2} />
          <mesh geometry={v.mancha} material={v.matMancha} renderOrder={1} />
        </group>
      ))}
    </>
  )
}

function MarcoVentana({ zc }: { zc: number }) {
  const { x, y0, y1, ancho } = VENTANA
  const yc = (y0 + y1) / 2
  const mat = <meshStandardMaterial color="#c8cbcc" metalness={0.45} roughness={0.4} />
  return (
    <group>
      <mesh position={[x + 0.03, y1 + 0.03, zc]}>
        <boxGeometry args={[0.08, 0.06, ancho + 0.1]} />
        {mat}
      </mesh>
      <mesh position={[x + 0.06, y0 - 0.025, zc]}>
        <boxGeometry args={[0.16, 0.05, ancho + 0.16]} />
        {mat}
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[x + 0.03, yc, zc + s * (ancho / 2 + 0.025)]}>
          <boxGeometry args={[0.08, ALTO_VENTANA, 0.05]} />
          {mat}
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`m${s}`} position={[x + 0.025, yc, zc + (s * ancho) / 6]}>
          <boxGeometry args={[0.05, ALTO_VENTANA, 0.035]} />
          {mat}
        </mesh>
      ))}
      <mesh position={[x + 0.025, y0 + ALTO_VENTANA * 0.32, zc]}>
        <boxGeometry args={[0.04, 0.03, ancho]} />
        {mat}
      </mesh>
      <mesh position={[x + 0.1, y1 - 0.01, zc]}>
        <boxGeometry args={[0.07, 0.05, ancho + 0.04]} />
        <meshStandardMaterial color="#e2dccd" roughness={0.7} />
      </mesh>
    </group>
  )
}
