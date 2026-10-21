# Cómo hacer un commit

El mensaje lleva un tipo, va en español y no menciona herramientas de IA.

## Formato

```
tipo(módulo): qué cambió y para qué

Detalle opcional, en una o dos frases.
```

El módulo es la zona del producto: `sala-previa`, `pasaporte`, `citacion`, `ensaya`, `mediador`, `backend`. Si el cambio cruza varias zonas, omite el paréntesis.

## Tipos

| Tipo | Cuándo |
| --- | --- |
| `feat` | Función nueva |
| `fix` | Corrección de un fallo |
| `refactor` | Cambio interno, el comportamiento sigue igual |
| `docs` | Documentación |
| `test` | Pruebas |
| `chore` | Mantenimiento que no cambia el producto |
| `perf` | Rendimiento |
| `ci` | Integración continua |

```
feat(sala-previa): panorama 360 real y barritas fuera del viewer
fix(pasaporte): el QR abre la vista pública al escanear
docs: normas de commit con tipos feat y fix
```

Mal:

```
Mejora implementada para optimizar la experiencia visual del usuario
update
wip
```

## Antes de commitear

1. Un cambio lógico por commit. No mezcles un arreglo de la API con un cambio de estilos.
2. Revisa `git diff`. No entres secretos, `.env` ni claves.
3. Prueba el flujo que tocaste. En una página, recórrela con Tab y mira la consola.

## Git

```bash
git status
git add ruta/del/archivo
git commit -m "tipo(módulo): qué cambió y para qué"
git push
```

Si `main` se movió en GitHub, trae los cambios con `git pull` antes de subir. Resuelve el conflicto en el archivo y vuelve a commitear. No hagas `push --force` a `main`.
