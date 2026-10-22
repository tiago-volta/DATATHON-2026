import { guardarPerfil, type PerfilV2 } from '@/lib/perfil/perfil'
import { guardarCitacion } from '@/lib/citaciones/almacen'
import { buildPasaporteUrl } from '@/lib/pasaporte'
import type { CitacionProcesada } from '@/lib/api'

export const CITACION_DEMO_LUIS: CitacionProcesada = {
  datos_clave: {
    tipo_documento: 'citacion',
    rol: 'testigo',
    tipo_procedimiento: 'Diligencias Previas 245/2026',
    organo: 'Juzgado de Instrucción nº 3 de A Coruña',
    fecha: '14 de noviembre de 2026',
    hora: '10:30',
    lugar: 'Juzgado de Instrucción nº 3 de A Coruña, Sala de Vistas 2',
    numero_procedimiento: '245/2026',
    que_llevar: ['DNI o documento de identidad'],
    derechos: [
      'Obligación de decir la verdad (art. 433 LECrim)',
      'No declarar contra familiares directos (art. 416 LECrim)',
      'Solicitar adaptaciones y pausas de tranquilidad (art. 7 bis LEC)',
    ],
    puedo_pedir_ajustes: true,
    base_legal_ajustes: 'Artículo 7 bis de la Ley de Enjuiciamiento Civil',
    apoyo_numerico: [
      {
        etiqueta: 'Hora de la cita',
        cifra: '10:30 h',
        en_palabras: 'Las diez y media de la mañana.',
      },
      {
        etiqueta: 'Multa si no acudes ni avisas',
        cifra: '200 € a 5.000 €',
        en_palabras: 'De doscientos a cinco mil euros solo si faltas al juzgado sin motivo ni aviso previo (art. 420 LECrim).',
      },
    ],
    que_pasa_si_no_voy: {
      resumen: 'Como testigo tienes la obligación legal de acudir (art. 410 LECrim). Si tienes causa justificada, avisa de inmediato.',
      pasos_si_no_puedes: [
        'Avisa con urgencia al Juzgado de Instrucción nº 3 de A Coruña.',
        'Entrega un justificante oficial (parte médico).',
        'El juez valorará señalar otra fecha sin multa.',
      ],
      mensaje_calma: 'Avisar a tiempo evita cualquier sanción.',
    },
    pasos_super_simples: [
      '1. Te llaman como testigo: NO te acusan de nada.',
      '2. Día: sábado 14 de noviembre a las 10:30 h en Sala de Vistas 2.',
      '3. Lugar: Juzgado de Instrucción número 3 de A Coruña.',
      '4. Lleva tu DNI.',
      '5. Cuenta lo que viste o sabes con tranquilidad.',
    ],
  },
  lectura_clara: 'Te citan como TESTIGO en un proceso penal. Día 14 de noviembre de 2026 a las 10:30 h en el Juzgado de Instrucción nº 3 de A Coruña, Sala de Vistas 2. No te acusan de nada: solo acudes a contar lo que sabes.',
  lectura_facil: 'Te llaman para ir al juzgado.\n\nEres TESTIGO.\nEso significa que no te acusan de nada.\n\nEl juicio es el 14 de noviembre a las diez y media de la mañana en la Sala de Vistas 2.',
  plazos: [
    {
      descripcion: 'Día de la declaración como testigo',
      fecha: '2026-11-14',
      dias_restantes: 23,
    },
  ],
  pictogram_keywords: ['juzgado', 'hablar', 'escuchar', 'calendario'],
  pictogramas: [],
}

export function cargarPerfilDemoLuis() {
  if (typeof window === 'undefined') return

  // Perfil de Luis: Testigo, TEA, sensibilidades a ruido y luz, tolerancia media-baja (nivel 2)
  const perfilLuis: PerfilV2 = {
    version: 2,
    nombre: 'Luis',
    rol: 'testigo',
    tolerancia: 2,
    estimulos: [
      { id: 'ruido', activo: true, nivel: 2, objetivo: 3, historial: [] },
      { id: 'luz', activo: true, nivel: 2, objetivo: 3, historial: [] },
      { id: 'gente', activo: true, nivel: 2, objetivo: 3, historial: [] },
    ],
    herramientas: [
      { id: 'cascos', vecesUsada: 2, ayudo: true },
      { id: 'pausa', vecesUsada: 2, ayudo: true },
    ],
    preguntas: [],
    creado: Date.now(),
    actualizado: Date.now(),
    estimulosSensibles: ['ruido', 'luz'],
  }

  guardarPerfil(perfilLuis)

  guardarCitacion({
    texto: 'JUZGADO DE INSTRUCCIÓN Nº 3 DE A CORUÑA. Diligencias Previas 245/2026. Se cita a Luis García Fernández como TESTIGO para el día 14 de noviembre de 2026 a las 10:30 h en la Sala de Vistas 2.',
    resultado: CITACION_DEMO_LUIS,
  })

  // Pasaporte de ajustes de Luis: descanso cada 20 min (pausas), acompañante (hermano), preguntas cortas
  const pasaporteLuis = {
    id: 'LUIS-AJUSTES',
    nombre: 'Luis',
    contacto: '600123456',
    ajustes: ['pausas', 'acompanante', 'preguntas-claras'],
    creado: Date.now(),
  }

  const urlPasaporte = buildPasaporteUrl({
    id: pasaporteLuis.id,
    nombre: pasaporteLuis.nombre,
    contacto: pasaporteLuis.contacto,
    ajustes: pasaporteLuis.ajustes,
  })

  try {
    localStorage.setItem(
      'court-pasaporte',
      JSON.stringify({ ...pasaporteLuis, url: urlPasaporte })
    )
  } catch {
    /* ignore */
  }
}
