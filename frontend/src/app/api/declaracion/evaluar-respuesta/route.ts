import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SYSTEM_PROMPT_DECLARACION = `Eres la Magistrada-Jueza que preside una vista penal en España.
Diriges la declaración de Luis (testigo con medidas de accesibilidad cognitiva TEA, lenguaje claro según UNE 153101 y art. 7 bis LEC).
Tus intervenciones deben ser breves (máximo 1 o 2 frases cortas, menos de 20 palabras en total), respetuosas, comprensivas y con autoridad institucional tranquila.

CONTEXTO DEL CASO DE LUIS:
- Juicio penal en el Juzgado de lo Penal de A Coruña.
- Hechos: Un martes 3 de marzo sobre las 19:00 horas, en la parada de autobús de la calle Real, alguien arrebató un teléfono móvil de las manos a una mujer y huyó a la carrera hacia la plaza.
- Luis estaba en la parada esperando el autobús. No conoce a las partes y prometió decir la verdad.
- Vio la ropa de quien corría pero no pudo ver bien la cara por la rapidez.

INSTRUCCIONES:
1. "replica_juez": Lo que dice la jueza en voz alta al escuchar al declarante.
   - Si el testigo dice que va a mentir o se niega a jurar/declarar (ej. "yo no digo nada", "no voy a hablar", "no quiero declarar"): adviértele seriamente de que como testigo tiene la obligación legal de declarar y decir la verdad (art. 410 y 433 LECrim). No tiene derecho a guardar silencio como un acusado. Pon "avanzar": false y pídele que conteste.
   - Si pide agua o pausa: concédela con amabilidad.
   - Si dice que no lo sabe o no lo recuerda: valida su honestidad y continúa ("avanzar": true).
   - Si aporta datos del hecho (móvil, parada, autobús, ropa, plaza, etc.): acusa recibo y continúa ("avanzar": true).
   - Máximo 20 palabras. Voz activa, lenguaje sencillo y claro.
2. "por_que": Una explicación pedagógica corta dirigida al usuario en segunda persona ("tú") indicando por qué su respuesta es válida o cómo le ayuda.
3. "avanzar": booleano (false si se niega a declarar o mentirá, true si colabora).
4. "entrar_pausa": booleano (true si pide pausa).
5. "esperar_listo": booleano (true si pide agua).

Responde ÚNICAMENTE en JSON válido con los campos: "replica_juez", "por_que", "avanzar", "entrar_pausa", "esperar_listo".`

function obtenerApiKey(): string {
  let apiKey = (process.env.GEMINI_API_KEY || '').trim()
  if (apiKey && apiKey.length > 20) return apiKey

  try {
    const envPaths = [
      path.resolve(process.cwd(), '../backend/.env'),
      path.resolve(process.cwd(), 'backend/.env'),
      path.resolve(process.cwd(), '.env.local'),
      path.resolve(process.cwd(), 'frontend/.env.local'),
      path.resolve(process.cwd(), '.env'),
    ]
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8')
        const m = raw.match(/GEMINI_API_KEY=([^\r\n]+)/)
        if (m && m[1].trim()) {
          apiKey = m[1].trim()
          process.env.GEMINI_API_KEY = apiKey
          return apiKey
        }
      }
    }
  } catch {}

  return apiKey
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { pregunta, respuesta_usuario, nombre = 'Luis', rol = 'testigo', contexto } = body
    const texto = (respuesta_usuario || '').trim()
    const minus = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // 1. Control inmediato de mentir o negarse a declarar como testigo
    const esMentira =
      minus.includes('mentir') ||
      minus.includes('voy a mentir') ||
      minus.includes('iba a mentir') ||
      minus.includes('pienso mentir') ||
      minus.includes('no voy a decir la verdad') ||
      minus.includes('no dire la verdad') ||
      minus.includes('mentira') ||
      minus.includes('fals') ||
      minus.includes('enganar') ||
      minus.includes('engano')

    const seNiega =
      minus.includes('no digo nada') ||
      minus.includes('no voy a decir nada') ||
      minus.includes('no dire nada') ||
      minus.includes('no hablo') ||
      minus.includes('no voy a hablar') ||
      minus.includes('no pienso hablar') ||
      minus.includes('no quiero contestar') ||
      minus.includes('no contesto') ||
      minus.includes('no voy a contestar') ||
      minus.includes('me niego') ||
      minus.includes('no declaro') ||
      minus.includes('me callo') ||
      minus.includes('silencio') ||
      minus.includes('prefiero no contestar')

    if ((esMentira || seNiega) && rol !== 'investigado') {
      const replica = esMentira
        ? 'Atención, testigo. Como testigo tiene la obligación legal de decir la verdad. Mentir ante el tribunal es un delito de falso testimonio (artículo 458 del Código Penal). Le repito la pregunta: ¿promete decir la verdad?'
        : `${nombre}, como testigo la ley te obliga a declarar y decir la verdad (artículo 410 de la LECrim). No tienes derecho a guardar silencio. Debes contestar a la pregunta.`
      const porQue = esMentira
        ? 'Como testigo estás obligado por ley a decir la verdad (art. 433 LECrim). Faltar a la verdad conlleva penas de prisión.'
        : 'A diferencia de la persona acusada, quien acude como testigo tiene el deber inexcusable de declarar (art. 410 LECrim).'

      return NextResponse.json({
        replica_juez: replica,
        por_que: porQue,
        avanzar: false,
        entrar_pausa: false,
        esperar_listo: false,
        fuente: 'legal',
      })
    }

    // 2. Control inmediato de agua
    if (minus.includes('agua') || minus.includes('beber')) {
      return NextResponse.json({
        replica_juez: 'Sí, por favor, beba un poco de agua. Tómese su tiempo.',
        por_que: 'Pedir agua está bien. Te ayuda a seguir con calma.',
        avanzar: true,
        entrar_pausa: false,
        esperar_listo: true,
        fuente: 'mock',
      })
    }

    // 3. Control inmediato de pausa
    if (
      minus.includes('pausa') ||
      minus.includes('descanso') ||
      minus.includes('un momento') ||
      minus.includes('bloque') ||
      minus.includes('nervios')
    ) {
      return NextResponse.json({
        replica_juez: 'De acuerdo. Hacemos una pausa para que descanse.',
        por_que: 'Pedir una pausa es tu derecho procesal (art. 7 bis LEC).',
        avanzar: false,
        entrar_pausa: true,
        esperar_listo: false,
        fuente: 'mock',
      })
    }

    // 4. Conexión con Gemini (gemini-3.5-flash-lite)
    const apiKey = obtenerApiKey()
    if (apiKey && apiKey.length > 20) {
      try {
        const userContent = `Nombre del declarante: ${nombre}
Rol procesal: ${rol}
Pregunta formulada en sala: "${pregunta}"
Respuesta escrita por ${nombre}: "${texto}"
Contexto adicional: ${contexto || 'Juicio penal por hurto de móvil en parada de autobús.'}`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: SYSTEM_PROMPT_DECLARACION }],
              },
              contents: [
                {
                  parts: [{ text: userContent }],
                },
              ],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 300,
              },
            }),
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''
          let limpio = rawText.trim()
          if (limpio.startsWith('```')) {
            limpio = limpio.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
          }
          const parsed = JSON.parse(limpio.trim())
          return NextResponse.json({
            replica_juez: parsed.replica_juez || 'De acuerdo. Queda anotada su respuesta. Seguimos.',
            por_que: parsed.por_que || 'Respondiste con tus palabras. Lo importante es no inventar.',
            avanzar: parsed.avanzar ?? true,
            entrar_pausa: Boolean(parsed.entrar_pausa),
            esperar_listo: Boolean(parsed.esperar_listo),
            fuente: 'gemini',
          })
        }
      } catch (e) {
        // Fallback a respuesta local contextual
      }
    }

    // 5. Fallback contextual sobre el caso de Luis
    if (
      minus.includes('no sé') ||
      minus.includes('no se') ||
      minus.includes('no recuerdo') ||
      minus.includes('no me acuerdo')
    ) {
      return NextResponse.json({
        replica_juez: 'De acuerdo. Si no lo recuerda, es correcto decirlo. Seguimos.',
        por_que: 'Decir que no recuerdas es ser sincero. No tienes que inventar.',
        avanzar: true,
        entrar_pausa: false,
        esperar_listo: false,
        fuente: 'mock',
      })
    }

    if (
      minus.includes('móvil') ||
      minus.includes('movil') ||
      minus.includes('parada') ||
      minus.includes('autobús') ||
      minus.includes('autobus') ||
      minus.includes('calle real') ||
      minus.includes('plaza') ||
      minus.includes('correr') ||
      minus.includes('ropa') ||
      minus.includes('cara')
    ) {
      return NextResponse.json({
        replica_juez: 'Queda anotado lo que usted observó en la parada. Muchas gracias.',
        por_que: 'Aportaste los datos del hecho que presenciaste de forma clara.',
        avanzar: true,
        entrar_pausa: false,
        esperar_listo: false,
        fuente: 'mock',
      })
    }

    return NextResponse.json({
      replica_juez: 'De acuerdo. Queda anotado en el acta. Seguimos.',
      por_que: 'Respondiste con tus palabras. En un juicio lo esencial es decir la verdad.',
      avanzar: true,
      entrar_pausa: false,
      esperar_listo: false,
      fuente: 'mock',
    })
  } catch {
    return NextResponse.json({
      replica_juez: 'De acuerdo. Queda anotada su respuesta. Seguimos.',
      por_que: 'Respondiste con tus palabras. Recuerda decir siempre la verdad.',
      avanzar: true,
      entrar_pausa: false,
      esperar_listo: false,
      fuente: 'mock',
    })
  }
}
