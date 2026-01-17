@echo off
echo 🚀 Настройка мобильного приложения От-Личный повар
echo ================================================

echo 📋 Проверка окружения...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен. Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js установлен

echo 📦 Проверка Capacitor...
npx cap --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Capacitor не установлен глобально. Установка...
    npm install -g @capacitor/cli
)

echo ✅ Capacitor готов

echo 🏗️ Инициализация мобильного приложения...
if not exist "android" (
    npx cap init "От-Личный повар" "com.otlichnypovar.app" --web-dir .
    npx cap add android
    echo ✅ Android проект создан
) else (
    echo ✅ Android проект уже существует
)

if not exist "ios" (
    npx cap add ios
    echo ✅ iOS проект создан
) else (
    echo ✅ iOS проект уже существует
)

echo 🔄 Синхронизация с нативными проектами...
npx cap sync

echo 📱 Создание иконок...
if not exist "icons" mkdir icons
echo 📄 Создание базовых иконок...

:: Создание простой иконки через PowerShell
powershell -Command "Add-Type -AssemblyName System.Drawing; $bitmap = New-Object System.Drawing.Bitmap(512,512); $graphics = [System.Drawing.Graphics]::FromImage($bitmap); $graphics.Clear([System.Drawing.Color]::FromArgb(139,92,246)); $bitmap.Save('icons/icon-512x512.png', [System.Drawing.Imaging.ImageFormat]::Png); Write-Host '✅ Базовая иконка создана'"

echo 🎉 Настройка завершена!
echo.
echo 📖 Инструкции:
echo   1. Для Android: npm run android
echo   2. Для iOS: npm run ios  
echo   3. Для PWA: откройте index.html в браузере
echo.
echo 🚀 Приложение готово к использованию!
pause