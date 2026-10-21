'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  cargarInsigniasUtiles,
  desbloquearInsigniaUtil,
  metaInsignia,
  type IdInsigniaUtil,
  type InsigniaUtil,
} from '@/lib/insignias'

export interface OpcionesInsignias {
  /** Reservado por compatibilidad con llamadas existentes. */
  enCalma?: boolean
  atenuarAmbiente?: (activo: boolean) => void
}

/**
 * Carga insignias útiles desde localStorage y gestiona el aviso discreto al ganar una.
 */
export function useInsigniasUtiles(_opts: OpcionesInsignias = {}) {
  const [conseguidas, setConseguidas] = useState<IdInsigniaUtil[]>([])
  const [listo, setListo] = useState(false)
  const [aviso, setAviso] = useState<InsigniaUtil | null>(null)

  useEffect(() => {
    setConseguidas(cargarInsigniasUtiles())
    setListo(true)
  }, [])

  const desbloquear = useCallback(
    (id: IdInsigniaUtil, optsDesbloqueo?: { silencioso?: boolean }) => {
      const { nueva, insignias } = desbloquearInsigniaUtil(id)
      if (nueva) {
        setConseguidas(insignias)
        if (!optsDesbloqueo?.silencioso) {
          setAviso(metaInsignia(id))
        }
      } else {
        setConseguidas(insignias)
      }
      return nueva
    },
    []
  )

  const descartarAviso = useCallback(() => {
    setAviso(null)
  }, [])

  return { conseguidas, listo, aviso, desbloquear, descartarAviso }
}
