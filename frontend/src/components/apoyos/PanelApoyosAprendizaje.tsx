'use client'

import { useEffect, useId, useState } from 'react'
import {
  guardarPreferencias,
  leerPreferencias,
  type PreferenciasAcceso,
} from '@/lib/preferencias'

type ClaveApoyo = keyof Pick<
  PreferenciasAcceso,
  'lecturaEspaciada' | 'apoyoNumeros' | 'evitarEscribir'
>

const OPCIONES: {
  clave: ClaveApoyo
  titulo: string
  detalle: string
  relacion: string
}[] = [
  {
    clave: 'lecturaEspaciada',
    titulo: 'Lectura más clara y espaciada',
    detalle:
      'Letras más separadas, líneas amplias y lectura fácil por defecto en la citación. También puedes usar «Leer en voz alta».',
    relacion: 'Ayuda si te cuesta leer o procesar textos (p. ej. dislexia).',
  },
  {
    clave: 'apoyoNumeros',
    titulo: 'Números, horas y euros en palabras',
    detalle:
      'Destacamos cifras, plazos e importes en palabras para que no haya confusión con los números.',
    relacion: 'Ayuda si te confunden las cifras (p. ej. discalculia).',
  },
  {
    clave: 'evitarEscribir',
    titulo: 'Menos escritura: voz y plantillas',
    detalle:
      'En Ensaya puedes dictar o practicar sin teclear. En el Pasaporte puedes descargar un escrito listo para el juzgado.',
    relacion: 'Ayuda si te cuesta escribir a mano o al teclado (p. ej. disgrafía).',
  },
]

interface Props {
  /** Título del bloque. */
  titulo?: string
  className?: string
}

/**
 * Preferencias funcionales (sin diagnóstico) para dislexia / discalculia / disgrafía.
 * Se guardan solo en este dispositivo.
 */
export function PanelApoyosAprendizaje({
  titulo = 'Si te cuesta leer, los números o escribir',
  className = '',
}: Props) {
  const tituloId = useId()
  const [prefs, setPrefs] = useState<PreferenciasAcceso | null>(null)

  useEffect(() => {
    setPrefs(leerPreferencias())
    const sync = () => setPrefs(leerPreferencias())
    window.addEventListener('puente-preferencias-cambio', sync)
    return () => window.removeEventListener('puente-preferencias-cambio', sync)
  }, [])

  if (!prefs) {
    return (
      <section className={`card ${className}`} aria-busy="true">
        <p className="text-puente-700">Cargando preferencias…</p>
      </section>
    )
  }

  const toggle = (clave: ClaveApoyo, valor: boolean) => {
    const parcial: Partial<PreferenciasAcceso> = { [clave]: valor }
    if (valor && (clave === 'lecturaEspaciada' || clave === 'apoyoNumeros')) {
      parcial.necesitoApoyos = true
    }
    if (valor && clave === 'evitarEscribir') {
      parcial.accesoPorVoz = true
    }
    setPrefs(guardarPreferencias(parcial))
  }

  return (
    <section aria-labelledby={tituloId} className={`card ${className}`}>
      <h2 id={tituloId} className="font-bold text-puente-800 mb-1">
        {titulo}
      </h2>
      <p className="text-sm text-puente-700 mb-4">
        Marca lo que te ayude. No es un diagnóstico: solo cambia cómo te muestra
        PUENTE la información en este dispositivo.
      </p>

      <ul className="space-y-3">
        {OPCIONES.map((op) => {
          const id = `apoyo-${op.clave}`
          const activo = prefs[op.clave]
          return (
            <li key={op.clave}>
              <label
                htmlFor={id}
                className={`flex items-start gap-4 min-h-[44px] p-4 rounded-suave border-2 cursor-pointer transition-colors ${
                  activo
                    ? 'border-puente-500 bg-puente-50'
                    : 'border-puente-200 bg-white hover:border-puente-300'
                }`}
              >
                <input
                  id={id}
                  type="checkbox"
                  className="mt-1 h-5 w-5 shrink-0 accent-puente-700"
                  checked={activo}
                  onChange={(e) => toggle(op.clave, e.target.checked)}
                  aria-describedby={`${id}-ayuda`}
                />
                <span>
                  <span className="block font-bold text-puente-900">
                    {op.titulo}
                  </span>
                  <span id={`${id}-ayuda`} className="block text-sm text-puente-700 mt-1">
                    {op.detalle}
                  </span>
                  <span className="block text-xs text-puente-600 mt-2">
                    {op.relacion}
                  </span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
