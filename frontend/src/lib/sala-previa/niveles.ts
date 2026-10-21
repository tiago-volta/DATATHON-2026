import type { IdEstimulo, Insignia, NivelSala, ValoresEstimulo } from './tipos'

export const ESTIMULOS_VACIOS: ValoresEstimulo = {
  ruido: 0,
  luz: 0,
  gente: 0,
}

export const ESTIMULOS_META: Record<
  IdEstimulo,
  {
    etiqueta: string
    descripcion: string
    bajo: string
    medio: string
    alto: string
    /** Ajustes del Pasaporte sugeridos si este estímulo molesta. */
    ajustesPasaporte: string[]
  }
> = {
  ruido: {
    etiqueta: 'Ruido',
    descripcion: 'Murmullos, pasos, puertas y voces lejanas',
    bajo: 'Silencio',
    medio: 'Suave',
    alto: 'Fuerte',
    ajustesPasaporte: ['sala-tranquila', 'pausas'],
  },
  luz: {
    etiqueta: 'Luz',
    descripcion: 'Brillo e iluminación de la sala',
    bajo: 'Tenue',
    medio: 'Normal',
    alto: 'Intensa',
    ajustesPasaporte: ['luz-tenue'],
  },
  gente: {
    etiqueta: 'Gente',
    descripcion: 'Personas en el público y en la sala',
    bajo: 'Vacía',
    medio: 'Algunas',
    alto: 'Llena',
    ajustesPasaporte: ['sala-tranquila'],
  },
}

/** Umbral a partir del cual un estímulo se considera alto / molesto. */
export const UMBRAL_ESTIMULO_ALTO = 55

/** Nivel cómodo al que bajar estímulos altos tras check-in regular/mal. */
export const NIVEL_ESTIMULO_COMODO = 18

export const NIVELES: NivelSala[] = [
  {
    id: 0,
    nombre: 'Sala vacía',
    descripcion: 'Silencio y poca luz. Empiezas aquí.',
    audioguia:
      'Estás en una sala de vistas vacía. No hay gente. La luz es suave. No se oye casi nada. Puedes quedarte el tiempo que necesites.',
    preset: { ruido: 0, luz: 8, gente: 0 },
  },
  {
    id: 1,
    nombre: 'Primeros sonidos',
    descripcion: 'Un murmullo muy bajo. La sala sigue casi vacía.',
    audioguia:
      'Ahora se oye un murmullo muy suave, como gente lejos. La luz sube un poco. Sigue habiendo casi nadie en la sala.',
    preset: { ruido: 24, luz: 20, gente: 12 },
  },
  {
    id: 2,
    nombre: 'Pasos lejanos',
    descripcion: 'Algún paso y una puerta al fondo.',
    audioguia:
      'Se oyen pasos lejanos y a veces una puerta. Hay pocas personas. La luz es cómoda, sin fluorescentes fuertes.',
    preset: { ruido: 42, luz: 35, gente: 28 },
  },
  {
    id: 3,
    nombre: 'Ambiente de espera',
    descripcion: 'Más gente y más sonido, aún controlable.',
    audioguia:
      'La sala se parece a una zona de espera. Hay más personas y murmullos. Si te molesta, baja los controles o pulsa Volver a la calma.',
    preset: { ruido: 62, luz: 50, gente: 52 },
  },
  {
    id: 4,
    nombre: 'Sala ocupada',
    descripcion: 'Casi como un día normal en el juzgado.',
    audioguia:
      'Hay bastante gente y más ruido. La luz es más fuerte. Practica bajar lo que te moleste. Tú mandas.',
    preset: { ruido: 82, luz: 68, gente: 72 },
  },
  {
    id: 5,
    nombre: 'Vista real',
    descripcion: 'Ambiente completo. Puedes bajar cualquier estímulo.',
    audioguia:
      'Este es el nivel más alto: sala llena, ruido y luz intensos. No tienes que quedarte. Si quieres, baja un control o vuelve a la calma.',
    preset: { ruido: 95, luz: 85, gente: 92 },
  },
]

export const INSIGNIAS: Insignia[] = [
  {
    id: 'primer-paso',
    nombre: 'Primer paso',
    descripcion: 'Entraste en la sala vacía.',
  },
  {
    id: 'explorador',
    nombre: 'Explorador del juzgado',
    descripcion: 'Llegaste al nivel 2.',
  },
  {
    id: 'paso-firme',
    nombre: 'Paso firme',
    descripcion: 'Llegaste al nivel 4.',
  },
  {
    id: 'sala-superada',
    nombre: 'Sala superada',
    descripcion: 'Probaste el nivel Vista real.',
  },
  {
    id: 'conoce-limites',
    nombre: 'Conoce tus límites',
    descripcion: 'Marcaste un estímulo que te molesta.',
  },
  {
    id: 'constancia',
    nombre: 'Práctica constante',
    descripcion: 'Tres días seguidos de práctica.',
  },
]

export function etiquetaNivelEstimulo(valor: number, estimulo: IdEstimulo): string {
  const meta = ESTIMULOS_META[estimulo]
  if (valor < 25) return meta.bajo
  if (valor < 65) return meta.medio
  return meta.alto
}

export function ajustesDesdeMolestias(molestias: IdEstimulo[]): string[] {
  const ids = new Set<string>()
  for (const m of molestias) {
    for (const id of ESTIMULOS_META[m].ajustesPasaporte) {
      ids.add(id)
    }
  }
  return Array.from(ids)
}

/** Estímulos por encima del umbral (candidatos a molestia). */
export function molestiasDesdeValores(valores: ValoresEstimulo): IdEstimulo[] {
  return (Object.keys(valores) as IdEstimulo[]).filter(
    (id) => (valores[id] ?? 0) >= UMBRAL_ESTIMULO_ALTO
  )
}

/** Baja los estímulos indicados a un nivel cómodo; el resto no cambia. */
export function bajarEstimulosAComodo(
  valores: ValoresEstimulo,
  molestias: IdEstimulo[],
  objetivo = NIVEL_ESTIMULO_COMODO
): ValoresEstimulo {
  const next = { ...valores }
  const targets = molestias.length > 0 ? molestias : (Object.keys(valores) as IdEstimulo[])
  for (const id of targets) {
    if ((next[id] ?? 0) > objetivo) {
      next[id] = objetivo
    }
  }
  return next
}
