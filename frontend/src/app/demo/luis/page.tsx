'use client'

import { useEffect, Suspense } from 'react'
import {
  VistaCitacion,
  EJEMPLO_LUIS,
} from '@/components/citacion/VistaCitacion'
import { cargarPerfilDemoLuis, CITACION_DEMO_LUIS } from '@/lib/perfil/demoLuis'

function ContenidoDemoLuis() {
  useEffect(() => {
    cargarPerfilDemoLuis()
  }, [])

  return (
    <VistaCitacion
      modoFijado="resultado"
      citacionInicial={CITACION_DEMO_LUIS}
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
