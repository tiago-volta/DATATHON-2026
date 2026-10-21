"""
Módulo de anonimización local y privacidad desde el diseño (RGPD art. 25).
Elimina datos personales identificativos (DNI/NIE, nombres, domicilios, teléfonos, emails)
antes de que el texto judicial sea procesado por cualquier modelo de IA externo.
"""

import re
from typing import Dict, List, Tuple


def _enmascarar_nombre(nombre: str) -> str:
    """Convierte 'LUIS GARCÍA FERNÁNDEZ' en 'L*** G*** F***' para mostrar al usuario."""
    partes = nombre.split()
    enmascaradas = []
    for p in partes:
        p_clean = p.rstrip(".")
        if len(p_clean) <= 1:
            enmascaradas.append(p)
        elif len(p_clean) == 2:
            enmascaradas.append(p_clean[0] + "*")
        else:
            enmascaradas.append(p_clean[0] + "***")
    return " ".join(enmascaradas)


def _enmascarar_dni(dni: str) -> str:
    """Convierte '32.123.456-Y' o '32.XXX.XXX-Y' en '32.***-Y'."""
    limpio = dni.strip()
    if len(limpio) >= 4:
        return limpio[:2] + ".***-" + limpio[-1]
    return "***"


def _enmascarar_domicilio(dom: str) -> str:
    """Enmascara una dirección postal preservando el tipo de vía y la ciudad o código si existen."""
    partes = dom.split(",")
    primera = partes[0].strip()
    resto = ", ".join(p.strip() for p in partes[1:]) if len(partes) > 1 else ""
    palabras = primera.split()
    if len(palabras) >= 2:
        via = palabras[0]
        nombre_calle = palabras[1][0] + "***"
        primera_enmascarada = f"{via} {nombre_calle}"
    else:
        primera_enmascarada = "C/ ***"
    return f"{primera_enmascarada}, {resto}" if resto else primera_enmascarada


def anonimizar_documento_judicial(texto: str) -> Tuple[str, List[Dict[str, str]]]:
    """
    Detecta y sustituye datos personales por marcadores no identificativos.
    Devuelve:
      - texto_anonimizado: listo para enviar al LLM de forma segura.
      - elementos_protegidos: lista con el tipo de dato y su valor parcialmente enmascarado.
    """
    if not texto:
        return "", []

    texto_anonimizado = texto
    elementos_protegidos: List[Dict[str, str]] = []
    mapa_reemplazos: Dict[str, str] = {}

    # 1. DNI, NIE y formatos judiciales con X/asteriscos (ej: 32.XXX.XXX-Y, 12345678Z, X1234567L)
    patrones_dni = [
        r"\b\d{2}\.[xX*]{3}\.[xX*]{3}[-_ ]?[A-Za-z]\b",
        r"\b\d{8}[-_ ]?[A-Za-z]\b",
        r"\b\d{1,2}\.\d{3}\.\d{3}[-_ ]?[A-Za-z]\b",
        r"\b[XYZxyz][-_ ]?\d{7}[-_ ]?[A-Za-z]\b",
        r"\b[XYZxyz]\.[xX*]{3}\.[xX*]{3}[-_ ]?[A-Za-z]\b",
    ]
    contador_dni = 0
    for pat in patrones_dni:
        for match in re.finditer(pat, texto_anonimizado):
            dni_orig = match.group(0)
            if dni_orig not in mapa_reemplazos:
                contador_dni += 1
                marcador = f"[DNI_{contador_dni}]"
                mapa_reemplazos[dni_orig] = marcador
                elementos_protegidos.append({
                    "tipo": "DNI / Documento de Identidad",
                    "marcador": marcador,
                    "valor_protegido": _enmascarar_dni(dni_orig),
                })

    for orig, marcador in mapa_reemplazos.items():
        texto_anonimizado = texto_anonimizado.replace(orig, marcador)

    # 2. Correos electrónicos
    patron_email = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    contador_email = 0
    for match in re.finditer(patron_email, texto_anonimizado):
        email_orig = match.group(0)
        contador_email += 1
        marcador = f"[EMAIL_{contador_email}]"
        texto_anonimizado = texto_anonimizado.replace(email_orig, marcador)
        elementos_protegidos.append({
            "tipo": "Correo electrónico",
            "marcador": marcador,
            "valor_protegido": email_orig[:2] + "***@" + email_orig.split("@")[-1],
        })

    # 3. Teléfonos
    patron_tel = r"\b(?:\+?34\s*)?[6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b"
    contador_tel = 0
    for match in re.finditer(patron_tel, texto_anonimizado):
        tel_orig = match.group(0)
        contador_tel += 1
        marcador = f"[TELEFONO_{contador_tel}]"
        texto_anonimizado = texto_anonimizado.replace(tel_orig, marcador)
        elementos_protegidos.append({
            "tipo": "Número de teléfono",
            "marcador": marcador,
            "valor_protegido": tel_orig[:3] + " *** ***",
        })

    # 4. Nombres propios precedidos por tratamientos judiciales (D./Dña./Don/Doña o fórmulas procesales)
    patrones_nombres = [
        # D./Dña./Don/Doña seguido de nombres e iniciales (ej. "Dña. MARÍA CARMEN R. V.")
        re.compile(
            r"\b(?:D\.|Dña\.|Don|Doña)\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\.]*(?:\s+[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\.]*){1,4})",
            re.IGNORECASE,
        ),
        # Fórmulas de citación directa: "Se cita a Pedro Gómez", "comparezca Juan Pérez"
        re.compile(
            r"(?i:\b(?:se cita a|comparezca|contra|imputad[oa]|investigad[oa]|absuelvo a|condeno a)\s+)"
            r"([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\.]*(?:\s+[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑa-záéíóúñ\.]*){1,4})",
        ),
    ]

    contador_persona = 0
    for patron in patrones_nombres:
        for match in patron.finditer(texto):
            nombre_detectado = match.group(1).strip()
            # Ignorar fórmulas institucionales
            if re.search(
                r"(?i)\b(juzgado|tribunal|administraci[oó]n|justicia|letrad[oa]|fiscal|sala|audiencia|polic[ií]a|guardia civil)\b",
                nombre_detectado,
            ):
                continue
            if len(nombre_detectado) >= 3 and nombre_detectado not in mapa_reemplazos:
                contador_persona += 1
                marcador = f"[PERSONA_{contador_persona}]"
                mapa_reemplazos[nombre_detectado] = marcador
                texto_anonimizado = re.sub(re.escape(nombre_detectado), marcador, texto_anonimizado)
                elementos_protegidos.append({
                    "tipo": "Nombre y apellidos de la persona",
                    "marcador": marcador,
                    "valor_protegido": _enmascarar_nombre(nombre_detectado),
                })

    # 5. Domicilio postal tras 'domiciliado en', 'con domicilio en', o por tipo de vía
    patron_domicilio = re.compile(
        r"(?i:\b(?:domiciliad[oa]\s+en|con\s+domicilio\s+en|vecin[oa]\s+de)\s+)"
        r"([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s,\/ºª\.\-]+?)"
        r"(?=,\s*para\s+que|\s+para\s+que|\.\s+|\n|$)",
    )
    contador_dom = 0
    for match in patron_domicilio.finditer(texto):
        dom_detectado = match.group(1).strip()
        if len(dom_detectado) > 5 and dom_detectado not in mapa_reemplazos:
            contador_dom += 1
            marcador = f"[DOMICILIO_{contador_dom}]"
            mapa_reemplazos[dom_detectado] = marcador
            texto_anonimizado = texto_anonimizado.replace(dom_detectado, marcador)
            elementos_protegidos.append({
                "tipo": "Dirección postal / Domicilio",
                "marcador": marcador,
                "valor_protegido": _enmascarar_domicilio(dom_detectado),
            })

    if contador_dom == 0:
        patron_calle = re.compile(
            r"\b(?:C\/|Calle|Avda\.|Avenida|Plaza|Paseo|Rúa)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s,\/ºª\.\-]+?\b\d{5}\b(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)?)"
        )
        for match in patron_calle.finditer(texto_anonimizado):
            dom_detectado = match.group(0).strip()
            if len(dom_detectado) > 6 and dom_detectado not in mapa_reemplazos:
                contador_dom += 1
                marcador = f"[DOMICILIO_{contador_dom}]"
                mapa_reemplazos[dom_detectado] = marcador
                texto_anonimizado = texto_anonimizado.replace(dom_detectado, marcador)
                elementos_protegidos.append({
                    "tipo": "Dirección postal / Domicilio",
                    "marcador": marcador,
                    "valor_protegido": _enmascarar_domicilio(dom_detectado),
                })

    return texto_anonimizado, elementos_protegidos

