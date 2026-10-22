'use client'

export interface LineaSubtitulo {
  id: string
  tipo: 'voz' | 'ruido'
  quien?: string
  texto: string
}

/** Subtítulos siempre visibles: lo que se dice y los ruidos de la sala. */
export function Subtitulos({ lineas }: { lineas: LineaSubtitulo[] }) {
  return (
    <section
      className="rounded-tarjeta border-2 border-court-300 bg-white px-4 py-3 min-h-[6rem]"
      aria-label="Subtítulos"
    >
      <h2 className="text-xs font-bold uppercase tracking-wide text-court-600 mb-1">Subtítulos</h2>
      {lineas.length === 0 ? (
        <p className="text-court-700">Silencio en la sala.</p>
      ) : (
        <ul className="space-y-1.5">
          {lineas.map((l, i) => {
            const ultima = i === lineas.length - 1
            if (l.tipo === 'ruido') {
              return (
                <li key={l.id} className="text-court-700 italic">
                  [Ruido] {l.texto}
                </li>
              )
            }
            return (
              <li
                key={l.id}
                className={ultima ? 'text-lg sm:text-xl font-semibold text-court-900' : 'text-court-800'}
              >
                <span className="font-bold">{l.quien}:</span> «{l.texto}»
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
