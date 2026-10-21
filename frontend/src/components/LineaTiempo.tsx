import { Icono } from '@/components/Icono'

interface Fase {
  numero: number
  nombre: string
  descripcion: string
  icono: string
  queHacer: string
}

interface Props {
  fases: Fase[]
  faseActual?: number
}

export function LineaTiempo({ fases, faseActual = 1 }: Props) {
  return (
    <div className="space-y-4" role="list" aria-label="Fases del proceso">
      {fases.map((fase, index) => {
        const esActual = fase.numero === faseActual
        const completada = fase.numero < faseActual

        return (
          <div
            key={fase.numero}
            className={`relative flex gap-4 ${esActual ? 'paso-activo' : ''}`}
            role="listitem"
            aria-current={esActual ? 'step' : undefined}
          >
            {index < fases.length - 1 && (
              <div
                className={`absolute left-6 top-14 w-0.5 h-full -translate-x-1/2 ${
                  completada ? 'bg-puente-500' : 'bg-puente-200'
                }`}
                aria-hidden="true"
              />
            )}

            <div className="paso-indicador shrink-0" aria-hidden="true">
              {completada ? <Icono nombre="✓" className="h-6 w-6" /> : fase.numero}
            </div>

            <div className={`card flex-1 ${esActual ? 'card-destacada' : ''}`}>
              <div className="flex items-center gap-3 mb-2">
                <Icono nombre={fase.icono} className="h-6 w-6 text-puente-900" />
                <h3 className="text-lg font-bold text-puente-800">{fase.nombre}</h3>
              </div>
              <p className="text-puente-600 mb-3">{fase.descripcion}</p>
              <div className="bg-calma-sage rounded-lg p-3">
                <p className="text-puente-700 font-medium">
                  <span className="sr-only">Qué hacer: </span>
                  {fase.queHacer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
