'use client'

import { useId, useState, type ReactNode } from 'react'
import { AjustesAmbiente } from '@/components/sala-previa/AjustesAmbiente'
import { ControlDistracciones } from '@/components/sala-previa/ControlDistracciones'
import type { EntradaHistorial } from '@/hooks/useDistracciones'
import type { NivelDistracciones } from '@/lib/sala-previa/distracciones'
import type { ValoresEstimulo } from '@/lib/sala-previa/tipos'
import type { MiradaSala } from '@/lib/sala-previa/salaVistasConfig'

const MIRADAS: { id: MiradaSala; etiqueta: string }[] = [
  { id: 'entrada', etiqueta: 'Entrada' },
  { id: 'abogados', etiqueta: 'Abogados' },
  { id: 'juez', etiqueta: 'Juez' },
]

interface Props {
  valores: ValoresEstimulo
  onValores: (valores: ValoresEstimulo) => void
  nivelDistracciones: NivelDistracciones
  onNivelDistracciones: (nivel: NivelDistracciones) => void
  enCalma: boolean
  enfoque: MiradaSala | null
  onMirar: (id: MiradaSala) => void
  miradasExtra?: ReactNode
  /** Control externo (tutorial). Si no se pasa, el menú se abre solo. */
  abierto?: boolean
  onAbiertoChange?: (abierto: boolean) => void
}

export function MiniMenuSala({
  valores,
  onValores,
  nivelDistracciones,
  onNivelDistracciones,
  enCalma,
  enfoque,
  onMirar,
  miradasExtra,
  abierto: abiertoControlado,
  onAbiertoChange,
}: Props) {
  const panelId = useId()
  const [abiertoInterno, setAbiertoInterno] = useState(false)
  const controlado = abiertoControlado !== undefined
  const abierto = controlado ? Boolean(abiertoControlado) : abiertoInterno

  const setAbierto = (valor: boolean) => {
    onAbiertoChange?.(valor)
    if (!controlado) setAbiertoInterno(valor)
  }

  return (
    <div
      className="pointer-events-auto max-w-[min(100%,20rem)]"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        data-tutorial="menu"
        className="inline-flex items-center gap-2 min-h-[44px] px-3 rounded-suave bg-white text-court-800 border-2 border-court-200 font-bold text-sm shadow-sm hover:bg-calma-mist focus-visible:ring-4 focus-visible:ring-court-400"
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto(!abierto)}
      >
        Menú
        <span className="text-court-600 font-normal text-xs" aria-hidden="true">
          {abierto ? '(cerrar)' : '(abrir)'}
        </span>
      </button>

      {abierto && (
        <div
          id={panelId}
          className="mt-2 rounded-suave border-2 border-court-200 bg-white/95 backdrop-blur-sm p-3 shadow-md space-y-3"
          role="region"
          aria-label="Menú de la sala"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-court-600 mb-2">
              Mirar
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Mirar hacia un punto">
              {MIRADAS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`btn-ghost text-xs min-h-[40px] px-2 border border-court-200 ${
                    enfoque === m.id ? 'bg-court-100 font-bold' : ''
                  }`}
                  aria-pressed={enfoque === m.id}
                  onClick={() => onMirar(m.id)}
                >
                  {m.etiqueta}
                </button>
              ))}
              {miradasExtra}
            </div>
          </div>

          <div data-tutorial="ajustes">
            <p className="text-xs font-bold uppercase tracking-wide text-court-600 mb-2">
              Ajustes
            </p>
            <AjustesAmbiente valores={valores} onCambiar={onValores} embebido />
          </div>

          <div data-tutorial="distracciones">
            <ControlDistracciones
              mini
              modo="preparacion"
              nivel={nivelDistracciones}
              enCalma={enCalma}
              aviso={null}
              explicacion=""
              historial={[] as EntradaHistorial[]}
              onNivel={onNivelDistracciones}
            />
          </div>
        </div>
      )}
    </div>
  )
}
