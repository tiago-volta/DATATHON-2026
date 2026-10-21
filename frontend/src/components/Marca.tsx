interface Props {
  className?: string
}

export function Marca({ className = 'w-9 h-9 shrink-0' }: Props) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M7 27V18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M33 27V18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M7 18c4.2-7 21.8-7 26 0" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M6 27h28" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  )
}
