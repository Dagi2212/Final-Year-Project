#!/usr/bin/env bash
# ============================================================
# IADS — Start all services (Backend + ML + Frontend)
# Usage: bash start-all.sh
# ============================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Integrated Agricultural Data System   ║${NC}"
echo -e "${GREEN}║  ASTU Final Year Project               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Check .env ────────────────────────────────────────────────────────────────
if [ ! -f "$ROOT_DIR/.env" ]; then
  echo -e "${RED}ERROR: Backend .env not found.${NC}"
  echo -e "Run: ${CYAN}cp .env.example .env${NC} and fill in values."
  exit 1
fi

if ! grep -q "ANTHROPIC_API_KEY=sk-ant" "$ROOT_DIR/.env" 2>/dev/null; then
  echo -e "${YELLOW}⚠  ANTHROPIC_API_KEY not set → AI Query will not work${NC}"
  echo -e "   Get a free key at: https://console.anthropic.com/"
fi

# ── Trap to kill child processes on exit ─────────────────────────────────────
PIDS=()
cleanup() {
  echo -e "\n${YELLOW}Stopping all services...${NC}"
  for pid in "${PIDS[@]}"; do kill "$pid" 2>/dev/null || true; done
  exit 0
}
trap cleanup INT TERM

# ── 1. Python ML service ─────────────────────────────────────────────────────
echo -e "${CYAN}[1/3] Starting ML service on port 8000...${NC}"
cd "$ROOT_DIR/ml-service"
if python3 -c "import fastapi, uvicorn, sklearn" 2>/dev/null; then
  uvicorn ml_service.app:app --port 8000 --host 0.0.0.0 --log-level warning &
  PIDS+=($!)
  sleep 1
  echo -e "      ${GREEN}✓ ML service running${NC}  http://localhost:8000"
else
  echo -e "      ${YELLOW}⚠ Python deps missing. Run: pip install -r ml-service/requirements.txt${NC}"
fi

# ── 2. AdonisJS backend ───────────────────────────────────────────────────────
echo -e "${CYAN}[2/3] Starting AdonisJS backend on port 3333...${NC}"
cd "$ROOT_DIR"
node ace migration:run --force 2>/dev/null || true
node ace serve --hmr &
PIDS+=($!)
sleep 3
echo -e "      ${GREEN}✓ Backend running${NC}       http://localhost:3333"

# ── 3. Next.js frontend ───────────────────────────────────────────────────────
echo -e "${CYAN}[3/3] Starting Next.js frontend on port 3000...${NC}"
FRONTEND_DIR="$ROOT_DIR/frontend"
if [ -d "$FRONTEND_DIR" ]; then
  cd "$FRONTEND_DIR"
  if [ ! -d "node_modules" ]; then
    echo -e "      Installing frontend dependencies..."
    npm install --silent
  fi
  npm run dev -- --port 3000 &
  PIDS+=($!)
  sleep 3
  echo -e "      ${GREEN}✓ Frontend running${NC}      http://localhost:3000"
else
  echo -e "      ${YELLOW}⚠ Frontend directory not found at ./frontend${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  All services started!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "  Frontend  → ${CYAN}http://localhost:3000${NC}"
echo -e "  Backend   → ${CYAN}http://localhost:3333${NC}"
echo -e "  ML Health → ${CYAN}http://localhost:8000/health${NC}"
echo ""
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for any child to exit
wait
