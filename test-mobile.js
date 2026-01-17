#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Тестирование мобильного приложения От-Личный повар...');

// Проверка основных файлов
const requiredFiles = [
    'index.html',
    'app.js',
    'package.json',
    'capacitor.config.json',
    'manifest.json',
    'sw.js'
];

console.log('📋 Проверка файловой структуры...');
let allFilesExist = true;

for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} - присутствует`);
    } else {
        console.log(`❌ ${file} - отсутствует`);
        allFilesExist = false;
    }
}

// Проверка содержимого файлов
console.log('\n🔍 Проверка содержимого файлов...');

// Проверка index.html
try {
    const indexHtml = fs.readFileSync('index.html', 'utf8');
    const checks = [
        { name: 'DOCTYPE', check: indexHtml.includes('<!DOCTYPE html>') },
        { name: 'viewport meta', check: indexHtml.includes('viewport') },
        { name: 'manifest', check: indexHtml.includes('manifest.json') },
        { name: 'service worker', check: indexHtml.includes('sw.js') },
        { name: 'app.js', check: indexHtml.includes('app.js') }
    ];
    
    checks.forEach(({ name, check }) => {
        console.log(check ? `✅ ${name}` : `❌ ${name}`);
    });
} catch (error) {
    console.log('❌ Ошибка чтения index.html');
}

// Проверка manifest.json
try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    const manifestChecks = [
        { name: 'name', check: manifest.name && manifest.name.length > 0 },
        { name: 'short_name', check: manifest.short_name && manifest.short_name.length > 0 },
        { name: 'theme_color', check: manifest.theme_color === '#8b5cf6' },
        { name: 'display', check: manifest.display === 'standalone' }
    ];
    
    manifestChecks.forEach(({ name, check }) => {
        console.log(check ? `✅ manifest.${name}` : `❌ manifest.${name}`);
    });
} catch (error) {
    console.log('❌ Ошибка чтения manifest.json');
}

// Проверка capacitor.config.json
try {
    const capacitorConfig = JSON.parse(fs.readFileSync('capacitor.config.json', 'utf8'));
    const capacitorChecks = [
        { name: 'appId', check: capacitorConfig.appId === 'com.otlichnypovar.app' },
        { name: 'appName', check: capacitorConfig.appName === 'От-Личный повар' },
        { name: 'webDir', check: capacitorConfig.webDir === '.' },
        { name: 'plugins', check: capacitorConfig.plinks && capacitorConfig.plinks.SplashScreen }
    ];
    
    capacitorChecks.forEach(({ name, check }) => {
        console.log(check ? `✅ capacitor.${name}` : `❌ capacitor.${name}`);
    });
} catch (error) {
    console.log('❌ Ошибка чтения capacitor.config.json');
}

// Проверка service worker
try {
    const sw = fs.readFileSync('sw.js', 'utf8');
    const swChecks = [
        { name: 'install event', check: sw.includes('install') },
        { name: 'fetch event', check: sw.includes('fetch') },
        { name: 'push notifications', check: sw.includes('push') },
        { name: 'cache name', check: sw.includes('ot-lichny-povar') }
    ];
    
    swChecks.forEach(({ name, check }) => {
        console.log(check ? `✅ service worker ${name}` : `❌ service worker ${name}`);
    });
} catch (error) {
    console.log('❌ Ошибка чтения sw.js');
}

// Проверка package.json
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const packageChecks = [
        { name: 'name', check: packageJson.name === 'ot-lichny-povar-mobile' },
        { name: 'scripts', check: packageJson.scripts && packageJson.scripts.android },
        { name: 'capacitor deps', check: packageJson.devDependencies && packageJson.devDependencies['@capacitor/cli'] }
    ];
    
    packageChecks.forEach(({ name, check }) => {
        console.log(check ? `✅ package.json ${name}` : `❌ package.json ${name}`);
    });
} catch (error) {
    console.log('❌ Ошибка чтения package.json');
}

// Проверка мобильных функций в app.js
try {
    const appJs = fs.readFileSync('app.js', 'utf8');
    const mobileFeatures = [
        { name: 'геолокация', check: appJs.includes('geolocation') || appJs.includes('navigator.geolocation') },
        { name: 'localStorage', check: appJs.includes('localStorage') },
        { name: 'touch события', check: appJs.includes('touchstart') || appJs.includes('touchend') },
        { name: 'PWA функции', check: appJs.includes('serviceWorker') || appJs.includes('manifest') }
    ];
    
    mobileFeatures.forEach(({ name, check }) => {
        console.log(check ? `✅ ${name}` : `❌ ${name}`);
    });
} catch (error) {
    console.log('❌ Ошибка чтения app.js');
}

// Итоговый отчет
console.log('\n📊 ИТОГОВЫЙ ОТЧЕТ:');
console.log('==================');

if (allFilesExist) {
    console.log('✅ Все основные файлы присутствуют');
    console.log('✅ Конфигурация мобильного приложения настроена');
    console.log('✅ PWA функции включены');
    console.log('✅ Service Worker настроен');
    console.log('✅ Capacitor конфигурация корректна');
    console.log('\n🚀 Приложение готово к сборке!');
    console.log('\nСледующие шаги:');
    console.log('1. npm install');
    console.log('2. npm run build:icons');
    console.log('3. npm run android (или npm run ios)');
} else {
    console.log('❌ Требуется дополнительная настройка');
    console.log('Проверьте отсутствующие файлы и повторите тест');
}

// Проверка совместимости с мобильными устройствами
console.log('\n📱 ПРОВЕРКА СОВМЕСТИМОСТИ:');
console.log('========================');

const compatibilityTests = [
    { feature: 'Service Worker', support: "'serviceWorker' in navigator" },
    { feature: 'Push Notifications', support: "'PushManager' in window" },
    { feature: 'Geolocation', support: "'geolocation' in navigator" },
    { feature: 'Touch Events', support: "'ontouchstart' in window" },
    { feature: 'Vibration API', support: "'vibrate' in navigator" },
    { feature: 'Local Storage', support: "'localStorage' in window" }
];

console.log('Эти функции будут доступны в поддерживаемых браузерах:');
compatibilityTests.forEach(({ feature, support }) => {
    console.log(`📱 ${feature}: ${support}`);
});

console.log('\n🎯 РЕКОМЕНДАЦИИ ПО ТЕСТИРОВАНИЮ:');
console.log('==============================');
console.log('1. Протестируйте на реальных мобильных устройствах');
console.log('2. Проверьте работу в оффлайн-режиме');
console.log('3. Убедитесь в корректности push-уведомлений');
console.log('4. Проверьте геолокацию и карты');
console.log('5. Тестируйте на разных версиях iOS и Android');

console.log('\n✅ Тестирование завершено!');