@echo off
cd /d "%~dp0.."

echo Starting backend (ASP.NET)...
start "Backend" cmd /k "cd server\src\GamesHub.Server && dotnet run"

echo Starting frontend (Vite)...
start "Frontend" cmd /k "cd web && npm run dev"

echo Both services started in separate windows.
