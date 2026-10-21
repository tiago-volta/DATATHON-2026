# PUENTE - Accesibilidad cognitiva en la justicia

Aplicación desarrollada en el DATAthon Justicia 2026 (A Coruña, Reto 3: Neurodiversidad).

## Qué es

PUENTE ayuda a personas neurodivergentes (autismo, TDAH, dislexia, ceguera) a entender
y prepararse para procesos judiciales. Convierte citaciones en lenguaje claro, ofrece
un Pasaporte de Ajustes sin revelar diagnóstico, y permite ensayar la declaración.

## Estructura del repositorio

```
/
├── frontend/          # Next.js 14 + TypeScript + Tailwind
│   └── src/
│       ├── app/       # Páginas (citacion, pasaporte, ensaya, sala-previa, profesional)
│       ├── components/# Componentes reutilizables
│       └── lib/       # API client, contenido estático
├── backend/           # FastAPI
│   └── app/           # main.py, llm.py, arasaac.py, mock_data.py
├── data/              # JSON de fases, roles, ajustes
└── .claude/skills/    # Skills para el agente
```

## Ejecutar el proyecto

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (otra terminal)
cd frontend
npm install
npm run dev
```

Abrir http://localhost:3000

## Perfiles de usuario de referencia

- **Luis** (TEA, testigo): necesita lenguaje literal, anticipación, ambiente tranquilo
- **Juan** (TDAH + ceguera, investigado): necesita voz, pausas, descripción de pruebas

## Skills disponibles

- `puente-lectura-facil`: pautas UNE para textos accesibles
- `puente-accesibilidad`: checklist WCAG/COGA
- `vendor/anthropics-skill-creator`: crear y mejorar skills
- `vendor/stop-slop`: textos que no suenen a plantilla
- `vendor/superpowers-*`: brainstorming, writing-plans, systematic-debugging

## División del trabajo (3 personas)

| Persona | Responsabilidad | Módulos |
|---------|-----------------|---------|
| A | IA y backend | Procesamiento citación, mediador, integración LLM |
| B | Frontend persona | Citación, Pasaporte, Ensaya, calendario, voz |
| C | Profesional + contenido | Panel profesional, Sala Previa, contenido legal |

## Reglas importantes

1. **Accesibilidad obligatoria**: todo debe funcionar con lector de pantalla
2. **Lectura fácil**: seguir UNE 153101 para textos de usuario
3. **Sin diagnóstico visible**: el Pasaporte muestra necesidades, no condiciones
4. **Mobile first**: diseño adaptable a móvil y escritorio
5. **No sugerir demos ni guiones**: no propongas ideas para demos, guiones de pitch ni presentaciones salvo que el usuario lo solicite explícitamente.

## MCPs configurados

- **docling**: para procesar PDFs de citaciones
- **context7**: documentación de librerías

## Base legal

- Art. 7 bis LEC (ajustes de procedimiento)
- Art. 109 y 118 LECrim (proceso penal)
- Ley 15/2022 (no discriminación)
- Guía CGPJ 2025 (perfil de ajustes)
