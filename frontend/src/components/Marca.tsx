interface Props {
  className?: string
}

export function Marca({ className = 'w-9 h-9 shrink-0' }: Props) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M11 30V14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M29 30V14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M9 14h22" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M20 14v16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
      <path d="M8 30h24" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  )
}
