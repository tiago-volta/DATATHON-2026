interface Props {
  className?: string
}

export function Marca({ className = 'w-9 h-9 shrink-0' }: Props) {
  return (
    <img
      src="/logo-icon.png"
      alt=""
      aria-hidden="true"
      className={`${className} object-contain`}
    />
  )
}
