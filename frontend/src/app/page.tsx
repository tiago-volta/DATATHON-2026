import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'

export default function Inicio() {
  return (
    <>
      <Cabecera />
      
      <main id="contenido-principal" className="max-w-4xl mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-puente-800 mb-4">
            De la citación a la sentencia,<br />
            <span className="text-puente-600">a tu manera</span>
          </h1>
          <p className="text-xl text-puente-600 max-w-2xl mx-auto">
            Entiende la justicia. Documentos del juzgado en lenguaje claro, 
            con pictogramas y lectura en voz alta.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-puente-800 mb-6 text-center">
            ¿Qué quieres hacer?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/citacion" className="card-destacada hover:shadow-lg transition-shadow group">
              <div className="flex items-start gap-4">
                <span className="text-4xl" aria-hidden="true">📄</span>
                <div>
                  <h3 className="text-xl font-bold text-puente-800 group-hover:text-puente-600 mb-2">
                    Tengo una citación
                  </h3>
                  <p className="text-puente-600">
                    Pega el texto de tu citación. La convertimos en lenguaje claro, 
                    con pictogramas y voz.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/pasaporte" className="card-destacada hover:shadow-lg transition-shadow group">
              <div className="flex items-start gap-4">
                <span className="text-4xl" aria-hidden="true">🪪</span>
                <div>
                  <h3 className="text-xl font-bold text-puente-800 group-hover:text-puente-600 mb-2">
                    Crear mi Pasaporte de Ajustes
                  </h3>
                  <p className="text-puente-600">
                    Indica qué adaptaciones necesitas. 
                    Genera un QR para enseñar en el juzgado.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/ensaya" className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-4">
                <span className="text-4xl" aria-hidden="true">🎯</span>
                <div>
                  <h3 className="text-xl font-bold text-puente-800 group-hover:text-puente-600 mb-2">
                    Ensayar mi declaración
                  </h3>
                  <p className="text-puente-600">
                    Practica responder preguntas como las que te harán en el juicio.
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/sala-previa" className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-4">
                <span className="text-4xl" aria-hidden="true">🏛️</span>
                <div>
                  <h3 className="text-xl font-bold text-puente-800 group-hover:text-puente-600 mb-2">
                    Visitar la sala antes
                  </h3>
                  <p className="text-puente-600">
                    Prueba el ambiente del juzgado por capas: ruido, luz y gente, a tu ritmo.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>

        <section className="bg-calma-sage rounded-tarjeta p-8 mb-12">
          <h2 className="text-2xl font-bold text-puente-800 mb-6 text-center">
            Conoce a Luis y a Juan
          </h2>
          <p className="text-center text-puente-600 mb-6">
            Dos ejemplos de uso según tu situación.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/demo/luis" className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-puente-100 flex items-center justify-center text-3xl">
                  🧩
                </div>
                <div>
                  <h3 className="text-lg font-bold text-puente-800">Luis, 28 años</h3>
                  <p className="text-puente-600">Testigo en un juicio</p>
                </div>
              </div>
              <p className="text-puente-600 text-base">
                Luis tiene autismo. Le cuesta entender las frases con doble sentido 
                y los ambientes con mucho ruido le agobian.
              </p>
              <span className="inline-block mt-4 text-puente-600 font-medium">
                Ver su recorrido →
              </span>
            </Link>

            <Link href="/demo/juan" className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-puente-100 flex items-center justify-center text-3xl">
                  🦯
                </div>
                <div>
                  <h3 className="text-lg font-bold text-puente-800">Juan, 32 años</h3>
                  <p className="text-puente-600">Investigado por un delito leve</p>
                </div>
              </div>
              <p className="text-puente-600 text-base">
                Juan tiene TDAH y es ciego. Necesita que le lean los documentos 
                y le cuesta concentrarse en explicaciones largas.
              </p>
              <span className="inline-block mt-4 text-puente-600 font-medium">
                Ver su recorrido →
              </span>
            </Link>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-bold text-puente-800 mb-4">
            ¿Eres profesional de la justicia?
          </h2>
          <p className="text-puente-600 mb-6">
            Consulta el perfil de ajustes de una persona y genera la documentación 
            según la Guía del CGPJ.
          </p>
          <Link href="/profesional" className="btn-secondary">
            Acceder al panel profesional
          </Link>
        </section>
      </main>

      <footer className="mt-16 py-8 border-t border-puente-100">
        <div className="max-w-4xl mx-auto px-4 text-center text-puente-500 text-sm">
          <p className="mb-2">
            PUENTE · DATAthon Justicia 2026
          </p>
          <p>
            Pictogramas: 
            <a href="https://arasaac.org" className="underline hover:text-puente-700" target="_blank" rel="noopener noreferrer">
              ARASAAC
            </a>
            , Sergio Palao, Gobierno de Aragón. Licencia CC BY-NC-SA.
          </p>
        </div>
      </footer>
    </>
  )
}
