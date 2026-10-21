import Link from 'next/link'
import {
  CircleHelp,
  Compass,
  FileText,
  UserCheck,
  ShieldCheck,
  MessageSquareQuote,
  type LucideIcon,
} from 'lucide-react'
import { ResumenPerfil } from '@/components/perfil/ResumenPerfil'

function IconoInicio({ icono: Dibujo }: { icono: LucideIcon }) {
  return (
    <Dibujo
      aria-hidden="true"
      className="h-6 w-6 shrink-0 text-court-900"
      strokeWidth={1.75}
    />
  )
}

export default function Inicio() {
  return (
    <main id="contenido-principal" className="page-shell">
      <section className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-court-100 text-court-800 text-xs font-bold uppercase tracking-wider mb-3">
          <span>🏛️</span>
          <span>Anticipación cognitiva y sensorial</span>
        </div>
        <h1 className="titulo-pagina max-w-[18ch]">
          Prueba el juzgado antes del día
        </h1>
        <p className="entradilla max-w-[46ch]">
          Comprende tu papel legal, ajusta el entorno sensorial de la sala en 3D y ensaya tus respuestas con tranquilidad.
        </p>
      </section>

      {/* Hilo conductor principal: perfil o paso inicial */}
      <ResumenPerfil />

      {/* 4 accesos directos a las herramientas principales */}
      <section aria-labelledby="titulo-herramientas" className="mb-8">
        <h2 id="titulo-herramientas" className="text-xl font-bold text-court-900 mb-4">
          Herramientas de preparación
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* 1. Citación */}
          <Link
            href="/citacion"
            className="card border-2 border-court-200 hover:border-court-400 transition-colors p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-court-100 rounded text-court-800">
                  <IconoInicio icono={FileText} />
                </div>
                <h3 className="text-lg font-bold text-court-900">
                  Comprender citación
                </h3>
              </div>
              <p className="text-sm text-court-700 leading-relaxed">
                Pasa tu citación judicial a Lectura Fácil (UNE 153101): fecha, tribunal, papel de testigo o investigado y consecuencias si no puedes acudir.
              </p>
            </div>
            <span className="text-xs text-court-900 font-bold underline decoration-court-400 mt-3 inline-block">
              Abrir citación →
            </span>
          </Link>

          {/* 2. Pasaporte de ajustes */}
          <Link
            href="/pasaporte"
            className="card border-2 border-court-200 hover:border-court-400 transition-colors p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-court-100 rounded text-court-800">
                  <IconoInicio icono={ShieldCheck} />
                </div>
                <h3 className="text-lg font-bold text-court-900">
                  Pasaporte de ajustes
                </h3>
              </div>
              <p className="text-sm text-court-700 leading-relaxed">
                Solicita pausas, luz tenue o preguntas directas amparado en el art. 7 bis de la LEC y CGPJ 2025, sin divulgar tu informe clínico.
              </p>
            </div>
            <span className="text-xs text-court-900 font-bold underline decoration-court-400 mt-3 inline-block">
              Ver o crear Pasaporte →
            </span>
          </Link>

          {/* 3. Sala Previa 3D */}
          <Link
            href="/sala-previa"
            className="card border-2 border-court-200 hover:border-court-400 transition-colors p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-court-100 rounded text-court-800">
                  <IconoInicio icono={Compass} />
                </div>
                <h3 className="text-lg font-bold text-court-900">
                  Sala de vistas 3D
                </h3>
              </div>
              <p className="text-sm text-court-700 leading-relaxed">
                Recorre la sala de vistas en 5 niveles: gradúa el volumen de toses, la luz, el aforo y prueba cascos antirruido o pausas de calma.
              </p>
            </div>
            <span className="text-xs text-court-900 font-bold underline decoration-court-400 mt-3 inline-block">
              Entrar en la sala 3D →
            </span>
          </Link>

          {/* 4. Ensayo de declaración */}
          <Link
            href="/ensaya"
            className="card border-2 border-court-200 hover:border-court-400 transition-colors p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-court-100 rounded text-court-800">
                  <IconoInicio icono={MessageSquareQuote} />
                </div>
                <h3 className="text-lg font-bold text-court-900">
                  Banco de preguntas
                </h3>
              </div>
              <p className="text-sm text-court-700 leading-relaxed">
                Entrena preguntas con trampas habituales: preguntas compuestas, dobles negaciones y practica decir "No lo recuerdo" con serenidad.
              </p>
            </div>
            <span className="text-xs text-court-900 font-bold underline decoration-court-400 mt-3 inline-block">
              Practicar respuestas →
            </span>
          </Link>
        </div>
      </section>

      {/* Caso de referencia de demostración: Luis (Testigo con TEA) */}
      <div className="card mb-8 bg-calma-cream/60 border border-court-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-court-600 flex items-center gap-1.5">
            <IconoInicio icono={UserCheck} />
            Caso de referencia • Testigo penal
          </span>
          <span className="text-xs bg-court-200/80 text-court-800 font-semibold px-2.5 py-0.5 rounded-full">
            Luis, 28 años (TEA)
          </span>
        </div>
        <h3 className="font-bold text-court-900 text-lg mb-1">
          Preparación guiada de Luis
        </h3>
        <p className="text-sm text-court-700 mb-4 max-w-2xl leading-relaxed">
          Recorrido de aclimatación sensorial progresiva, herramientas de regulación en sala y práctica de respuestas sin sobrecarga cognitiva.
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
