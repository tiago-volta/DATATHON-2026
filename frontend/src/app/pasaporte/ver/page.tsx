import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { Marca } from '@/components/Marca'
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
      <main id="contenido-principal" className="page-shell">
        {!pasaporte ? (
          <section className="card text-center" aria-live="polite">
            <h1 className="titulo-pagina">
              Pasaporte no encontrado
            </h1>
            <p className="entradilla">
              Este enlace no incluye los datos del Pasaporte. Pide a la persona
              que te muestre de nuevo su código QR.
            </p>
            <Link href="/pasaporte" className="btn-primary">
              Crear un Pasaporte
            </Link>
          </section>
        ) : (
          <section aria-labelledby="titulo-pasaporte">
            <p className="text-puente-700 font-medium mb-6">
              Escaneado · Pasaporte de Ajustes
            </p>

            <article className="hoja">
              <header className="border-b-2 border-puente-800 pb-6 mb-6">
                <div className="flex items-center gap-3 mb-4 text-puente-800">
                  <Marca className="w-8 h-8" />
                  <span className="text-xl font-bold" translate="no">PUENTE</span>
                </div>
                <h1 id="titulo-pasaporte" className="text-3xl font-bold text-puente-900 mb-1">
                  {pasaporte.nombre}
                </h1>
                <p className="text-puente-700">
                  Necesita estos ajustes en el juzgado
                </p>
                <p className="text-puente-800 mt-3 numeros">
                  Código: {pasaporte.id}
                </p>
              </header>

              <h2 className="font-bold text-puente-800 mb-4 text-lg">
                Adaptaciones pedidas
              </h2>
              <ul className="space-y-3">
                {ajustes.map((ajuste) => (
                  <li
                    key={ajuste.id}
                    className="flex items-start gap-3 p-3 rounded-suave bg-white border border-puente-200"
                  >
                    <Icono nombre="✓" className="mt-0.5 h-5 w-5 text-accent-success" />
                    <div>
                      <p className="font-bold text-puente-800">{ajuste.nombre}</p>
                      <p className="text-puente-700 text-base">{ajuste.descripcion}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {pasaporte.contacto && (
                <div className="mt-6 p-4 rounded-suave border-2 border-puente-200 bg-white">
                  <p className="text-puente-800 mb-1">
                    Contacto de emergencia
                  </p>
                  <p className="text-lg font-bold text-puente-900">
                    <a href={`tel:${pasaporte.contacto.replace(/\s/g, '')}`} className="underline">
                      {pasaporte.contacto}
                    </a>
                  </p>
                </div>
              )}

              <p className="mt-6 text-puente-800">
                Este Pasaporte no muestra ningún diagnóstico. Solo indica qué
                adaptaciones necesita la persona.
                <br />
                Base legal: Art. 7 bis LEC · Art. 109 LECrim · Ley 15/2022.
              </p>
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
