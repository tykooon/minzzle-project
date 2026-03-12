#!/bin/bash
# Start backend and frontend in dev mode

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Starting backend (ASP.NET)..."
cd "$ROOT/server/src/GamesHub.Server"
dotnet run &
BACKEND_PID=$!

echo "Starting frontend (Vite)..."
cd "$ROOT/web"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both..."

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
