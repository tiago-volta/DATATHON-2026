#!/usr/bin/env bash
# Arranca InclusiveCourt (backend + frontend) con un solo comando:
#   ./start.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
PID_BACKEND=""
PID_FRONTEND=""

limpiar() {
  echo ""
  echo "Cerrando InclusiveCourt..."
  [[ -n "$PID_FRONTEND" ]] && kill "$PID_FRONTEND" 2>/dev/null || true
  [[ -n "$PID_BACKEND" ]] && kill "$PID_BACKEND" 2>/dev/null || true
  # Hijos de next/uvicorn
  pkill -P "$PID_FRONTEND" 2>/dev/null || true
  pkill -P "$PID_BACKEND" 2>/dev/null || true
  wait 2>/dev/null || true
  echo "Listo."
}
trap limpiar EXIT INT TERM

necesita() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Falta '$1'. Instálalo y vuelve a ejecutar ./start.sh"
    exit 1
  }
}

necesita python3
necesita npm
necesita curl

echo "==> Backend"
cd "$ROOT/backend"
if [[ ! -d venv ]]; then
  python3 -m venv venv
fi
./venv/bin/pip install -q -r requirements.txt
if [[ ! -f .env && -f .env.example ]]; then
  cp .env.example .env
  echo "    Creado backend/.env desde .env.example"
fi
# 0.0.0.0 para que el preview/túnel de Cursor pueda conectar
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port "$BACKEND_PORT" &
PID_BACKEND=$!

echo "==> Frontend"
cd "$ROOT/frontend"
if [[ ! -d node_modules ]]; then
  npm install
fi
npm run dev -- --hostname 0.0.0.0 --port "$FRONTEND_PORT" &
PID_FRONTEND=$!

echo ""
echo "InclusiveCourt en marcha"
echo "  App:     http://localhost:$FRONTEND_PORT"
echo "  API:     http://localhost:$BACKEND_PORT"
echo "  Salud:   http://localhost:$BACKEND_PORT/health"
echo ""
echo "Ctrl+C para parar ambos."
echo ""

for _ in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:$FRONTEND_PORT" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if [[ "${OPEN_BROWSER:-1}" != "0" ]]; then
  if command -v open >/dev/null 2>&1; then
    open "http://localhost:$FRONTEND_PORT" 2>/dev/null || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:$FRONTEND_PORT" 2>/dev/null || true
  fi
fi

wait
