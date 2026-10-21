'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  cargarInsigniasUtiles,
  desbloquearInsigniaUtil,
  metaInsignia,
  type IdInsigniaUtil,
  type InsigniaUtil,
} from '@/lib/insignias'
import { sonarRecompensaInsignia } from '@/lib/insignias/sonarRecompensa'

export interface OpcionesInsignias {
  /** Si true, el chime suena más bajo (modo calma). */
  enCalma?: boolean
  /** Ducking breve del audio de sala al sonar la medalla. */
  atenuarAmbiente?: (activo: boolean) => void
}

/**
 * Carga insignias útiles desde localStorage y gestiona el aviso discreto al ganar una.
 */
export function useInsigniasUtiles(opts: OpcionesInsignias = {}) {
  const [conseguidas, setConseguidas] = useState<IdInsigniaUtil[]>([])
  const [listo, setListo] = useState(false)
  const [aviso, setAviso] = useState<InsigniaUtil | null>(null)
  const optsRef = useRef(opts)
  optsRef.current = opts

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
          const o = optsRef.current
          sonarRecompensaInsignia({
            enCalma: o.enCalma,
            atenuarAmbiente: o.atenuarAmbiente,
          })
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
