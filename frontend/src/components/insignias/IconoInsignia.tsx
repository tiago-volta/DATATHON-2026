import type { IdInsigniaUtil } from '@/lib/insignias'

interface Props {
  id: IdInsigniaUtil
  className?: string
  /** Medalla a color (desbloqueada) o en gris (bloqueada). */
  desbloqueada?: boolean
}

/**
 * Medalla visual por insignia (estilo videojuego calmado).
 * Sin morado; tonos teal / sage / oro suave.
 */
export function IconoInsignia({
  id,
  className = 'w-10 h-10',
  desbloqueada = true,
}: Props) {
  const gradId = `medalla-brillo-${id}`
  const filtros = desbloqueada
    ? undefined
    : { filter: 'grayscale(1) brightness(1.05)', opacity: 0.55 }

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      style={filtros}
    >
      {desbloqueada && (
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#D4EDE8" />
            <stop offset="100%" stopColor="#B8DCCF" />
          </radialGradient>
        </defs>
      )}

      {/* Cinta */}
      <path
        d="M22 8h8l2 14H20L22 8z"
        fill={desbloqueada ? '#1A5566' : '#94A8B0'}
      />
      <path
        d="M34 8h8l2 14H32L34 8z"
        fill={desbloqueada ? '#2E7A8C' : '#A8B8BE'}
      />
      <path
        d="M30 8h4v14h-4V8z"
        fill={desbloqueada ? '#3EA3BC' : '#B8C5CA'}
      />

      {/* Disco de medalla */}
      <circle
        cx="32"
        cy="38"
        r="20"
        fill={desbloqueada ? '#E8F4F2' : '#E8ECEE'}
        stroke={desbloqueada ? '#1A5566' : '#9AADB5'}
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="38"
        r="15.5"
        stroke={desbloqueada ? '#5EA37A' : '#B0BEC4'}
        strokeWidth="1.75"
        strokeDasharray={desbloqueada ? undefined : '3 3'}
        fill={desbloqueada ? `url(#${gradId})` : '#F2F4F5'}
      />

      {id === 'primera-calma' && <PictogramaCalma desbloqueada={desbloqueada} />}
      {id === 'pedi-ajustes' && <PictogramaAjustes desbloqueada={desbloqueada} />}
      {id === 'ensaye-1-nivel' && <PictogramaEnsayo desbloqueada={desbloqueada} />}
      {id === 'ensaya-nivel-1' && (
        <PictogramaEnsayaNivel desbloqueada={desbloqueada} marcas={1} />
      )}
      {id === 'ensaya-nivel-2' && (
        <PictogramaEnsayaNivel desbloqueada={desbloqueada} marcas={2} />
      )}
      {id === 'ensaya-nivel-3' && (
        <PictogramaEnsayaNivel desbloqueada={desbloqueada} marcas={3} />
      )}
      {id === 'ensaye-con-calma' && (
        <PictogramaEnsayeConCalma desbloqueada={desbloqueada} />
      )}
      {id === 'casi-listo' && <PictogramaCasiListo desbloqueada={desbloqueada} />}
      {id === 'testigo-en-forma' && (
        <PictogramaTestigo desbloqueada={desbloqueada} />
      )}
    </svg>
  )
}

function PictogramaCalma({ desbloqueada }: { desbloqueada: boolean }) {
  const c = desbloqueada ? '#1A5566' : '#7A8F96'
  return (
    <g>
      <path
        d="M32 48c0-10 7.5-15 7.5-22.5C32 28 27 35.5 27 43c0 3 2 5 5 5z"
        fill={c}
        opacity="0.9"
      />
      <path
        d="M24 40c3-1.5 6-1.5 9 0"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="38" cy="28" r="2" fill={desbloqueada ? '#5EA37A' : '#9AADB5'} />
    </g>
  )
}

function PictogramaAjustes({ desbloqueada }: { desbloqueada: boolean }) {
  const c = desbloqueada ? '#1A5566' : '#7A8F96'
  return (
    <g>
      <rect
        x="24"
        y="26"
        width="16"
        height="22"
        rx="2.5"
        stroke={c}
        strokeWidth="2"
        fill={desbloqueada ? '#FFFFFF' : '#F5F7F8'}
      />
      <path
        d="M28 32h8M28 37h8M28 42h5"
        stroke={c}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M38 44.5 40.5 47 45 41.5"
        stroke={desbloqueada ? '#5EA37A' : '#9AADB5'}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

function PictogramaEnsayo({ desbloqueada }: { desbloqueada: boolean }) {
  const c = desbloqueada ? '#1A5566' : '#7A8F96'
  const fill = desbloqueada ? '#5EA37A' : '#9AADB5'
  return (
    <g>
      <path
        d="M22 48h7v-8h-7v8zm9 0h7V34h-7v14zm9 0h7V28h-7v20z"
        stroke={c}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={fill}
        fillOpacity="0.35"
      />
      <path
        d="M25 36.5 28.5 40 34 32.5"
        stroke={desbloqueada ? '#1A5566' : '#7A8F96'}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  )
}

/** Bloques 1–3 de Ensaya: barras de progreso calmadas. */
function PictogramaEnsayaNivel({
  desbloqueada,
  marcas,
}: {
  desbloqueada: boolean
  marcas: 1 | 2 | 3
}) {
  const c = desbloqueada ? '#1A5566' : '#7A8F96'
  const ok = desbloqueada ? '#5EA37A' : '#9AADB5'
  const xs = [22, 32, 42] as const
  return (
    <g>
      {xs.map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy="38"
          r="4"
          fill={i < marcas ? ok : 'none'}
          stroke={c}
          strokeWidth="1.75"
          strokeDasharray={i < marcas ? undefined : '2 2'}
        />
      ))}
      <path
        d="M20 48h24"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.45"
      />
    </g>
  )
}

function PictogramaEnsayeConCalma({ desbloqueada }: { desbloqueada: boolean }) {
  const c = desbloqueada ? '#1A5566' : '#7A8F96'
  const soft = desbloqueada ? '#5EA37A' : '#9AADB5'
  return (
    <g>
      <path
        d="M32 46c0-8 6-12 6-18C32 30 28 36 28 42c0 2.5 1.6 4 4 4z"
        fill={c}
        opacity="0.85"
      />
      <path
        d="M24 36c2.5-1 5.5-1 8 0"
        stroke={soft}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="38" cy="30" r="2" fill={soft} />
    </g>
  )
}

/** Nivel 3: camino casi completo (3 de 5 marcas). */
function PictogramaCasiListo({ desbloqueada }: { desbloqueada: boolean }) {
  const c = desbloqueada ? '#1A5566' : '#7A8F96'
  const ok = desbloqueada ? '#5EA37A' : '#9AADB5'
  return (
    <g>
      <circle cx="22" cy="38" r="3.5" fill={ok} />
      <circle cx="32" cy="38" r="3.5" fill={ok} />
      <circle cx="42" cy="38" r="3.5" fill={ok} />
      <circle
        cx="27"
        cy="48"
        r="2.5"
        stroke={c}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="2 2"
      />
      <circle
        cx="37"
        cy="48"
        r="2.5"
        stroke={c}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="2 2"
      />
      <path
        d="M20 30h24"
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </g>
  )
}

/** Nivel 5: estrella suave / testigo. */
function PictogramaTestigo({ desbloqueada }: { desbloqueada: boolean }) {
  const c = desbloqueada ? '#1A5566' : '#7A8F96'
  const fill = desbloqueada ? '#C4A35A' : '#9AADB5'
  return (
    <g>
      <path
        d="M32 24l2.8 8.2H43l-6.6 5 2.5 8.2L32 40.6l-6.9 4.8 2.5-8.2-6.6-5h8.2L32 24z"
        fill={fill}
        stroke={c}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="48" r="2" fill={c} opacity="0.7" />
    </g>
  )
}
