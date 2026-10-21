import Link from 'next/link'
import { Building2, FileText, IdCard, MessagesSquare, type LucideIcon } from 'lucide-react'

function IconoInicio({ icono: Dibujo }: { icono: LucideIcon }) {
  return (
    <Dibujo
      aria-hidden="true"
      className="h-7 w-7 shrink-0 text-puente-900"
      strokeWidth={1.75}
    />
  )
}

export default function Inicio() {
  return (
    <>
      <main id="contenido-principal" className="page-shell">
        <section className="mb-10">
          <h1 className="titulo-pagina max-w-[18ch]">
            Entiende lo que dice el juzgado
          </h1>
          <p className="entradilla max-w-[38ch]">
            Pega el texto de tu citación. Te lo explicamos con frases cortas, pictogramas y voz.
          </p>
        </section>

        <Link href="/citacion" className="hoja mb-12">
          <div className="flex items-start gap-4 mb-6">
            <IconoInicio icono={FileText} />
            <div className="min-w-0">
              <h2 className="text-2xl text-puente-900 mb-2">
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
            <li className="border-b border-puente-200">
              <Link href="/pasaporte" className="fila-enlace">
                <IconoInicio icono={IdCard} />
                <span className="min-w-0">
                  <span className="block text-xl font-bold text-puente-900 underline decoration-puente-300 underline-offset-4">Pasaporte de ajustes</span>
                  <span className="block text-puente-700">
                    Indica qué adaptaciones necesitas. El juzgado ve tus necesidades, no un diagnóstico.
                  </span>
                </span>
              </Link>
            </li>
            <li className="border-b border-puente-200">
              <Link href="/ensaya" className="fila-enlace">
                <IconoInicio icono={MessagesSquare} />
                <span className="min-w-0">
                  <span className="block text-xl font-bold text-puente-900 underline decoration-puente-300 underline-offset-4">Ensayar mi declaración</span>
                  <span className="block text-puente-700">
                    Practica las preguntas antes del día. Puedes parar cuando quieras.
                  </span>
                </span>
              </Link>
            </li>
            <li className="border-b border-puente-200">
              <Link href="/sala-previa" className="fila-enlace">
                <IconoInicio icono={Building2} />
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
            <article className="card">
              <h3 className="text-xl text-puente-900 mb-2">Luis, 28 años</h3>
              <p className="text-puente-700 mb-2">Va como testigo.</p>
              <p className="text-puente-700 mb-4">
                Tiene autismo. Necesita frases literales, saber qué va a pasar y un sitio con poco ruido.
              </p>
              <Link href="/demo/luis" className="link-atras mb-0">
                Ver el recorrido de Luis
              </Link>
            </article>
            <article className="card">
              <h3 className="text-xl text-puente-900 mb-2">Juan, 32 años</h3>
              <p className="text-puente-700 mb-2">Va como investigado.</p>
              <p className="text-puente-700 mb-4">
                Tiene TDAH y es ciego. Necesita que le lean los documentos, pausas y bloques cortos.
              </p>
              <Link href="/demo/juan" className="link-atras mb-0">
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
    </>
  )
}
