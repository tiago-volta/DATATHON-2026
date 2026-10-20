export const FASES_TESTIGO = [
  {
    numero: 1,
    nombre: 'Citación',
    descripcion: 'Recibes una carta que te dice que tienes que ir al juzgado.',
    icono: '📬',
    queHacer: 'Lee bien la fecha, hora y lugar. Guarda la carta.',
  },
  {
    numero: 2,
    nombre: 'Preparación',
    descripcion: 'Los días antes del juicio, puedes prepararte.',
    icono: '📝',
    queHacer: 'Recuerda lo que viste. Puedes pedir ajustes si los necesitas.',
  },
  {
    numero: 3,
    nombre: 'Llegada al juzgado',
    descripcion: 'El día de la cita, llegas al juzgado.',
    icono: '🏛️',
    queHacer: 'Llega 15 minutos antes. Pasa el control de seguridad. Espera a que te llamen.',
  },
  {
    numero: 4,
    nombre: 'Declaración',
    descripcion: 'Entras en la sala y cuentas lo que sabes.',
    icono: '🗣️',
    queHacer: 'Di la verdad. Si no entiendes una pregunta, pide que te la repitan.',
  },
  {
    numero: 5,
    nombre: 'Fin',
    descripcion: 'Cuando terminas, te puedes ir.',
    icono: '✅',
    queHacer: 'Ya has cumplido. Normalmente no tienes que volver.',
  },
]

export const FASES_INVESTIGADO = [
  {
    numero: 1,
    nombre: 'Citación',
    descripcion: 'Recibes una carta que dice que te acusan de algo.',
    icono: '📬',
    queHacer: 'Lee bien tus derechos. Busca un abogado.',
  },
  {
    numero: 2,
    nombre: 'Buscar abogado',
    descripcion: 'Tienes derecho a un abogado que te ayude.',
    icono: '👔',
    queHacer: 'Si no tienes dinero, pide uno de oficio (gratis). Cuéntale todo.',
  },
  {
    numero: 3,
    nombre: 'Preparar pruebas',
    descripcion: 'Busca pruebas que demuestren tu versión.',
    icono: '🔍',
    queHacer: 'Mensajes, fotos, testigos... Todo lo que te ayude.',
  },
  {
    numero: 4,
    nombre: 'El juicio',
    descripcion: 'Vas al juzgado y se celebra el juicio.',
    icono: '⚖️',
    queHacer: 'Tu abogado te guía. Puedes hablar o guardar silencio.',
  },
  {
    numero: 5,
    nombre: 'Sentencia',
    descripcion: 'El juez decide si eres culpable o inocente.',
    icono: '📜',
    queHacer: 'Si no estás de acuerdo, puedes recurrir con tu abogado.',
  },
]

export const ROLES = [
  {
    nombre: 'Juez / Jueza',
    descripcion: 'La persona que dirige el juicio y toma la decisión final.',
    queHace: 'Escucha a todos, hace preguntas y decide quién tiene razón.',
    comoReconocerlo: 'Lleva toga negra y se sienta en el lugar más alto de la sala.',
    icono: '⚖️',
  },
  {
    nombre: 'Fiscal',
    descripcion: 'Representa al Estado y a la sociedad.',
    queHace: 'En casos penales, acusa a la persona investigada.',
    comoReconocerlo: 'Lleva toga negra y se sienta a un lado de la sala.',
    icono: '🏛️',
  },
  {
    nombre: 'Letrado/a de la Administración de Justicia',
    descripcion: 'Antes se llamaba Secretario Judicial.',
    queHace: 'Se encarga de los papeles, las fechas y que todo se haga bien.',
    comoReconocerlo: 'Lleva toga negra y se sienta cerca del juez.',
    icono: '📋',
  },
  {
    nombre: 'Tu abogado/a',
    descripcion: 'El abogado que te defiende.',
    queHace: 'Te ayuda, habla por ti y defiende tus derechos.',
    comoReconocerlo: 'Lleva toga negra y se sienta a tu lado.',
    icono: '👔',
  },
  {
    nombre: 'Facilitador/a',
    descripcion: 'Una persona que te ayuda a entender y comunicarte.',
    queHace: 'Adapta las preguntas, te explica las cosas y te ayuda si te bloqueas.',
    comoReconocerlo: 'No lleva toga. Se sienta cerca de ti.',
    icono: '🤝',
  },
]

export const AJUSTES_DISPONIBLES = [
  {
    id: 'sala-tranquila',
    nombre: 'Esperar en una sala tranquila',
    descripcion: 'Un espacio con menos ruido y gente mientras esperas.',
    para: ['tea', 'tdah', 'ansiedad'],
  },
  {
    id: 'preguntas-claras',
    nombre: 'Preguntas claras, de una en una',
    descripcion: 'Que te hagan preguntas sencillas y esperen tu respuesta.',
    para: ['tea', 'tdah', 'dislexia'],
  },
  {
    id: 'pausas',
    nombre: 'Pausas cuando las necesite',
    descripcion: 'Poder descansar un momento si te sientes agobiado.',
    para: ['tea', 'tdah', 'ansiedad'],
  },
  {
    id: 'mas-tiempo',
    nombre: 'Más tiempo para responder',
    descripcion: 'No tener prisa para pensar las respuestas.',
    para: ['tea', 'tdah', 'dislexia'],
  },
  {
    id: 'facilitador',
    nombre: 'Persona facilitadora',
    descripcion: 'Alguien que me ayude a entender y comunicarme.',
    para: ['tea', 'discapacidad-intelectual'],
  },
  {
    id: 'documentos-voz',
    nombre: 'Documentos leídos en voz alta',
    descripcion: 'Que me lean los papeles importantes.',
    para: ['ceguera', 'dislexia'],
  },
  {
    id: 'descripcion-pruebas',
    nombre: 'Descripción de pruebas visuales',
    descripcion: 'Que me expliquen qué hay en las fotos o vídeos.',
    para: ['ceguera'],
  },
  {
    id: 'acompanante',
    nombre: 'Poder ir con un acompañante',
    descripcion: 'Una persona de confianza que esté conmigo.',
    para: ['tea', 'tdah', 'ansiedad', 'ceguera'],
  },
]
