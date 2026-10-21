import { Icono } from '@/components/Icono'

interface Props {
  nombre: string
  descripcion: string
  queHace: string
  comoReconocerlo: string
  icono: string
}

export function TarjetaRol({ nombre, descripcion, queHace, comoReconocerlo, icono }: Props) {
  return (
    <article className="card">
      <div className="flex items-start gap-4">
        <Icono nombre={icono} className="mt-1 h-6 w-6 text-puente-900" />
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-puente-800 mb-2">{nombre}</h3>
          <p className="text-puente-600 mb-3">{descripcion}</p>
          
          <dl className="space-y-2 text-base">
            <div>
              <dt className="font-semibold text-puente-700">Qué hace:</dt>
              <dd className="text-puente-600">{queHace}</dd>
            </div>
            <div>
              <dt className="font-semibold text-puente-700">Cómo reconocerlo:</dt>
              <dd className="text-puente-600">{comoReconocerlo}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  )
}
