import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'

export default function Inicio() {
  return (
    <>
      <Cabecera />

      <main id="contenido-principal">
        <section className="relative overflow-hidden border-b border-puente-100">
          <div
            className="absolute inset-0 bg-gradient-to-br from-calma-mist via-calma-cream to-puente-50"
            aria-hidden="true"
          />
          <div
            className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-puente-200/40 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -left-16 bottom-0 w-64 h-64 rounded-full bg-accent-info/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative max-w-4xl mx-auto px-4 py-14 md:py-20 text-center">
            <p className="inline-flex items-center gap-2 text-puente-600 font-bold tracking-wide mb-6">
              <svg
                className="w-10 h-10 text-puente-700"
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M12 24 L20 16 L28 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M20 16 L20 28"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-3xl md:text-4xl">PUENTE</span>
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-puente-800 mb-5 max-w-3xl mx-auto">
              De la citación a la sentencia, a tu manera
            </h1>
            <p className="text-xl text-puente-600 max-w-2xl mx-auto mb-10">
              Documentos del juzgado en lenguaje claro, con pictogramas, voz y
              un Pasaporte de ajustes que puedes enseñar con un QR.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/citacion" className="btn-primary">
                Tengo una citación
              </Link>
              <Link href="/pasaporte" className="btn-secondary">
                Crear mi Pasaporte
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-puente-800 mb-2 text-center">
              ¿Qué quieres hacer?
            </h2>
            <p className="text-center text-puente-600 mb-8">
              Elige el paso que te toca ahora.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              <Link
                href="/citacion"
                className="card-destacada hover:border-puente-400 group"
              >
                <h3 className="text-xl font-bold text-puente-800 group-hover:text-puente-600 mb-2">
                  Tengo una citación
                </h3>
                <p className="text-puente-600">
                  Pega el texto. Lo convertimos en lenguaje claro, con
                  pictogramas y lectura en voz alta.
                </p>
              </Link>

              <Link
                href="/pasaporte"
                className="card-destacada hover:border-puente-400 group"
              >
                <h3 className="text-xl font-bold text-puente-800 group-hover:text-puente-600 mb-2">
                  Pasaporte de Ajustes
                </h3>
                <p className="text-puente-600">
                  Indica qué necesitas. Genera un QR que, al escanearlo, muestra
                  tus adaptaciones en el juzgado.
                </p>
              </Link>

              <Link
                href="/ensaya"
                className="card hover:border-puente-300 group"
              >
                <h3 className="text-xl font-bold text-puente-800 group-hover:text-puente-600 mb-2">
                  Ensayar mi declaración
                </h3>
                <p className="text-puente-600">
                  Practica responder preguntas como las del juicio.
                </p>
              </Link>

              <Link
                href="/sala-previa"
                className="card hover:border-puente-300 group"
              >
                <h3 className="text-xl font-bold text-puente-800 group-hover:text-puente-600 mb-2">
                  Visitar la sala antes
                </h3>
                <p className="text-puente-600">
                  Prueba el ambiente del juzgado por capas: ruido, luz y gente,
                  a tu ritmo.
                </p>
              </Link>
            </div>
          </section>

          <section className="bg-calma-sage rounded-tarjeta p-8 mb-14">
            <h2 className="text-2xl font-bold text-puente-800 mb-2 text-center">
              Conoce a Luis y a Juan
            </h2>
            <p className="text-center text-puente-600 mb-6">
              Dos ejemplos según tu situación.
            </p>

            <div className="grid md:grid-cols-2 gap-5">
              <Link href="/demo/luis" className="card hover:border-puente-300">
                <h3 className="text-lg font-bold text-puente-800 mb-1">
                  Luis, 28 años
                </h3>
                <p className="text-puente-500 text-sm mb-3">
                  Testigo en un juicio
                </p>
                <p className="text-puente-600">
                  Tiene autismo. Prefiere frases literales y ambientes con poco
                  ruido.
                </p>
                <span className="inline-block mt-4 text-puente-600 font-medium">
                  Ver su recorrido →
                </span>
              </Link>

              <Link href="/demo/juan" className="card hover:border-puente-300">
                <h3 className="text-lg font-bold text-puente-800 mb-1">
                  Juan, 32 años
                </h3>
                <p className="text-puente-500 text-sm mb-3">
                  Investigado por un delito leve
                </p>
                <p className="text-puente-600">
                  Tiene TDAH y es ciego. Necesita documentos en voz y pausas
                  para concentrarse.
                </p>
                <span className="inline-block mt-4 text-puente-600 font-medium">
                  Ver su recorrido →
                </span>
              </Link>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-2xl font-bold text-puente-800 mb-3">
              ¿Eres profesional de la justicia?
            </h2>
            <p className="text-puente-600 mb-6 max-w-xl mx-auto">
              Consulta el perfil de ajustes y genera la documentación según la
              Guía del CGPJ.
            </p>
            <Link href="/profesional" className="btn-secondary">
              Acceder al panel profesional
            </Link>
          </section>
        </div>
      </main>

      <footer className="mt-8 py-8 border-t border-puente-100">
        <div className="max-w-4xl mx-auto px-4 text-center text-puente-500 text-sm">
          <p className="mb-2 font-medium text-puente-600">
            PUENTE · DATAthon Justicia 2026
          </p>
          <p>
            Pictogramas:{' '}
            <a
              href="https://arasaac.org"
              className="underline hover:text-puente-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              ARASAAC
            </a>
            , Sergio Palao, Gobierno de Aragón. Licencia CC BY-NC-SA.
          </p>
        </div>
      </footer>
    </>
  )
}
