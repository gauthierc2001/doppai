@echo off
title DoppAI Development Server
cd /d "%~dp0"
echo Killing any existing Node processes...
taskkill /f /im node.exe 2>nul
echo Starting DoppAI on http://localhost:3000...
npm run dev
pause
