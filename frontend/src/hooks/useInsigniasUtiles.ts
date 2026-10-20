'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  cargarInsigniasUtiles,
  desbloquearInsigniaUtil,
  metaInsignia,
  type IdInsigniaUtil,
  type InsigniaUtil,
} from '@/lib/insignias'

/**
 * Carga insignias útiles desde localStorage y gestiona el aviso discreto al ganar una.
 */
export function useInsigniasUtiles() {
  const [conseguidas, setConseguidas] = useState<IdInsigniaUtil[]>([])
  const [listo, setListo] = useState(false)
  const [aviso, setAviso] = useState<InsigniaUtil | null>(null)

  useEffect(() => {
    setConseguidas(cargarInsigniasUtiles())
    setListo(true)
  }, [])

  const desbloquear = useCallback((id: IdInsigniaUtil) => {
    const { nueva, insignias } = desbloquearInsigniaUtil(id)
    if (nueva) {
      setConseguidas(insignias)
      setAviso(metaInsignia(id))
    }
    return nueva
  }, [])

  const descartarAviso = useCallback(() => {
    setAviso(null)
  }, [])

  return { conseguidas, listo, aviso, desbloquear, descartarAviso }
}
