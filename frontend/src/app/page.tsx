import Link from 'next/link'
import {
  CircleHelp,
  Compass,
  FileText,
  MessageSquareQuote,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import { ListaCitaciones } from '@/components/inicio/ListaCitaciones'
import { ResumenPerfil } from '@/components/perfil/ResumenPerfil'

function IconoInicio({
  icono: Dibujo,
  className = 'text-accent-navy',
}: {
  icono: LucideIcon
  className?: string
}) {
  return (
    <Dibujo
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 ${className}`}
      strokeWidth={1.75}
    />
  )
}

export default function Inicio() {
  return (
    <main id="contenido-principal" className="page-shell">
      <section className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-calma-mist via-calma-sage/40 to-transparent p-6 rounded-tarjeta border border-accent-info/20 shadow-sm">
        <div className="max-w-[48ch]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-suave bg-white text-accent-navy text-xs font-bold uppercase tracking-wider mb-3 border border-accent-info/25 shadow-2xs">
            <span aria-hidden="true">🏛️</span>
            <span>Anticipación cognitiva y sensorial</span>
          </div>
          <h1 className="titulo-pagina max-w-[18ch] !mb-2">
            Prueba el juzgado antes del día
          </h1>
          <p className="entradilla max-w-[46ch] !mb-0">
            Añade tu citación, prepara tus apoyos y recorre la sala previa antes del juicio.
            Puedes parar cuando quieras.
          </p>
        </div>
        <div className="hidden sm:flex shrink-0 p-3 bg-white rounded-2xl border border-accent-info/20 shadow-sm">
          <img src="/logo-icon.png" alt="" aria-hidden="true" className="w-24 h-24 object-contain" />
        </div>
      </section>

      {/* Acción principal única */}
      <ResumenPerfil />
      <ListaCitaciones />

      {/* Tres pasos principales en orden: Citación → Pasaporte → Sala previa */}
      <section aria-labelledby="titulo-herramientas" className="mb-8 pt-2">
        <h2 id="titulo-herramientas" className="text-base font-bold text-court-800 mb-3 uppercase tracking-wider text-xs">
          Recorrido de preparación
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Citación */}
          <Link
            href="/citacion"
            className="card border border-accent-info/20 hover:border-accent-info p-4 flex flex-col justify-between transition-colors duration-200"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-accent-info/20 text-accent-navy text-xs font-bold flex items-center justify-center">1</span>
                <IconoInicio icono={FileText} className="text-accent-info" />
                <h3 className="text-base font-bold text-court-900">
                  Citación
                </h3>
              </div>
              <p className="text-xs text-court-700 leading-snug">
                Pasa tu citación judicial a lectura fácil para saber fecha, lugar y tu papel.
              </p>
            </div>
            <span className="text-xs text-accent-navy font-bold underline decoration-accent-info/40 mt-3 inline-block">
              1. Entender citación →
            </span>
          </Link>

          {/* 2. Pasaporte de ajustes */}
          <Link
            href="/pasaporte"
            className="card border border-accent-success/20 hover:border-accent-success p-4 flex flex-col justify-between transition-colors duration-200"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-accent-success/20 text-accent-navy text-xs font-bold flex items-center justify-center">2</span>
                <IconoInicio icono={ShieldCheck} className="text-accent-success" />
                <h3 className="text-base font-bold text-court-900">
                  Pasaporte de ajustes
                </h3>
              </div>
              <p className="text-xs text-court-700 leading-snug">
                Pide pausas, sala tranquila o acompañante amparado en el art. 7 bis de la LEC.
              </p>
            </div>
            <span className="text-xs text-accent-navy font-bold underline decoration-accent-success/40 mt-3 inline-block">
              2. Pedir ajustes →
            </span>
          </Link>

          <Link
            href="/sala-previa"
            className="card border border-accent-info/20 hover:border-accent-info p-4 flex flex-col justify-between transition-colors duration-200"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-accent-info/20 text-accent-navy text-xs font-bold flex items-center justify-center">3</span>
                <IconoInicio icono={Compass} className="text-accent-navy" />
                <h3 className="text-base font-bold text-court-900">
                  La sala
                </h3>
              </div>
              <p className="text-xs text-court-700 leading-snug">
                Quién hay en el juzgado y qué se oye.
              </p>
            </div>
            <span className="text-xs text-accent-navy font-bold underline decoration-accent-info/40 mt-3 inline-block">
              3. Ver la sala →
            </span>
          </Link>

          <Link
            href="/sala-previa/declaracion"
            className="card border border-accent-warm/20 hover:border-accent-warm p-4 flex flex-col justify-between transition-colors duration-200"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <IconoInicio icono={MessageSquareQuote} className="text-accent-warm" />
                <h3 className="text-base font-bold text-court-900">
                  Simulación
                </h3>
              </div>
              <p className="text-xs text-court-700 leading-snug">
                Preguntas y respuestas de un juicio.
              </p>
            </div>
            <span className="text-xs text-accent-navy font-bold underline decoration-accent-warm/40 mt-3 inline-block">
              Simular →
            </span>
          </Link>
        </div>
      </section>

      <p className="mb-8">
        <Link
          href="/ayuda"
          className="inline-flex items-center gap-2 min-h-[44px] text-accent-navy font-bold underline decoration-accent-info/50 underline-offset-4 transition-colors duration-200 hover:decoration-accent-info hover:text-accent-info text-sm"
        >
          <IconoInicio icono={CircleHelp} className="text-accent-info" />
          Preguntas frecuentes y ayuda sobre el juzgado
        </Link>
      </p>
    </main>
  )
}
