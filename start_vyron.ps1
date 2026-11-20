# PowerShell Runner for VYRON
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Starting VYRON: Gamified Productivity System     " -ForegroundColor Magenta
Write-Host "========================================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python manage.py runserver 0.0.0.0:8000"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev -- --host 0.0.0.0"

Write-Host "VYRON is live!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:8000/api" -ForegroundColor Yellow
