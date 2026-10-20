'use client'

interface Props {
  enCalma: boolean
  onPausa: () => void
  onReanudar: () => void
}

export function BotonCalma({ enCalma, onPausa, onReanudar }: Props) {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <button
        type="button"
        onClick={enCalma ? onReanudar : onPausa}
        className="pointer-events-auto btn bg-accent-success text-puente-900 shadow-lg hover:brightness-95 min-h-[64px] text-lg px-8"
        aria-pressed={enCalma}
      >
        {enCalma ? 'Seguir explorando' : 'Pausa / Volver a la calma'}
      </button>
    </div>
  )
}
