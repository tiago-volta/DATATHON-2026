'use client'

import type { ReactNode } from 'react'
import { SalaJuzgado360 } from '@/components/sala-previa/SalaJuzgado360'
import type { MiradaSala, PapelSala } from '@/lib/sala-previa/salaVistasConfig'
import type { TipoDistraccion } from '@/lib/sala-previa/distracciones'
import type {
  IdEscenaJuzgado,
  NivelSala,
  ValoresEstimulo,
} from '@/lib/sala-previa/tipos'

interface Props {
  nivel: NivelSala
  escenaId: IdEscenaJuzgado
  valores: ValoresEstimulo
  enCalma: boolean
  miradaExterna?: MiradaSala | null
  personaEntrando?: boolean
  papel?: PapelSala
  eventoExterno?: { id: number; tipo: TipoDistraccion } | null
  ocultarFicha?: boolean
  panelExtra?: ReactNode
  vistaAmplia?: boolean
  onCambiarValores?: (valores: ValoresEstimulo) => void
  tutorialMenuAbierto?: boolean
  tutorialAvisoDemo?: string | null
}

export function EscenaSensorial({
  nivel,
  escenaId,
  valores,
  enCalma,
  miradaExterna,
  personaEntrando,
  papel,
  eventoExterno,
  ocultarFicha = false,
  panelExtra,
  vistaAmplia = false,
  onCambiarValores,
  tutorialMenuAbierto,
  tutorialAvisoDemo = null,
}: Props) {
  return (
    <div className="space-y-3">
      <SalaJuzgado360
        escenaId={escenaId}
        titulo={nivel.nombre}
        valores={valores}
        enCalma={enCalma}
        miradaExterna={miradaExterna}
        personaEntrando={personaEntrando}
        papel={papel}
        eventoExterno={eventoExterno}
        panelExtra={panelExtra}
        vistaAmplia={vistaAmplia}
        onCambiarValores={onCambiarValores}
        tutorialMenuAbierto={tutorialMenuAbierto}
        tutorialAvisoDemo={tutorialAvisoDemo}
      />

      {!ocultarFicha && (
        <div className="rounded-suave border border-court-200 bg-white px-4 py-3">
          <p className="font-bold text-court-800 text-lg">{nivel.nombre}</p>
          <p className="text-court-700 mt-1">{nivel.descripcion}</p>
        </div>
      )}
    </div>
  )
}
