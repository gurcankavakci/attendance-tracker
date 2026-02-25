@echo off
echo Devam Takip uygulamasi baslatiliyor...
echo Tarayicinizda http://localhost:5173 adresini acin
echo Durdurmak icin CTRL+C basin
echo.
"%APPDATA%\nvm\v20.18.0\npm.cmd" run dev
pause
