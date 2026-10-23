'use client'

import { Suspense } from 'react'
import { VistaCitacion } from '@/components/citacion/VistaCitacion'

export default function PaginaCitacion() {
  return (
    <Suspense fallback={null}>
      <VistaCitacion />
    </Suspense>
  )
}
