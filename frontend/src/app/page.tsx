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
      className={`h-6 w-6 shrink-0 ${className}`}
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

      {/* Hilo conductor principal: perfil o paso inicial */}
      <ResumenPerfil />
      <ListaCitaciones />

      {/* 4 accesos directos a las herramientas principales */}
      <section aria-labelledby="titulo-herramientas" className="mb-8">
        <h2 id="titulo-herramientas" className="text-xl font-bold text-court-900 mb-4">
          Herramientas de preparación
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* 1. Citación */}
          <Link
            href="/citacion"
            className="card border-2 border-accent-info/25 hover:border-accent-info transition-colors duration-200 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-accent-info/15 rounded-suave text-accent-navy">
                  <IconoInicio icono={FileText} className="text-accent-info" />
                </div>
                <h3 className="text-lg font-bold text-court-900">
                  Comprender citación
                </h3>
              </div>
              <p className="text-sm text-court-700 leading-relaxed">
                Pasa tu citación a lectura fácil.
                Verás la fecha, el juzgado, tu papel y qué pasa si no puedes ir.
              </p>
            </div>
            <span className="text-xs text-accent-navy font-bold underline decoration-accent-info/50 mt-3 inline-block">
              Abrir citación →
            </span>
          </Link>

          {/* 2. Pasaporte de ajustes */}
          <Link
            href="/pasaporte"
            className="card border-2 border-accent-success/25 hover:border-accent-success transition-colors duration-200 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-accent-success/15 rounded-suave text-accent-success">
                  <IconoInicio icono={ShieldCheck} className="text-accent-success" />
                </div>
                <h3 className="text-lg font-bold text-court-900">
                  Pasaporte de ajustes
                </h3>
              </div>
              <p className="text-sm text-court-700 leading-relaxed">
                Solicita pausas, luz tenue o preguntas directas amparado en el art. 7 bis de la LEC y CGPJ 2025, sin divulgar tu informe clínico.
              </p>
            </div>
            <span className="text-xs text-accent-navy font-bold underline decoration-accent-success/50 mt-3 inline-block">
              Ver o crear Pasaporte →
            </span>
          </Link>

          {/* 3. Sala Previa 3D */}
          <Link
            href="/sala-previa"
            className="card border-2 border-accent-info/25 hover:border-accent-info transition-colors duration-200 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-calma-mist rounded-suave text-accent-navy">
                  <IconoInicio icono={Compass} className="text-accent-navy" />
                </div>
                <h3 className="text-lg font-bold text-court-900">
                  Sala de vistas 3D
                </h3>
              </div>
              <p className="text-sm text-court-700 leading-relaxed">
                Recorre la sala de vistas en 5 niveles: gradúa el volumen de toses, la luz, el aforo y prueba cascos antirruido o pausas de calma.
              </p>
            </div>
            <span className="text-xs text-accent-navy font-bold underline decoration-accent-info/50 mt-3 inline-block">
              Entrar en la sala 3D →
            </span>
          </Link>

          {/* 4. Ensayo de declaración */}
          <Link
            href="/ensaya"
            className="card border-2 border-accent-warm/25 hover:border-accent-warm transition-colors duration-200 p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="p-2 bg-accent-warm/10 rounded-suave text-accent-warm">
                  <IconoInicio icono={MessageSquareQuote} className="text-accent-warm" />
                </div>
                <h3 className="text-lg font-bold text-court-900">
                  Banco de preguntas
                </h3>
              </div>
              <p className="text-sm text-court-700 leading-relaxed">
                Entrena preguntas con trampas habituales: preguntas compuestas, dobles negaciones y practica decir "No lo recuerdo" con serenidad.
              </p>
            </div>
            <span className="text-xs text-accent-navy font-bold underline decoration-accent-warm/50 mt-3 inline-block">
              Practicar respuestas →
            </span>
          </Link>
        </div>
      </section>

      {/* Caso de referencia de demostración: Luis (Testigo con TEA) */}
      <div className="card mb-8 bg-white border border-accent-info/30 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-navy flex items-center gap-1.5">
            <IconoInicio icono={UserCheck} className="text-accent-info" />
            Caso de referencia • Testigo penal
          </span>
          <span className="text-xs bg-accent-info/15 text-accent-navy font-semibold px-2.5 py-0.5 rounded-suave border border-accent-info/25">
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
          className="inline-flex items-center gap-3 min-h-[44px] text-accent-navy font-bold underline decoration-accent-info/50 underline-offset-4 transition-colors duration-200 hover:decoration-accent-info hover:text-accent-info"
        >
          <IconoInicio icono={CircleHelp} className="text-accent-info" />
          Preguntas frecuentes y ayuda sobre el juzgado
        </Link>
      </p>
    </main>
  )
}
