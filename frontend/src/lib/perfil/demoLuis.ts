import { guardarPerfil, type PerfilV2 } from '@/lib/perfil/perfil'
import { sembrarToleranciaEjemplo } from '@/lib/perfil/ultimaTolerancia'
import { guardarCitacion } from '@/lib/citaciones/almacen'
import { buildPasaporteUrl } from '@/lib/pasaporte'
import type { CitacionProcesada } from '@/lib/api'

export const CITACION_DEMO_LUIS: CitacionProcesada = {
  datos_clave: {
    tipo_documento: 'citacion',
    rol: 'testigo',
    tipo_procedimiento: 'Diligencias Previas 245/2026',
    organo: 'Juzgado de Instrucción nº 3 de A Coruña',
    fecha: '10 de noviembre de 2026',
    hora: '10:00',
    lugar: 'Juzgado de Instrucción nº 3, A Coruña',
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
        cifra: '10:00 h',
        en_palabras: 'Las diez en punto de la mañana (te recomendamos llegar a las diez menos cuarto).',
      },
      {
        etiqueta: 'Tiempo que falta',
        cifra: '21 días',
        en_palabras: 'Faltan tres semanas completas desde hoy hasta el martes diez de noviembre.',
      },
      {
        etiqueta: 'Multa si no acudes ni avisas',
        cifra: '200 € a 5.000 €',
        en_palabras: 'Entre doscientos euros y cinco mil euros solo si faltas al juzgado sin motivo ni aviso previo (art. 420 LECrim).',
      },
    ],
    que_pasa_si_no_voy: {
      resumen:
        'Como testigo tienes la obligación legal de acudir (art. 410 LECrim). Si tienes un impedimento médico o de fuerza mayor justificado, debes avisar al juzgado de inmediato aportando justificante.',
      pasos_si_no_puedes: [
        'Llama o escribe al Juzgado de Instrucción nº 3 de A Coruña en cuanto sepas que no puedes ir.',
        'Presenta un justificante (por ejemplo, un parte médico o certificado de trabajo).',
        'El juez valorará la causa justificada para acordar una nueva fecha de citación sin sanción (art. 420 LECrim).',
      ],
      mensaje_calma:
        'La ley prevé multa de 200 a 5.000 € y conducción policial si faltas sin causa justificada (art. 420 LECrim). Justificar a tiempo protege tus derechos.',
    },
    pasos_super_simples: [
      '1. Te llaman como testigo: NO te acusan de nada.',
      '2. Día: martes 10 de noviembre a las 10 de la mañana.',
      '3. Lugar: Juzgado de Instrucción número 3 de A Coruña.',
      '4. Lleva tu carné de identidad (DNI).',
      "5. Tienes la obligación legal de decir la verdad (art. 433 LECrim). Si no recuerdas algo, responder 'no me acuerdo' es válido. Si eres pariente directo del investigado, puedes no declarar contra él (art. 416 LECrim).",
      '6. Puedes llevar tu Pasaporte de Ajustes para esperar en un lugar tranquilo.',
    ],
    pipeline_ia: [
      {
        paso: 1,
        nombre: 'Extracción y estructura documental',
        detalle: 'Identifica juzgado, rol de la persona, fecha, hora, importes y artículos legales.',
      },
      {
        paso: 2,
        nombre: 'Traducción jurídica a lenguaje claro (ISO 24495-1)',
        detalle: 'Sustituye tecnicismos procesales por frases directas en voz activa.',
      },
      {
        paso: 3,
        nombre: 'Adaptación orientada a lectura fácil y discalculia',
        detalle: 'Divide en una idea por línea y convierte cifras y plazos en palabras comprensibles.',
      },
      {
        paso: 4,
        nombre: 'Síntesis multimodal (Pictogramas ARASAAC + Voz)',
        detalle: 'Enlaza conceptos visuales validados y prepara la lectura por voz.',
      },
    ],
    privacidad_rgpd: {
      anonimizado_antes_de_ia: true,
      art_rgpd: 'Artículo 25 RGPD (Privacidad desde el diseño)',
      garantia:
        'Tus datos personales (nombre, DNI, dirección) se detectaron y anonimizaron en local antes de cualquier llamada a la IA.',
      total_protegidos: 3,
      elementos_protegidos: [
        {
          tipo: 'Nombre y apellidos de la persona',
          marcador: '[PERSONA_1]',
          valor_protegido: 'L*** G*** F***',
        },
        {
          tipo: 'DNI / Documento de Identidad',
          marcador: '[DNI_1]',
          valor_protegido: '32.***-Y',
        },
        {
          tipo: 'Dirección postal / Domicilio',
          marcador: '[DOMICILIO_1]',
          valor_protegido: 'C/ E***, 15, 15001 A Coruña',
        },
      ],
    },
  },
  lectura_clara: `Te citan como TESTIGO en un proceso penal (Diligencias Previas).

🗓️ CUÁNDO: Martes 10 de noviembre de 2026, a las 10:00 horas.

📍 DÓNDE: Juzgado de Instrucción número 3 de A Coruña.

🎯 QUÉ TIENES QUE HACER: Ir al juzgado y declarar sobre los hechos. No estás acusado de ningún delito.

⚖️ DEBER DE DECIR LA VERDAD: Prestarás juramento o promesa de decir la verdad. Mentir conscientemente es delito de falso testimonio (art. 433 LECrim). Si dudas o no recuerdas algo con exactitud, responder "no lo recuerdo" o "no lo sé" es plenamente legítimo.

🛡️ DISPENSA POR PARENTESCO: Si la persona investigada es tu cónyuge o familiar directo, la ley te dispensa de declarar contra ella (art. 416 LECrim).

✅ DERECHO A APOYOS: Puedes pedir sala de espera tranquila, pausas y preguntas comprensibles de una en una (artículo 7 bis LEC y art. 109 LECrim).`,
  lectura_facil: `Te llaman para ir al juzgado.

Eres TESTIGO.
Eso significa que no te acusan de nada.
Solo quieren que cuentes con la verdad lo que sabes.

TIENES QUE IR el martes 10 de noviembre.
A las diez de la mañana.
Al Juzgado número 3 de A Coruña.

OBLIGACIÓN DE DECIR LA VERDAD:
1. Tienes la obligación legal de decir la verdad.
2. Mentir en el juicio es un delito de falso testimonio (art. 458 del Código Penal).
3. Si no te acuerdas de algo, puedes decir tranquilamente "no me acuerdo".
4. Si el investigado es tu familiar cercano, la ley te permite no declarar contra él (artículo 416).

PUEDES PEDIR AYUDA (artículo 7 bis):
- Esperar en una sala tranquila.
- Más tiempo para contestar.
- Preguntas claras, una a una.`,
  plazos: [
    {
      descripcion: 'Día de la declaración como testigo',
      fecha: '2026-11-10',
      dias_restantes: 18,
    },
  ],
  pictogram_keywords: ['juzgado', 'testigo', 'hablar', 'escuchar', 'documento', 'calendario', 'ayuda', 'tranquilo'],
  pictogramas: [
    { keyword: 'juzgado', id: 8147, url: 'https://static.arasaac.org/pictograms/8147/8147_500.png' },
    { keyword: 'testigo', id: 12339, url: 'https://static.arasaac.org/pictograms/12339/12339_500.png' },
    { keyword: 'hablar', id: 6517, url: 'https://static.arasaac.org/pictograms/6517/6517_500.png' },
    { keyword: 'escuchar', id: 6572, url: 'https://static.arasaac.org/pictograms/6572/6572_500.png' },
    { keyword: 'documento', id: 21802, url: 'https://static.arasaac.org/pictograms/21802/21802_500.png' },
    { keyword: 'calendario', id: 32488, url: 'https://static.arasaac.org/pictograms/32488/32488_500.png' },
    { keyword: 'ayuda', id: 12252, url: 'https://static.arasaac.org/pictograms/12252/12252_500.png' },
    { keyword: 'tranquilo', id: 31310, url: 'https://static.arasaac.org/pictograms/31310/31310_500.png' },
  ],
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
  sembrarToleranciaEjemplo()

  guardarCitacion({
    texto: 'JUZGADO DE INSTRUCCIÓN Nº 3 DE A CORUÑA. Diligencias Previas 245/2026. Se cita a Luis García Fernández como TESTIGO para el día 10 de noviembre de 2026 a las 10:00 h en la Sala de Vistas 2.',
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
