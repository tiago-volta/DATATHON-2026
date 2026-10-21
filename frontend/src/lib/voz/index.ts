export {
  procesarPeticionVoz,
  procesarPeticionVozLocal,
  type AccionVoz,
  type IntentVoz,
  type ResultadoPeticionVoz,
} from './asistenteVoz'
export {
  FRASE_ACTIVACION,
  FRASES_ACTIVACION,
  LS_MODO_VOZ,
  LS_ONBOARDING_VISTO,
  MENSAJE_SIN_RECONOCIMIENTO,
  TEXTO_ONBOARDING,
} from './constantes'
export {
  crearReconocimiento,
  reconocimientoVozDisponible,
} from './reconocimiento'
export {
  marcarOnboardingVozVisto,
  modoVozActivo,
  onboardingVozVisto,
  setModoVozActivo,
} from './storage'
