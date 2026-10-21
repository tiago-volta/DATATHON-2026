'use client'

import { FormEvent, useCallback, useState } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { EscanerFicha } from '@/components/profesional/EscanerFicha'
import { useRouter } from 'next/navigation'
import { rutaPasaporteDesdeTexto } from '@/lib/pasaporte'

const PASOS_CGPJ = [
  {
    numero: 1,
    titulo: 'Detectar áreas de ajuste',
    descripcion: 'Identificar en qué ámbitos la persona necesita apoyo: comunicación, comprensión, interacción con el entorno, aspectos sensoriales.',
  },
  {
    numero: 2,
    titulo: 'Identificar apoyos necesarios',
    descripcion: 'Determinar qué tipo de apoyos concretos se requieren: lectura fácil, facilitador, adaptaciones del espacio, pausas, etc.',
  },
  {
    numero: 3,
    titulo: 'Valorar la intensidad',
    descripcion: 'Evaluar el grado de apoyo necesario en cada área: puntual, frecuente o constante.',
  },
  {
    numero: 4,
    titulo: 'Trasladar a un informe',
    descripcion: 'Documentar las necesidades y ajustes en un perfil individualizado que se incorpora al expediente.',
  },
]

const AJUSTES_POR_PERFIL = {
  tea: {
    nombre: 'Trastorno del Espectro Autista',
    ajustes: [
      'Lenguaje literal, sin metáforas, ironía ni dobles sentidos',
      'Anticipar cada paso del proceso',
      'Sala de espera tranquila, con menos estímulos',
      'Preguntas concretas, de una en una',
      'Más tiempo para procesar y responder',
      'Posibilidad de persona facilitadora',
      'Evitar cambios imprevistos',
    ],
  },
  tdah: {
    nombre: 'TDAH',
    ajustes: [
      'Declaraciones breves con pausas pactadas',
      'Preguntas cortas y directas',
      'Permitir apoyo de notas o esquema',
      'Horario sin esperas largas',
      'Posibilidad de movimiento o objeto de autorregulación',
      'Información en bloques cortos',
    ],
  },
  dislexia: {
    nombre: 'Dislexia',
    ajustes: [
      'Documentos en audio o con lectura asistida',
      'No exigir lectura en voz alta',
      'Más tiempo para revisar documentos',
      'Tipografía y espaciado amplios',
      'Glosario de términos jurídicos',
    ],
  },
  ceguera: {
    nombre: 'Ceguera o baja visión',
    ajustes: [
      'Documentos en formato accesible (digital etiquetado o braille)',
      'Lectura en voz alta de documentos',
      'Descripción de pruebas visuales',
      'Acompañamiento y orientación en la sede',
      'Más tiempo con productos de apoyo',
    ],
  },
}

export default function PaginaProfesional() {
  const router = useRouter()
  const abrirFicha = useCallback((ruta: string) => {
    router.push(ruta)
  }, [router])
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<keyof typeof AJUSTES_POR_PERFIL | null>(null)
  const [ajustesMarcados, setAjustesMarcados] = useState<string[]>([])
  const [informeGenerado, setInformeGenerado] = useState<string[] | null>(null)
  const [codigoEntrada, setCodigoEntrada] = useState('')
  const [errorCodigo, setErrorCodigo] = useState('')
  const [camaraDisponible, setCamaraDisponible] = useState<boolean | null>(null)
  const anotarCamara = useCallback((soportada: boolean) => {
    setCamaraDisponible(soportada)
  }, [])

  const perfil = perfilSeleccionado ? AJUSTES_POR_PERFIL[perfilSeleccionado] : null

  const seleccionarPerfil = (key: keyof typeof AJUSTES_POR_PERFIL) => {
    setPerfilSeleccionado(key)
    setAjustesMarcados(AJUSTES_POR_PERFIL[key].ajustes)
    setInformeGenerado(null)
  }

  const toggleAjustePerfil = (ajuste: string) => {
    setAjustesMarcados((prev) =>
      prev.includes(ajuste) ? prev.filter((a) => a !== ajuste) : [...prev, ajuste]
    )
    setInformeGenerado(null)
  }

  const handleCodigoChange = (raw: string) => {
    setErrorCodigo('')
    if (raw.includes('/pasaporte/ver') || raw.startsWith('http')) {
      setCodigoEntrada(raw.trim())
      return
    }
    const limpio = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
    if (raw && raw.toUpperCase().replace(/\s/g, '') !== limpio) {
      setErrorCodigo('El código solo contiene letras y números (sin espacios ni símbolos).')
    }
    setCodigoEntrada(limpio)
  }

  const consultarPasaporte = (e: FormEvent) => {
    e.preventDefault()
    const valor = codigoEntrada.trim()
    if (!valor) {
      setErrorCodigo('Escribe el código o pega el enlace de la ficha.')
      return
    }

    const ruta = rutaPasaporteDesdeTexto(valor)
    if (ruta) {
      router.push(ruta)
      return
    }

    if (!/^[A-Z0-9]{6,10}$/.test(valor)) {
      setErrorCodigo('Introduce un código válido de entre 6 y 10 letras o números (ej: A1B2C3D4).')
      return
    }

    try {
      const guardado = localStorage.getItem('court-pasaporte')
      if (guardado) {
        const datos = JSON.parse(guardado)
        if (datos?.id?.toUpperCase() === valor && typeof datos.url === 'string') {
          const rutaGuardada = rutaPasaporteDesdeTexto(datos.url)
          if (rutaGuardada) {
            router.push(rutaGuardada)
            return
          }
        }
      }
    } catch {
      /* ignore */
    }

    setErrorCodigo(
      `No encontramos la ficha con código ${valor} en este dispositivo. Escanea el código o pega el enlace.`
    )
  }

  return (
    <>
      <main id="contenido-principal" className="page-shell-wide">
        <nav aria-label="Volver">
          <Link href="/" className="link-atras">
            <Icono nombre="←" />
            Volver al inicio
          </Link>
        </nav>

        <h1 className="titulo-pagina">
          Panel profesional
        </h1>
        <p className="entradilla">
          Herramientas para generar el perfil individualizado de ajustes según la Guía del CGPJ (2025).
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-court-800 mb-4">
            Perfil individualizado de ajustes (4 pasos CGPJ)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PASOS_CGPJ.map((paso) => (
              <div key={paso.numero} className="card">
                <div className="flex items-start gap-4">
                  <span className="paso-indicador shrink-0">{paso.numero}</span>
                  <div>
                    <h3 className="font-bold text-court-800">{paso.titulo}</h3>
                    <p className="text-court-600 text-sm">{paso.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-court-800 mb-4">
            Ajustes por perfil
          </h2>
          <p className="text-court-600 mb-6">
            Selecciona un perfil para ver los ajustes recomendados.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(AJUSTES_POR_PERFIL).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => seleccionarPerfil(key as keyof typeof AJUSTES_POR_PERFIL)}
                aria-pressed={perfilSeleccionado === key}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  perfilSeleccionado === key
                    ? 'bg-court-600 text-white'
                    : 'bg-court-100 text-court-700 hover:bg-court-200'
                }`}
              >
                {value.nombre}
              </button>
            ))}
          </div>

          {perfil && (
            <div className="card-destacada">
              <h3 className="text-xl font-bold text-court-800 mb-4">{perfil.nombre}</h3>
              <ul className="space-y-3">
                {perfil.ajustes.map((ajuste, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`ajuste-${i}`}
                      checked={ajustesMarcados.includes(ajuste)}
                      onChange={() => toggleAjustePerfil(ajuste)}
                      className="mt-1 w-5 h-5 accent-court-600"
                    />
                    <label htmlFor={`ajuste-${i}`} className="text-court-700">
                      {ajuste}
                    </label>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={ajustesMarcados.length === 0}
                onClick={() => setInformeGenerado([...ajustesMarcados])}
                className="btn-primary mt-6 w-full"
              >
                Generar informe de ajustes
              </button>

              {informeGenerado && (
                <div
                  className="mt-6 p-5 bg-calma-sage rounded-suave border border-court-200"
                  aria-live="polite"
                >
                  <h4 className="font-bold text-court-800 mb-2">
                    Informe individualizado de ajustes (Guía CGPJ 2025)
                  </h4>
                  <p className="text-sm text-court-600 mb-3">
                    Medidas propuestas para incorporar al expediente (Art. 7 bis LEC / Art. 109 LECrim):
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-court-800 mb-4">
                    {informeGenerado.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-secondary text-sm"
                  >
                    Imprimir informe
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-court-800 mb-4">
            Leer Pasaporte de Ajustes
          </h2>
          <EscanerFicha onRuta={abrirFicha} onSoporte={anotarCamara} />
          <form className="card" onSubmit={consultarPasaporte} noValidate>
            <label
              htmlFor="codigo-pasaporte"
              className="block font-medium text-court-700 mb-2"
            >
              Código o enlace de la ficha
            </label>
            <p id="ayuda-codigo" className="text-court-700 text-sm mb-4">
              {camaraDisponible === false
                ? 'Pega el enlace o escribe el código corto. En este navegador no se puede usar la cámara.'
                : 'Escanea el código con la cámara o pega el enlace. En este mismo móvil también puedes escribir el código corto.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                id="codigo-pasaporte"
                type="text"
                value={codigoEntrada}
                onChange={(e) => handleCodigoChange(e.target.value)}
                placeholder="Código del Pasaporte (ej: A1B2C3D4)"
                className="input-accesible flex-1"
                aria-invalid={Boolean(errorCodigo)}
                aria-describedby={
                  errorCodigo ? 'ayuda-codigo error-codigo' : 'ayuda-codigo'
                }
              />
              <button type="submit" className="btn-primary">
                Consultar
              </button>
            </div>
            {errorCodigo && (
              <p
                id="error-codigo"
                className="text-sm text-red-700 font-medium mt-3"
                role="alert"
              >
                {errorCodigo}
              </p>
            )}
          </form>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-court-800 mb-4">
            Analizar preguntas
          </h2>
          <p className="text-court-600 mb-4">
            Revisa si las preguntas del interrogatorio pueden confundir a la persona.
          </p>
          <Link href="/mediador" className="btn-secondary">
            Ir a Pregunta Clara
          </Link>
        </section>

        <section className="bg-calma-sage rounded-tarjeta p-6">
          <h2 className="text-xl font-bold text-court-800 mb-4">
            Derivación a recursos de apoyo
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-bold text-court-700 mb-2">Facilitación procesal</h3>
              <ul className="space-y-1 text-court-600">
                <li>Plena inclusión · 917 444 600</li>
                <li>UAVDI (Fundación A LA PAR) · 917 355 790</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-court-700 mb-2">Asociaciones (Galicia)</h3>
              <ul className="space-y-1 text-court-600">
                <li>ASPERGA · 881 917 318</li>
                <li>ANHIDA Coruña · 981 903 830</li>
                <li>ONCE · 900 221 221</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-court-700 mt-4">
            Base legal: Art. 7 bis LEC, Art. 109 LECrim, Ley 15/2022, Guía CGPJ 2025.
          </p>
        </section>
      </main>
    </>
  )
}
