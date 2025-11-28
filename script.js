const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSesKdM0WEwiWoG2R60ZbYWE6rLWf4QGc7jaWmMrG1PpY3Gbew/formResponse';
const GOOGLE_SHEET_ID = '1rIYZ100UmTW9IXMGcZ9KdDUn16cqk-jcy4vz4EbMU-k';
const GOOGLE_SHEETS_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json`;

// Сохранить голос в Google Form
async function saveVoteToGoogleForm(nominationId, studentName) {
    try {
        const formData = new FormData();
        formData.append('entry.1754914772', currentUser.name);    // Имя
        formData.append('entry.12540210', currentUser.email);     // Email  
        formData.append('entry.1756708600', nominationId);        // Номинация
        formData.append('entry.2128743791', studentName);         // Студент

        await fetch(GOOGLE_FORM_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });

        // Всегда сохраняем локально
        saveToLocalStorage(currentUser.id, nominationId, studentName);
        showNotification('Голос сохранен!', 'success');
        
    } catch (error) {
        // Если интернета нет - сохраняем локально
        saveToLocalStorage(currentUser.id, nominationId, studentName);
        showNotification('Голос сохранен локально', 'info');
    }
}

// Загрузить все голоса из Google Sheets
async function loadVotesFromGoogleSheets() {
    try {
        const response = await fetch(GOOGLE_SHEETS_URL);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        const allVotes = {};
        const allUsers = {};
        
        // Обрабатываем все строки (кроме заголовка)
        json.table.rows.forEach((row, index) => {
            if (index === 0) return; // Пропускаем заголовок
            
            const userName = row.c[0]?.v || '';     // Столбец A - Имя
            const userEmail = row.c[1]?.v || '';    // Столбец B - Email
            const nominationId = row.c[2]?.v || ''; // Столбец C - Номинация
            const studentName = row.c[3]?.v || '';  // Столбец D - Студент
            
            if (userName && nominationId && studentName) {
                const userId = `sheet_${index}`;
                
                // Сохраняем пользователя
                if (!allUsers[userId]) {
                    allUsers[userId] = {
                        name: userName,
                        email: userEmail
                    };
                }
                
                // Сохраняем голос
                if (!allVotes[userId]) {
                    allVotes[userId] = {};
                }
                allVotes[userId][nominationId] = studentName;
            }
        });
        
        return { votes: allVotes, users: allUsers };
        
    } catch (error) {
        console.error('Ошибка загрузки из Google Sheets:', error);
        return { votes: {}, users: {} };
    }
}

// Обновленная функция показа деталей голосования
async function showVoteDetails() {
    const modal = document.getElementById('resultsModal');
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (!modal || !resultsGrid) return;
    
    resultsGrid.innerHTML = '<h3 style="text-align: center; margin-bottom: 20px; color: #fff8f0;">Детали голосования - Все пользователи</h3>';
    
    // Загружаем данные из Google Sheets
    const sheetData = await loadVotesFromGoogleSheets();
    const allVotes = sheetData.votes;
    const allUsers = sheetData.users;
    
    // Объединяем с локальными данными
    const localVotes = getAllVotes();
    const localUsers = getAllUsers();
    
    Object.assign(allVotes, localVotes);
    Object.assign(allUsers, localUsers);
    
    let totalUsers = Object.keys(allVotes).length;
    let totalVotesCount = 0;
    Object.values(allVotes).forEach(userVotes => {
        totalVotesCount += Object.values(userVotes).filter(v => v).length;
    });
    
    const totalInfo = document.createElement('div');
    totalInfo.style.textAlign = 'center';
    totalInfo.style.marginBottom = '20px';
    totalInfo.style.color = '#fff8f0';
    totalInfo.style.fontSize = '1.1em';
    totalInfo.innerHTML = `
        <strong>Всего проголосовало: ${totalUsers} пользователей</strong><br>
        <strong>Всего голосов: ${totalVotesCount}</strong>
    `;
    resultsGrid.appendChild(totalInfo);
    
    nominations.forEach(nomination => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        let resultsHTML = `
            <h4>${nomination.title}</h4>
            <ul class="result-list">
        `;
        
        let hasVotes = false;
        let nominationVotes = 0;
        
        Object.entries(allVotes).forEach(([userId, userVotes]) => {
            if (userVotes[nomination.id]) {
                hasVotes = true;
                nominationVotes++;
                const userInfo = allUsers[userId];
                const userName = userInfo ? userInfo.name : `Пользователь ${userId}`;
                
                resultsHTML += `
                    <li>
                        <span class="student-result-name">${userName}</span>
                        <div class="result-details">
                            <span style="color: #fff8f0;">→ ${userVotes[nomination.id]}</span>
                        </div>
                    </li>
                `;
            }
        });
        
        if (!hasVotes) {
            resultsHTML += '<li class="no-votes">Голосов пока нет</li>';
        }
        
        resultsHTML += `</ul><div class="results-stats">Проголосовало в этой номинации: ${nominationVotes}</div>`;
        resultItem.innerHTML = resultsHTML;
        resultsGrid.appendChild(resultItem);
    });
    
    modal.style.display = 'block';
    hideAdminPanel();
}

// В функции confirmSelection замени вызов:
function confirmSelection() {
    if (!currentNomination || !currentUser) return;
    
    const selectedCard = document.querySelector('#studentModal .student-card.selected');
    if (!selectedCard) return;
    
    const studentName = selectedCard.querySelector('.student-name').textContent;
    
    // Сохраняем в Google Form и локально
    saveVoteToGoogleForm(currentNomination, studentName);
    updateNominationDisplay(currentNomination, studentName);
    updateStats();
    
    showNotification(`Вы выбрали: ${studentName}`, 'success');
    
    const modal = document.getElementById('studentModal');
    modal.style.display = 'none';
    currentNomination = null;
}

// Остальные функции оставь как есть (getAllVotes, saveAllVotes, и т.д.)