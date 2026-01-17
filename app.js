/**
 * ============================================
 * От-Личный повар | Mobile Food Delivery App
 * ============================================
 * Architecture: Single Page Application (SPA)
 * Framework: Vanilla JS + Tailwind CSS
 * Storage: localStorage (offline-first)
 * 
 * Features:
 * - Auth (phone + SMS)
 * - Geolocation
 * - Catalog with filters
 * - Cart (single chef)
 * - Checkout (5 steps)
 * - Order tracking
 * - Profile (addresses, payments, favorites)
 * - Admin panel
 * - Search
 * - Promo codes
 */

// ============================================
// STATE MANAGEMENT
// ============================================
const AppState = {
    // User
    user: null,
    token: localStorage.getItem('auth_token'),
    
    // Navigation
    currentScreen: 'home',
    previousScreen: null,
    navHistory: [],

    // Timers
    timers: {
        orderStatusIntervalId: null
    },
    
    // Location
    location: null,
    
    // Cart
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    
    // Checkout
    checkout: {
        step: 1,
        address: null,
        time: 'asap',
        datetime: null,
        service: 'yandex',
        payment: null,
        promo: null,
        discount: 0
    },
    
    // Filters
    filters: {
        distance: 10,
        rating: 0,
        cuisine: 'all',
        price: 'all'
    },
    
    // Current data
    currentChef: null,
    
    // Profile data
    addresses: JSON.parse(localStorage.getItem('addresses')) || [],
    payments: JSON.parse(localStorage.getItem('payments')) || [],
    favorites: JSON.parse(localStorage.getItem('favorites')) || { chefs: [], dishes: [] },
    orders: JSON.parse(localStorage.getItem('orders')) || [],
    
    // Search
    searchQuery: '',
    
    // Admin
    chefApplications: JSON.parse(localStorage.getItem('chef_applications')) || []
};

// ============================================
// MOCK DATA
// ============================================
const mockChefs = [
    {
        id: 'chef1',
        name: 'Мария Иванова',
        rating: 4.8,
        ordersCount: 1250,
        distance: 1.2,
        cuisine: 'russian',
        avgPrice: 360,
        image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
        description: 'Готовлю с душой! Традиционные русские блюда по бабушкиным рецептам. Стаж 15 лет.',
        experience: '15 лет опыта, работала в ресторанах "Тарас Бульба", "Кофе Хаус"',
        verified: true,
        reviews: [
            { id: 1, author: 'Андрей', rating: 5, text: 'Борщ просто бомба! Спасибо!', date: '2024-01-10' },
            { id: 2, author: 'Елена', rating: 4, text: 'Вкусно, но чуть солоновато', date: '2024-01-08' },
            { id: 3, author: 'Михаил', rating: 5, text: 'Лучшие пельмени в городе', date: '2024-01-05' }
        ],
        dishes: [
            { id: 'dish1', name: 'Борщ с говядиной', description: 'Традиционный борщ с говядиной, сметаной и зеленью. Готовим на бульоне 6 часов!', price: 350, weight: '400г', image: 'https://images.unsplash.com/photo-1583224994076-ae951d019af7?w=300&h=200&fit=crop', popular: true, isFavorite: false },
            { id: 'dish2', name: 'Пельмени домашние', description: 'Сочные пельмени с двойной мясной начинкой. Тесто замешивается вручную.', price: 280, weight: '300г', image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=300&h=200&fit=crop', popular: true, isFavorite: false },
            { id: 'dish3', name: 'Блины с икрой', description: 'Тонкие блины с красной икрой и сливочным маслом', price: 450, weight: '250г', image: 'https://images.unsplash.com/photo-1617056073183-9a3240e8e05c?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish4', name: 'Солянка', description: 'Наваристая солянка с колбасой, огурчиками и лимоном', price: 320, weight: '350г', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish5', name: 'Картофельное пюре', description: 'Нежное пюре с маслом и молоком', price: 180, weight: '250г', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish6', name: 'Котлета по-киевски', description: 'Сочная куриная котлета с маслом внутри', price: 420, weight: '180г', image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300&h=200&fit=crop', popular: true, isFavorite: false }
        ]
    },
    {
        id: 'chef2',
        name: 'Антонио Росси',
        rating: 4.9,
        ordersCount: 2100,
        distance: 2.5,
        cuisine: 'italian',
        avgPrice: 440,
        image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=200&fit=crop',
        description: 'Аутентичная итальянская кухня от шефа из Милана. Специализируюсь на пасте и ризотто.',
        experience: '20 лет, работал в ресторанах Милана и Рима',
        verified: true,
        reviews: [
            { id: 1, author: 'Мария', rating: 5, text: 'Лучшая паста в Москве!', date: '2024-01-12' },
            { id: 2, author: 'Дмитрий', rating: 5, text: 'Как в Италии!', date: '2024-01-09' }
        ],
        dishes: [
            { id: 'dish7', name: 'Паста Карбонара', description: 'Классическая паста с беконом, яйцом и пармезаном. Рецепт из Рима!', price: 420, weight: '350г', image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=300&h=200&fit=crop', popular: true, isFavorite: false },
            { id: 'dish8', name: 'Ризотто с грибами', description: 'Кремовое ризотто с белыми грибами и трюфельным маслом', price: 520, weight: '300г', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&h=200&fit=crop', popular: true, isFavorite: false },
            { id: 'dish9', name: 'Пицца Маргарита', description: 'Тонкое тесто, свежие томаты, моцарелла и базилик', price: 380, weight: '400г', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish10', name: 'Тирамису', description: 'Легендарный итальянский десерт с маскарпоне', price: 350, weight: '150г', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish11', name: 'Фокачча', description: 'Итальянский хлеб с розмарином и оливковым маслом', price: 250, weight: '200г', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish12', name: 'Лазанья', description: 'Многослойная паста с мясным соусом бешамель', price: 480, weight: '400г', image: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=300&h=200&fit=crop', popular: true, isFavorite: false }
        ]
    },
    {
        id: 'chef3',
        name: 'Хан Су Ли',
        rating: 4.7,
        ordersCount: 890,
        distance: 3.1,
        cuisine: 'asian',
        avgPrice: 350,
        image: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=200&fit=crop',
        description: 'Мастер азиатской кухни: Китай, Таиланд, Япония. Готовлю с использованием аутентичных специй.',
        experience: '12 лет, работал в ресторанах Бангкока и Гонконга',
        verified: true,
        reviews: [
            { id: 1, author: 'Ольга', rating: 5, text: 'Том Ям божественный!', date: '2024-01-11' },
            { id: 2, author: 'Сергей', rating: 4, text: 'Вкусно, острота в меру', date: '2024-01-07' }
        ],
        dishes: [
            { id: 'dish13', name: 'Том Ям', description: 'Острый суп с креветками, грибами и кокосовым молоком', price: 380, weight: '300мл', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=300&h=200&fit=crop', popular: true, isFavorite: false },
            { id: 'dish14', name: 'Пад Тай', description: 'Тайская лапша с курицей, орехами и соусом тамаринда', price: 320, weight: '350г', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=300&h=200&fit=crop', popular: true, isFavorite: false },
            { id: 'dish15', name: 'Дим самы', description: 'Паровые пельмени с креветками (4 шт)', price: 350, weight: '180г', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish16', name: 'Утка по-пекински', description: 'Утка с хрустящей корочкой, соус хоисин, блины', price: 1200, weight: '500г', image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300&h=200&fit=crop', popular: true, isFavorite: false },
            { id: 'dish17', name: 'Рамен', description: 'Японский суп с свининой, яйцом и лапшой', price: 450, weight: '500мл', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish18', name: 'Суши сет (8 шт)', description: 'Лосось, тунец, угорь, авокадо', price: 680, weight: '250г', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&h=200&fit=crop', popular: true, isFavorite: false }
        ]
    },
    {
        id: 'chef4',
        name: 'Жан-Пьер Дюпон',
        rating: 4.9,
        ordersCount: 540,
        distance: 4.5,
        cuisine: 'european',
        avgPrice: 480,
        image: 'https://images.unsplash.com/photo-1581339394628-6a68361c980b?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop',
        description: 'Высокая французская кухня. Блюда ресторанного уровня у вас дома.',
        experience: '18 лет, работал в ресторанах Мишлен',
        verified: true,
        reviews: [
            { id: 1, author: 'Анна', rating: 5, text: 'Шедевр! Утка божественна', date: '2024-01-13' },
            { id: 2, author: 'Павел', rating: 5, text: 'Как в дорогом ресторане', date: '2024-01-06' }
        ],
        dishes: [
            { id: 'dish19', name: 'Луковый суп', description: 'Классический суп с гренками и сыром грюйер', price: 450, weight: '350мл', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish20', name: 'Конфи из утки', description: 'Утиная ножка томленая в соку с гарниром', price: 890, weight: '400г', image: 'https://images.unsplash.com/photo-1511909523672-51e61d1f736c?w=300&h=200&fit=crop', popular: true, isFavorite: false },
            { id: 'dish21', name: 'Рататуй', description: 'Овощное рагу из Прованса', price: 390, weight: '300г', image: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish22', name: 'Эскарго', description: 'Виноградные улитки с чесночным маслом (6 шт)', price: 520, weight: '150г', image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=200&fit=crop', popular: false, isFavorite: false },
            { id: 'dish23', name: 'Фуа-гра', description: 'Утиная печень с тостом и инжиром', price: 750, weight: '120г', image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=300&h=200&fit=crop', popular: true, isFavorite: false },
            { id: 'dish24', name: 'Крем-брюле', description: 'Классический десерт с карамельной корочкой', price: 320, weight: '150г', image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=300&h=200&fit=crop', popular: false, isFavorite: false }
        ]
    },
    {
        id: 'chef5',
        name: 'Новый повар',
        rating: 0,
        ordersCount: 0,
        distance: 5.0,
        cuisine: 'russian',
        avgPrice: 400,
        image: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=200&fit=crop',
        description: 'Новый повар в приложении. Ждите появления блюд!',
        experience: '',
        verified: false,
        reviews: [],
        dishes: []
    }
];

const mockOrders = [
    {
        id: 'ORD-001',
        chefId: 'chef1',
        chefName: 'Мария Иванова',
        chefImage: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop',
        status: 'cooking',
        statusText: 'Готовится',
        statusColor: 'orange',
        date: new Date().toISOString(),
        time: '18:30',
        items: [
            { name: 'Борщ с говядиной', price: 350, quantity: 1 },
            { name: 'Пельмени домашние', price: 280, quantity: 1 }
        ],
        subtotal: 630,
        delivery: 199,
        total: 829,
        deliveryTime: '19:15 - 19:30',
        address: 'Москва, ул. Примерная, 1, кв. 81'
    },
    {
        id: 'ORD-002',
        chefId: 'chef2',
        chefName: 'Антонио Росси',
        chefImage: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=100&h=100&fit=crop',
        status: 'delivered',
        statusText: 'Доставлен',
        statusColor: 'green',
        date: new Date(Date.now() - 86400000).toISOString(),
        time: '13:15',
        items: [
            { name: 'Ризотто с грибами', price: 520, quantity: 1 }
        ],
        subtotal: 520,
        delivery: 199,
        total: 719,
        deliveryTime: '14:00',
        address: 'Москва, ул. Примерная, 1, кв. 81'
    },
    {
        id: 'ORD-003',
        chefId: 'chef3',
        chefName: 'Хан Су Ли',
        chefImage: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&h=100&fit=crop',
        status: 'delivered',
        statusText: 'Доставлен',
        statusColor: 'green',
        date: new Date(Date.now() - 172800000).toISOString(),
        time: '19:45',
        items: [
            { name: 'Том Ям', price: 380, quantity: 1 },
            { name: 'Пад Тай', price: 320, quantity: 1 }
        ],
        subtotal: 700,
        delivery: 199,
        total: 899,
        deliveryTime: '20:30',
        address: 'Москва, ул. Примерная, 1, кв. 81'
    }
];

// Promo codes
const promoCodes = {
    'HELLO20': { discount: 20, type: 'percent', description: '20% скидка на первый заказ' },
    'WELCOME10': { discount: 10, type: 'percent', description: '10% скидка' },
    'FREEDELIVERY': { discount: 199, type: 'fixed', description: 'Бесплатная доставка' },
    'PIZZA50': { discount: 50, type: 'fixed', description: '50₽ скидка' }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize phone input mask
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) {
        phoneInput.addEventListener('input', handlePhoneInput);
    }
    
    // Initialize OTP inputs
    initOTPInputs();
    
    // Initialize card inputs
    setTimeout(initCardInputs, 100);

    // Splash screen
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                splash.classList.add('hidden');
                checkAuth();
            }, 300);
        }
    }, 1500);
});

function checkAuth() {
    if (AppState.token) {
        AppState.user = { phone: localStorage.getItem('user_phone') };
        initApp();
    } else {
        document.getElementById('auth-modal').classList.remove('hidden');
    }
}

function initApp() {
    document.getElementById('app-container').classList.remove('hidden');
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('location-modal').classList.add('hidden');

    bootstrapProfileData();
    
    // Check location
    if (!localStorage.getItem('location_granted')) {
        document.getElementById('location-modal').classList.remove('hidden');
    } else {
        loadUserLocation();
    }
    
    // Load data
    loadHomeData();
    updateCartBadge();
    updateProfileCounts();

    // Start background simulations (demo for mobile app)
    startOrderStatusSimulation();
    
    // User info
    if (AppState.user?.phone) {
        document.getElementById('user-phone').textContent = AppState.user.phone;
    }
}

function bootstrapProfileData() {
    // Ensure addresses
    if (!Array.isArray(AppState.addresses) || AppState.addresses.length === 0) {
        AppState.addresses = [{
            id: 'addr_' + Date.now(),
            label: 'Дом',
            city: 'Москва',
            line: 'ул. Примерная, д. 1',
            entrance: '1',
            floor: '8',
            apartment: '81',
            intercom: '81',
            comment: '',
            isDefault: true
        }];
        persistAddresses();
    }
    
    // Ensure payments
    if (!Array.isArray(AppState.payments) || AppState.payments.length === 0) {
        AppState.payments = [{
            id: 'pay_' + Date.now(),
            type: 'card',
            label: 'Основная карта',
            brand: 'VISA',
            last4: '4242',
            exp: '12/29',
            isDefault: true
        }];
        persistPayments();
    }
    
    // Ensure orders
    if (!Array.isArray(AppState.orders) || AppState.orders.length === 0) {
        AppState.orders = mockOrders;
        persistOrders();
    }
}

// ============================================
// AUTHENTICATION
// ============================================
function handlePhoneInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    
    let formatted = '';
    if (value.length > 0) {
        if (value[0] === '7' || value[0] === '8') {
            value = value.substring(1); // Remove 7/8
        }
    }
    
    if (value.length > 0) {
        formatted = '+7 (' + value.substring(0, 3);
    }
    if (value.length >= 4) {
        formatted += ') ' + value.substring(3, 6);
    }
    if (value.length >= 7) {
        formatted += '-' + value.substring(6, 8);
    }
    if (value.length >= 9) {
        formatted += '-' + value.substring(8, 10);
    }
    
    e.target.value = formatted;
}

function initOTPInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (this.value.length === 1) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
        });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

function sendSMSCode() {
    const phoneInput = document.getElementById('phone-input');
    const phone = phoneInput.value.replace(/\D/g, '');
    
    if (phone.length < 10) {
        showToast('Введите корректный номер телефона');
        return;
    }
    
    document.getElementById('auth-step-1').classList.add('hidden');
    document.getElementById('auth-step-2').classList.remove('hidden');
    document.getElementById('sent-phone-display').textContent = phoneInput.value;
    
    // Auto-fill demo code
    setTimeout(() => {
        const inputs = document.querySelectorAll('.otp-input');
        inputs.forEach((input, index) => {
            setTimeout(() => {
                input.value = '1';
            }, index * 100);
        });
    }, 500);
}

function verifyCode() {
    const inputs = document.querySelectorAll('.otp-input');
    const code = Array.from(inputs).map(input => input.value).join('');
    
    if (code.length !== 4) {
        showToast('Введите полный код');
        return;
    }
    
    const phone = document.getElementById('phone-input').value;
    AppState.user = { phone };
    AppState.token = 'jwt_' + Date.now();
    
    localStorage.setItem('auth_token', AppState.token);
    localStorage.setItem('user_phone', phone);
    
    initApp();
    showToast('Добро пожаловать!');
}

function resetAuth() {
    document.getElementById('auth-step-2').classList.add('hidden');
    document.getElementById('auth-step-1').classList.remove('hidden');
    document.querySelectorAll('.otp-input').forEach(input => input.value = '');
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        AppState.user = null;
        AppState.token = null;
        AppState.cart = [];
        
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_phone');
        localStorage.removeItem('cart');
        localStorage.removeItem('location_granted');
        
        location.reload();
    }
}

// ============================================
// GEOLOCATION
// ============================================
function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                AppState.location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                localStorage.setItem('location_granted', 'true');
                document.getElementById('location-modal').classList.add('hidden');
                loadUserLocation();
                showToast('Геолокация определена');
            },
            (error) => {
                selectLocationManually();
            }
        );
    } else {
        selectLocationManually();
    }
}

function selectLocationManually() {
    const city = prompt('Введите ваш город:', 'Москва');
    if (city) {
        localStorage.setItem('location_granted', 'true');
        AppState.location = { city, address: 'ул. Примерная, д. 1' };
        loadUserLocation();
    }
    document.getElementById('location-modal').classList.add('hidden');
}

function loadUserLocation() {
    const def = getDefaultAddress();
    if (def) {
        const text = `${def.city}, ${def.line}`;
        updateAddressDisplay(text);
        AppState.location = { city: def.city, address: def.line };
    } else if (AppState.location) {
        const text = AppState.location.city 
            ? `${AppState.location.city}, ${AppState.location.address || ''}`
            : 'Москва, ул. Примерная, 1';
        updateAddressDisplay(text);
    }
}

function updateAddressDisplay(text) {
    const headerAddr = document.getElementById('current-address');
    const checkoutAddr = document.getElementById('checkout-current-address');
    if (headerAddr) headerAddr.textContent = text;
    if (checkoutAddr) checkoutAddr.textContent = text;
}

// ============================================
// NAVIGATION
// ============================================
function showScreen(screenName, navElement = null) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const target = document.getElementById(`${screenName}-screen`);
    if (target) {
        target.classList.add('active');
        AppState.previousScreen = AppState.currentScreen;
        AppState.currentScreen = screenName;
    }
    
    // Update navigation
    if (navElement) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        navElement.classList.add('active');
    }
    
    // Load screen data
    switch(screenName) {
        case 'home': loadHomeData(); break;
        case 'catalog': loadCatalogData(); break;
        case 'cart': loadCartData(); break;
        case 'orders': loadOrdersData(); break;
        case 'profile': loadProfileData(); break;
        case 'addresses': loadAddressesData(); break;
        case 'payments': loadPaymentsData(); break;
        case 'favorites': loadFavoritesData(); break;
        case 'chef-detail': /* already loaded */ break;
        case 'checkout': loadCheckoutData(); break;
        case 'order-detail': /* loaded dynamically */ break;
        case 'admin': loadAdminData(); break;
    }
}

function goBack() {
    const prev = AppState.previousScreen || 'home';
    showScreen(prev);
}

function showHome() {
    const homeBtn = document.querySelector('.nav-item:nth-child(1)');
    showScreen('home', homeBtn);
}

function showCatalog() {
    const catalogBtn = document.querySelector('.nav-item:nth-child(2)');
    showScreen('catalog', catalogBtn);
}

function showOrders() {
    const ordersBtn = document.querySelector('.nav-item:nth-child(3)');
    showScreen('orders', ordersBtn);
}

function showCart() {
    const cartBtn = document.querySelector('.nav-item:nth-child(4)');
    showScreen('cart', cartBtn);
}

function showProfile() {
    const profileBtn = document.querySelector('.nav-item:nth-child(5)');
    showScreen('profile', profileBtn);
}

// ============================================
// HOME SCREEN
// ============================================
function loadHomeData() {
    // Render best dishes
    renderBestDishes();
    
    // Render chefs sections
    const nearbyChefs = mockChefs.filter(c => c.distance <= 5).slice(0, 3);
    const popularChefs = [...mockChefs].sort((a, b) => b.ordersCount - a.ordersCount).slice(0, 4);
    const newChefs = mockChefs.filter(c => c.ordersCount < 500).slice(0, 2);
    
    renderChefList('chefs-nearby', nearbyChefs);
    renderChefList('popular-chefs', popularChefs);
    renderChefList('new-chefs', newChefs);
}

function renderBestDishes() {
    const container = document.getElementById('best-dishes-home');
    if (!container) return;
    
    // Get popular dishes from all chefs
    const bestDishes = [];
    mockChefs.forEach(chef => {
        chef.dishes.forEach(dish => {
            if (dish.popular) {
                bestDishes.push({ ...dish, chefName: chef.name, chefId: chef.id, chefImage: chef.image });
            }
        });
    });
    
    container.innerHTML = bestDishes.map(dish => `
        <div class="flex-shrink-0 w-44 bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer" onclick="showChefDetail('${dish.chefId}')">
            <div class="relative">
                <img src="${dish.image}" alt="${dish.name}" class="w-full h-28 object-cover">
                <button onclick="toggleDishFavorite(event, '${dish.chefId}', '${dish.id}')" 
                        class="heart-btn absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center ${isDishFavorite(dish.chefId, dish.id) ? 'liked' : ''}">
                    <i class="far fa-heart ${isDishFavorite(dish.chefId, dish.id) ? 'fas' : 'far'}"></i>
                </button>
            </div>
            <div class="p-3">
                <h3 class="font-semibold text-sm truncate">${dish.name}</h3>
                <p class="text-xs text-gray-500 truncate">${dish.chefName}</p>
                <div class="flex items-center justify-between mt-2">
                    <span class="font-bold text-purple-600">${dish.price} ₽</span>
                    <button onclick="addDishToCart(event, '${dish.chefId}', '${dish.id}')" 
                            class="w-7 h-7 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center active:scale-90">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderChefList(containerId, chefs) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = chefs.map(chef => `
        <div class="chef-card bg-white rounded-2xl p-4 shadow-sm cursor-pointer active:scale-98" onclick="showChefDetail('${chef.id}')">
            <div class="flex items-start space-x-4">
                <img src="${chef.image}" alt="${chef.name}" 
                     class="w-16 h-16 rounded-2xl object-cover">
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                        <div class="min-w-0">
                            <div class="flex items-center gap-1">
                                <h3 class="font-semibold text-base truncate">${chef.name}</h3>
                                ${chef.verified ? '<i class="fas fa-check-circle text-blue-500 text-xs"></i>' : ''}
                            </div>
                            <p class="text-sm text-gray-600">${getCuisineName(chef.cuisine)}</p>
                        </div>
                        <div class="text-right flex-shrink-0 ml-2">
                            <div class="flex items-center text-xs text-gray-500">
                                <i class="fas fa-location-dot mr-1"></i>
                                <span>${chef.distance} км</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 mt-2 text-sm">
                        <div class="flex items-center gap-1">
                            <i class="fas fa-star text-yellow-400 text-xs"></i>
                            <span class="font-medium">${chef.rating}</span>
                        </div>
                        <div class="flex items-center gap-1 text-gray-500">
                            <i class="fas fa-shopping-bag text-xs"></i>
                            <span>${chef.ordersCount}</span>
                        </div>
                        <span class="text-gray-400">•</span>
                        <span class="text-purple-600 font-medium">от ${chef.avgPrice} ₽</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getCuisineName(cuisine) {
    const names = {
        russian: 'Русская кухня',
        italian: 'Итальянская кухня',
        asian: 'Азиатская кухня',
        european: 'Европейская кухня',
        caucasian: 'Кавказская кухня',
        mediterranean: 'Средиземноморская',
        fusion: 'Фьюжн'
    };
    return names[cuisine] || cuisine;
}

// ============================================
// CHEF DETAIL
// ============================================
function showChefDetail(chefId) {
    const chef = mockChefs.find(c => c.id === chefId);
    if (!chef) return;
    
    AppState.currentChef = chef;
    const content = document.getElementById('chef-detail-content');
    
    content.innerHTML = `
        <!-- Cover & Back -->
        <div class="relative">
            <img src="${chef.cover || chef.image}" alt="${chef.name}" class="w-full h-48 object-cover">
            <div class="absolute top-4 left-4">
                <button onclick="goBack()" class="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg active:scale-90">
                    <i class="fas fa-arrow-left"></i>
                </button>
            </div>
            <div class="absolute top-4 right-4">
                <button onclick="toggleChefFavorite(event, '${chef.id}')" 
                        class="heart-btn w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg ${isChefFavorite(chef.id) ? 'liked' : ''} active:scale-90">
                    <i class="far fa-heart ${isChefFavorite(chef.id) ? 'fas' : 'far'} ${isChefFavorite(chef.id) ? 'text-red-500' : ''}"></i>
                </button>
            </div>
        </div>
        
        <!-- Info -->
        <div class="p-4 -mt-6 relative">
            <div class="bg-white rounded-2xl p-4 shadow-lg">
                <div class="flex items-start gap-3">
                    <img src="${chef.image}" alt="${chef.name}" class="w-16 h-16 rounded-2xl object-cover -mt-10 border-4 border-white shadow-md">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <h1 class="text-xl font-bold">${chef.name}</h1>
                            ${chef.verified ? '<i class="fas fa-check-circle text-blue-500"></i>' : ''}
                        </div>
                        <p class="text-gray-600 text-sm">${getCuisineName(chef.cuisine)}</p>
                        <div class="flex items-center gap-4 mt-2 text-sm">
                            <div class="flex items-center gap-1">
                                <i class="fas fa-star text-yellow-400"></i>
                                <span class="font-semibold">${chef.rating}</span>
                            </div>
                            <div class="flex items-center gap-1 text-gray-500">
                                <i class="fas fa-shopping-bag"></i>
                                <span>${chef.ordersCount} заказов</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <p class="mt-4 text-gray-700">${chef.description}</p>
                ${chef.experience ? `<p class="mt-2 text-sm text-gray-500"><i class="fas fa-briefcase mr-1"></i>${chef.experience}</p>` : ''}
                
                <div class="flex items-center gap-2 mt-4 pt-4 border-t">
                    <i class="fas fa-location-dot text-gray-400"></i>
                    <span class="text-sm text-gray-600">${chef.distance} км от вас</span>
                    <span class="text-gray-400">•</span>
                    <span class="text-sm text-purple-600 font-medium">от ${chef.avgPrice} ₽</span>
                </div>
            </div>
            
            <!-- Menu -->
            <h2 class="text-lg font-bold mt-6 mb-3">Меню (${chef.dishes.length})</h2>
            <div class="space-y-3">
                ${chef.dishes.map(dish => `
                    <div class="dish-card bg-white rounded-2xl p-4 shadow-sm">
                        <div class="flex gap-4">
                            <img src="${dish.image}" alt="${dish.name}" class="w-24 h-24 rounded-xl object-cover flex-shrink-0">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <h3 class="font-semibold">${dish.name}</h3>
                                    <button onclick="toggleDishFavorite(event, '${chef.id}', '${dish.id}')" 
                                            class="heart-btn w-7 h-7 flex-shrink-0 ${isDishFavorite(chef.id, dish.id) ? 'liked' : ''}">
                                        <i class="far fa-heart ${isDishFavorite(chef.id, dish.id) ? 'fas text-red-500' : 'far'}"></i>
                                    </button>
                                </div>
                                <p class="text-sm text-gray-600 line-clamp-2 mt-1">${dish.description}</p>
                                <div class="flex items-center justify-between mt-2">
                                    <div>
                                        <span class="font-bold text-lg">${dish.price} ₽</span>
                                        <span class="text-sm text-gray-500 ml-1">${dish.weight}</span>
                                    </div>
                                    <button onclick="addDishToCart(event, '${chef.id}', '${dish.id}')" 
                                            class="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold active:scale-95">
                                        В корзину
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Reviews -->
            ${chef.reviews.length > 0 ? `
                <h2 class="text-lg font-bold mt-6 mb-3">Отзывы (${chef.reviews.length})</h2>
                <div class="space-y-3">
                    ${chef.reviews.map(review => `
                        <div class="bg-white rounded-2xl p-4 shadow-sm">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center gap-2">
                                    <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span class="font-semibold text-purple-600">${review.author[0]}</span>
                                    </div>
                                    <div>
                                        <p class="font-medium">${review.author}</p>
                                        <div class="flex items-center gap-1">
                                            ${renderStars(review.rating)}
                                            <span class="text-xs text-gray-500">${formatDate(review.date)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="mt-3 text-gray-700 text-sm">${review.text}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- Bottom padding -->
            <div class="h-8"></div>
        </div>
    `;
    
    showScreen('chef-detail');
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fas fa-star ${i <= rating ? 'text-yellow-400' : 'text-gray-300'} text-xs"></i>`;
    }
    return stars;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

// ============================================
// CATALOG
// ============================================
function loadCatalogData() {
    applyFilters();
    updateChefsCount();
}

function updateChefsCount() {
    const count = mockChefs.filter(c => c.dishes.length > 0).length;
    const el = document.getElementById('chefs-count');
    if (el) el.textContent = `${count} ${declension(count, ['повар', 'повара', 'поваров'])}`;
}

function applyFilters() {
    // Sync distance from slider (defensive)
    const slider = document.getElementById('distance-filter');
    if (slider) {
        const km = parseInt(slider.value, 10);
        if (!Number.isNaN(km)) {
            AppState.filters.distance = km;
            const label = document.getElementById('distance-value');
            if (label) label.textContent = `до ${km} км`;
        }
    }

    const filtered = mockChefs.filter(chef => {
        if (chef.dishes.length === 0) return false;
        
        const distanceMatch = chef.distance <= AppState.filters.distance;
        const ratingMatch = chef.rating >= AppState.filters.rating;
        const cuisineMatch = AppState.filters.cuisine === 'all' || chef.cuisine === AppState.filters.cuisine;
        const priceMatch = AppState.filters.price === 'all' ||
            (AppState.filters.price === 'low' && chef.avgPrice <= 350) ||
            (AppState.filters.price === 'medium' && chef.avgPrice > 350 && chef.avgPrice <= 500) ||
            (AppState.filters.price === 'high' && chef.avgPrice > 500);
        
        return distanceMatch && ratingMatch && cuisineMatch && priceMatch;
    });
    
    renderCatalogChefs(filtered);
}

function renderCatalogChefs(chefs) {
    const container = document.getElementById('catalog-chefs');
    if (!container) return;
    
    if (chefs.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-search text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Повара не найдены</p>
                <p class="text-sm text-gray-400">Попробуйте изменить фильтры</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = chefs.map(chef => `
        <div class="chef-card bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-98" onclick="showChefDetail('${chef.id}')">
            <div class="flex p-4">
                <img src="${chef.image}" alt="${chef.name}" class="w-20 h-20 rounded-2xl object-cover flex-shrink-0">
                <div class="flex-1 min-w-0 ml-4">
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="font-semibold text-lg">${chef.name}</h3>
                            <p class="text-sm text-gray-600">${getCuisineName(chef.cuisine)}</p>
                        </div>
                        <div class="text-right">
                            <div class="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
                                <i class="fas fa-star text-green-600 text-xs"></i>
                                <span class="font-bold text-green-700">${chef.rating}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
                        <span><i class="fas fa-location-dot mr-1"></i>${chef.distance} км</span>
                        <span><i class="fas fa-shopping-bag mr-1"></i>${chef.ordersCount}</span>
                        <span class="text-purple-600 font-medium">от ${chef.avgPrice} ₽</span>
                    </div>
                    <p class="text-sm text-gray-500 mt-2 line-clamp-1">${chef.description}</p>
                    <div class="flex items-center gap-1 mt-2">
                        ${chef.dishes.slice(0, 3).map(d => `
                            <img src="${d.image}" class="w-8 h-8 rounded-lg object-cover border border-gray-200" title="${d.name}">
                        `).join('')}
                        ${chef.dishes.length > 3 ? `<span class="text-xs text-gray-400 ml-1">+${chef.dishes.length - 3}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter functions
function setRatingFilter(rating, btn) {
    AppState.filters.rating = rating;
    document.querySelectorAll('.rating-filter').forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700');
    });
    btn.classList.add('bg-purple-600', 'text-white');
    btn.classList.remove('bg-gray-100', 'text-gray-700');
    applyFilters();
}

function setPriceFilter(price, btn) {
    AppState.filters.price = price;
    document.querySelectorAll('.price-filter').forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700');
    });
    btn.classList.add('bg-purple-600', 'text-white');
    btn.classList.remove('bg-gray-100', 'text-gray-700');
    applyFilters();
}

function setCuisineFilter(cuisine, btn) {
    AppState.filters.cuisine = cuisine;
    document.querySelectorAll('.cuisine-filter').forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700');
    });
    btn.classList.add('bg-purple-600', 'text-white');
    btn.classList.remove('bg-gray-100', 'text-gray-700');
    applyFilters();
}

function clearFilters() {
    AppState.filters = { distance: 10, rating: 0, cuisine: 'all', price: 'all' };
    document.getElementById('distance-filter').value = 10;
    document.getElementById('distance-value').textContent = 'до 10 км';
    
    // Reset button states
    const defaultButtons = [
        { selector: '.rating-filter', activeIndex: 0 },
        { selector: '.price-filter', activeIndex: 0 },
        { selector: '.cuisine-filter', activeIndex: 0 }
    ];
    
    defaultButtons.forEach(({ selector, activeIndex }) => {
        const btns = document.querySelectorAll(selector);
        btns.forEach((b, i) => {
            b.classList.remove('bg-purple-600', 'text-white');
            b.classList.add('bg-gray-100', 'text-gray-700');
            if (i === activeIndex) {
                b.classList.add('bg-purple-600', 'text-white');
                b.classList.remove('bg-gray-100', 'text-gray-700');
            }
        });
    });
    
    applyFilters();
}

function selectCategory(element, category) {
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.remove('active', 'bg-purple-600', 'text-white');
        chip.classList.add('bg-gray-100', 'text-gray-700');
    });
    element.classList.add('active', 'bg-purple-600', 'text-white');
    element.classList.remove('bg-gray-100', 'text-gray-700');
    
    if (category !== 'all') {
        const filtered = mockChefs.filter(chef => chef.cuisine === category && chef.dishes.length > 0);
        renderChefList('chefs-nearby', filtered.slice(0, 2));
        renderChefList('popular-chefs', filtered);
        renderChefList('new-chefs', filtered.slice(1));
    } else {
        loadHomeData();
    }
}

// ============================================
// CART
// ============================================
function addDishToCart(event, chefId, dishId) {
    if (event) event.stopPropagation();
    
    const chef = mockChefs.find(c => c.id === chefId);
    const dish = chef.dishes.find(d => d.id === dishId);
    if (!dish) return;
    
    // Check if cart is empty or same chef
    if (AppState.cart.length > 0 && AppState.cart[0].chefId !== chefId) {
        if (!confirm('В корзине блюда от другого повара. Очистить корзину?')) {
            return;
        }
        AppState.cart = [];
    }
    
    // Add to cart
    const existingItem = AppState.cart.find(item => item.dishId === dishId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        AppState.cart.push({
            chefId,
            chefName: chef.name,
            dishId: dish.id,
            dishName: dish.name,
            price: dish.price,
            image: dish.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartBadge();
    showToast('Добавлено в корзину');
}

function removeFromCart(dishId) {
    AppState.cart = AppState.cart.filter(item => item.dishId !== dishId);
    saveCart();
    loadCartData();
    updateCartBadge();
}

function updateCartQuantity(dishId, change) {
    const item = AppState.cart.find(item => item.dishId === dishId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(dishId);
        } else {
            saveCart();
            loadCartData();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(AppState.cart));
}

function updateCartBadge() {
    const total = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        if (total > 0) {
            badge.textContent = total > 99 ? '99+' : total;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function loadCartData() {
    const cartContent = document.getElementById('cart-content');
    const cartEmpty = document.getElementById('cart-empty');
    
    if (!cartContent || !cartEmpty) return;
    
    if (AppState.cart.length === 0) {
        cartContent.classList.add('hidden');
        cartEmpty.classList.remove('hidden');
        return;
    }
    
    cartContent.classList.remove('hidden');
    cartEmpty.classList.add('hidden');
    
    // Chef info
    const chef = AppState.cart[0];
    document.getElementById('cart-chef-info').innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas fa-hat-chef text-purple-600 text-xl"></i>
            <div>
                <p class="font-semibold">${chef.chefName}</p>
                <p class="text-sm text-gray-500">Блюда от одного повара</p>
            </div>
        </div>
    `;
    
    // Items
    document.getElementById('cart-items').innerHTML = AppState.cart.map(item => `
        <div class="bg-white rounded-xl p-3 flex items-center gap-3">
            <img src="${item.image}" alt="${item.dishName}" class="w-16 h-16 rounded-xl object-cover">
            <div class="flex-1 min-w-0">
                <h3 class="font-medium truncate">${item.dishName}</h3>
                <p class="text-gray-600">${item.price} ₽</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="updateCartQuantity('${item.dishId}', -1)" 
                        class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:scale-90">
                    <i class="fas fa-minus text-sm"></i>
                </button>
                <span class="w-8 text-center font-semibold">${item.quantity}</span>
                <button onclick="updateCartQuantity('${item.dishId}', 1)" 
                        class="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center active:scale-90">
                    <i class="fas fa-plus text-sm"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Totals
    const subtotal = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = AppState.checkout.discount;
    const delivery = calculateDeliveryCost(AppState.checkout.service || 'yandex', subtotal);
    const total = subtotal + delivery - discount;

    const deliveryEl = document.getElementById('cart-delivery');
    if (deliveryEl) deliveryEl.textContent = delivery === 0 ? 'Бесплатно' : `${delivery} ₽`;
    
    document.getElementById('cart-subtotal').textContent = `${subtotal} ₽`;
    document.getElementById('cart-total').textContent = `${total} ₽`;
    
    if (discount > 0) {
        document.getElementById('cart-discount').textContent = `-${discount} ₽`;
        document.getElementById('discount-row').classList.remove('hidden');
    } else {
        document.getElementById('discount-row').classList.add('hidden');
    }
}

// ============================================
// CHECKOUT
// ============================================
function startCheckout() {
    if (AppState.cart.length === 0) {
        showToast('Корзина пуста');
        return;
    }
    
    // Reset checkout state (keep promo/discount from cart)
    AppState.checkout = {
        step: 1,
        address: getDefaultAddress(),
        time: 'asap',
        datetime: null,
        service: AppState.checkout.service || 'yandex',
        payment: getDefaultPayment(),
        promo: AppState.checkout.promo,
        discount: AppState.checkout.discount || 0
    };
    
    showScreen('checkout');
    loadCheckoutData();
}

function loadCheckoutData() {
    updateCheckoutProgress();
    loadCheckoutStep();
}

function loadCheckoutStep() {
    const step = AppState.checkout.step;
    
    // Hide all steps
    document.querySelectorAll('.checkout-step').forEach(el => el.classList.add('hidden'));
    
    // Show current step
    const stepEl = document.getElementById(`checkout-step-${step}`);
    if (stepEl) stepEl.classList.remove('hidden');
    
    // Load step content
    switch(step) {
        case 1: loadCheckoutAddresses(); break;
        case 2: /* Time - static */ break;
        case 3: /* Delivery - static */ break;
        case 4: loadCheckoutPayments(); break;
        case 5: loadCheckoutConfirm(); break;
    }
}

function updateCheckoutProgress() {
    const step = AppState.checkout.step;
    
    // Update step dots
    for (let i = 1; i <= 5; i++) {
        const dot = document.querySelector(`.step-dot[data-step="${i}"]`);
        if (dot) {
            dot.classList.remove('active', 'bg-purple-600', 'text-white', 'bg-gray-200', 'text-gray-600');
            if (i < step) {
                dot.classList.add('bg-purple-600', 'text-white');
            } else if (i === step) {
                dot.classList.add('active', 'bg-purple-600', 'text-white');
            } else {
                dot.classList.add('bg-gray-200', 'text-gray-600');
            }
        }
    }
    
    // Update progress lines
    const lines = [
        ['progress-1-2', 1, step],
        ['progress-2-3', 2, step],
        ['progress-3-4', 3, step],
        ['progress-4-5', 4, step]
    ];
    
    lines.forEach(([id, from, current]) => {
        const line = document.getElementById(id);
        if (line) {
            line.style.width = current > from ? '100%' : '0%';
        }
    });
}

function loadCheckoutAddresses() {
    const container = document.getElementById('saved-addresses');
    if (!container) return;
    
    const addresses = AppState.addresses.slice().sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    const selectedId = AppState.checkout.address?.id || getDefaultAddress()?.id;
    
    container.innerHTML = addresses.map(addr => {
        const isSelected = addr.id === selectedId;
        const details = [addr.city, addr.line, addr.apartment].filter(Boolean).join(', ');
        
        return `
            <label class="block bg-white p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-purple-600' : 'border-gray-200'}">
                <input type="radio" name="checkout-address" value="${addr.id}" 
                       ${isSelected ? 'checked' : ''} class="sr-only" onchange="selectCheckoutAddress('${addr.id}')">
                <div class="flex items-start gap-3">
                    <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-home text-purple-600"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                            <p class="font-semibold">${addr.label}</p>
                            ${addr.isDefault ? '<span class="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">По умолчанию</span>' : ''}
                        </div>
                        <p class="text-sm text-gray-600 truncate">${details}</p>
                        ${addr.comment ? `<p class="text-xs text-gray-400 mt-1">${addr.comment}</p>` : ''}
                    </div>
                    <i class="fas fa-check-circle ${isSelected ? 'text-purple-600' : 'text-gray-300'}"></i>
                </div>
            </label>
        `;
    }).join('');
}

function selectCheckoutAddress(addressId) {
    const addr = AppState.addresses.find(a => a.id === addressId);
    if (addr) {
        AppState.checkout.address = addr;
        loadCheckoutAddresses(); // Update UI
    }
}

function updateDeliveryTime() {
    const time = document.querySelector('input[name="delivery_time"]:checked')?.value;
    AppState.checkout.time = time;
    
    const scheduleDiv = document.getElementById('schedule-time');
    if (scheduleDiv) {
        scheduleDiv.classList.toggle('hidden', time !== 'schedule');
    }
}

function loadCheckoutPayments() {
    const container = document.getElementById('checkout-payments');
    if (!container) return;
    
    const payments = AppState.payments.slice().sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
    const selectedId = AppState.checkout.payment?.id || getDefaultPayment()?.id;
    
    container.innerHTML = payments.map(p => {
        const isSelected = p.id === selectedId;
        const icon = p.type === 'wallet' 
            ? (p.walletType === 'apple' ? 'fab fa-apple' : 'fab fa-google')
            : 'fas fa-credit-card';
        const subtitle = p.type === 'wallet'
            ? (p.walletType === 'apple' ? 'Apple Pay' : 'Google Pay')
            : `${p.brand} •••• ${p.last4}`;
        
        return `
            <label class="block bg-white p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-purple-600' : 'border-gray-200'}">
                <input type="radio" name="checkout-payment" value="${p.id}" 
                       ${isSelected ? 'checked' : ''} class="sr-only" onchange="selectCheckoutPayment('${p.id}')">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <i class="${icon} text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <p class="font-semibold">${p.label}</p>
                        <p class="text-sm text-gray-500">${subtitle}</p>
                    </div>
                    <i class="fas fa-check-circle ${isSelected ? 'text-purple-600' : 'text-gray-300'}"></i>
                </div>
            </label>
        `;
    }).join('');
}

function selectCheckoutPayment(paymentId) {
    const payment = AppState.payments.find(p => p.id === paymentId);
    if (payment) {
        AppState.checkout.payment = payment;
        loadCheckoutPayments();
    }
}

function loadCheckoutConfirm() {
    const addr = AppState.checkout.address || getDefaultAddress();
    const payment = AppState.checkout.payment || getDefaultPayment();
    
    // Address display
    const addrEl = document.getElementById('checkout-address-display');
    if (addrEl) {
        addrEl.textContent = addr ? `${addr.city}, ${addr.line}, ${addr.apartment || ''}` : 'Не выбран';
    }
    
    // Time display
    const timeEl = document.getElementById('checkout-time-display');
    if (timeEl) {
        const time = AppState.checkout.time;
        if (time === 'asap') {
            timeEl.textContent = 'Как можно быстрее (~45-60 мин)';
        } else {
            const dt = document.getElementById('delivery-datetime')?.value;
            timeEl.textContent = dt ? new Date(dt).toLocaleString('ru-RU') : 'Запланировано';
        }
    }
    
    // Service display
    const serviceEl = document.getElementById('checkout-service-display');
    if (serviceEl) {
        const services = {
            yandex: 'Яндекс.Еда',
            dostavista: 'Dostavista',
            pickup: 'Самовывоз'
        };
        serviceEl.textContent = services[AppState.checkout.service] || AppState.checkout.service;
    }
    
    // Payment display
    const payEl = document.getElementById('checkout-payment-display');
    if (payEl && payment) {
        if (payment.type === 'wallet') {
            payEl.textContent = payment.walletType === 'apple' ? 'Apple Pay' : 'Google Pay';
        } else {
            payEl.textContent = `${payment.brand} •••• ${payment.last4}`;
        }
    }
    
    // Items
    document.getElementById('checkout-items').innerHTML = AppState.cart.map(item => `
        <div class="flex justify-between text-sm">
            <span>${item.dishName} ×${item.quantity}</span>
            <span>${item.price * item.quantity} ₽</span>
        </div>
    `).join('');
    
    // Totals
    const subtotal = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = AppState.checkout.discount;
    const delivery = calculateDeliveryCost(AppState.checkout.service, subtotal);
    const total = subtotal + delivery - discount;
    
    document.getElementById('checkout-subtotal').textContent = `${subtotal} ₽`;
    document.getElementById('checkout-delivery').textContent = delivery === 0 ? 'Бесплатно' : `${delivery} ₽`;
    document.getElementById('checkout-total').textContent = `${total} ₽`;
    
    if (discount > 0) {
        document.getElementById('checkout-discount').textContent = `-${discount} ₽`;
        document.getElementById('checkout-discount-row').classList.remove('hidden');
    } else {
        document.getElementById('checkout-discount-row').classList.add('hidden');
    }
}

function nextCheckoutStep() {
    if (AppState.checkout.step < 5) {
        AppState.checkout.step++;
        
        // Validate step 1
        if (AppState.checkout.step === 2 && !AppState.checkout.address) {
            showToast('Выберите адрес доставки');
            AppState.checkout.step = 1;
            return;
        }
        
        // Capture datetime if scheduled
        if (AppState.checkout.step === 3 && AppState.checkout.time === 'schedule') {
            const dtInput = document.getElementById('delivery-datetime');
            if (dtInput && dtInput.value) {
                AppState.checkout.datetime = dtInput.value;
            }
        }
        
        // Capture service
        if (AppState.checkout.step === 4) {
            const service = document.querySelector('input[name="delivery_service"]:checked')?.value;
            if (service) AppState.checkout.service = service;
            // Recalc cart totals immediately for UX consistency
            loadCheckoutConfirm();
        }
        
        // Validate payment step
        if (AppState.checkout.step === 5 && !AppState.checkout.payment) {
            showToast('Выберите способ оплаты');
            AppState.checkout.step = 4;
            return;
        }
        
        updateCheckoutProgress();
        loadCheckoutStep();
    }
}

function cancelCheckout() {
    showScreen('cart');
}

function confirmOrder() {
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    const subtotal = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const delivery = calculateDeliveryCost(AppState.checkout.service, subtotal);
    const total = subtotal + delivery - AppState.checkout.discount;
    
    const order = {
        id: orderId,
        chefId: AppState.cart[0].chefId,
        chefName: AppState.cart[0].chefName,
        chefImage: mockChefs.find(c => c.id === AppState.cart[0].chefId)?.image,
        status: 'accepted',
        statusText: 'Принят',
        statusColor: 'blue',
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        items: AppState.cart.map(item => ({
            name: item.dishName,
            price: item.price,
            quantity: item.quantity
        })),
        subtotal,
        delivery,
        total,
        discount: AppState.checkout.discount,
        deliveryTime: AppState.checkout.time === 'asap' 
            ? calculateDeliveryTime()
            : new Date(AppState.checkout.datetime).toLocaleString('ru-RU'),
        address: AppState.checkout.address,
        payment: AppState.checkout.payment,
        service: AppState.checkout.service
    };
    
    // Save order
    AppState.orders.unshift(order);
    persistOrders();
    
    // Clear cart
    AppState.cart = [];
    saveCart();
    updateCartBadge();
    
    // Reset promo
    AppState.checkout.promo = null;
    AppState.checkout.discount = 0;
    
    // Show success modal
    document.getElementById('success-order-id').textContent = orderId;
    document.getElementById('success-delivery-time').textContent = order.deliveryTime;
    document.getElementById('success-total').textContent = `${total} ₽`;
    document.getElementById('order-success-modal').classList.remove('hidden');
    
    // Track event
    trackEvent('purchase', { order_id: orderId, value: total });
}

function calculateDeliveryTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 45);
    const end = new Date(now.getTime() + 15 * 60000);
    return `${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
}

function closeOrderSuccess() {
    document.getElementById('order-success-modal').classList.add('hidden');
    showScreen('orders');
}

// ============================================
// PROMO CODES
// ============================================
function applyPromo() {
    const input = document.getElementById('promo-input');
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        showToast('Введите промокод');
        return;
    }
    
    const promo = promoCodes[code];
    if (!promo) {
        showToast('Промокод не найден');
        input.classList.add('border-red-500');
        return;
    }
    
    const subtotal = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = 0;
    
    if (promo.type === 'percent') {
        discount = Math.round(subtotal * promo.discount / 100);
    } else {
        discount = promo.discount;
    }
    
    AppState.checkout.promo = code;
    AppState.checkout.discount = discount;
    
    // Show result
    const result = document.getElementById('promo-result');
    result.innerHTML = `
        <div class="promo-applied p-3 rounded-xl flex items-center justify-between">
            <div>
                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                <span class="text-green-700 font-medium">${promo.description}</span>
            </div>
            <span class="text-green-600 font-bold">-${discount} ₽</span>
        </div>
    `;
    result.classList.remove('hidden');
    input.classList.remove('border-red-500');
    
    showToast('Промокод применён');
    loadCartData();
}

// ============================================
// ORDERS
// ============================================
function loadOrdersData() {
    const activeContainer = document.getElementById('active-orders');
    const completedContainer = document.getElementById('completed-orders');
    
    const activeOrders = AppState.orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    const completedOrders = AppState.orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
    
    // Active
    if (activeOrders.length === 0) {
        activeContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-clipboard-list text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Нет активных заказов</p>
            </div>
        `;
    } else {
        activeContainer.innerHTML = activeOrders.map(order => renderOrderCard(order)).join('');
    }
    
    // Completed
    if (completedOrders.length === 0) {
        completedContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-history text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Нет завершённых заказов</p>
            </div>
        `;
    } else {
        completedContainer.innerHTML = completedOrders.map(order => renderOrderCard(order)).join('');
    }
}

function renderOrderCard(order) {
    const statusColors = {
        accepted: 'bg-blue-100 text-blue-600',
        cooking: 'bg-orange-100 text-orange-600',
        ready: 'bg-yellow-100 text-yellow-600',
        'in-delivery': 'bg-purple-100 text-purple-600',
        delivered: 'bg-green-100 text-green-600',
        cancelled: 'bg-red-100 text-red-600'
    };
    
    return `
        <div class="order-card bg-white rounded-2xl p-4 shadow-sm cursor-pointer active:scale-98" onclick="showOrderDetail('${order.id}')">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                    <img src="${order.chefImage}" alt="${order.chefName}" class="w-12 h-12 rounded-xl object-cover">
                    <div>
                        <h3 class="font-semibold">${order.chefName}</h3>
                        <p class="text-sm text-gray-500">${order.date ? formatDate(order.date) : order.time}</p>
                    </div>
                </div>
                <span class="status-badge ${statusColors[order.status] || 'bg-gray-100'} px-3 py-1 rounded-full text-xs font-bold">
                    ${order.statusText}
                </span>
            </div>
            <p class="text-sm text-gray-700 mb-2 line-clamp-1">${order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}</p>
            <div class="flex items-center justify-between">
                <span class="font-bold text-purple-600">${order.total} ₽</span>
                <div class="flex items-center gap-2">
                    ${order.status === 'delivered' ? `
                        <button onclick="event.stopPropagation(); repeatOrder('${order.id}')" 
                                class="text-xs bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg font-medium">
                            Повторить
                        </button>
                    ` : ''}
                    <span class="text-xs text-gray-500">${order.deliveryTime}</span>
                </div>
            </div>
        </div>
    `;
}

function showOrderDetail(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const content = document.getElementById('order-detail-content');
    const statusSteps = ['accepted', 'cooking', 'ready', 'in-delivery', 'delivered'];
    const currentIndex = statusSteps.indexOf(order.status);
    
    content.innerHTML = `
        <div class="p-4">
            <div class="flex items-center gap-3 mb-4">
                <button onclick="goBack()" class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h1 class="text-xl font-bold">Заказ ${order.id}</h1>
            </div>
            
            <!-- Status -->
            <div class="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <div class="flex items-center justify-between mb-4">
                    <span class="font-semibold">Статус заказа</span>
                    <span class="px-3 py-1 bg-${order.statusColor}-100 text-${order.statusColor}-600 rounded-full text-sm font-bold">
                        ${order.statusText}
                    </span>
                </div>
                
                <!-- Progress -->
                <div class="relative">
                    <div class="flex justify-between mb-2">
                        ${statusSteps.map((step, i) => `
                            <div class="tracking-step ${i <= currentIndex ? (i === currentIndex ? 'active' : 'completed') : ''} text-center">
                                <div class="step-icon w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-1 text-xs font-bold">
                                    ${i < currentIndex ? '<i class="fas fa-check"></i>' : i + 1}
                                </div>
                                <span class="text-xs text-gray-500 hidden">${step}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex h-1 bg-gray-200 rounded-full -mt-4">
                        ${statusSteps.slice(0, -1).map((_, i) => `
                            <div class="flex-1 ${i < currentIndex ? 'bg-green-500' : ''} rounded-l-full"></div>
                        `).join('')}
                    </div>
                </div>
                
                ${order.status === 'in-delivery' ? `
                    <div class="mt-4 p-3 bg-purple-50 rounded-xl flex items-center gap-3">
                        <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center pulse-dot">
                            <i class="fas fa-motorcycle text-white"></i>
                        </div>
                        <div>
                            <p class="font-semibold">Курьер в пути</p>
                            <p class="text-sm text-gray-600">Прибудет к ${order.deliveryTime}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Info -->
            <div class="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <h3 class="font-semibold mb-3">Информация о заказе</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex items-start gap-2">
                        <i class="fas fa-store text-gray-400 mt-1"></i>
                        <div>
                            <p class="text-gray-600">Повар</p>
                            <p class="font-medium">${order.chefName}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-2">
                        <i class="fas fa-map-marker-alt text-gray-400 mt-1"></i>
                        <div>
                            <p class="text-gray-600">Адрес доставки</p>
                            <p class="font-medium">${order.address?.city}, ${order.address?.line}${order.address?.apartment ? ', кв. ' + order.address.apartment : ''}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-2">
                        <i class="fas fa-clock text-gray-400 mt-1"></i>
                        <div>
                            <p class="text-gray-600">Время</p>
                            <p class="font-medium">${order.time} • ${order.deliveryTime}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-2">
                        <i class="fas fa-truck text-gray-400 mt-1"></i>
                        <div>
                            <p class="text-gray-600">Доставка</p>
                            <p class="font-medium">${order.service === 'pickup' ? 'Самовывоз' : 'Курьер'}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Items -->
            <div class="bg-white rounded-2xl p-4 shadow-sm mb-4">
                <h3 class="font-semibold mb-3">Состав заказа</h3>
                <div class="space-y-2">
                    ${order.items.map(item => `
                        <div class="flex justify-between text-sm">
                            <span>${item.name} ×${item.quantity}</span>
                            <span>${item.price * item.quantity} ₽</span>
                        </div>
                    `).join('')}
                </div>
                <div class="border-t mt-3 pt-3 space-y-1">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Сумма</span>
                        <span>${order.subtotal} ₽</span>
                    </div>
                    ${order.discount > 0 ? `
                        <div class="flex justify-between text-sm text-green-600">
                            <span>Скидка</span>
                            <span>-${order.discount} ₽</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600">Доставка</span>
                        <span>${order.delivery} ₽</span>
                    </div>
                    <div class="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Итого</span>
                        <span>${order.total} ₽</span>
                    </div>
                </div>
            </div>
            
            ${order.status === 'delivered' ? `
                <button onclick="repeatOrder('${order.id}')" 
                        class="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg">
                    Повторить заказ
                </button>
            ` : ''}

            <!-- Admin demo controls -->
            <div class="mt-3">
                <button onclick="openAdminOrderModal('${order.id}')" class="w-full bg-gray-900 text-white py-3 rounded-xl font-bold active:scale-98">
                    <i class="fas fa-shield-alt mr-2"></i>Админ: сменить статус
                </button>
            </div>
        </div>
    `;
    
    showScreen('order-detail');
}

function repeatOrder(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Find chef
    const chef = mockChefs.find(c => c.id === order.chefId);
    if (!chef) {
        showToast('Повар не найден');
        return;
    }
    
    // Clear cart and add items
    AppState.cart = [];
    order.items.forEach(item => {
        const dish = chef.dishes.find(d => d.name === item.name);
        if (dish) {
            AppState.cart.push({
                chefId: chef.id,
                chefName: chef.name,
                dishId: dish.id,
                dishName: dish.name,
                price: dish.price,
                image: dish.image,
                quantity: item.quantity
            });
        }
    });
    
    saveCart();
    updateCartBadge();
    showCart();
    showToast('Заказ добавлен в корзину');
}

function switchTab(tab, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700');
    });
    btn.classList.add('bg-purple-600', 'text-white');
    btn.classList.remove('bg-gray-100', 'text-gray-700');
    
    document.getElementById('active-orders').classList.toggle('hidden', tab !== 'active');
    document.getElementById('completed-orders').classList.toggle('hidden', tab !== 'completed');
}

// ============================================
// FAVORITES
// ============================================
function showFavorites() {
    showScreen('favorites');
}

function loadFavoritesData() {
    renderFavorites();
}

function renderFavorites() {
    const chefContainer = document.getElementById('favorites-chefs');
    const dishContainer = document.getElementById('favorites-dishes');
    const emptyContainer = document.getElementById('favorites-empty');
    
    if (!chefContainer || !dishContainer) return;
    
    const favoriteChefs = mockChefs.filter(c => AppState.favorites.chefs.includes(c.id) && c.dishes.length > 0);
    const favoriteDishes = [];
    mockChefs.forEach(chef => {
        chef.dishes.forEach(dish => {
            if (AppState.favorites.dishes.includes(`${chef.id}:${dish.id}`)) {
                favoriteDishes.push({ ...dish, chefName: chef.name, chefId: chef.id });
            }
        });
    });
    
    // Chefs
    if (favoriteChefs.length === 0) {
        chefContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Нет избранных поваров</p>';
    } else {
        chefContainer.innerHTML = favoriteChefs.map(chef => `
            <div class="chef-card bg-white rounded-2xl p-4 shadow-sm cursor-pointer active:scale-98" onclick="showChefDetail('${chef.id}')">
                <div class="flex items-center space-x-3">
                    <img src="${chef.image}" alt="${chef.name}" class="w-14 h-14 rounded-xl object-cover">
                    <div class="flex-1">
                        <h3 class="font-semibold">${chef.name}</h3>
                        <p class="text-sm text-gray-600">${getCuisineName(chef.cuisine)}</p>
                        <div class="flex items-center gap-2 mt-1 text-sm">
                            <i class="fas fa-star text-yellow-400"></i>
                            <span>${chef.rating}</span>
                        </div>
                    </div>
                    <button onclick="event.stopPropagation(); toggleChefFavorite(null, '${chef.id}')" class="text-red-500">
                        <i class="fas fa-heart text-xl"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Dishes
    if (favoriteDishes.length === 0) {
        dishContainer.innerHTML = '<p class="text-center text-gray-500 py-8">Нет избранных блюд</p>';
    } else {
        dishContainer.innerHTML = favoriteDishes.map(dish => `
            <div class="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <img src="${dish.image}" alt="${dish.name}" class="w-16 h-16 rounded-xl object-cover">
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold truncate">${dish.name}</h3>
                    <p class="text-sm text-gray-600 truncate">${dish.chefName}</p>
                    <p class="font-bold text-purple-600 mt-1">${dish.price} ₽</p>
                </div>
                <button onclick="toggleDishFavorite(null, '${dish.chefId}', '${dish.id}')" class="text-red-500">
                    <i class="fas fa-heart text-xl"></i>
                </button>
            </div>
        `).join('');
    }
    
    // Empty state
    if (favoriteChefs.length === 0 && favoriteDishes.length === 0) {
        emptyContainer.classList.remove('hidden');
    } else {
        emptyContainer.classList.add('hidden');
    }
    
    updateProfileCounts();
}

function switchFavTab(tab, btn) {
    document.querySelectorAll('.fav-tab').forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white');
        b.classList.add('bg-gray-100', 'text-gray-700');
    });
    btn.classList.add('bg-purple-600', 'text-white');
    btn.classList.remove('bg-gray-100', 'text-gray-700');
    
    document.getElementById('favorites-chefs').classList.toggle('hidden', tab !== 'chefs');
    document.getElementById('favorites-dishes').classList.toggle('hidden', tab !== 'dishes');
}

function isChefFavorite(chefId) {
    return AppState.favorites.chefs.includes(chefId);
}

function isDishFavorite(chefId, dishId) {
    return AppState.favorites.dishes.includes(`${chefId}:${dishId}`);
}

function toggleChefFavorite(event, chefId) {
    if (event) event.stopPropagation();
    
    const index = AppState.favorites.chefs.indexOf(chefId);
    if (index > -1) {
        AppState.favorites.chefs.splice(index, 1);
        showToast('Удалено из избранного');
    } else {
        AppState.favorites.chefs.push(chefId);
        showToast('Добавлено в избранное');
    }
    
    persistFavorites();
    renderFavorites();
    
    // Re-render current view if needed
    if (AppState.currentScreen === 'chef-detail') {
        showChefDetail(chefId);
    }
}

function toggleDishFavorite(event, chefId, dishId) {
    if (event) event.stopPropagation();
    
    const key = `${chefId}:${dishId}`;
    const index = AppState.favorites.dishes.indexOf(key);
    if (index > -1) {
        AppState.favorites.dishes.splice(index, 1);
        showToast('Удалено из избранного');
    } else {
        AppState.favorites.dishes.push(key);
        showToast('Добавлено в избранное');
    }
    
    persistFavorites();
    
    // Update UI
    const btn = event?.target?.closest('.heart-btn');
    if (btn) {
        btn.classList.toggle('liked', index === -1);
        btn.querySelector('i').classList.toggle('fas', index === -1);
        btn.querySelector('i').classList.toggle('far', index !== -1);
        btn.querySelector('i').classList.toggle('text-red-500', index === -1);
    }
}

function persistFavorites() {
    localStorage.setItem('favorites', JSON.stringify(AppState.favorites));
}

// ============================================
// ADDRESSES
// ============================================
function showAddresses() {
    showScreen('addresses');
}

function loadAddressesData() {
    const container = document.getElementById('addresses-list');
    if (!container) return;
    
    if (AppState.addresses.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Адресов пока нет</p>';
        return;
    }
    
    container.innerHTML = AppState.addresses
        .slice()
        .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
        .map(addr => {
            const details = [addr.city, addr.line, addr.apartment].filter(Boolean).join(', ');
            
            return `
                <div class="bg-white rounded-2xl p-4 shadow-sm">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <p class="font-semibold">${addr.label}</p>
                                ${addr.isDefault ? '<span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">По умолчанию</span>' : ''}
                            </div>
                            <p class="text-sm text-gray-600">${details}</p>
                            ${addr.comment ? `<p class="text-xs text-gray-400 mt-2"><i class="fas fa-comment-alt mr-1"></i>${escapeHtml(addr.comment)}</p>` : ''}
                        </div>
                        <div class="flex flex-col gap-1">
                            ${!addr.isDefault ? `
                                <button onclick="setDefaultAddress('${addr.id}')" class="text-xs px-3 py-1.5 rounded-lg bg-purple-100 text-purple-600 font-medium">По умолч.</button>
                            ` : ''}
                            <button onclick="editAddress('${addr.id}')" class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600">Изменить</button>
                            <button onclick="deleteAddress('${addr.id}')" class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600">Удалить</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
    
    updateProfileCounts();
}

function openAddressModal(addressId = null) {
    const modal = document.getElementById('address-modal');
    const title = document.getElementById('address-modal-title');
    const form = document.getElementById('address-form');
    
    form.reset();
    document.getElementById('address-id').value = '';
    
    if (addressId) {
        const addr = AppState.addresses.find(a => a.id === addressId);
        if (addr) {
            title.textContent = 'Редактировать адрес';
            document.getElementById('address-id').value = addr.id;
            document.getElementById('address-label').value = addr.label || '';
            document.getElementById('address-city').value = addr.city || '';
            document.getElementById('address-line').value = addr.line || '';
            document.getElementById('address-entrance').value = addr.entrance || '';
            document.getElementById('address-floor').value = addr.floor || '';
            document.getElementById('address-apartment').value = addr.apartment || '';
            document.getElementById('address-intercom').value = addr.intercom || '';
            document.getElementById('address-comment').value = addr.comment || '';
            document.getElementById('address-default').checked = Boolean(addr.isDefault);
        }
    } else {
        title.textContent = 'Новый адрес';
    }
    
    modal.classList.remove('hidden');
}

function closeAddressModal() {
    document.getElementById('address-modal').classList.add('hidden');
}

function editAddress(addressId) {
    openAddressModal(addressId);
}

function saveAddress(e) {
    e.preventDefault();
    
    const id = document.getElementById('address-id').value || 'addr_' + Date.now();
    const payload = {
        id,
        label: document.getElementById('address-label').value.trim(),
        city: document.getElementById('address-city').value.trim(),
        line: document.getElementById('address-line').value.trim(),
        entrance: document.getElementById('address-entrance').value.trim(),
        floor: document.getElementById('address-floor').value.trim(),
        apartment: document.getElementById('address-apartment').value.trim(),
        intercom: document.getElementById('address-intercom').value.trim(),
        comment: document.getElementById('address-comment').value.trim(),
        isDefault: document.getElementById('address-default').checked
    };
    
    const existingIndex = AppState.addresses.findIndex(a => a.id === id);
    if (existingIndex >= 0) {
        AppState.addresses[existingIndex] = { ...AppState.addresses[existingIndex], ...payload };
    } else {
        AppState.addresses.push(payload);
    }
    
    if (payload.isDefault) {
        AppState.addresses = AppState.addresses.map(a => ({ ...a, isDefault: a.id === id }));
    }
    
    persistAddresses();
    closeAddressModal();
    loadAddressesData();
    syncDefaultAddressToUI();
    showToast('Адрес сохранён');
}

function deleteAddress(addressId) {
    const addr = AppState.addresses.find(a => a.id === addressId);
    if (!addr) return;
    if (!confirm(`Удалить адрес "${addr.label}"?`)) return;
    
    AppState.addresses = AppState.addresses.filter(a => a.id !== addressId);
    
    if (AppState.addresses.length > 0 && !AppState.addresses.some(a => a.isDefault)) {
        AppState.addresses[0].isDefault = true;
    }
    
    persistAddresses();
    loadAddressesData();
    syncDefaultAddressToUI();
    showToast('Адрес удалён');
}

function setDefaultAddress(addressId) {
    AppState.addresses = AppState.addresses.map(a => ({ ...a, isDefault: a.id === addressId }));
    persistAddresses();
    loadAddressesData();
    syncDefaultAddressToUI();
    showToast('Адрес выбран по умолчанию');
}

function getDefaultAddress() {
    return AppState.addresses.find(a => a.isDefault) || AppState.addresses[0] || null;
}

function syncDefaultAddressToUI() {
    const def = getDefaultAddress();
    if (def) {
        const text = `${def.city}, ${def.line}`;
        updateAddressDisplay(text);
    }
}

function persistAddresses() {
    localStorage.setItem('addresses', JSON.stringify(AppState.addresses));
}

// ============================================
// PAYMENTS
// ============================================
function showPayments() {
    showScreen('payments');
}

function loadPaymentsData() {
    const container = document.getElementById('payments-list');
    if (!container) return;
    
    if (AppState.payments.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Способов оплаты пока нет</p>';
        return;
    }
    
    container.innerHTML = AppState.payments
        .slice()
        .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
        .map(p => {
            const icon = p.type === 'wallet' 
                ? (p.walletType === 'apple' ? 'fab fa-apple' : 'fab fa-google')
                : 'fas fa-credit-card';
            const subtitle = p.type === 'wallet'
                ? (p.walletType === 'apple' ? 'Apple Pay' : 'Google Pay')
                : `${p.brand} •••• ${p.last4}`;
            
            return `
                <div class="bg-white rounded-2xl p-4 shadow-sm">
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                                <i class="${icon} text-xl"></i>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <p class="font-semibold">${p.label}</p>
                                    ${p.isDefault ? '<span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">По умолч.</span>' : ''}
                                </div>
                                <p class="text-sm text-gray-600">${subtitle}</p>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            ${!p.isDefault ? `
                                <button onclick="setDefaultPayment('${p.id}')" class="text-xs px-3 py-1.5 rounded-lg bg-purple-100 text-purple-600 font-medium">По умолч.</button>
                            ` : ''}
                            ${p.type === 'card' ? `
                                <button onclick="editPayment('${p.id}')" class="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600">Изменить</button>
                            ` : ''}
                            <button onclick="deletePayment('${p.id}')" class="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600">Удалить</button>
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
    
    updateProfileCounts();
}

function initCardInputs() {
    const pan = document.getElementById('payment-pan');
    const exp = document.getElementById('payment-exp');
    const cvc = document.getElementById('payment-cvc');
    
    if (pan) {
        pan.addEventListener('input', handleCardPanInput);
    }
    if (exp) {
        exp.addEventListener('input', handleCardExpInput);
    }
    if (cvc) {
        cvc.addEventListener('input', handleCardCvcInput);
    }
}

function handleCardPanInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    const groups = value.match(/.{1,4}/g) || [];
    e.target.value = groups.join(' ');
}

function handleCardExpInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 3) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    e.target.value = value;
}

function handleCardCvcInput(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
}

function openPaymentModal(paymentId = null) {
    const modal = document.getElementById('payment-modal');
    const title = document.getElementById('payment-modal-title');
    const form = document.getElementById('payment-form');
    
    form.reset();
    document.getElementById('payment-id').value = '';
    
    if (paymentId) {
        const p = AppState.payments.find(x => x.id === paymentId);
        if (p && p.type === 'card') {
            title.textContent = 'Редактировать карту';
            document.getElementById('payment-id').value = p.id;
            document.getElementById('payment-label').value = p.label || '';
            document.getElementById('payment-pan').value = `**** **** **** ${p.last4}`;
            document.getElementById('payment-exp').value = p.exp || '';
            document.getElementById('payment-cvc').value = '';
            document.getElementById('payment-default').checked = Boolean(p.isDefault);
        }
    } else {
        title.textContent = 'Новая карта';
    }
    
    modal.classList.remove('hidden');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
}

function editPayment(paymentId) {
    openPaymentModal(paymentId);
}

function savePayment(e) {
    e.preventDefault();
    
    const panRaw = document.getElementById('payment-pan').value.replace(/\D/g, '');
    
    if (panRaw.length < 12) {
        showToast('Введите корректный номер карты');
        return;
    }
    
    const id = document.getElementById('payment-id').value || 'pay_' + Date.now();
    const last4 = panRaw.slice(-4);
    const brand = panRaw[0] === '4' ? 'VISA' : (panRaw[0] === '5' ? 'MC' : 'МИР');
    
    const payload = {
        id,
        type: 'card',
        label: document.getElementById('payment-label').value.trim() || 'Карта',
        brand,
        last4,
        exp: document.getElementById('payment-exp').value,
        isDefault: document.getElementById('payment-default').checked
    };
    
    const existingIndex = AppState.payments.findIndex(p => p.id === id);
    if (existingIndex >= 0) {
        AppState.payments[existingIndex] = { ...AppState.payments[existingIndex], ...payload };
    } else {
        AppState.payments.push(payload);
    }
    
    if (payload.isDefault) {
        AppState.payments = AppState.payments.map(p => ({ ...p, isDefault: p.id === id }));
    }
    
    persistPayments();
    closePaymentModal();
    loadPaymentsData();
    showToast('Карта сохранена');
}

function deletePayment(paymentId) {
    const p = AppState.payments.find(x => x.id === paymentId);
    if (!p) return;
    if (!confirm(`Удалить "${p.label}"?`)) return;
    
    AppState.payments = AppState.payments.filter(x => x.id !== paymentId);
    
    if (AppState.payments.length > 0 && !AppState.payments.some(p => p.isDefault)) {
        AppState.payments[0].isDefault = true;
    }
    
    persistPayments();
    loadPaymentsData();
    showToast('Удалено');
}

function setDefaultPayment(paymentId) {
    AppState.payments = AppState.payments.map(p => ({ ...p, isDefault: p.id === paymentId }));
    persistPayments();
    loadPaymentsData();
    showToast('Способ оплаты выбран');
}

function addWallet(walletType) {
    const existing = AppState.payments.find(p => p.type === 'wallet' && p.walletType === walletType);
    if (existing) {
        setDefaultPayment(existing.id);
        showToast('Уже подключено');
        return;
    }
    
    const p = {
        id: 'pay_' + Date.now(),
        type: 'wallet',
        walletType,
        label: walletType === 'apple' ? 'Apple Pay' : 'Google Pay',
        isDefault: true
    };
    
    AppState.payments = AppState.payments.map(x => ({ ...x, isDefault: false }));
    AppState.payments.unshift(p);
    persistPayments();
    loadPaymentsData();
    showToast('Подключено');
}

function getDefaultPayment() {
    return AppState.payments.find(p => p.isDefault) || AppState.payments[0] || null;
}

function persistPayments() {
    localStorage.setItem('payments', JSON.stringify(AppState.payments));
}

// ============================================
// PROFILE
// ============================================
function loadProfileData() {
    if (AppState.user?.phone) {
        document.getElementById('user-phone').textContent = AppState.user.phone;
    }
    updateProfileCounts();
}

function updateProfileCounts() {
    const addrCount = AppState.addresses.length;
    const payCount = AppState.payments.filter(p => p.type === 'card').length;
    const favCount = AppState.favorites.chefs.length + AppState.favorites.dishes.length;
    
    const addrEl = document.getElementById('profile-address-count');
    const payEl = document.getElementById('profile-payment-count');
    const favEl = document.getElementById('profile-favorites-count');
    
    if (addrEl) addrEl.textContent = `${addrCount} ${declension(addrCount, ['адрес', 'адреса', 'адресов'])}`;
    if (payEl) payEl.textContent = `${payCount} ${declension(payCount, ['карта', 'карты', 'карт'])}`;
    if (favEl) favEl.textContent = `${favCount} ${declension(favCount, ['в избранном', 'в избранном', 'в избранном'])}`;
}

function showSupport() {
    alert('📞 Поддержка: 8 (800) 555-35-35\n\nЧат в приложении скоро будет доступен!');
}

function showAbout() {
    alert('🍽️ От-Личный повар\nВерсия 1.0.0\n\nДоставка еды от лучших поваров вашего города.\n\n© 2024');
}

// ============================================
// SEARCH
// ============================================
function toggleSearch() {
    const bar = document.getElementById('search-bar');
    const input = document.getElementById('search-input');
    
    if (bar.classList.contains('hidden')) {
        bar.classList.remove('hidden');
        input.focus();
    } else {
        closeSearch();
    }
}

function closeSearch() {
    const bar = document.getElementById('search-bar');
    const results = document.getElementById('search-results');
    const input = document.getElementById('search-input');
    
    bar.classList.add('hidden');
    results.classList.add('hidden');
    results.innerHTML = '';
    input.value = '';
}

function handleSearch(query) {
    const results = document.getElementById('search-results');
    
    if (query.length < 2) {
        results.classList.add('hidden');
        results.innerHTML = '';
        return;
    }
    
    const q = query.toLowerCase();
    
    // Search in chefs
    const matchedChefs = mockChefs.filter(c => 
        c.name.toLowerCase().includes(q) || 
        getCuisineName(c.cuisine).toLowerCase().includes(q)
    ).filter(c => c.dishes.length > 0);
    
    // Search in dishes
    const matchedDishes = [];
    mockChefs.forEach(chef => {
        chef.dishes.forEach(dish => {
            if (dish.name.toLowerCase().includes(q) || dish.description.toLowerCase().includes(q)) {
                matchedDishes.push({ ...dish, chefName: chef.name, chefId: chef.id });
            }
        });
    });
    
    let html = '';
    
    if (matchedChefs.length > 0) {
        html += `<div class="mb-3"><p class="text-xs text-gray-500 mb-2 px-1">Повара</p>`;
        html += matchedChefs.slice(0, 3).map(chef => `
            <div onclick="showChefDetail('${chef.id}'); closeSearch();" 
                 class="flex items-center gap-3 p-3 bg-white rounded-xl mb-2 cursor-pointer active:bg-gray-50">
                <img src="${chef.image}" class="w-10 h-10 rounded-lg object-cover">
                <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">${chef.name}</p>
                    <p class="text-sm text-gray-500">${getCuisineName(chef.cuisine)}</p>
                </div>
            </div>
        `).join('');
        html += '</div>';
    }
    
    if (matchedDishes.length > 0) {
        html += `<div><p class="text-xs text-gray-500 mb-2 px-1">Блюда</p>`;
        html += matchedDishes.slice(0, 5).map(dish => `
            <div onclick="addDishToCart(null, '${dish.chefId}', '${dish.id}'); closeSearch();" 
                 class="flex items-center gap-3 p-3 bg-white rounded-xl mb-2 cursor-pointer active:bg-gray-50">
                <img src="${dish.image}" class="w-10 h-10 rounded-lg object-cover">
                <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">${dish.name}</p>
                    <p class="text-sm text-gray-500">${dish.chefName} • ${dish.price} ₽</p>
                </div>
                <i class="fas fa-plus-circle text-purple-600"></i>
            </div>
        `).join('');
        html += '</div>';
    }
    
    if (html === '') {
        html = '<p class="text-center text-gray-500 py-4">Ничего не найдено</p>';
    }
    
    results.innerHTML = html;
    results.classList.remove('hidden');
}

// ============================================
// BECOME A CHEF
// ============================================
function showBeChefForm() {
    document.getElementById('chef-apply-modal').classList.remove('hidden');
}

function closeChefModal() {
    document.getElementById('chef-apply-modal').classList.add('hidden');
}

function submitChefApplication(e) {
    e.preventDefault();
    
    const form = e.target;
    const payload = {
        id: 'app_' + Date.now(),
        fullName: form.fullName?.value?.trim() || '',
        phone: form.phone?.value?.trim() || '',
        cuisine: form.cuisine?.value || '',
        experience: form.experience?.value?.trim() || '',
        avgPrice: parseInt(form.avgPrice?.value) || 400,
        portfolio: form.portfolio?.value?.trim() || '',
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    // Save application
    AppState.chefApplications.unshift(payload);
    localStorage.setItem('chef_applications', JSON.stringify(AppState.chefApplications));
    
    showToast('Заявка отправлена! Мы свяжемся с вами.');
    closeChefModal();
    form.reset();
}

// ============================================
// ADMIN PANEL
// ============================================
function showAdmin() {
    showScreen('admin');
}

function loadAdminData() {
    // Stats
    const todayOrders = AppState.orders.filter(o => {
        const orderDate = new Date(o.date).toDateString();
        return orderDate === new Date().toDateString();
    }).length;
    
    const todayRevenue = AppState.orders
        .filter(o => {
            const orderDate = new Date(o.date).toDateString();
            return orderDate === new Date().toDateString();
        })
        .reduce((sum, o) => sum + o.total, 0);
    
    document.getElementById('admin-orders-count').textContent = todayOrders;
    document.getElementById('admin-revenue').textContent = formatNumber(todayRevenue) + ' ₽';
    
    // Applications
    const appsCount = AppState.chefApplications.filter(a => a.status === 'pending').length;
    document.getElementById('admin-apps-count').textContent = appsCount;
    
    const appsContainer = document.getElementById('admin-applications');
    const pendingApps = AppState.chefApplications.filter(a => a.status === 'pending').slice(0, 5);
    
    if (pendingApps.length === 0) {
        appsContainer.innerHTML = '<div class="p-4 text-center text-gray-500">Нет новых заявок</div>';
    } else {
        appsContainer.innerHTML = pendingApps.map(app => `
            <div class="p-4">
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <h3 class="font-semibold">${escapeHtml(app.fullName)}</h3>
                        <p class="text-sm text-gray-600">${app.phone}</p>
                    </div>
                    <span class="text-xs text-gray-400">${formatDate(app.createdAt)}</span>
                </div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">${getCuisineName(app.cuisine)}</span>
                    <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">${app.avgPrice} ₽</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${escapeHtml(app.experience).slice(0, 100)}${(app.experience || '').length > 100 ? '...' : ''}</p>
                ${app.portfolio ? `<a href="${app.portfolio}" target="_blank" class="text-xs text-purple-600 mb-3 block">Портфолио →</a>` : ''}
                <div class="flex gap-2">
                    <button onclick="adminApprove('${app.id}')" class="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-bold active:scale-95">Одобрить</button>
                    <button onclick="adminReject('${app.id}')" class="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-bold active:scale-95">Отклонить</button>
                </div>
            </div>
        `).join('');
    }
    
    // Couriers
    const couriersContainer = document.getElementById('admin-couriers');
    const couriers = [
        { name: 'Алексей К.', service: 'Яндекс', status: 'on_order', avatar: 'A' },
        { name: 'Мария С.', service: 'Dostavista', status: 'free', avatar: 'M' },
        { name: 'Дмитрий П.', service: 'Яндекс', status: 'free', avatar: 'Д' }
    ];
    
    couriersContainer.innerHTML = couriers.map(courier => `
        <div class="p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-bold text-purple-600">
                    ${courier.avatar}
                </div>
                <div>
                    <p class="font-medium">${courier.name}</p>
                    <p class="text-sm text-gray-500">${courier.service}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full ${courier.status === 'free' ? 'bg-green-500' : 'bg-orange-500'}"></div>
                <span class="text-sm ${courier.status === 'free' ? 'text-green-600' : 'text-orange-600'}">
                    ${courier.status === 'free' ? 'Свободен' : 'На заказе'}
                </span>
            </div>
        </div>
    `).join('');
}

function adminApprove(appId) {
    const app = AppState.chefApplications.find(a => a.id === appId);
    if (!app) return;
    
    app.status = 'approved';
    localStorage.setItem('chef_applications', JSON.stringify(AppState.chefApplications));
    
    // Create new chef from application
    const newChef = {
        id: 'chef_' + Date.now(),
        name: app.fullName.split(' ')[0] + ' ' + (app.fullName.split(' ')[1] || ''),
        rating: 4.5,
        ordersCount: 0,
        distance: Math.random() * 5 + 1,
        cuisine: app.cuisine,
        avgPrice: app.avgPrice,
        image: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=200&h=200&fit=crop&crop=face',
        cover: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=200&fit=crop',
        description: app.experience.slice(0, 100),
        experience: app.experience,
        verified: false,
        reviews: [],
        dishes: [
            {
                id: 'dish_new_' + Date.now(),
                name: 'Фирменное блюдо',
                description: 'Попробуйте наше фирменное блюдо от шефа!',
                price: app.avgPrice,
                weight: '300г',
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
                popular: true,
                isFavorite: false
            }
        ]
    };
    
    mockChefs.unshift(newChef);
    
    showToast('Заявка одобрена. Повар добавлен в каталог!');
    loadAdminData();
}

function adminReject(appId) {
    const app = AppState.chefApplications.find(a => a.id === appId);
    if (!app) return;
    
    app.status = 'rejected';
    localStorage.setItem('chef_applications', JSON.stringify(AppState.chefApplications));
    
    showToast('Заявка отклонена');
    loadAdminData();
}

function persistOrders() {
    localStorage.setItem('orders', JSON.stringify(AppState.orders));
}

// ============================================
// DELIVERY (Pricing)
// ============================================
function calculateDeliveryCost(service, subtotal) {
    // Demo pricing model
    // - pickup: free
    // - yandex: 99 ₽ base, free from 1000 ₽
    // - dostavista: 149 ₽ base, free from 1500 ₽
    const s = service || 'yandex';
    if (s === 'pickup') return 0;

    if (s === 'yandex') {
        return subtotal >= 1000 ? 0 : 199;
    }

    if (s === 'dostavista') {
        return subtotal >= 1500 ? 0 : 249;
    }

    return 199;
}

// ============================================
// ADDRESS SELECTOR (Header)
// ============================================
function openAddressSelector() {
    const modal = document.getElementById('address-selector-modal');
    const list = document.getElementById('address-selector-list');
    if (!modal || !list) return;

    const addresses = (AppState.addresses || []).slice().sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

    if (addresses.length === 0) {
        list.innerHTML = `
            <div class="text-center text-gray-500 py-6">
                <i class="fas fa-map-marker-alt text-4xl text-gray-300 mb-3"></i>
                <p class="font-medium">Адресов нет</p>
                <p class="text-xs text-gray-400 mt-1">Добавьте адрес для доставки</p>
            </div>
        `;
    } else {
        list.innerHTML = addresses.map(addr => {
            const details = [addr.city, addr.line, addr.apartment ? `кв. ${addr.apartment}` : ''].filter(Boolean).join(', ');
            return `
                <button onclick="setDefaultAddressFromSelector('${addr.id}')" class="w-full text-left p-4 rounded-xl border ${addr.isDefault ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white'} active:bg-gray-50">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-xl ${addr.isDefault ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'} flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-location-dot"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2">
                                <p class="font-semibold">${escapeHtml(addr.label || 'Адрес')}</p>
                                ${addr.isDefault ? '<span class="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">По умолчанию</span>' : ''}
                            </div>
                            <p class="text-sm text-gray-600 truncate">${escapeHtml(details)}</p>
                        </div>
                        <i class="fas fa-check ${addr.isDefault ? 'text-purple-600' : 'text-gray-300'} mt-1"></i>
                    </div>
                </button>
            `;
        }).join('');
    }

    modal.classList.remove('hidden');
}

function closeAddressSelector() {
    document.getElementById('address-selector-modal')?.classList.add('hidden');
}

function setDefaultAddressFromSelector(addressId) {
    setDefaultAddress(addressId);
    closeAddressSelector();
}

// ============================================
// ADMIN: ORDER STATUS CONTROL (Demo)
// ============================================
function openAdminOrderModal(orderId) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('admin-order-modal');
    const title = document.getElementById('admin-order-title');
    const list = document.getElementById('admin-order-status-buttons');
    if (!modal || !title || !list) return;

    title.textContent = `${order.id} • ${order.chefName}`;

    const statusFlow = [
        { status: 'accepted', text: 'Принят', color: 'blue' },
        { status: 'cooking', text: 'Готовится', color: 'orange' },
        { status: 'ready', text: 'Готов', color: 'yellow' },
        { status: 'in-delivery', text: 'В пути', color: 'purple' },
        { status: 'delivered', text: 'Доставлен', color: 'green' },
        { status: 'cancelled', text: 'Отменён', color: 'red' }
    ];

    list.innerHTML = statusFlow.map(s => `
        <button onclick="adminSetOrderStatus('${orderId}', '${s.status}')" class="w-full flex items-center justify-between p-3 rounded-xl border ${order.status === s.status ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'} active:bg-gray-50">
            <span class="font-semibold">${s.text}</span>
            <span class="text-xs px-2 py-1 rounded-full bg-${s.color}-100 text-${s.color}-700">${s.status}</span>
        </button>
    `).join('');

    modal.classList.remove('hidden');
}

function closeAdminOrderModal() {
    document.getElementById('admin-order-modal')?.classList.add('hidden');
}

function adminSetOrderStatus(orderId, status) {
    const order = AppState.orders.find(o => o.id === orderId);
    if (!order) return;

    const map = {
        accepted: { text: 'Принят', color: 'blue' },
        cooking: { text: 'Готовится', color: 'orange' },
        ready: { text: 'Готов', color: 'yellow' },
        'in-delivery': { text: 'В пути', color: 'purple' },
        delivered: { text: 'Доставлен', color: 'green' },
        cancelled: { text: 'Отменён', color: 'red' }
    };

    order.status = status;
    order.statusText = map[status]?.text || status;
    order.statusColor = map[status]?.color || 'gray';

    persistOrders();
    showToast(`Статус заказа ${order.id}: ${order.statusText}`);

    // Refresh UI screens if open
    if (AppState.currentScreen === 'orders') loadOrdersData();
    if (AppState.currentScreen === 'order-detail') showOrderDetail(orderId);

    closeAdminOrderModal();
}

// ============================================
// ORDER STATUS SIMULATION (Demo realtime)
// ============================================
function startOrderStatusSimulation() {
    // Avoid multiple intervals
    if (AppState.timers.orderStatusIntervalId) {
        clearInterval(AppState.timers.orderStatusIntervalId);
        AppState.timers.orderStatusIntervalId = null;
    }

    const flow = ['accepted', 'cooking', 'ready', 'in-delivery', 'delivered'];
    const map = {
        accepted: { text: 'Принят', color: 'blue' },
        cooking: { text: 'Готовится', color: 'orange' },
        ready: { text: 'Готов', color: 'yellow' },
        'in-delivery': { text: 'В пути', color: 'purple' },
        delivered: { text: 'Доставлен', color: 'green' }
    };

    AppState.timers.orderStatusIntervalId = setInterval(() => {
        // Find one active order to progress
        const active = AppState.orders.find(o => !['delivered', 'cancelled'].includes(o.status));
        if (!active) return;

        const idx = flow.indexOf(active.status);
        if (idx === -1) return;
        if (idx >= flow.length - 1) return;

        const next = flow[idx + 1];
        active.status = next;
        active.statusText = map[next].text;
        active.statusColor = map[next].color;

        persistOrders();

        // lightweight UX: toast
        showToast(`Заказ ${active.id}: ${active.statusText}`);

        // Refresh visible screens
        if (AppState.currentScreen === 'orders') loadOrdersData();
        if (AppState.currentScreen === 'order-detail') showOrderDetail(active.id);
    }, 12000); // every 12s progress
}

// ============================================
// FILTERS: Distance slider
// ============================================
(function initDistanceFilterLabelSync() {
    // attach once
    document.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'distance-filter') {
            const km = parseInt(e.target.value, 10) || 10;
            AppState.filters.distance = km;
            const label = document.getElementById('distance-value');
            if (label) label.textContent = `до ${km} км`;
        }
    });
})();

// ============================================
// UTILITIES
// ============================================
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function declension(num, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[(num % 100 > 4 && num % 100 < 20) ? 2 : cases[(num % 10 < 5) ? num % 10 : 5]];
}

function formatNumber(num) {
    return num.toLocaleString('ru-RU');
}

// Close modals on backdrop click
document.addEventListener('click', function(e) {
    const modals = [
        { id: 'auth-modal', close: closeAuthModal },
        { id: 'location-modal', close: () => {} },
        { id: 'chef-apply-modal', close: closeChefModal },
        { id: 'address-modal', close: closeAddressModal },
        { id: 'payment-modal', close: closePaymentModal },
        { id: 'order-success-modal', close: closeOrderSuccess },
        { id: 'address-selector-modal', close: closeAddressSelector },
        { id: 'admin-order-modal', close: closeAdminOrderModal }
    ];
    
    modals.forEach(({ id, close }) => {
        const modal = document.getElementById(id);
        if (modal && !modal.classList.contains('hidden') && e.target === modal) {
            close();
        }
    });
});

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

// ============================================
// ANALYTICS
// ============================================
function trackEvent(eventName, params = {}) {
    console.log('📊 Analytics:', eventName, params);
    // Firebase/AppMetrica would go here
}

// Click tracking
document.addEventListener('click', function(e) {
    const target = e.target;
    
    if (target.textContent === 'В корзину') {
        const dishName = target.closest('.dish-card')?.querySelector('h3')?.textContent;
        trackEvent('add_to_cart', { item: dishName });
    }
    
    if (target.textContent === 'Оформить заказ') {
        const value = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        trackEvent('begin_checkout', { value });
    }
    
    if (target.textContent === 'Подтвердить заказ') {
        const orderId = document.getElementById('success-order-id')?.textContent;
        const value = AppState.cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + 199;
        trackEvent('purchase', { order_id: orderId, value });
    }
});

// ============================================
// PERFORMANCE MONITORING
// ============================================
window.addEventListener('load', function() {
    const loadTime = performance.now();
    console.log(`🚀 App loaded in ${loadTime.toFixed(2)}ms`);
    if (loadTime > 2000) {
        console.warn('⚠️ Load time exceeds 2s target');
    }
});

// ============================================
// ERROR HANDLING
// ============================================
window.addEventListener('error', function(e) {
    console.error('❌ App error:', e.error);
    // Error reporting would go here
});
