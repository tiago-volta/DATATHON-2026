import { AJUSTES_DISPONIBLES } from './contenido'
import { etiquetasAjustes } from './pasaporte'

/**
 * Genera un escrito de solicitud de ajustes (art. 7 bis LEC) listo para
 * descargar o copiar — apoyo a disgrafía: la persona no tiene que redactarlo.
 */
export function redactarEscritoAjustes(opts: {
  nombre: string
  ajustes: string[]
  organo?: string
}): string {
  const nombre = opts.nombre.trim() || 'la persona solicitante'
  const lista = etiquetasAjustes(opts.ajustes)
  const organo =
    opts.organo?.trim() ||
    'el Juzgado competente que corresponda a mi procedimiento'

  const bullets =
    lista.length > 0
      ? lista.map((a) => `  - ${a.nombre}: ${a.descripcion}`).join('\n')
      : AJUSTES_DISPONIBLES.slice(0, 3)
          .map((a) => `  - ${a.nombre}: ${a.descripcion}`)
          .join('\n')

  const hoy = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `SOLICITUD DE AJUSTES DE PROCEDIMIENTO
(Art. 7 bis de la Ley de Enjuiciamiento Civil · Art. 109 LECrim · Ley 15/2022)

A ${organo}:

Yo, ${nombre}, solicito que se adopten los ajustes de procedimiento necesarios
para garantizar mi participación en condiciones de igualdad.

AJUSTES QUE SOLICITO:
${bullets}

Estas peticiones describen necesidades de apoyo. No incluyen ningún diagnóstico
médico ni dato de salud.

Documento generado con PUENTE (DATAthon Justicia 2026) el ${hoy}.
Puedo aportar este escrito o mi Pasaporte de Ajustes (código QR) al personal del juzgado.
`
}

export function descargarEscritoAjustes(texto: string, nombreArchivo: string) {
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  a.click()
  URL.revokeObjectURL(url)
}
