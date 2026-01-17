#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Сборка мобильного приложения От-Личный повар...');

// Проверка наличия необходимых файлов
const requiredFiles = [
    'index.html',
    'app.js',
    'package.json',
    'capacitor.config.json',
    'manifest.json',
    'sw.js'
];

for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.error(`❌ Отсутствует файл: ${file}`);
        process.exit(1);
    }
}

console.log('✅ Все необходимые файлы присутствуют');

// Создание директории для иконок
if (!fs.existsSync('icons')) {
    console.log('📁 Создание директории для иконок...');
    fs.mkdirSync('icons');
    console.log('✅ Директория icons создана');
}

// Создание скрипта для генерации иконок
const iconGeneratorScript = `
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
    const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
    
    // Создаем базовую иконку (заглушка)
    const baseIcon = sharp({
        create: {
            width: 512,
            height: 512,
            channels: 4,
            background: { r: 139, g: 92, b: 246, alpha: 1 }
        }
    });
    
    for (const size of sizes) {
        await baseIcon
            .resize(size, size)
            .png()
            .toFile(\`icons/icon-\${size}x\${size}.png\`);
        console.log(\`✅ Создана иконка \${size}x\${size}\`);
    }
}

generateIcons().catch(console.error);
`;

fs.writeFileSync('generate-icons.js', iconGeneratorScript);
console.log('📄 Создан скрипт генерации иконок');

// Создание инструкций по сборке
const buildInstructions = `
# Инструкция по сборке мобильного приложения

## Предварительные требования
- Node.js 16+
- Java 11+ (для Android)
- Xcode (для iOS)

## Установка зависимостей
\`\`\`bash
npm install
\`\`\`

## Генерация иконок
\`\`\`bash
node generate-icons.js
\`\`\`

## Инициализация Capacitor
\`\`\`bash
npx cap init
npx cap add android
npx cap add ios
\`\`\`

## Сборка и запуск

### Android
\`\`\`bash
npm run android
\`\`\`

### iOS
\`\`\`bash
npm run ios
\`\`\`

## Публикация в магазинах приложений

### Google Play Store
1. Соберите APK/AAB: \`npx cap build android\`
2. Загрузите в Google Play Console

### Apple App Store
1. Соберите IPA: \`npx cap build ios\`
2. Загрузите через Xcode

## Конфигурация

### Capacitor Config
Файл \`capacitor.config.json\` содержит основные настройки приложения.

### PWA Manifest
Файл \`manifest.json\` определяет поведение приложения как PWA.

## Особенности приложения
- Offline-first архитектура
- Push-уведомления
- Геолокация
- Нативный интерфейс
- Кэширование данных
`;

fs.writeFileSync('BUILD_INSTRUCTIONS.md', buildInstructions);
console.log('📄 Создана инструкция по сборке');

// Создание скрипта деплоя
const deployScript = `
const fs = require('fs');
const path = require('path');

class MobileAppDeployer {
    constructor() {
        this.platforms = ['android', 'ios'];
    }

    validateEnvironment() {
        console.log('🔍 Проверка окружения...');
        
        // Проверка Node.js
        if (parseInt(process.version.slice(1)) < 16) {
            throw new Error('Требуется Node.js 16+');
        }

        // Проверка Capacitor
        try {
            require('@capacitor/cli');
        } catch {
            throw new Error('Capacitor не установлен. Запустите: npm install');
        }

        console.log('✅ Окружение проверено');
    }

    async build(platform) {
        if (!this.platforms.includes(platform)) {
            throw new Error(\`Неподдерживаемая платформа: \${platform}\`);
        }

        console.log(\`🏗️  Сборка для \${platform}...\`);

        try {
            // Синхронизация с нативными проектами
            execSync('npx cap sync', { stdio: 'inherit' });
            
            // Сборка
            execSync(\`npx cap build \${platform}\`, { stdio: 'inherit' });
            
            console.log(\`✅ Сборка \${platform} завершена\`);
        } catch (error) {
            console.error(\`❌ Ошибка сборки \${platform}:\`, error);
            throw error;
        }
    }

    async deploy(platform) {
        console.log(\`🚀 Деплой для \${platform}...\`);
        
        // Здесь будет логика деплоя в магазины приложений
        console.log(\`📋 Готово к загрузке в \${platform === 'android' ? 'Google Play' : 'App Store'}\`);
    }
}

module.exports = MobileAppDeployer;
`;

fs.writeFileSync('deploy.js', deployScript);
console.log('📄 Создан скрипт деплоя');

console.log('\n🎉 Сборка мобильного приложения настроена!');
console.log('📖 Смотрите BUILD_INSTRUCTIONS.md для инструкций');
console.log('🚀 Запустите: npm run android или npm run ios');

// Обновление package.json с новыми скриптами
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts = {
    ...packageJson.scripts,
    "build:icons": "node generate-icons.js",
    "build:android": "npx cap sync && npx cap build android",
    "build:ios": "npx cap sync && npx cap build ios",
    "deploy:android": "node deploy.js android",
    "deploy:ios": "node deploy.js ios"
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('📦 package.json обновлен с новыми скриптами');