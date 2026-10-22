import { NextResponse } from 'next/server'

const SYSTEM_PROMPT_DECLARACION = `Eres la Magistrada-Jueza que preside una vista penal en España.
Diriges la declaración de una persona en calidad de testigo (o investigado) que cuenta con medidas de accesibilidad cognitiva (TEA, lenguaje claro según UNE 153101 y art. 7 bis LEC).
Tus intervenciones deben ser breves (máximo 1 o 2 frases cortas, menos de 20 palabras en total), respetuosas, comprensivas y con autoridad institucional tranquila.

CONTEXTO DEL CASO DE LUIS:
- Juicio penal en el Juzgado de lo Penal de A Coruña.
- Hechos: Un martes 3 de marzo sobre las 19:00 horas, en la parada de autobús de la calle Real, alguien arrebató un teléfono móvil de las manos a una mujer y huyó a la carrera hacia la plaza.
- La persona que declara (habitualmente Luis) estaba en la parada esperando el autobús. No conoce a las partes y prometió decir la verdad.
- Vio la ropa de quien corría pero no pudo ver bien la cara por la rapidez.

INSTRUCCIONES:
1. "replica_juez": Lo que dice la jueza en voz alta al escuchar al declarante.
   - Si dice que va a mentir o no dirá la verdad: adviértele severamente de que es delito de falso testimonio (art. 458 CP y 433 LECrim) y pon "avanzar": false ("Atención, testigo. Mentir en juicio es delito de falso testimonio. Le repito: ¿promete decir la verdad?").
   - Si pide agua: autorízalo con empatía ("Sí, por favor, beba un poco de agua. Tómese su tiempo.").
   - Si pide una pausa o descanso: autorízalo ("De acuerdo. Hacemos una pausa para que descanse.").
   - Si dice que no lo sabe o no lo recuerda: valida su honestidad ("De acuerdo. Si no lo recuerda, es correcto decirlo. Seguimos.").
   - Si aporta datos del hecho (móvil, parada, autobús, ropa, plaza, etc.): acusa recibo ("Queda anotado lo que usted observó. Muchas gracias.").
   - Si responde cualquier otra cosa: confirma recepción con calma ("De acuerdo. Queda anotada su respuesta. Seguimos.").
2. "por_que": Una explicación pedagógica corta dirigida al usuario en segunda persona ("tú") indicando por qué su respuesta es válida o cómo le ayuda.
3. "avanzar": booleano (true para continuar al siguiente turno, false si dice que va a mentir o solicita parar).
4. "entrar_pausa": booleano (true si pide pausa).
5. "esperar_listo": booleano (true si pide agua).

Responde ÚNICAMENTE en JSON válido con los campos: "replica_juez", "por_que", "avanzar", "entrar_pausa", "esperar_listo".`

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { pregunta, respuesta_usuario, nombre = 'Luis', rol = 'testigo', contexto } = body
    const texto = (respuesta_usuario || '').trim()
    const minus = texto.toLowerCase()

    // Control inmediato de mentir
    if (
      minus.includes('mentir') ||
      minus.includes('voy a mentir') ||
      minus.includes('pienso mentir') ||
      minus.includes('no voy a decir la verdad') ||
      minus.includes('no dire la verdad') ||
      minus.includes('es mentira')
    ) {
      return NextResponse.json({
        replica_juez:
          'Atención, testigo. Como testigo tiene la obligación legal de decir la verdad. Mentir ante el tribunal es un delito de falso testimonio (artículo 458 del Código Penal). Le repito la pregunta: ¿promete decir la verdad?',
        por_que:
          'Como testigo estás obligado por ley a decir la verdad (art. 433 LECrim). Faltar a la verdad conlleva penas de prisión.',
        avanzar: false,
        entrar_pausa: false,
        esperar_listo: false,
        fuente: 'legal',
      })
    }

    // Control inmediato de agua
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

    // Control inmediato de pausa
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

    // Conexión directa con Gemini usando GEMINI_API_KEY
    const apiKey = (process.env.GEMINI_API_KEY || '').trim()
    if (apiKey && apiKey.length > 20) {
      try {
        const userContent = `Nombre del declarante: ${nombre}
Rol procesal: ${rol}
Pregunta formulada en sala: "${pregunta}"
Respuesta escrita por ${nombre}: "${texto}"
Contexto adicional: ${contexto || 'Sin contexto adicional'}`

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
                temperature: 0.3,
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
      } catch {
        // Fallback a respuesta local contextual
      }
    }

    // Fallback contextual sobre el caso de Luis
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
