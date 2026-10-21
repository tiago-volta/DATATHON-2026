import Link from 'next/link'
import { CircleHelp, Compass, FileText, UserCheck, type LucideIcon } from 'lucide-react'
import { ResumenPerfil } from '@/components/perfil/ResumenPerfil'

function IconoInicio({ icono: Dibujo }: { icono: LucideIcon }) {
  return (
    <Dibujo
      aria-hidden="true"
      className="h-7 w-7 shrink-0 text-court-900"
      strokeWidth={1.75}
    />
  )
}

export default function Inicio() {
  return (
    <main id="contenido-principal" className="page-shell">
      <section className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-court-100 text-court-800 text-xs font-bold uppercase tracking-wider mb-3">
          <span>🏛️</span>
          <span>Anticipación cognitiva y sensorial</span>
        </div>
        <h1 className="titulo-pagina max-w-[18ch]">
          Prueba el juzgado antes del día
        </h1>
        <p className="entradilla max-w-[46ch]">
          Primero creas tu perfil. Después entiendes tu citación en Lectura Fácil, entras en la sala 3D y ensayas tu declaración.
        </p>
      </section>

      <ResumenPerfil />

      {/* Tarjeta principal: Simulador y Ensayo en sala (El Wow) */}
      <Link
        href="/sala-previa?ensayo=1"
        className="hoja mb-8 border-2 border-court-400 bg-gradient-to-br from-white to-court-50/80 shadow-sm block hover:border-court-600 transition-colors"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-court-100 rounded-suave text-court-800 shrink-0">
            <IconoInicio icono={Compass} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-court-700 bg-court-200/70 px-2 py-0.5 rounded">
                Simulador interactivo en sala
              </span>
            </div>
            <h2 className="text-2xl font-bold text-court-900 mb-2">
              Entrar en la sala del juicio y ensayar
            </h2>
            <p className="text-court-700 leading-relaxed text-base">
              Vista 3D en primera persona, modulación de ruido, luz y aforo de público. Diálogos reales con el juez y los abogados con tarjetas FAQ y tus derechos del artículo 7 bis de la LEC.
            </p>
          </div>
        </div>
        <span className="btn-primary w-full sm:w-auto text-base">
          Abrir simulador de sala y ensayo
        </span>
      </Link>

      {/* Tarjeta de citación */}
      <Link href="/citacion" className="hoja mb-8 block hover:border-court-400 transition-colors">
        <div className="flex items-start gap-4 mb-4">
          <IconoInicio icono={FileText} />
          <div className="min-w-0">
            <h2 className="text-2xl text-court-900 mb-2">
              Tengo una citación
            </h2>
            <p className="text-court-700">
              Sube tu citación judicial para verla en Lectura Fácil (UNE 153101): fecha, juzgado, rol de testigo y pasos explicados.
            </p>
          </div>
        </div>
        <span className="btn-secondary w-full sm:w-auto">Comprender mi citación</span>
      </Link>

      {/* Caso de referencia de demostración: Luis (Testigo con TEA) */}
      <div className="card mb-8 bg-calma-cream/60 border border-court-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-court-600 flex items-center gap-1.5">
            <IconoInicio icono={UserCheck} />
            Caso de referencia • Testigo
          </span>
          <span className="text-xs bg-court-200/80 text-court-800 font-semibold px-2.5 py-0.5 rounded-full">
            Luis, 28 años (TEA)
          </span>
        </div>
        <h3 className="font-bold text-court-900 text-lg mb-1">
          Preparación de Luis: testigo en proceso penal
        </h3>
        <p className="text-sm text-court-700 mb-4 max-w-2xl">
          Anticipación del entorno judicial, aclimatación sensorial progresiva y práctica de respuestas serenas sin sobrecarga cognitiva ni presiones.
        </p>
        <Link href="/demo/luis" className="btn-secondary text-sm inline-flex items-center gap-2">
          Ver caso guiado de Luis
        </Link>
      </div>

      <p className="mb-8">
        <Link
          href="/ayuda"
          className="inline-flex items-center gap-3 min-h-[44px] text-court-900 font-bold underline decoration-court-400 underline-offset-4 hover:decoration-court-900"
        >
          <IconoInicio icono={CircleHelp} />
          Preguntas frecuentes y ayuda sobre el juzgado
        </Link>
      </p>
    </main>
  )
}
