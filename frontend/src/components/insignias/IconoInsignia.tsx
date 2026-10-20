import type { IdInsigniaUtil } from '@/lib/insignias'

interface Props {
  id: IdInsigniaUtil
  className?: string
}

/** Pictograma simple (SVG) por insignia. Sin morado; tono teal/calma. */
export function IconoInsignia({ id, className = 'w-8 h-8' }: Props) {
  if (id === 'primera-calma') {
    return (
      <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="2" />
        <path
          d="M20 28c0-8 6-12 6-18-6 2-10 8-10 14 0 2.5 1.5 4 4 4z"
          fill="currentColor"
          opacity="0.85"
        />
        <path
          d="M14 22c2-1 4-1 6 0"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (id === 'pedi-ajustes') {
    return (
      <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect
          x="10"
          y="6"
          width="20"
          height="28"
          rx="3"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M15 16h10M15 21h10M15 26h6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M26 27.5 28 29.5 32 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  // ensaye-1-nivel
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M8 28h8v-6H8v6zm10 0h8v-12h-8v12zm10 0h8V10h-8v18z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path
        d="M11 18.5 14 21.5 19 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
