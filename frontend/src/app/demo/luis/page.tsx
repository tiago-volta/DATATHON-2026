'use client'

import { useEffect, Suspense } from 'react'
import {
  VistaCitacion,
  construirRespaldoLocal,
  EJEMPLO_LUIS,
} from '@/components/citacion/VistaCitacion'
import { cargarPerfilDemoLuis } from '@/lib/perfil/demoLuis'

function ContenidoDemoLuis() {
  const citacionLuis = construirRespaldoLocal(EJEMPLO_LUIS)

  useEffect(() => {
    cargarPerfilDemoLuis()
  }, [])

  return (
    <VistaCitacion
      modoFijado="resultado"
      citacionInicial={citacionLuis}
      textoInicial={EJEMPLO_LUIS}
      esDemoLuis
    />
  )
}

export default function PaginaDemoLuis() {
  return (
    <Suspense fallback={null}>
      <ContenidoDemoLuis />
    </Suspense>
  )
}
