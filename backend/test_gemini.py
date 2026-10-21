from pathlib import Path
import os
import sys
from dotenv import load_dotenv
from google import genai

sys.stdout.reconfigure(encoding="utf-8")

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

client = genai.Client()  # lee GEMINI_API_KEY del entorno
modelos_candidatos = [
    os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
]

prompt = "Reescribe en lenguaje claro: «Se le apercibe de que, si no comparece sin causa justificada, podrá ser sancionado con multa.»"

for modelo in dict.fromkeys(modelos_candidatos):
    try:
        print(f"Probando GEMINI_API_KEY con '{modelo}'...")
        r = client.models.generate_content(
            model=modelo,
            contents=prompt,
        )
        print(f"\nOK ({modelo}) — Respuesta:\n")
        print(r.text)
        break
    except Exception as e:
        print(f"Aviso en {modelo}: {e}")

