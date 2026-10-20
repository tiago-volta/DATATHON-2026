import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'
import { etiquetasAjustes, parsePasaporteSearchParams } from '@/lib/pasaporte'

type SearchParams = Record<string, string | string[] | undefined>

export default function PaginaVerPasaporte({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const pasaporte = parsePasaporteSearchParams(searchParams)
  const ajustes = pasaporte ? etiquetasAjustes(pasaporte.ajustes) : []

  return (
    <>
      <Cabecera />

      <main id="contenido-principal" className="max-w-xl mx-auto px-4 py-8">
        {!pasaporte ? (
          <section className="card text-center" aria-live="polite">
            <h1 className="text-2xl font-bold text-puente-800 mb-3">
              Pasaporte no encontrado
            </h1>
            <p className="text-puente-600 mb-6">
              Este enlace no incluye los datos del Pasaporte. Pide a la persona
              que te muestre de nuevo su código QR.
            </p>
            <Link href="/pasaporte" className="btn-primary">
              Crear un Pasaporte
            </Link>
          </section>
        ) : (
          <section aria-labelledby="titulo-pasaporte">
            <p className="text-sm font-medium text-puente-500 mb-3 uppercase tracking-wide">
              Escaneado · Pasaporte de Ajustes
            </p>

            <article className="card-destacada overflow-hidden p-0">
              <header className="bg-gradient-to-br from-puente-600 to-puente-800 text-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <path d="M12 24 L20 16 L28 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M20 16 L20 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-xl font-bold">PUENTE</span>
                </div>
                <h1 id="titulo-pasaporte" className="text-3xl font-bold text-white mb-1">
                  {pasaporte.nombre}
                </h1>
                <p className="text-puente-100">
                  Necesita estos ajustes en el juzgado
                </p>
                <p className="text-puente-200 text-sm mt-3">
                  Código: {pasaporte.id}
                </p>
              </header>

              <div className="p-6">
                <h2 className="font-bold text-puente-800 mb-4 text-lg">
                  Adaptaciones pedidas
                </h2>
                <ul className="space-y-3">
                  {ajustes.map((ajuste) => (
                    <li
                      key={ajuste.id}
                      className="flex items-start gap-3 p-3 rounded-suave bg-calma-mist"
                    >
                      <span className="text-accent-success font-bold mt-0.5" aria-hidden="true">
                        ✓
                      </span>
                      <div>
                        <p className="font-bold text-puente-800">{ajuste.nombre}</p>
                        <p className="text-puente-600 text-base">{ajuste.descripcion}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {pasaporte.contacto && (
                  <div className="mt-6 p-4 rounded-suave border-2 border-puente-200 bg-white">
                    <p className="text-sm font-medium text-puente-500 mb-1">
                      Contacto de emergencia
                    </p>
                    <p className="text-lg font-bold text-puente-800">
                      <a href={`tel:${pasaporte.contacto.replace(/\s/g, '')}`} className="underline">
                        {pasaporte.contacto}
                      </a>
                    </p>
                  </div>
                )}

                <p className="mt-6 text-sm text-puente-500 text-center">
                  Este Pasaporte no muestra ningún diagnóstico. Solo indica qué
                  adaptaciones necesita la persona.
                  <br />
                  Base legal: Art. 7 bis LEC · Art. 109 LECrim · Ley 15/2022.
                </p>
              </div>
            </article>

            <div className="mt-8 flex flex-col gap-3">
              <Link href="/profesional" className="btn-secondary w-full text-center">
                Panel profesional
              </Link>
              <Link href="/pasaporte" className="btn-ghost w-full text-center">
                Crear otro Pasaporte
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
