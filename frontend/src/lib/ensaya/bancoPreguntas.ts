import type { MiradaSala } from '@/lib/sala-previa/salaVistasConfig'
import type { RolPerfil, TipoPreguntaDificil } from '@/lib/perfil/tipos'

export type RolJuicio = 'juez' | 'abogado' | 'fiscal' | 'testigo'

export interface FaqPregunta {
  titulo: string
  queSignifica: string
  derechoTestigo: string
  consejos: string[]
  articuloLey?: string
  ejemploRespuesta: string
}

export interface PreguntaJuicio {
  id: string
  rol: RolJuicio
  nombreHablante: string
  cargo: string
  mirada: MiradaSala
  texto: string
  tipoDificil?: TipoPreguntaDificil
  respuestaSegura?: string
  pictogramas: { id: number; keyword: string }[]
  opcionesSugeridas: string[]
  faq: FaqPregunta
}

export interface NivelJuicio {
  id: number
  nombre: string
  subtitulo: string
  descripcion: string
  pictogramaId: number
  pictogramaKeyword: string
  resumenSuperado: {
    clave1: string
    clave2: string
    clave3: string
  }
  preguntas: PreguntaJuicio[]
}

/**
 * BLOQUE 0: Calentamiento con tema neutro (Advocate's Gateway, Toolkit 3, §79).
 * Se entrena la regla 'di si alguien se equivoca' y la literalidad sin juzgar hechos del caso.
 */
export const BLOQUE_CALENTAMIENTO: NivelJuicio = {
  id: 0,
  nombre: 'Calentamiento: tema cotidiano neutro',
  subtitulo: 'Regla de corregir errores y literalidad',
  descripcion: 'Ensayamos la dinámica de preguntas con ejemplos de tu día a día, sin tratar los hechos del juicio.',
  pictogramaId: 9847,
  pictogramaKeyword: 'preguntar',
  resumenSuperado: {
    clave1: 'Practicaste decir "no lo recuerdo" sin sentir presión.',
    clave2: 'Aprendiste a corregir al interlocutor si su premisa es incorrecta.',
    clave3: 'Comprobaste que tienes derecho a pedir aclaraciones si una palabra tiene varios sentidos.',
  },
  preguntas: [
    {
      id: 'cal-p1',
      rol: 'juez',
      nombreHablante: 'Juez/a de Sala',
      cargo: 'Preside la sesión',
      mirada: 'juez',
      texto: 'Para empezar con tranquilidad: ¿qué desayunaste ayer por la mañana?',
      pictogramas: [
        { id: 2841, keyword: 'desayunar' },
        { id: 6517, keyword: 'hablar' },
      ],
      opcionesSugeridas: [
        'Desayuné tostadas con café o leche',
        'Tomé fruta y cereales',
        'No lo recuerdo exactamente con detalle',
      ],
      respuestaSegura: 'No lo recuerdo exactamente con detalle',
      faq: {
        titulo: '¿Por qué empezamos con un tema que no tiene que ver con el caso?',
        queSignifica: 'Toolkit 3 (§79) recomienda calentar con temas neutros para habituarse a hablar en sala sin el estrés de los hechos.',
        derechoTestigo: 'Puedes responder con naturalidad o decir "no lo recuerdo". Nadie espera una memoria perfecta.',
        articuloLey: 'Toolkit 3 Advocate’s Gateway (§79)',
        consejos: [
          'Tómate unos segundos antes de hablar.',
          'Si no recuerdas un detalle cotidiano, dilo con calma.',
        ],
        ejemploRespuesta: '"No recuerdo con seguridad lo que desayuné ayer."',
      },
    },
    {
      id: 'cal-p2',
      rol: 'abogado',
      nombreHablante: 'Letrado/a',
      cargo: 'Formula preguntas',
      mirada: 'abogados',
      texto: 'Ayer por la tarde fuiste al centro de la ciudad en helicóptero, ¿correcto?',
      tipoDificil: 'afirmacion-pregunta',
      pictogramas: [
        { id: 2439, keyword: 'autobus' },
        { id: 6517, keyword: 'hablar' },
      ],
      opcionesSugeridas: [
        'Eso no es correcto. Fui en autobús o caminando',
        'No, no me desplazo en helicóptero',
      ],
      respuestaSegura: 'Eso no es correcto. Fui en autobús o caminando',
      faq: {
        titulo: '¿Qué hago si quien pregunta afirma algo que no es verdad?',
        queSignifica: 'Es la regla fundamental de Toolkit 3 (§79): corregir respetuosamente el error de quien pregunta.',
        derechoTestigo: 'Tienes pleno derecho a decir "eso no es correcto" o "no fue así". El tribunal agradece la precisión.',
        articuloLey: 'Art. 709 Ley de Enjuiciamiento Criminal',
        consejos: [
          'No asientas por cortesía si la frase incluye datos falsos.',
          'Corrige primero el dato erróneo.',
        ],
        ejemploRespuesta: '"Eso no es correcto, señoría. Me desplacé en transporte público."',
      },
    },
    {
      id: 'cal-p3',
      rol: 'abogado',
      nombreHablante: 'Letrado/a',
      cargo: 'Formula preguntas',
      mirada: 'abogados',
      texto: 'Cuando fuiste a ver a tu amigo por la tarde, ¿estabas en su casa o estabas en su piso?',
      pictogramas: [
        { id: 2470, keyword: 'casa' },
        { id: 6070, keyword: 'preguntar' },
      ],
      opcionesSugeridas: [
        'Es lo mismo: vive en un piso que es su casa',
        'Estaba en su piso',
        '¿A qué se refiere exactamente con esa distinción?',
      ],
      respuestaSegura: '¿A qué se refiere exactamente con esa distinción?',
      faq: {
        titulo: '¿Por qué me preguntan por dos palabras que significan casi lo mismo?',
        queSignifica: 'La guía de Bath documenta que las personas autistas pueden dudar si "casa" y "piso" exigen respuestas jurídicamente distintas.',
        derechoTestigo: 'Puedes pedir que te aclaren la palabra si sospechas un doble sentido o no entiendes la diferencia.',
        articuloLey: 'Guía de Bath (sección 6.2) y Art. 7 bis LEC',
        consejos: [
          'Explica la realidad con tus propias palabras.',
          'Si para ti significan lo mismo, indícalo con serenidad.',
        ],
        ejemploRespuesta: '"Para mí su piso y su casa son la misma cosa."',
      },
    },
  ],
}

/**
 * BLOQUE 1: Preguntas compuestas (Toolkit 3, §80).
 */
export const BLOQUE_COMPUESTAS: NivelJuicio = {
  id: 1,
  nombre: 'Preguntas compuestas',
  subtitulo: 'Aprender a dividirlas de una en una',
  descripcion: 'Cuando te hacen dos o tres preguntas juntas en la misma frase, aprendes a pedir que vayan de una en una.',
  pictogramaId: 6070,
  pictogramaKeyword: 'preguntas-claras',
  resumenSuperado: {
    clave1: 'Reconociste que te estaban haciendo más de una pregunta a la vez.',
    clave2: 'Pediste que te las formularan por separado sin agobiarte.',
    clave3: 'Respondiste con precisión a cada parte por su orden.',
  },
  preguntas: [
    {
      id: 'comp-p1',
      rol: 'abogado',
      nombreHablante: 'Letrado/a',
      cargo: 'Formula preguntas',
      mirada: 'abogados',
      texto: '¿Usted salió ayer de su casa a las cinco, tomó el autobús de la línea 4 y compró el periódico al bajarse?',
      tipoDificil: 'compuesta',
      pictogramas: [
        { id: 2439, keyword: 'autobus' },
        { id: 6070, keyword: 'preguntar' },
      ],
      opcionesSugeridas: [
        'Hágame una pregunta cada vez, por favor',
        'Salí a esa hora, pero las demás cosas prefiero responderlas una a una',
        'No puedo responder sí o no a tres cosas distintas juntas',
      ],
      respuestaSegura: 'Hágame una pregunta cada vez, por favor',
      faq: {
        titulo: '¿Tengo que responder a preguntas con varias partes a la vez?',
        queSignifica: 'Las preguntas compuestas mezclan varios hechos. Si dices "sí", parece que confirmas las tres.',
        derechoTestigo: 'Puedes pedir que te dividan la pregunta. Decide quien preside la sala según el Art. 709 LECrim y Art. 7 bis LEC.',
        articuloLey: 'Art. 709 LECrim · Toolkit 3 §80',
        consejos: [
          'No te sientas obligado a responder a todo de golpe.',
          'Pide respetuosamente: "¿Puede hacerme las preguntas por separado?".',
        ],
        ejemploRespuesta: '"Son varias preguntas juntas. Por favor, ¿puede formulármelas de una en una?".',
      },
    },
  ],
}

/**
 * BLOQUE 2: Doble negación (Toolkit 3, §80).
 */
export const BLOQUE_DOBLE_NEGACION: NivelJuicio = {
  id: 2,
  nombre: 'Preguntas con doble negación',
  subtitulo: 'Evitar la trampa del sí y del no',
  descripcion: 'Frases como "¿No es cierto que no vio...?" confunden a cualquiera. Entrenas a pedir que la digan en positivo.',
  pictogramaId: 32420,
  pictogramaKeyword: 'no',
  resumenSuperado: {
    clave1: 'Identificaste la doble negación que inducía a confusión.',
    clave2: 'Pediste que te reformularan la pregunta en positivo.',
    clave3: 'Evitaste una respuesta ambigua.',
  },
  preguntas: [
    {
      id: 'neg-p1',
      rol: 'abogado',
      nombreHablante: 'Letrado/a',
      cargo: 'Formula preguntas',
      mirada: 'abogados',
      texto: '¿No es verdad que usted no se fijó si la puerta del portal estaba cerrada?',
      tipoDificil: 'doble-negacion',
      pictogramas: [
        { id: 32420, keyword: 'no' },
        { id: 6070, keyword: 'preguntar' },
      ],
      opcionesSugeridas: [
        '¿Me lo puede preguntar de otra forma en positivo?',
        'No entiendo si responder sí o no con tantas negaciones',
        'Prefiero explicar directamente lo que vi en la puerta',
      ],
      respuestaSegura: '¿Me lo puede preguntar de otra forma en positivo?',
      faq: {
        titulo: '¿Por qué confunden tanto las dobles negaciones?',
        queSignifica: 'Si dices "sí", puedes estar diciendo "sí es verdad que no me fijé". Crea ambigüedad procesal.',
        derechoTestigo: 'Puedes solicitar que te pregunten sin negaciones. Decide quien preside la sala (Art. 709 LECrim).',
        articuloLey: 'Art. 709 LECrim · Advocate’s Gateway Toolkit 3',
        consejos: [
          'Nunca respondas solo con un monosílabo a una doble negación.',
          'Pide la reformulación o di directamente la frase completa.',
        ],
        ejemploRespuesta: '"¿Me puede preguntar en positivo si me fijé en la puerta o no?".',
      },
    },
  ],
}

/**
 * BLOQUE 3: Coletillas y preguntas sugestivas (Toolkit 3, §80).
 */
export const BLOQUE_COLETILLAS: NivelJuicio = {
  id: 3,
  nombre: 'Preguntas sugestivas y coletillas',
  subtitulo: 'Mantener tu versión sin dejarte llevar',
  descripcion: 'Frases que terminan en "¿verdad?" o "¿no es así?" intentan condicionarte. Practicas a no asentir automáticamente.',
  pictogramaId: 6462,
  pictogramaKeyword: 'ayuda',
  resumenSuperado: {
    clave1: 'No te dejaste condicionar por la coletilla final.',
    clave2: 'Separaste lo que sugiere el abogado de lo que tú sabes.',
    clave3: 'Mantuviste tu propia voz con tranquilidad.',
  },
  preguntas: [
    {
      id: 'col-p1',
      rol: 'abogado',
      nombreHablante: 'Letrado/a',
      cargo: 'Formula preguntas',
      mirada: 'abogados',
      texto: 'El vehículo circulaba a una velocidad excesiva y haciendo ruido molesto, ¿a que sí?',
      tipoDificil: 'coletilla',
      pictogramas: [
        { id: 2439, keyword: 'coche' },
        { id: 6070, keyword: 'preguntar' },
      ],
      opcionesSugeridas: [
        'Prefiero explicar yo lo que percibí en lugar de responder a su coletilla',
        'No puedo confirmar su adjetivo. Solo puedo decir lo que vi',
        'Eso no es exactamente lo que yo describiría',
      ],
      respuestaSegura: 'Prefiero explicar yo lo que percibí en lugar de responder a su coletilla',
      faq: {
        titulo: '¿Son legales las preguntas que sugieren la respuesta?',
        queSignifica: 'El artículo 439 de la LECrim prohíbe terminantemente las preguntas capciosas o sugestivas dirigidas a testigos.',
        derechoTestigo: 'Puedes pedir que no te condicionen. Quien preside el juicio debe reprender al letrado si insiste.',
        articuloLey: 'Art. 439 y Art. 709 Ley de Enjuiciamiento Criminal',
        consejos: [
          'No digas sí por complacer.',
          'Responde con tus propios términos.',
        ],
        ejemploRespuesta: '"Prefiero relatar con mis palabras lo que vi sin usar esos calificativos."',
      },
    },
  ],
}

/**
 * BLOQUE 4: Específico según tu papel en el juicio (Testigo, Investigado, Víctima).
 */
export function bloquePorPapel(rol: RolPerfil): NivelJuicio {
  if (rol === 'investigado') {
    return {
      id: 4,
      nombre: 'Tus derechos como persona investigada',
      subtitulo: 'Derecho a guardar silencio y no declarar',
      descripcion: 'Entrenas a ejercer el derecho a no declarar sobre puntos concretos sin sentirte culpable.',
      pictogramaId: 32420,
      pictogramaKeyword: 'silencio',
      resumenSuperado: {
        clave1: 'Recordaste que tienes derecho a guardar silencio.',
        clave2: 'Practicaste no declarar sin que nadie te presione.',
        clave3: 'Hiciste valer el art. 118 LECrim.',
      },
      preguntas: [
        {
          id: 'inv-p1',
          rol: 'fiscal',
          nombreHablante: 'Ministerio Fiscal',
          cargo: 'Acusación pública',
          mirada: 'abogados',
          texto: 'Explique por qué se encontraba en ese lugar concreto a esa hora de la noche.',
          opcionesSugeridas: [
            'Por consejo de mi defensa, me acojo a mi derecho a no declarar sobre eso',
            'Prefiero responder únicamente a las preguntas de mi abogado',
            'No deseo hacer manifestaciones sobre ese extremo',
          ],
          respuestaSegura: 'Por consejo de mi defensa, me acojo a mi derecho a no declarar sobre eso',
          faq: {
            titulo: '¿Qué pasa si me niego a responder como investigado?',
            queSignifica: 'El Art. 118.1.g y h de la LECrim ampara tu derecho a no declarar y a no confesarte culpable.',
            derechoTestigo: 'No supone ninguna confesión ni agravante. Es un derecho constitucional fundamental.',
            articuloLey: 'Art. 118.1 LECrim y Art. 24.2 Constitución Española',
            consejos: [
              'No tienes que justificarte por callar.',
              'Tu abogado velará porque se respete tu silencio.',
            ],
            ejemploRespuesta: '"Me acojo a mi derecho a no declarar, señoría."',
          },
          pictogramas: [
            { id: 32420, keyword: 'silencio' },
            { id: 6517, keyword: 'hablar' },
          ],
        },
      ],
    }
  }

  if (rol === 'victima') {
    return {
      id: 4,
      nombre: 'Tus derechos como víctima en sala',
      subtitulo: 'Pausas y medidas de protección',
      descripcion: 'Practicas cómo solicitar un receso si sientes sobrecarga emocional o saturación sensorial.',
      pictogramaId: 5505,
      pictogramaKeyword: 'pausa',
      resumenSuperado: {
        clave1: 'Pediste una pausa cuando sentiste fatiga.',
        clave2: 'Protegiste tu bienestar en sala.',
        clave3: 'Recordaste las garantías del Estatuto de la Víctima.',
      },
      preguntas: [
        {
          id: 'vic-p1',
          rol: 'abogado',
          nombreHablante: 'Letrado/a de la defensa',
          cargo: 'Formula preguntas',
          mirada: 'abogados',
          texto: '¿Puede describir minuciosamente los detalles exactos de lo que sintió en ese instante?',
          opcionesSugeridas: [
            'Necesito una pausa breve antes de seguir, por favor',
            'No puedo responder a eso en este momento con detalle',
            'Solicito la ayuda del facilitador o persona de apoyo',
          ],
          respuestaSegura: 'Necesito una pausa breve antes de seguir, por favor',
          faq: {
            titulo: '¿Puedo parar si me siento sobrepasada o saturada?',
            queSignifica: 'El Estatuto de la Víctima (Ley 4/2015) y el art. 7 bis LEC garantizan la evitación de la victimización secundaria.',
            derechoTestigo: 'Puedes pedir una pausa de descanso o solicitar agua. Decide quien preside la vista.',
            articuloLey: 'Ley 4/2015 del Estatuto de la Víctima y Art. 7 bis LEC',
            consejos: [
              'Levanta la mano con serenidad si necesitas parar.',
              'Respira hondo y apóyate en el personal de asistencia.',
            ],
            ejemploRespuesta: '"Señoría, necesito un receso de cinco minutos para beber agua."',
          },
          pictogramas: [
            { id: 5505, keyword: 'pausa' },
            { id: 6462, keyword: 'ayuda' },
          ],
        },
      ],
    }
  }

  // Por defecto: rol testigo
  return {
    id: 4,
    nombre: 'Tu papel como testigo en sala',
    subtitulo: 'Veracidad sin memoria fotográfica',
    descripcion: 'Ensayas que decir "no lo recuerdo" o "no lo vi" es una respuesta perfectamente válida en derecho.',
    pictogramaId: 27357,
    pictogramaKeyword: 'testigo',
    resumenSuperado: {
      clave1: 'Dijiste la verdad reconociendo los límites de tu recuerdo.',
      clave2: 'No inventaste datos ante la insistencia.',
      clave3: 'Cumpliste con la obligación del art. 433 LECrim.',
    },
    preguntas: [
      {
        id: 'test-p1',
        rol: 'abogado',
        nombreHablante: 'Letrado/a',
        cargo: 'Formula preguntas',
        mirada: 'abogados',
        texto: 'Haga memoria: la persona llevaba una chaqueta de color oscuro, ¿verdad que sí?',
        tipoDificil: 'coletilla',
        opcionesSugeridas: [
          'No recuerdo con certeza el color de la chaqueta',
          'Solo vi que era una persona, los detalles de la ropa no los sé',
          'Prometí decir la verdad, y la verdad es que no lo recuerdo',
        ],
        respuestaSegura: 'Prometí decir la verdad, y la verdad es que no lo recuerdo',
        faq: {
          titulo: '¿Pasa algo malo si como testigo no recuerdo un dato?',
          queSignifica: 'Absolutamente nada. Tu deber legal (art. 433 LECrim) es decir la verdad sobre lo que recuerdas. Inventar o suponer sí está prohibido.',
          derechoTestigo: '"No lo sé" o "no lo recuerdo" son respuestas impecables y plenamente válidas ante el juez.',
          articuloLey: 'Art. 433 LECrim y Art. 458 Código Penal',
          consejos: [
            'Nunca completes lagunas de memoria con suposiciones.',
            'Mantente firme en tu recuerdo real.',
          ],
          ejemploRespuesta: '"Prometí decir la verdad y la verdad es que no recuerdo ese dato con exactitud."',
        },
        pictogramas: [
          { id: 9847, keyword: 'preguntar' },
          { id: 6517, keyword: 'hablar' },
        ],
      },
    ],
  }
}

export function bloquesPorRol(rol?: RolPerfil): NivelJuicio[] {
  const base = [BLOQUE_CALENTAMIENTO, BLOQUE_COMPUESTAS, BLOQUE_DOBLE_NEGACION, BLOQUE_COLETILLAS]
  const papel = bloquePorPapel(rol || 'testigo')
  return [...base, papel]
}

export const BLOQUES_ENSAYO_SALA: NivelJuicio[] = bloquesPorRol('testigo')
