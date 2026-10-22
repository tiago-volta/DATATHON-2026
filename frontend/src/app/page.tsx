import Link from 'next/link'
import {
  CircleHelp,
  Compass,
  FileText,
  ShieldCheck,
  MessageSquareQuote,
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
      <section className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-suave bg-accent-info/15 text-accent-navy text-xs font-bold uppercase tracking-wider mb-3 border border-accent-info/25">
          <span aria-hidden="true">🏛️</span>
          <span>Anticipación cognitiva y sensorial</span>
        </div>
        <h1 className="titulo-pagina max-w-[18ch]">
          Prueba el juzgado antes del día
        </h1>
        <p className="entradilla max-w-[46ch]">
          Añade tu citación, recorre la sala en 3D y ensaya lo que vas a decir.
          Puedes parar cuando quieras.
        </p>
      </section>

      {/* Acción principal única */}
      <ResumenPerfil />
      <ListaCitaciones />

      {/* Fila secundaria: accesos directos compactos */}
      <section aria-labelledby="titulo-herramientas" className="mb-8 pt-2">
        <h2 id="titulo-herramientas" className="text-base font-bold text-court-800 mb-3 uppercase tracking-wider text-xs">
          Otras herramientas
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Citación */}
          <Link
            href="/citacion"
            className="card border border-accent-info/20 hover:border-accent-info p-3.5 flex flex-col justify-between transition-colors duration-200"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <IconoInicio icono={FileText} className="text-accent-info" />
                <h3 className="text-sm font-bold text-court-900">
                  Citación
                </h3>
              </div>
              <p className="text-xs text-court-700 leading-snug">
                Pasa tu citación judicial a lectura fácil.
              </p>
            </div>
            <span className="text-[11px] text-accent-navy font-bold underline decoration-accent-info/40 mt-2 inline-block">
              Abrir →
            </span>
          </Link>

          {/* 2. Pasaporte de ajustes */}
          <Link
            href="/pasaporte"
            className="card border border-accent-success/20 hover:border-accent-success p-3.5 flex flex-col justify-between transition-colors duration-200"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <IconoInicio icono={ShieldCheck} className="text-accent-success" />
                <h3 className="text-sm font-bold text-court-900">
                  Pasaporte
                </h3>
              </div>
              <p className="text-xs text-court-700 leading-snug">
                Pide pausas o luz tenue (art. 7 bis LEC).
              </p>
            </div>
            <span className="text-[11px] text-accent-navy font-bold underline decoration-accent-success/40 mt-2 inline-block">
              Ver ajustes →
            </span>
          </Link>

          {/* 3. Sala Previa 3D */}
          <Link
            href="/sala-previa"
            className="card border border-accent-info/20 hover:border-accent-info p-3.5 flex flex-col justify-between transition-colors duration-200"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <IconoInicio icono={Compass} className="text-accent-navy" />
                <h3 className="text-sm font-bold text-court-900">
                  Sala 3D
                </h3>
              </div>
              <p className="text-xs text-court-700 leading-snug">
                Vista 3D y modulación de ruido y luz.
              </p>
            </div>
            <span className="text-[11px] text-accent-navy font-bold underline decoration-accent-info/40 mt-2 inline-block">
              Entrar →
            </span>
          </Link>

          {/* 4. Ensayo de declaración */}
          <Link
            href="/ensaya"
            className="card border border-accent-warm/20 hover:border-accent-warm p-3.5 flex flex-col justify-between transition-colors duration-200"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <IconoInicio icono={MessageSquareQuote} className="text-accent-warm" />
                <h3 className="text-sm font-bold text-court-900">
                  Banco preguntas
                </h3>
              </div>
              <p className="text-xs text-court-700 leading-snug">
                Entrena preguntas capciosas o dobles.
              </p>
            </div>
            <span className="text-[11px] text-accent-navy font-bold underline decoration-accent-warm/40 mt-2 inline-block">
              Practicar →
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
