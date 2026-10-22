import type { Guion, PuntoVista, Respuesta } from './declaracion'

const REPETIR: Respuesta = {
  texto: 'Perdone, ¿me puede repetir la pregunta?',
  porQue: 'Pedir que te repitan una pregunta es un derecho. Nadie se enfada por eso.',
}

const NO_RECUERDO: Respuesta = {
  texto: 'No lo recuerdo.',
  porQue: '«No lo recuerdo» es una respuesta válida. Es mejor que inventar.',
}

const DE_UNA_EN_UNA: Respuesta = {
  texto: 'Son dos preguntas. ¿Me las puede hacer de una en una?',
  porQue: 'Si te hacen dos preguntas juntas, puedes pedir que las separen.',
}

const MAS_ALTO: Respuesta = {
  texto: 'Sí, perdone. Lo repito más alto.',
  porQue: 'Repetir más alto está bien. La jueza no está enfadada: todo se graba.',
}

const GUION_TESTIGO: Guion = {
  puntoVista: 'testigo',
  turnos: [
    {
      id: 't-inicio',
      hablante: 'laj',
      texto:
        'Procedimiento abreviado número ciento veinte de dos mil veintiséis. La sesión se graba. Que pase el testigo.',
      explicacion:
        'Te llaman por tu nombre. Entras y vas al atril del centro. Que se grabe es normal: pasa en todos los juicios.',
      respuestas: [],
    },
    {
      id: 't-generales',
      hablante: 'jueza',
      texto:
        'Buenos días. Dígame su nombre completo. ¿Conoce usted a la persona acusada o a la persona que denunció? ¿Es familiar o amigo de alguna de ellas?',
      claro:
        'Diga su nombre. Después dígame si conoce a alguien de este juicio.',
      explicacion:
        'Son las preguntas «generales». Sirven para saber quién eres y si tienes relación con alguien del juicio.',
      ley: 'Artículo 708 de la Ley de Enjuiciamiento Criminal',
      respuestas: [
        {
          texto: 'Me llamo {nombre}. No conozco a nadie de este juicio.',
          porQue: 'Contestaste las dos cosas que pedía la jueza: tu nombre y si conoces a alguien.',
        },
        REPETIR,
      ],
    },
    {
      id: 't-verdad',
      hablante: 'jueza',
      texto:
        'Va a declarar como testigo. Tiene obligación de decir la verdad. Si miente, puede cometer un delito de falso testimonio. Si no sabe algo o no lo recuerda, puede decirlo. ¿Jura o promete decir verdad?',
      claro:
        'Tiene que decir la verdad. Mentir aquí es un delito. Si no sabe algo, dígalo. ¿Jura o promete decir la verdad?',
      explicacion:
        'Jurar o prometer vale igual. Decir «no lo sé» o «no lo recuerdo» no es mentir. Mentir es decir algo que sabes que no es verdad.',
      ley: 'Artículos 433 y 715 de la Ley de Enjuiciamiento Criminal. Artículo 458 del Código Penal',
      respuestas: [
        {
          texto: 'Sí, lo juro.',
          porQue: 'Jurar es una de las dos formas de comprometerte a decir la verdad.',
        },
        {
          texto: 'Sí, lo prometo.',
          porQue: 'Prometer vale igual que jurar. No tiene que ver con la religión.',
        },
      ],
    },
    {
      id: 't-fiscal-donde',
      hablante: 'fiscal',
      texto:
        'Gracias, señoría. Testigo, ¿dónde estaba usted el día tres de marzo, sobre las siete de la tarde?',
      claro: '¿Dónde estaba usted el tres de marzo a las siete de la tarde?',
      explicacion:
        'El fiscal pregunta primero. Contesta solo lo que te pregunta. No hace falta contar más.',
      interrupcion: {
        tipo: 'timbre-movil',
        en: 2,
        descripcion: 'Suena el móvil de una persona del público.',
      },
      intervencion: {
        hablante: 'jueza',
        texto: 'Por favor, apaguen los teléfonos móviles. Puede contestar, testigo.',
      },
      respuestas: [
        {
          texto: 'Estaba en la parada de autobús de la calle Real.',
          porQue: 'Respuesta corta y concreta. Es justo lo que te preguntaron.',
        },
        {
          texto: 'Estaba en la parada de autobús. No recuerdo la hora exacta.',
          porQue: 'Decir qué recuerdas y qué no recuerdas es ser sincero.',
        },
      ],
    },
    {
      id: 't-fiscal-que-vio',
      hablante: 'fiscal',
      texto: '¿Qué vio usted? Cuéntelo con sus palabras.',
      explicacion:
        'Cuenta lo que viste tú. No cuentes lo que te dijeron otras personas. Puedes ir en orden: antes, durante y después.',
      respuestas: [
        {
          texto: 'Vi a una persona quitarle el móvil de la mano a una mujer y salir corriendo.',
          porQue: 'Contaste lo que viste con tus ojos, en una frase clara.',
        },
        {
          texto: 'Lo vi de lejos. Vi a alguien correr con un móvil en la mano.',
          porQue: 'Decir desde dónde lo viste ayuda a entender tu declaración.',
        },
      ],
    },
    {
      id: 't-mas-alto',
      hablante: 'jueza',
      texto:
        'Perdone, no le hemos oído bien. ¿Puede repetirlo un poco más alto, cerca del micrófono?',
      explicacion:
        'La jueza no está enfadada. Necesita oírte bien porque todo se graba. Puedes beber agua antes.',
      respuestas: [
        MAS_ALTO,
        {
          texto: '¿Puedo beber un poco de agua antes?',
          porQue: 'Pedir agua está bien. En el atril tienes un vaso.',
        },
      ],
    },
    {
      id: 't-acusacion',
      hablante: 'acusacion',
      texto: 'Con la venia. ¿Hacia dónde se fue la persona que corría?',
      explicacion:
        'Este abogado representa a la persona a la que le quitaron el móvil. También puede preguntarte.',
      respuestas: [
        {
          texto: 'Se fue corriendo hacia la plaza.',
          porQue: 'Un dato concreto y corto. No hace falta adornarlo.',
        },
        NO_RECUERDO,
      ],
    },
    {
      id: 't-defensa-hora',
      hablante: 'defensa',
      texto:
        'Con la venia. ¿Está usted seguro de que eran las siete? ¿No es verdad que ya era de noche y no se veía bien?',
      claro: '¿Está seguro de la hora? ¿Había luz suficiente para ver?',
      explicacion:
        'La defensa comprueba si lo recuerdas bien. Es su trabajo. No quiere decir que piense que mientes.',
      ley: 'Artículo 709 de la Ley de Enjuiciamiento Criminal: la jueza no permite preguntas con trampa',
      interrupcion: {
        tipo: 'entra-persona',
        en: 1.5,
        descripcion: 'Se abre la puerta del fondo y entra una persona. No tiene que ver contigo.',
      },
      respuestas: [
        DE_UNA_EN_UNA,
        {
          texto: 'No estoy seguro de la hora exacta. Había luz de las farolas.',
          porQue: 'Admitir lo que no sabes seguro te hace más creíble, no menos.',
        },
        NO_RECUERDO,
      ],
    },
    {
      id: 't-defensa-cara',
      hablante: 'defensa',
      texto: '¿No es cierto que usted no vio la cara de la persona que corría?',
      explicacion:
        'Las preguntas que empiezan por «¿No es cierto que…?» buscan que digas que sí. Contesta solo lo que sabes.',
      respuestas: [
        {
          texto: 'Vi su ropa, pero no vi bien su cara.',
          porQue: 'Separaste lo que viste de lo que no viste. Eso es decir la verdad.',
        },
        {
          texto: 'No lo sé. Fue muy rápido.',
          porQue: '«No lo sé» es una respuesta válida cuando de verdad no lo sabes.',
        },
      ],
    },
  ],
  cierre: {
    hablante: 'jueza',
    texto:
      'Ha terminado su declaración. Muchas gracias. Puede marcharse o quedarse en la sala, con el público.',
    explicacion:
      'Ya has terminado. Si te quedas en la sala, tienes que estar en silencio.',
  },
  claves: [
    'Tienes que decir la verdad. «No lo sé» y «No lo recuerdo» también son la verdad.',
    'Puedes pedir que repitan una pregunta o que la hagan de una en una.',
    'La defensa pregunta para comprobar. No es un ataque contra ti.',
  ],
}

const GUION_ACUSADO: Guion = {
  puntoVista: 'acusado',
  turnos: [
    {
      id: 'a-inicio',
      hablante: 'laj',
      texto:
        'Procedimiento abreviado número ciento veinte de dos mil veintiséis, por un delito de robo con violencia. La sesión se graba.',
      explicacion:
        'Vas a escuchar de qué te acusan. Escuchar la acusación no significa aceptarla.',
      respuestas: [],
    },
    {
      id: 'a-identidad',
      hablante: 'jueza',
      texto: 'Buenos días. ¿Es usted {nombre}? ¿Ha entendido de qué se le acusa?',
      claro: '¿Usted es {nombre}? ¿Sabe por qué está hoy aquí?',
      explicacion:
        'En muchas salas te piden pasar al centro para hablar. Aquí lo practicas desde el banquillo.',
      ley: 'Artículo 118 de la Ley de Enjuiciamiento Criminal: derecho a entender la acusación',
      respuestas: [
        {
          texto: 'Sí, soy yo. Lo he entendido.',
          porQue: 'Confirmaste quién eres y que entiendes la acusación.',
        },
        {
          texto: 'Sí, soy yo. No lo he entendido bien. ¿Me lo puede explicar?',
          porQue: 'Tienes derecho a entender de qué te acusan. Pedir que te lo expliquen está bien.',
        },
      ],
    },
    {
      id: 'a-derechos',
      hablante: 'jueza',
      texto:
        'Le informo de sus derechos. Tiene derecho a no declarar. Tiene derecho a no contestar a alguna de las preguntas. Y tiene derecho a no declarar contra sí mismo y a no confesarse culpable. ¿Va a declarar?',
      claro:
        'No está obligado a hablar. Puede no contestar a algunas preguntas. No tiene que decir que es culpable. ¿Quiere hablar?',
      explicacion:
        'Tú no juras decir la verdad. Tampoco tienes la obligación de declarar. Lo mejor es decidirlo antes con tu abogada.',
      ley: 'Artículo 24 de la Constitución. Artículos 118 y 520 de la Ley de Enjuiciamiento Criminal',
      respuestas: [
        {
          texto: 'Sí, voy a declarar.',
          porQue: 'Declarar es una opción. Puedes no contestar a alguna pregunta en concreto.',
        },
        {
          texto: 'Solo voy a contestar a las preguntas de mi abogada.',
          porQue: 'Puedes elegir a quién contestas. Muchas personas solo contestan a su defensa.',
          saltaA: 'a-defensa-tarde',
        },
        {
          texto: 'Prefiero no declarar.',
          porQue: 'No declarar es un derecho. No te pueden castigar por usarlo.',
          saltaA: 'a-ultima-palabra',
        },
      ],
    },
    {
      id: 'a-fiscal-donde',
      hablante: 'fiscal',
      texto: 'Con la venia. ¿Dónde estaba usted el tres de marzo, sobre las siete de la tarde?',
      explicacion: 'El fiscal acusa. Pregunta primero. Puedes pensar antes de contestar.',
      interrupcion: {
        tipo: 'entra-persona',
        en: 1.5,
        descripcion: 'Se abre la puerta del fondo y entra una persona. No tiene que ver contigo.',
      },
      respuestas: [
        {
          texto: 'Estaba en mi casa.',
          porQue: 'Respuesta corta. Contestas solo a lo que te preguntan.',
        },
        NO_RECUERDO,
        {
          texto: 'Prefiero no contestar.',
          porQue: 'No contestar a una pregunta es un derecho. No te pueden castigar por eso.',
        },
      ],
    },
    {
      id: 'a-fiscal-movil',
      hablante: 'fiscal',
      texto:
        '¿No es verdad que usted cogió el móvil de la mano de la víctima y salió corriendo?',
      claro: '¿Usted le quitó el móvil a esa persona?',
      explicacion:
        'No tienes que confesar. Puedes mirar a tu abogada y tomarte un momento antes de hablar.',
      interrupcion: {
        tipo: 'abogado-susurra',
        en: 3,
        descripcion: 'Tu abogada te dice algo en voz baja.',
      },
      respuestas: [
        {
          texto: 'No, no es verdad.',
          porQue: 'Puedes negar la acusación con una frase corta y tranquila.',
        },
        {
          texto: 'Prefiero no contestar.',
          porQue: 'Es tu derecho. Usarlo no significa que seas culpable.',
        },
        {
          texto: '¿Me puede hacer la pregunta de otra forma?',
          porQue: 'Si una pregunta te confunde, puedes pedir que la digan de otra manera.',
        },
      ],
    },
    {
      id: 'a-mas-alto',
      hablante: 'jueza',
      texto: 'Perdone, no se le oye bien. ¿Puede hablar más alto, cerca del micrófono?',
      explicacion:
        'La jueza no está enfadada. Todo se graba y necesita oírte bien.',
      respuestas: [
        MAS_ALTO,
        {
          texto: 'Necesito un momento, por favor.',
          porQue: 'Pedir un momento está bien. No hay prisa por contestar.',
        },
      ],
    },
    {
      id: 'a-defensa-tarde',
      hablante: 'defensa',
      texto: 'Con la venia. Cuéntenos qué hizo usted esa tarde.',
      explicacion:
        'Tu abogada te defiende. Sus preguntas te ayudan a contar tu versión.',
      interrupcion: {
        tipo: 'agente-postura',
        en: 2,
        descripcion: 'El agente que está a tu lado cambia de postura. Es normal.',
      },
      respuestas: [
        {
          texto: 'Salí de trabajar y volví a casa en autobús. Llegué sobre las seis y media.',
          porQue: 'Contaste los hechos en orden. Así es más fácil de entender.',
        },
        {
          texto: 'Estuve en casa toda la tarde.',
          porQue: 'Una respuesta corta también vale. En tu juicio, di siempre lo que pasó de verdad.',
        },
      ],
    },
    {
      id: 'a-defensa-anadir',
      hablante: 'defensa',
      texto: '¿Quiere añadir algo sobre esa tarde?',
      respuestas: [
        {
          texto: 'No, nada más.',
          porQue: 'No hace falta hablar más de lo necesario.',
        },
        {
          texto: 'Sí. Quiero decir que yo no fui.',
          porQue: 'Puedes decir tu versión con tus palabras, de forma breve.',
        },
      ],
    },
    {
      id: 'a-ultima-palabra',
      hablante: 'jueza',
      texto:
        'Antes de terminar, tiene derecho a la última palabra. ¿Quiere decir algo más?',
      claro: 'Puede decir algo más antes de terminar. ¿Quiere hablar?',
      explicacion:
        'La persona acusada habla la última, después de todos. Puede ser una frase corta o nada.',
      ley: 'Artículo 739 de la Ley de Enjuiciamiento Criminal',
      respuestas: [
        {
          texto: 'Solo quiero decir que soy inocente.',
          porQue: 'La última palabra es tuya. Una frase corta es suficiente.',
        },
        {
          texto: 'No, gracias. No tengo nada más que decir.',
          porQue: 'Usar la última palabra es un derecho, no una obligación.',
        },
      ],
    },
  ],
  cierre: {
    hablante: 'jueza',
    texto: 'El juicio queda visto para sentencia. Recibirá la sentencia más adelante.',
    explicacion:
      '«Visto para sentencia» significa que la jueza ya lo ha oído todo y va a decidir. La decisión llega por escrito.',
  },
  claves: [
    'Tienes derecho a no declarar y a no contestar a alguna pregunta.',
    'Puedes contestar solo a tu abogada. No te pueden castigar por callar.',
    'Al final tienes la última palabra. Puedes usarla o no.',
  ],
}

const GUION_ESTRADO: Guion = {
  puntoVista: 'estrado',
  turnos: [
    {
      id: 'v-bienvenida',
      hablante: 'jueza',
      texto:
        'Buenos días. Siéntese, por favor. Hemos puesto una mampara para que no tenga que ver a la persona acusada. Puede tener a su lado a la persona que le acompaña.',
      explicacion:
        'La mampara es una medida de protección. Sirve para que no tengas contacto visual con la persona acusada.',
      ley: 'Ley 4 de 2015, del Estatuto de la Víctima, artículos 21 y 25',
      respuestas: [
        {
          texto: 'Gracias.',
          porQue: 'Una respuesta corta es suficiente.',
        },
        {
          texto: '¿Puedo pedir una pausa si la necesito?',
          porQue: 'Sí. Puedes pedir una pausa cuando la necesites. La jueza decide cuándo.',
        },
      ],
    },
    {
      id: 'v-generales',
      hablante: 'jueza',
      texto:
        'Dígame su nombre completo. Va a declarar como testigo, así que tiene que decir la verdad. Si no sabe algo o no lo recuerda, puede decirlo.',
      claro: 'Diga su nombre. Tiene que decir la verdad. Si no recuerda algo, dígalo.',
      explicacion:
        'Aunque seas la persona perjudicada, declaras como testigo. Por eso tienes que decir la verdad.',
      ley: 'Artículos 433 y 707 de la Ley de Enjuiciamiento Criminal',
      respuestas: [
        {
          texto: 'Me llamo {nombre}. Lo he entendido.',
          porQue: 'Dijiste tu nombre y confirmaste que lo entiendes.',
        },
        {
          texto: 'Me llamo {nombre}. ¿Puede repetir la última parte?',
          porQue: 'Pedir que repitan una parte es un derecho.',
        },
      ],
    },
    {
      id: 'v-fiscal-que-paso',
      hablante: 'fiscal',
      texto: 'Con la venia. ¿Puede contarnos qué pasó el tres de marzo en la parada del autobús?',
      explicacion: 'Cuenta lo que pasó en orden. Puedes parar cuando quieras.',
      interrupcion: {
        tipo: 'movil',
        en: 2,
        descripcion: 'Vibra un móvil entre el público.',
      },
      respuestas: [
        {
          texto:
            'Estaba esperando el autobús con el móvil en la mano. Alguien me lo quitó de un tirón y salió corriendo.',
          porQue: 'Contaste lo principal en orden: dónde estabas, qué pasó y qué hizo la otra persona.',
        },
        {
          texto: 'Me cuesta hablar de esto. ¿Puedo ir despacio?',
          porQue: 'Puedes ir a tu ritmo. Decir cómo te sientes también está bien.',
        },
      ],
    },
    {
      id: 'v-fiscal-danos',
      hablante: 'fiscal',
      texto: '¿Sufrió alguna lesión? ¿Ha recuperado el teléfono?',
      claro: '¿Le hicieron daño? ¿Le han devuelto el móvil?',
      explicacion:
        'Si no te devolvieron el móvil, puedes pedir que te paguen lo que valía. Se llama responsabilidad civil.',
      ley: 'Artículo 109 del Código Penal',
      respuestas: [
        DE_UNA_EN_UNA,
        {
          texto: 'Me hice daño en la mano. El móvil no lo he recuperado.',
          porQue: 'Contestaste las dos preguntas con datos concretos.',
        },
        {
          texto: 'No me hice daño. Quiero reclamar lo que valía el móvil.',
          porQue: 'Reclamar el valor del móvil es un derecho de la víctima.',
        },
      ],
    },
    {
      id: 'v-acusacion',
      hablante: 'acusacion',
      texto: 'Con la venia. ¿Cómo se ha sentido después de lo que pasó?',
      explicacion:
        'Este abogado es tu abogado: defiende tus intereses. Puedes contar solo lo que quieras compartir.',
      interrupcion: {
        tipo: 'acompanante-susurra',
        en: 2.5,
        descripcion: 'Tu acompañante te dice algo bajito para darte apoyo.',
      },
      respuestas: [
        {
          texto: 'Ahora tengo miedo cuando espero el autobús.',
          porQue: 'Explicar cómo te afectó ayuda a la jueza a entender el daño.',
        },
        {
          texto: 'Necesito un momento antes de contestar.',
          porQue: 'Pedir tiempo está bien. No hay prisa.',
        },
      ],
    },
    {
      id: 'v-mas-alto',
      hablante: 'jueza',
      texto: 'Perdone, no le hemos oído bien. ¿Puede repetirlo un poco más alto? Tómese su tiempo.',
      explicacion: 'La jueza no está enfadada. Necesita oírte bien porque todo se graba.',
      interrupcion: {
        tipo: 'tos',
        en: 1,
        descripcion: 'Alguien tose en el público.',
      },
      respuestas: [
        MAS_ALTO,
        {
          texto: '¿Puedo beber un poco de agua?',
          porQue: 'Pedir agua está bien. Te ayuda a seguir con calma.',
        },
      ],
    },
    {
      id: 'v-defensa-privada',
      hablante: 'defensa',
      texto: 'Con la venia. ¿Con quién vive usted? ¿Sale mucho por las noches?',
      explicacion:
        'Esta pregunta es sobre tu vida privada y no tiene relación con el robo. La jueza puede no permitirla.',
      ley: 'Artículo 709 de la Ley de Enjuiciamiento Criminal. Ley 4 de 2015, artículo 25',
      intervencion: {
        hablante: 'jueza',
        texto:
          'No se admite la pregunta. No tiene relación con los hechos. No tiene que contestar.',
      },
      respuestas: [
        {
          texto: 'De acuerdo. Gracias.',
          porQue: 'La jueza te protege de preguntas sobre tu vida privada. No tienes que contestarlas.',
        },
      ],
    },
    {
      id: 'v-defensa-gente',
      hablante: 'defensa',
      texto:
        '¿Está usted seguro de la hora? ¿No es cierto que había mucha gente en la parada y todo fue muy confuso?',
      claro: '¿Está seguro de la hora? ¿Había mucha gente en la parada?',
      explicacion:
        'La defensa comprueba si lo recuerdas bien. Es su trabajo. No quiere decir que piense que mientes.',
      respuestas: [
        DE_UNA_EN_UNA,
        {
          texto: 'Había gente, sí. Lo que me pasó lo recuerdo bien.',
          porQue: 'Aceptaste lo que es cierto y mantuviste lo que recuerdas.',
        },
        {
          texto: 'No recuerdo la hora exacta.',
          porQue: '«No lo recuerdo» es una respuesta válida. Es mejor que inventar.',
        },
      ],
    },
    {
      id: 'v-anadir',
      hablante: 'jueza',
      texto: '¿Quiere añadir algo más?',
      respuestas: [
        {
          texto: 'No, nada más. Gracias.',
          porQue: 'No hace falta añadir nada si ya lo has contado.',
        },
        {
          texto: 'Quiero decir que pasé mucho miedo.',
          porQue: 'Puedes decir cómo te sentiste con una frase corta.',
        },
      ],
    },
  ],
  cierre: {
    hablante: 'jueza',
    texto:
      'Ha terminado su declaración. Muchas gracias. Puede salir con su acompañante. Le informaremos de la sentencia.',
    explicacion:
      'Como víctima, tienes derecho a que te informen de la sentencia, aunque no estés en la sala.',
  },
  claves: [
    'Puedes pedir una mampara para no ver a la persona acusada, y estar con tu acompañante.',
    'La jueza puede parar las preguntas sobre tu vida privada.',
    'Puedes pedir pausas, agua o que te repitan las preguntas.',
  ],
}

export const GUIONES: Record<PuntoVista, Guion> = {
  estrado: GUION_ESTRADO,
  testigo: GUION_TESTIGO,
  acusado: GUION_ACUSADO,
}
