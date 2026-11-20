@echo off
title VYRON - Gamified Productivity System
echo ========================================================
echo        Starting VYRON: Gamified Productivity System
echo ========================================================
echo.
echo Starting Django REST API Backend on http://localhost:8000 ...
start "VYRON Backend" cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"

timeout /t 2 /nobreak > nul

echo Starting React Vite Frontend on http://localhost:5173 ...
start "VYRON Frontend" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0"

echo.
echo ========================================================
echo  VYRON is live!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000/api
echo ========================================================
