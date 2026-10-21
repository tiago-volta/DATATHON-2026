import Link from 'next/link'
import { CircleHelp, FileText, type LucideIcon } from 'lucide-react'
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
      <section className="mb-10">
        <h1 className="titulo-pagina max-w-[18ch]">
          Prueba el juzgado antes del día
        </h1>
        <p className="entradilla max-w-[42ch]">
          Primero entiendes tu citación. Después entras en la sala y ensayas lo que vas a decir.
        </p>
      </section>

      <ResumenPerfil />

      <Link href="/citacion" className="hoja mb-12">
        <div className="flex items-start gap-4 mb-6">
          <IconoInicio icono={FileText} />
          <div className="min-w-0">
            <h2 className="text-2xl text-court-900 mb-2">
              Tengo una citación
            </h2>
            <p className="text-court-700">
              Te decimos qué día es, a qué hora, dónde tienes que ir y qué va a pasar.
            </p>
          </div>
        </div>
        <span className="btn-primary w-full sm:w-auto">Empezar con mi citación</span>
      </Link>

      <p className="mb-10">
        <Link
          href="/ayuda"
          className="inline-flex items-center gap-3 min-h-[44px] text-court-900 font-bold underline decoration-court-400 underline-offset-4 hover:decoration-court-900"
        >
          <IconoInicio icono={CircleHelp} />
          Preguntar a InclusiveCourt
        </Link>
      </p>

      <section className="border-t border-court-200 pt-8">
        <h2 className="text-xl text-court-900 mb-2">Si trabajas en el juzgado</h2>
        <p className="text-court-700 mb-4 max-w-[42ch]">
          Abre la ficha de ajustes de la persona. Puedes escanear el código o pegar el enlace.
        </p>
        <Link href="/profesional" className="btn-secondary">
          Abrir el panel profesional
        </Link>
      </section>
    </main>
  )
}
