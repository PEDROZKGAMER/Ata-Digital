@echo off
echo ========================================
echo    INICIANDO ATA DIGITAL COMPLETA
echo ========================================
echo.

echo [1/2] Iniciando Backend (porta 3001)...
start "Backend" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend (porta 5173)...
start "Frontend" cmd /k "cd ata_digital && npm run dev"

echo.
echo ========================================
echo   SISTEMA INICIADO COM SUCESSO!
echo ========================================
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Pressione qualquer tecla para sair...
pause > nul