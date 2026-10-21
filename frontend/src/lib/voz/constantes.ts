/** Claves y textos del Modo con voz (acceso por voz / modo audiodescrito). */

export const LS_ONBOARDING_VISTO = 'court-voz-onboarding-visto'
export const LS_MODO_VOZ = 'court-modo-voz'

/** Frase mágica principal (lectura fácil, calmada). */
export const FRASE_ACTIVACION =
  'quiero activar el modo con voz'

/** Variantes que también activan el modo (reconocimiento + keywords). */
export const FRASES_ACTIVACION = [
  FRASE_ACTIVACION,
  'activar modo con voz',
  'activar el modo con voz',
  'modo con voz',
  'activar acceso por voz',
  'acceso por voz',
  'modo audiodescrito',
  'activar modo audiodescrito',
  'necesito audio',
  'necesito la voz',
  'modo ciego',
  'activar modo ciego',
] as const

export const TEXTO_ONBOARDING = [
  'Hola. InclusiveCourt funciona así: te explicamos el juzgado con frases cortas, pictogramas y voz.',
  'Si quieres moverte con la voz, di: «quiero activar el modo con voz».',
  'También puedes pulsar el botón Escuchar explicación o activar el Modo audioguía en la Sala Previa.',
].join(' ')

export const CONFIRMACION_ACTIVACION =
  'Modo con voz activado. Puedes pedir que te lea, que te explique o que te repita. Si quieres, ve a la Sala Previa o a tu citación.'

export const MENSAJE_SIN_RECONOCIMIENTO =
  'Tu navegador no reconoce la voz. Puedes usar el botón Modo audioguía y tu lector de pantalla.'

export const AYUDA_MODO_VOZ =
  'Puedes decir: activar modo con voz, desactivar modo con voz, repite, otra vez, más despacio, para, o ayuda. También puedes pulsar Escuchar pedido.'
