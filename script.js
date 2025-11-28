const students = [
    // ДЕВУШКИ (5 человек)
    { name: "Барсукова Валерия", photo: "photos/barsukova.jpg", gender: "female" },
    { name: "Гайдукова Валерия", photo: "photos/gaydukova.jpg", gender: "female" },
    { name: "Демирова Анна", photo: "photos/demirova.jpg", gender: "female" },
    { name: "Мамашарипова Зиёдахон", photo: "photos/mamasharipova.jpg", gender: "female" },
    { name: "Одинокова Юлия", photo: "photos/odinokova.jpg", gender: "female" },
    
    // ПАРНИ (14 человек)
    { name: "Асанбеков Тынай", photo: "photos/asanbekov.jpg", gender: "male" },
    { name: "Беляев Александр", photo: "photos/belyaev.jpg", gender: "male" },
    { name: "Воробьев Александр", photo: "photos/vorobiev.jpg", gender: "male" },
    { name: "Гупанов Данила", photo: "photos/gupanov.jpg", gender: "male" },
    { name: "Крутов Павел", photo: "photos/krutov.jpg", gender: "male" },
    { name: "Мазур Александр", photo: "photos/mazur.jpg", gender: "male" },
    { name: "Медведев Илья", photo: "photos/medvedev.jpg", gender: "male" },
    { name: "Московский Дмитрий", photo: "photos/moskovsky.jpg", gender: "male" },
    { name: "Назаренко Ларион", photo: "photos/nazarenko.jpg", gender: "male" },
    { name: "Никитин Кирилл", photo: "photos/nikitin.jpg", gender: "male" },
    { name: "Ракуц Иван", photo: "photos/rakuts.jpg", gender: "male" },
    { name: "Резниченко Алексей", photo: "photos/reznichenko.jpg", gender: "male" },
    { name: "Халваши Иван", photo: "photos/khalvashi.jpg", gender: "male" },
    { name: "Яцышин Андриан", photo: "photos/yatsyshin.jpg", gender: "male" }
];

const nominations = [
    {
        id: "best_male",
        title: "Лучший парень группы",
        description: "Главный приз за выдающиеся качества и лидерство",
        isMain: true,
        gender: "male"
    },
    {
        id: "best_female", 
        title: "Лучшая девушка группы",
        description: "Главный приз за выдающиеся качества и лидерство", 
        isMain: true,
        gender: "female"
    },
    {
        id: "best_student",
        title: "Лучший студент",
        description: "За выдающиеся академические достижения и успехи в учебе",
        isMain: false
    },
    {
        id: "creative", 
        title: "Самый креативный",
        description: "За творческий подход и нестандартное мышление",
        isMain: false
    },
    {
        id: "leader",
        title: "Лучший лидер", 
        description: "За организаторские способности и лидерские качества",
        isMain: false
    },
    {
        id: "friend",
        title: "Лучший друг",
        description: "За надежность и поддержку в трудную минуту",
        isMain: false
    },
    {
        id: "sportsman",
        title: "Лучший спортсмен",
        description: "За спортивные достижения и активный образ жизни",
        isMain: false
    },
    {
        id: "humor",
        title: "Душа компании",
        description: "За отличное чувство юмора и умение поднять настроение",
        isMain: false
    }
];

let votingResults = {};
let currentNomination = null;
let currentUser = null;
const ADMIN_PASSWORD = "admin2024";

const ALL_VOTES_KEY = "premia_isp_2025_all_votes";
const ALL_USERS_KEY = "premia_isp_2025_all_users";
const RESULTS_KEY = "premia_isp_2025_results";

// КОНФИГУРАЦИЯ TELEGRAM БОТА
const TELEGRAM_BOT_TOKEN = '8427231488:AAEXjmk16sBUIpz9O2aSzz8eM2lEjLp1KFA';
const TELEGRAM_CHAT_ID = '5613274785'; // Ваш Chat ID

// Функция проверки подключения бота
async function testTelegramBot() {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ok) {
            console.log('✅ Бот подключен:', data.result.username);
            showNotification('Бот подключен!', 'success');
            return true;
        } else {
            console.error('❌ Ошибка бота:', data);
            showNotification('Ошибка подключения бота', 'error');
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка подключения к боту:', error);
        showNotification('Ошибка сети', 'error');
        return false;
    }
}

// Функция отправки тестового сообщения
async function sendTestMessage() {
    try {
        const message = `🤖 <b>БОТ АКТИВИРОВАН!</b>\n\nСистема голосования "Премия ИСП" готова к работе!\n\n📊 <b>Статистика системы:</b>\n• 19 студентов\n• 8 номинаций\n• Максимум 144 голоса\n\n🕐 <b>Время запуска:</b> ${new Date().toLocaleString('ru-RU')}\n\n<b>Бот будет присылать уведомления о каждом голосе!</b>`;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        
        if (data.ok) {
            showNotification('✅ Тестовое сообщение отправлено!', 'success');
            return true;
        } else {
            console.error('❌ Ошибка отправки:', data);
            showNotification('Ошибка отправки сообщения', 'error');
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showNotification('Ошибка сети при отправке', 'error');
        return false;
    }
}

// Функция отправки детальной статистики в Telegram
async function sendDetailedTelegramNotification(nominationId, studentName) {
    try {
        const nomination = nominations.find(n => n.id === nominationId);
        
        // Получаем детальную статистику
        const stats = getDetailedStatistics();
        
        const message = `
🎯 <b>НОВЫЙ ГОЛОС ЗАФИКСИРОВАН</b>

👤 <b>Голосующий:</b> ${currentUser.name}
📧 <b>Контакты:</b> ${currentUser.email}
🏅 <b>Номинация:</b> ${nomination.title}
✅ <b>Выбор:</b> ${studentName}
🕐 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}

${stats}

#голосование #${nomination.title.replace(/\s+/g, '_')}
        `.trim();

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            console.log('✅ Детальная статистика отправлена в Telegram');
        } else {
            console.error('❌ Ошибка отправки в Telegram');
        }
    } catch (error) {
        console.error('❌ Ошибка отправки в Telegram:', error);
    }
}

// Функция получения детальной статистики по всем номинациям
function getDetailedStatistics() {
    const allVotes = getAllVotes();
    const allUsers = getAllUsers();
    
    let stats = `📊 <b>ДЕТАЛЬНАЯ СТАТИСТИКА ГОЛОСОВАНИЯ</b>\n\n`;
    
    // Общая информация
    const totalVoters = Object.keys(allVotes).length;
    let totalVotesCount = 0;
    
    Object.values(allVotes).forEach(userVotes => {
        totalVotesCount += Object.values(userVotes).filter(v => v).length;
    });
    
    stats += `👥 <b>Всего проголосовало:</b> ${totalVoters} чел.\n`;
    stats += `🗳️ <b>Всего голосов:</b> ${totalVotesCount}/144\n\n`;
    
    // Статистика по каждой номинации
    nominations.forEach((nomination, index) => {
        const results = votingResults[nomination.id] || {};
        const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
        
        stats += `🏆 <b>${nomination.title}</b>\n`;
        stats += `   └ <b>Всего голосов:</b> ${totalVotes}\n`;
        
        if (totalVotes > 0) {
            // Сортируем по количеству голосов
            const sortedResults = Object.entries(results)
                .sort(([,a], [,b]) => b - a);
            
            // Показываем лидера
            const leader = sortedResults[0];
            if (leader) {
                stats += `   └ <b>ЛИДЕР:</b> ${leader[0]} - ${leader[1]} гол.\n`;
            }
            
            // Показываем всех кандидатов с голосами
            sortedResults.forEach(([student, votes]) => {
                const percentage = ((votes / totalVotes) * 100).toFixed(1);
                stats += `      ▫️ ${student}: ${votes} (${percentage}%)\n`;
            });
        } else {
            stats += `   └ Голосов пока нет\n`;
        }
        
        // Кто голосовал в этой номинации
        const voters = [];
        Object.entries(allVotes).forEach(([userId, userVotes]) => {
            if (userVotes[nomination.id]) {
                const user = allUsers[userId];
                voters.push(user.name);
            }
        });
        
        if (voters.length > 0) {
            stats += `   └ <b>Проголосовали:</b> ${voters.length} чел.\n`;
        }
        
        stats += `\n`;
    });
    
    return stats;
}

// Функция отправки экстренного отчета
async function sendEmergencyReport() {
    try {
        const report = getEmergencyReport();
        
        const message = `
🚨 <b>СРОЧНЫЙ ОТЧЕТ ПО ГОЛОСОВАНИЮ</b>

${report}

<b>Обновлено:</b> ${new Date().toLocaleString('ru-RU')}
        `.trim();

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            showNotification('Срочный отчет отправлен в Telegram!', 'success');
        }
    } catch (error) {
        console.error('Ошибка отправки отчета:', error);
        showNotification('Ошибка отправки отчета', 'error');
    }
}

// Функция получения экстренного отчета
function getEmergencyReport() {
    const allVotes = getAllVotes();
    const allUsers = getAllUsers();
    
    let report = '';
    
    nominations.forEach(nomination => {
        const results = votingResults[nomination.id] || {};
        const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
        
        report += `\n🏅 <b>${nomination.title}</b>\n`;
        report += `   └ <b>Голосов:</b> ${totalVotes}\n`;
        
        if (totalVotes > 0) {
            const sortedResults = Object.entries(results)
                .sort(([,a], [,b]) => b - a);
            
            const leader = sortedResults[0];
            report += `   └ <b>ЛИДЕР:</b> ${leader[0]} (${leader[1]} гол.)\n`;
            
            // Показываем отрыв от второго места
            if (sortedResults.length > 1) {
                const second = sortedResults[1];
                const gap = leader[1] - second[1];
                report += `   └ <b>Отрыв:</b> +${gap} гол.\n`;
            }
        }
        
        // Список проголосовавших
        const voters = [];
        Object.entries(allVotes).forEach(([userId, userVotes]) => {
            if (userVotes[nomination.id]) {
                const user = allUsers[userId];
                voters.push(user.name);
            }
        });
        
        report += `   └ <b>Проголосовали:</b> ${voters.length} чел.\n`;
    });
    
    return report;
}

// Функция для получения списка всех проголосовавших
function getVotersList() {
    const allVotes = getAllVotes();
    const allUsers = getAllUsers();
    
    let votersInfo = `<b>СПИСОК ВСЕХ ПРОГОЛОСОВАВШИХ</b>\n\n`;
    
    Object.entries(allVotes).forEach(([userId, userVotes]) => {
        const user = allUsers[userId];
        const voteCount = Object.values(userVotes).filter(v => v).length;
        
        votersInfo += `👤 <b>${user.name}</b>\n`;
        votersInfo += `📧 ${user.email}\n`;
        votersInfo += `🗳️ Проголосовал в: ${voteCount} номинациях\n`;
        
        // Показываем выбор пользователя
        Object.entries(userVotes).forEach(([nominationId, studentName]) => {
            if (studentName) {
                const nomination = nominations.find(n => n.id === nominationId);
                votersInfo += `   ▫️ ${nomination.title}: ${studentName}\n`;
            }
        });
        
        votersInfo += `\n`;
    });
    
    return votersInfo;
}

// Функция отправки списка проголосовавших в Telegram
async function sendVotersListToTelegram() {
    try {
        const votersList = getVotersList();
        
        const message = `
👥 <b>ПОЛНЫЙ СПИСОК ПРОГОЛОСОВАВШИХ</b>

${votersList}

<b>Всего:</b> ${Object.keys(getAllVotes()).length} человек
        `.trim();

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            showNotification('Список проголосовавших отправлен!', 'success');
        }
    } catch (error) {
        console.error('Ошибка отправки списка:', error);
        showNotification('Ошибка отправки списка', 'error');
    }
}

// Остальные функции остаются без изменений (getAllVotes, saveAllVotes, и т.д.)
// ... [вставьте сюда все остальные функции из предыдущего кода]

// Добавляем кнопки Telegram в админ-панель
function addTelegramControls() {
    const adminControls = document.querySelector('.admin-controls');
    if (adminControls) {
        // Кнопка тестирования бота
        const testBotBtn = document.createElement('button');
        testBotBtn.className = 'admin-button';
        testBotBtn.innerHTML = '<span class="btn-text">🤖 Тест бота</span>';
        testBotBtn.onclick = async () => {
            const botConnected = await testTelegramBot();
            if (botConnected) {
                await sendTestMessage();
            }
        };
        adminControls.appendChild(testBotBtn);
        
        // Кнопка для отправки срочного отчета
        const emergencyBtn = document.createElement('button');
        emergencyBtn.className = 'admin-button';
        emergencyBtn.innerHTML = '<span class="btn-text">🚨 Срочный отчет</span>';
        emergencyBtn.onclick = sendEmergencyReport;
        adminControls.appendChild(emergencyBtn);
        
        // Кнопка для отправки списка проголосовавших
        const votersBtn = document.createElement('button');
        votersBtn.className = 'admin-button';
        votersBtn.innerHTML = '<span class="btn-text">👥 Список проголосовавших</span>';
        votersBtn.onclick = sendVotersListToTelegram;
        adminControls.appendChild(votersBtn);
    }
}

// В initApp() добавляем тест бота при загрузке
async function initApp() {
    createSnowflakes();
    setInterval(createSnowflakes, 3000);
    
    // Тестируем бота при загрузке
    await testTelegramBot();
    
    // ... остальной код инициализации
}

// Остальной код остается таким же...
// [вставьте сюда все остальные функции]