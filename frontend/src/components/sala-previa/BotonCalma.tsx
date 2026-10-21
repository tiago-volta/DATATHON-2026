'use client'

interface Props {
  enCalma: boolean
  onPausa: () => void
  onReanudar: () => void
}

/**
 * Fijo en móvil y escritorio, encima de overlays (z alto).
 * Siempre a mano: intro, escenas y check-in.
 */
export function BotonCalma({ enCalma, onPausa, onReanudar }: Props) {
  const etiqueta = enCalma ? 'Seguir explorando' : 'Pausa / Volver a la calma'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center pointer-events-none px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
      role="region"
      aria-label="Control de calma"
    >
      <button
        type="button"
        onClick={enCalma ? onReanudar : onPausa}
        className="pointer-events-auto btn bg-accent-success text-white border-2 border-accent-success hover:bg-[#145233] min-h-[56px] min-w-[44px] text-lg px-8 max-w-full"
        aria-pressed={enCalma}
        aria-label={etiqueta}
      >
        {etiqueta}
      </button>
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {enCalma ? 'Modo calma activo. Los estímulos están bajos.' : ''}
      </span>
    </div>
  )
}
