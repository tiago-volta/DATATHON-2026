import type { ReactNode } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'

function Trazo({ children }: { children: ReactNode }) {
  return (
    <svg
      className="shrink-0 text-puente-800"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const trazo = {
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export default function Inicio() {
  return (
    <>
      <Cabecera />

      <main id="contenido-principal" className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <section className="mb-10">
          <h1 className="text-4xl md:text-[2.75rem] text-puente-900 mb-4 max-w-[18ch]">
            Entiende lo que dice el juzgado
          </h1>
          <p className="text-xl text-puente-700 max-w-[38ch]">
            Pega el texto de tu citación. Te lo explicamos con frases cortas, pictogramas y voz.
          </p>
        </section>

        <Link href="/citacion" className="hoja revelar group mb-12">
          <div className="flex items-start gap-4 mb-6">
            <Trazo>
              <path d="M7 3.5h7.2L19 8.2V20.5H7z" {...trazo} />
              <path d="M14.2 3.6V8.4H19" {...trazo} />
              <path d="M9.5 12.5h5.5M9.5 16h4" {...trazo} />
            </Trazo>
            <div className="min-w-0">
              <h2 className="text-2xl text-puente-900 mb-2 group-hover:text-puente-700">
                Tengo una citación
              </h2>
              <p className="text-puente-700">
                Te decimos qué día es, a qué hora, dónde tienes que ir y qué va a pasar.
              </p>
            </div>
          </div>
          <span className="btn-primary w-full sm:w-auto">Empezar con mi citación</span>
        </Link>

        <section className="mb-14">
          <h2 className="text-2xl text-puente-900 mb-2">También puedes preparar el día</h2>
          <ul className="border-t border-puente-200">
            <li className="camino border-b border-puente-200">
              <Link href="/pasaporte" className="flex items-start gap-4 py-5 cursor-pointer hover:text-puente-700">
                <Trazo>
                  <rect x="4" y="5" width="16" height="14" rx="1.5" {...trazo} />
                  <path d="M8 9.5h8M8 13h5" {...trazo} />
                </Trazo>
                <span className="min-w-0">
                  <span className="block text-xl font-bold text-puente-900 underline decoration-puente-300 underline-offset-4">Pasaporte de ajustes</span>
                  <span className="block text-puente-700">
                    Indica qué adaptaciones necesitas. El juzgado ve tus necesidades, no un diagnóstico.
                  </span>
                </span>
              </Link>
            </li>
            <li className="camino border-b border-puente-200">
              <Link href="/ensaya" className="flex items-start gap-4 py-5 cursor-pointer hover:text-puente-700">
                <Trazo>
                  <path d="M6 18.5V8.5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10" {...trazo} />
                  <path d="M8.5 10h7M8.5 13.5h5" {...trazo} />
                </Trazo>
                <span className="min-w-0">
                  <span className="block text-xl font-bold text-puente-900 underline decoration-puente-300 underline-offset-4">Ensayar mi declaración</span>
                  <span className="block text-puente-700">
                    Practica las preguntas antes del día. Puedes parar cuando quieras.
                  </span>
                </span>
              </Link>
            </li>
            <li className="camino border-b border-puente-200">
              <Link href="/sala-previa" className="flex items-start gap-4 py-5 cursor-pointer hover:text-puente-700">
                <Trazo>
                  <path d="M4 19.5h16" {...trazo} />
                  <path d="M6.5 19.5V9.5L12 5.5l5.5 4v10" {...trazo} />
                  <path d="M10.5 19.5v-4h3v4" {...trazo} />
                </Trazo>
                <span className="min-w-0">
                  <span className="block text-xl font-bold text-puente-900 underline decoration-puente-300 underline-offset-4">Visitar la sala antes</span>
                  <span className="block text-puente-700">
                    Prueba el ruido, la luz y la gente, a tu ritmo.
                  </span>
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl text-puente-900 mb-6">Luis y Juan</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <article>
              <h3 className="text-xl text-puente-900 mb-2">Luis, 28 años</h3>
              <p className="text-puente-700 mb-2">Va como testigo.</p>
              <p className="text-puente-700 mb-4">
                Tiene autismo. Necesita frases literales, saber qué va a pasar y un sitio con poco ruido.
              </p>
              <Link href="/demo/luis" className="font-bold text-puente-800 underline underline-offset-4 hover:text-puente-600">
                Ver el recorrido de Luis
              </Link>
            </article>
            <article>
              <h3 className="text-xl text-puente-900 mb-2">Juan, 32 años</h3>
              <p className="text-puente-700 mb-2">Va como investigado.</p>
              <p className="text-puente-700 mb-4">
                Tiene TDAH y es ciego. Necesita que le lean los documentos, pausas y bloques cortos.
              </p>
              <Link href="/demo/juan" className="font-bold text-puente-800 underline underline-offset-4 hover:text-puente-600">
                Ver el recorrido de Juan
              </Link>
            </article>
          </div>
        </section>

        <section className="border-t border-puente-200 pt-8">
          <h2 className="text-xl text-puente-900 mb-2">Si trabajas en el juzgado</h2>
          <p className="text-puente-700 mb-4 max-w-[42ch]">
            Consulta el perfil de ajustes y prepara la documentación de la Guía del CGPJ.
          </p>
          <Link href="/profesional" className="btn-secondary">
            Abrir el panel profesional
          </Link>
        </section>
      </main>

      <footer className="mt-8 py-8 border-t border-puente-200">
        <div className="max-w-3xl mx-auto px-4 text-puente-600 text-sm">
          <p className="mb-2">PUENTE · DATAthon Justicia 2026</p>
          <p>
            Pictogramas:{' '}
            <a href="https://arasaac.org" className="underline underline-offset-2 hover:text-puente-800" target="_blank" rel="noopener noreferrer">
              ARASAAC
            </a>
            , Sergio Palao, Gobierno de Aragón. Licencia CC BY-NC-SA.
          </p>
        </div>
      </footer>
    </>
  )
}
