'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { LineaTiempo } from '@/components/LineaTiempo'
import { TarjetaRol } from '@/components/TarjetaRol'
import { FASES_TESTIGO, ROLES } from '@/lib/contenido'

const LUIS_LECTURA_CLARA = `Te citan como TESTIGO en un juicio.

Cuándo: Martes 10 de noviembre de 2026, a las 10:00 de la mañana.

Dónde: Juzgado de Instrucción número 3 de A Coruña.

Qué tienes que hacer: Ir al juzgado y contar lo que viste o sabes sobre unos hechos. No te acusan de nada, solo quieren escuchar tu versión.

Qué llevar: Tu DNI o carné de identidad.

Importante: Tienes que ir. Si no vas sin una razón válida, pueden ponerte una multa.

Puedes pedir ayuda: Si necesitas adaptaciones (por ejemplo, un lugar tranquilo, más tiempo para responder, o que te expliquen las cosas de otra forma), puedes pedirlo. Es tu derecho según la ley.`

const LUIS_LECTURA_FACIL = `Te llaman para ir al juzgado.

Eres TESTIGO.
Eso significa que no te acusan de nada.
Solo quieren que cuentes lo que sabes.

TIENES QUE IR el día 10 de noviembre.
A las 10 de la mañana.
Al Juzgado número 3 de A Coruña.

LLEVA tu DNI.

Si no vas, te pueden poner una multa.
La multa es dinero que tienes que pagar.

PUEDES PEDIR AYUDA.
Por ejemplo:
- Una sala tranquila.
- Más tiempo para contestar.
- Que te expliquen las cosas despacio.

Es tu derecho. La ley lo dice.`

export default function DemoLuis() {
  const [seccion, setSeccion] = useState<'intro' | 'citacion' | 'fases' | 'roles' | 'ajustes'>('intro')
  const [modoLectura, setModoLectura] = useState<'clara' | 'facil'>('clara')

  return (
    <>
      <Cabecera />

      <main id="contenido-principal" className="max-w-3xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <Link href="/" className="text-puente-600 hover:text-puente-800">
            ← Volver al inicio
          </Link>
        </nav>

        <header className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-puente-800">Luis, 28 años</h1>
            <p className="text-lg text-puente-700">Testigo en un juicio penal</p>
          </div>
          <div className="bg-calma-sage rounded-lg p-4">
            <p className="text-puente-700">
              Luis tiene autismo (TEA nivel 1). Le cuesta entender las frases con doble sentido,
              los ambientes ruidosos le agobian y necesita saber qué va a pasar con antelación.
            </p>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 mb-8" aria-label="Secciones de la demo">
          {[
            { id: 'intro', label: 'Situación' },
            { id: 'citacion', label: 'Su citación' },
            { id: 'fases', label: 'Fases del proceso' },
            { id: 'roles', label: 'Quién es quién' },
            { id: 'ajustes', label: 'Ajustes' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSeccion(s.id as typeof seccion)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                seccion === s.id
                  ? 'bg-puente-600 text-white'
                  : 'bg-puente-100 text-puente-700 hover:bg-puente-200'
              }`}
              aria-current={seccion === s.id ? 'true' : undefined}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {seccion === 'intro' && (
          <section className="card">
            <h2 className="text-2xl font-bold text-puente-800 mb-4">La situación de Luis</h2>
            <div className="space-y-4 text-lg text-puente-700">
              <p>
                Luis presenció un incidente en su barrio y la policía tomó sus datos.
                Dos semanas después, recibe una carta del juzgado: es una citación para
                declarar como testigo.
              </p>
              <p>
                Luis nunca ha ido a un juzgado. No sabe cómo es, qué tiene que hacer,
                ni quién le va a preguntar qué. La carta usa palabras que no entiende:
                &ldquo;se le apercibe&rdquo;, &ldquo;a los efectos oportunos&rdquo;...
              </p>
              <p>
                <strong>PUENTE le ayuda a:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Entender qué dice la citación en palabras claras</li>
                <li>Saber qué va a pasar, paso a paso</li>
                <li>Conocer quién estará en la sala y qué hace cada persona</li>
                <li>Pedir los ajustes que necesita (sala tranquila, preguntas claras...)</li>
                <li>Practicar responder preguntas antes del día</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setSeccion('citacion')}
              className="btn-primary mt-6"
            >
              Ver su citación explicada →
            </button>
          </section>
        )}

        {seccion === 'citacion' && (
          <section>
            <div className="card-destacada mb-6">
              <h2 className="text-xl font-bold text-puente-800 mb-4">Lo más importante</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="bg-calma-sage rounded-lg p-4">
                  <dt className="text-sm text-puente-600 mb-1">Tu rol</dt>
                  <dd className="text-xl font-bold text-puente-800">Testigo</dd>
                </div>
                <div className="bg-calma-sage rounded-lg p-4">
                  <dt className="text-sm text-puente-600 mb-1">Fecha y hora</dt>
                  <dd className="text-xl font-bold text-puente-800">10 nov 2026, 10:00</dd>
                </div>
                <div className="bg-calma-sage rounded-lg p-4 sm:col-span-2">
                  <dt className="text-sm text-puente-600 mb-1">Lugar</dt>
                  <dd className="text-lg font-bold text-puente-800">
                    Juzgado de Instrucción nº 3, A Coruña
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setModoLectura('clara')}
                aria-pressed={modoLectura === 'clara'}
                className={`btn ${modoLectura === 'clara' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Lectura clara
              </button>
              <button
                type="button"
                onClick={() => setModoLectura('facil')}
                aria-pressed={modoLectura === 'facil'}
                className={`btn ${modoLectura === 'facil' ? 'btn-primary' : 'btn-secondary'}`}
              >
                Lectura fácil
              </button>
            </div>

            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-puente-800">
                  {modoLectura === 'clara' ? 'En lenguaje claro' : 'En lectura fácil'}
                </h2>
                <BotonLeerEnVoz
                  texto={modoLectura === 'clara' ? LUIS_LECTURA_CLARA : LUIS_LECTURA_FACIL}
                />
              </div>
              <div className="lectura-facil whitespace-pre-line">
                {modoLectura === 'clara' ? LUIS_LECTURA_CLARA : LUIS_LECTURA_FACIL}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button type="button" onClick={() => setSeccion('fases')} className="btn-primary">
                Ver las fases del proceso →
              </button>
            </div>
          </section>
        )}

        {seccion === 'fases' && (
          <section>
            <h2 className="text-2xl font-bold text-puente-800 mb-2">Fases del proceso</h2>
            <p className="text-puente-600 mb-6">
              Esto es lo que va a pasar, paso a paso. Luis está en la fase 1.
            </p>
            <LineaTiempo fases={FASES_TESTIGO} faseActual={1} />
            <button type="button" onClick={() => setSeccion('roles')} className="btn-primary mt-8">
              Ver quién estará en la sala →
            </button>
          </section>
        )}

        {seccion === 'roles' && (
          <section>
            <h2 className="text-2xl font-bold text-puente-800 mb-2">Quién es quién</h2>
            <p className="text-puente-600 mb-6">
              Estas son las personas que Luis se encontrará en el juzgado.
            </p>
            <div className="space-y-4">
              {ROLES.map((rol) => (
                <TarjetaRol
                  key={rol.nombre}
                  nombre={rol.nombre}
                  descripcion={rol.descripcion}
                  queHace={rol.queHace}
                  comoReconocerlo={rol.comoReconocerlo}
                  icono={rol.icono}
                />
              ))}
            </div>
            <button type="button" onClick={() => setSeccion('ajustes')} className="btn-primary mt-8">
              Ver qué ajustes puede pedir →
            </button>
          </section>
        )}

        {seccion === 'ajustes' && (
          <section>
            <h2 className="text-2xl font-bold text-puente-800 mb-2">Ajustes para Luis</h2>
            <p className="text-puente-600 mb-6">
              Luis puede pedir estas adaptaciones. Es su derecho (Art. 7 bis LEC).
            </p>

            <div className="space-y-4 mb-8">
              {[
                { nombre: 'Esperar en una sala tranquila', desc: 'Sin ruido ni mucha gente' },
                { nombre: 'Preguntas claras, de una en una', desc: 'Sin dobles sentidos ni ironías' },
                { nombre: 'Anticipar cada paso', desc: 'Que le expliquen qué va a pasar antes de que pase' },
                { nombre: 'Más tiempo para responder', desc: 'Sin prisa ni presión' },
                { nombre: 'Persona facilitadora', desc: 'Alguien que le ayude a entender y comunicarse' },
              ].map((ajuste) => (
                <div key={ajuste.nombre} className="card flex items-start gap-4">
                  <span className="text-accent-success text-2xl" aria-hidden="true">✓</span>
                  <div>
                    <p className="font-bold text-puente-800">{ajuste.nombre}</p>
                    <p className="text-puente-600">{ajuste.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-accent-success/10 border-2 border-accent-success rounded-tarjeta p-6">
              <h3 className="text-xl font-bold text-puente-800 mb-4">
                Crear el Pasaporte de Luis
              </h3>
              <p className="text-puente-600 mb-4">
                Con el Pasaporte, Luis puede mostrar en el juzgado qué necesita,
                sin tener que explicar su diagnóstico.
              </p>
              <Link
                href="/pasaporte?ajustes=sala-tranquila,preguntas-claras,mas-tiempo,facilitador"
                className="btn-primary"
              >
                Ir a crear Pasaporte
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
