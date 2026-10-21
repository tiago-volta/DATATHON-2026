'use client'

import { useEffect, useState } from 'react'
import {
  CLAVE_INSIGNIAS,
  EVENTO_INSIGNIAS,
  cargarInsigniasUtiles,
  type IdInsigniaUtil,
} from '@/lib/insignias'
import { PanelInsignias } from '@/components/insignias/PanelInsignias'

export function MedallasPerfil() {
  const [conseguidas, setConseguidas] = useState<IdInsigniaUtil[]>([])

  useEffect(() => {
    const sync = () => setConseguidas(cargarInsigniasUtiles())
    sync()
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === CLAVE_INSIGNIAS) sync()
    }
    window.addEventListener(EVENTO_INSIGNIAS, sync)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENTO_INSIGNIAS, sync)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return (
    <div id="medallas" className="mt-10 scroll-mt-28">
      <PanelInsignias conseguidas={conseguidas} titulo="Tus medallas" />
    </div>
  )
}
