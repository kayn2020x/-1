const students = [
    { name: "Асанбеков Тынай", photo: "photos/asanbekov.jpg", gender: "male" },
    { name: "Барсукова Валерия", photo: "photos/barsukova.jpg", gender: "female" },
    { name: "Воробьев Александр", photo: "photos/vorobiev.jpg", gender: "male" },
    { name: "Гайдукова Валерия", photo: "photos/gaydukova.jpg", gender: "female" },
    { name: "Гупанов Данила", photo: "photos/gupanov.jpg", gender: "male" },
    { name: "Демирова Анна", photo: "photos/demirova.jpg", gender: "female" },
    { name: "Крутов Павел", photo: "photos/krutov.jpg", gender: "male" },
    { name: "Мазур Александр", photo: "photos/mazur.jpg", gender: "male" },
    { name: "Мамашарипова Зиёдахон", photo: "photos/mamasharipova.jpg", gender: "female" },
    { name: "Медведев Илья", photo: "photos/medvedev.jpg", gender: "male" },
    { name: "Московский Дмитрий", photo: "photos/moskovsky.jpg", gender: "male" },
    { name: "Назаренко Ларион", photo: "photos/nazarenko.jpg", gender: "male" },
    { name: "Никитин Кирилл", photo: "photos/nikitin.jpg", gender: "male" },
    { name: "Одинокова Юлия", photo: "photos/odinokova.jpg", gender: "female" },
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

// Google Apps Script URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyI0Uk8-ImyK_Lso2zwtNZ1nRHXRM4ZrLi9W6gDFnx_0w8It6I87TBG1cUWxzzNsnvz/exec';
const SHEET_ID = '1HbEEsNYNua6Wh6JARNiE_JFcqdNF1ivq83u0DelVN70';

// Сохранить голос через Google Apps Script
async function saveVoteToServer(nominationId, studentName) {
    try {
        const voteData = {
            user_name: currentUser.name,
            user_email: currentUser.email,
            nomination_id: nominationId,
            student_name: studentName
        };

        console.log('📤 Отправляю данные:', voteData);

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(voteData)
        });

        const result = await response.json();
        console.log('📥 Ответ от сервера:', result);
        
        if (result.success) {
            console.log('✅ Данные успешно сохранены в Google Sheets!');
            saveToLocalStorage(currentUser.id, nominationId, studentName);
            showNotification('Голос сохранен!', 'success');
        } else {
            throw new Error(result.error || 'Неизвестная ошибка');
        }
        
    } catch (error) {
        console.error('❌ Ошибка отправки:', error);
        saveToLocalStorage(currentUser.id, nominationId, studentName);
        showNotification('Голос сохранен локально', 'info');
    }
}

// Загрузить все голоса из Google Sheets
async function loadVotesFromGoogleSheets() {
    try {
        const sheetsUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
        
        console.log('📥 Загружаю данные из Google Sheets...');
        const response = await fetch(sheetsUrl);
        const text = await response.text();
        const json = JSON.parse(text.substr(47).slice(0, -2));
        
        const allVotes = {};
        const allUsers = {};
        
        json.table.rows.forEach((row, index) => {
            if (index === 0) return;
            
            const userName = row.c[1]?.v || '';
            const userEmail = row.c[2]?.v || '';
            const nominationId = row.c[3]?.v || '';
            const studentName = row.c[4]?.v || '';
            
            if (userName && nominationId && studentName) {
                const userId = `sheet_${index}`;
                
                if (!allUsers[userId]) {
                    allUsers[userId] = { name: userName, email: userEmail };
                }
                
                if (!allVotes[userId]) {
                    allVotes[userId] = {};
                }
                allVotes[userId][nominationId] = studentName;
            }
        });
        
        console.log('📊 Загружено голосов:', Object.keys(allVotes).length);
        return { votes: allVotes, users: allUsers };
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        return { votes: {}, users: {} };
    }
}

// LocalStorage функции
function getAllVotes() {
    try {
        const data = localStorage.getItem(ALL_VOTES_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function saveAllVotes(votes) {
    try {
        localStorage.setItem(ALL_VOTES_KEY, JSON.stringify(votes));
    } catch (e) {}
}

function getAllUsers() {
    try {
        const data = localStorage.getItem(ALL_USERS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function saveAllUsers(users) {
    try {
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(users));
    } catch (e) {}
}

function saveToLocalStorage(userId, nominationId, studentName) {
    const allVotes = getAllVotes();
    if (!allVotes[userId]) allVotes[userId] = {};
    allVotes[userId][nominationId] = studentName;
    saveAllVotes(allVotes);
    recalculateTotalResults();
}

function recalculateTotalResults() {
    const allVotes = getAllVotes();
    const newResults = {};
    
    nominations.forEach(nomination => {
        newResults[nomination.id] = {};
    });
    
    Object.values(allVotes).forEach(userVotes => {
        Object.entries(userVotes).forEach(([nominationId, studentName]) => {
            if (studentName && newResults[nominationId]) {
                if (!newResults[nominationId][studentName]) {
                    newResults[nominationId][studentName] = 0;
                }
                newResults[nominationId][studentName]++;
            }
        });
    });
    
    votingResults = newResults;
    saveData();
}

// Визуальные функции
function createSnowflakes() {
    const container = document.getElementById('snowflakes-container');
    if (!container) return;
    
    const count = window.innerWidth < 768 ? 25 : 50;
    
    for (let i = 0; i < count; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = (Math.random() * 5 + 3) + 's';
        snowflake.style.opacity = Math.random() * 0.7 + 0.3;
        snowflake.style.fontSize = (Math.random() * 8 + 6) + 'px';
        snowflake.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(snowflake);
        
        setTimeout(() => snowflake.remove(), 15000);
    }
}

function validateName(name) {
    return name.trim().split(' ').length >= 2 && name.trim().length >= 5;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateForm() {
    const name = document.getElementById('userName')?.value || '';
    const email = document.getElementById('userEmail')?.value || '';
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    
    let isValid = true;
    
    if (!validateName(name)) {
        if (nameError) nameError.style.display = 'block';
        if (nameInput) nameInput.classList.add('invalid');
        isValid = false;
    } else {
        if (nameError) nameError.style.display = 'none';
        if (nameInput) nameInput.classList.remove('invalid');
    }
    
    if (!validateEmail(email)) {
        if (emailError) emailError.style.display = 'block';
        if (emailInput) emailInput.classList.add('invalid');
        isValid = false;
    } else {
        if (emailError) emailError.style.display = 'none';
        if (emailInput) emailInput.classList.remove('invalid');
    }
    
    return isValid;
}

function initApp() {
    createSnowflakes();
    setInterval(createSnowflakes, 3000);
    
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    
    if (userNameInput && userEmailInput) {
        userNameInput.addEventListener('input', validateForm);
        userEmailInput.addEventListener('input', validateForm);
        
        userNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') registerUser();
        });
        userEmailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') registerUser();
        });
    }
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showVotingSection();
        } catch (e) {
            localStorage.removeItem('currentUser');
            showRegistrationSection();
        }
    } else {
        showRegistrationSection();
    }
    
    loadSavedData();
    updateStats();
}

function showRegistrationSection() {
    const regSection = document.getElementById('registrationSection');
    const votingSection = document.getElementById('votingSection');
    if (regSection) regSection.style.display = 'block';
    if (votingSection) votingSection.style.display = 'none';
}

function showVotingSection() {
    const regSection = document.getElementById('registrationSection');
    const votingSection = document.getElementById('votingSection');
    if (regSection) regSection.style.display = 'none';
    if (votingSection) votingSection.style.display = 'block';
    
    if (currentUser) {
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
    }
    
    renderNominations();
    setupModal();
    updateStats();
}

function registerUser() {
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    
    if (!userNameInput || !userEmailInput) return;
    
    const userName = userNameInput.value.trim();
    const userEmail = userEmailInput.value.trim();
    
    if (!userName || !userEmail) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (!validateForm()) {
        showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
        return;
    }
    
    currentUser = {
        name: userName,
        email: userEmail,
        id: Date.now().toString(),
        registeredAt: new Date().toISOString()
    };
    
    const allUsers = getAllUsers();
    allUsers[currentUser.id] = {
        name: currentUser.name,
        email: currentUser.email,
        registeredAt: currentUser.registeredAt
    };
    saveAllUsers(allUsers);
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    showVotingSection();
    showNotification(`Добро пожаловать, ${userName}! Приятного голосования!`, 'success');
}

function renderNominations() {
    const mainContainer = document.getElementById('mainNominationsContainer');
    const otherContainer = document.getElementById('otherNominationsContainer');
    
    if (!mainContainer || !otherContainer) return;
    
    mainContainer.innerHTML = '';
    otherContainer.innerHTML = '';

    nominations.filter(n => n.isMain).forEach(nomination => {
        const card = createNominationCard(nomination);
        mainContainer.appendChild(card);
    });
    
    nominations.filter(n => !n.isMain).forEach(nomination => {
        const card = createNominationCard(nomination);
        otherContainer.appendChild(card);
    });
}

function createNominationCard(nomination) {
    const card = document.createElement('div');
    card.className = `nomination-card ${nomination.isMain ? 'main-card' : ''}`;
    
    if (nomination.gender === 'male') card.classList.add('male-nomination');
    else if (nomination.gender === 'female') card.classList.add('female-nomination');
    
    const allVotes = getAllVotes();
    const userVotes = allVotes[currentUser?.id] || {};
    const selectedStudent = userVotes[nomination.id];
    
    card.innerHTML = `
        <h3>${nomination.title}</h3>
        <p>${nomination.description}</p>
        <div class="selected-student" id="selected-${nomination.id}" 
             style="${selectedStudent ? 'display: flex' : 'display: none'}">
            <span id="selected-name-${nomination.id}">${selectedStudent || ''}</span>
        </div>
        <button class="vote-button nomination-vote-btn" onclick="openStudentSelection('${nomination.id}')">
            <span class="btn-text">${selectedStudent ? 'Изменить выбор' : 'Выбрать студента'}</span>
            <span class="btn-arrow">→</span>
        </button>
    `;
    
    return card;
}

function setupModal() {
    const modal = document.getElementById('studentModal');
    const closeBtn = document.querySelector('#studentModal .close');
    const confirmBtn = document.getElementById('confirmSelection');

    if (closeBtn) {
        closeBtn.onclick = () => {
            if (modal) modal.style.display = 'none';
            currentNomination = null;
        };
    }
    
    if (confirmBtn) confirmBtn.onclick = confirmSelection;

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            currentNomination = null;
        }
    };
}

function openStudentSelection(nominationId) {
    currentNomination = nominationId;
    const modal = document.getElementById('studentModal');
    const modalTitle = document.getElementById('modalTitle');
    const studentsGrid = document.getElementById('studentsGrid');
    const confirmBtn = document.getElementById('confirmSelection');

    if (!modal || !modalTitle || !studentsGrid || !confirmBtn) return;

    const nomination = nominations.find(n => n.id === nominationId);
    if (nomination) modalTitle.textContent = nomination.title;
    
    studentsGrid.innerHTML = '';

    const allVotes = getAllVotes();
    const userVotes = allVotes[currentUser?.id] || {};
    const currentSelection = userVotes[nominationId];

    const filteredStudents = nomination.gender ? 
        students.filter(student => student.gender === nomination.gender) : 
        students;

    filteredStudents.forEach((student) => {
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        
        if (currentSelection === student.name) studentCard.classList.add('selected');
        
        const photoDiv = document.createElement('div');
        photoDiv.className = 'student-photo';
        
        if (student.photo) {
            const img = document.createElement('img');
            img.src = student.photo;
            img.alt = student.name;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            img.onerror = function() {
                img.style.display = 'none';
                showInitials(photoDiv, student);
            };
            photoDiv.appendChild(img);
        } else {
            showInitials(photoDiv, student);
        }

        studentCard.innerHTML = `<div class="student-name">${student.name}</div>`;
        studentCard.insertBefore(photoDiv, studentCard.firstChild);
        studentCard.onclick = () => selectStudent(student.name, studentCard);
        studentsGrid.appendChild(studentCard);
    });

    confirmBtn.disabled = !currentSelection;
    modal.style.display = 'block';
}

function showInitials(photoDiv, student) {
    const initials = student.name.split(' ').map(n => n[0]).join('');
    photoDiv.textContent = initials;
    photoDiv.style.background = student.gender === 'female' ? 
        'linear-gradient(135deg, #ff6b9d, #c2185b)' : 
        'linear-gradient(135deg, #4fc3f7, #1565c0)';
    photoDiv.style.color = '#fff8f0';
    photoDiv.style.display = 'flex';
    photoDiv.style.alignItems = 'center';
    photoDiv.style.justifyContent = 'center';
    photoDiv.style.fontWeight = '600';
    photoDiv.style.fontSize = '1.2em';
}

function selectStudent(studentName, cardElement) {
    const studentsGrid = document.getElementById('studentsGrid');
    const confirmBtn = document.getElementById('confirmSelection');
    
    if (!studentsGrid || !confirmBtn) return;
    
    Array.from(studentsGrid.children).forEach(card => card.classList.remove('selected'));
    cardElement.classList.add('selected');
    confirmBtn.disabled = false;

    cardElement.style.transform = 'scale(0.95)';
    setTimeout(() => cardElement.style.transform = 'scale(1.05)', 150);
}

function confirmSelection() {
    if (!currentNomination || !currentUser) return;
    
    const selectedCard = document.querySelector('#studentModal .student-card.selected');
    if (!selectedCard) return;
    
    const studentNameElement = selectedCard.querySelector('.student-name');
    if (!studentNameElement) return;
    
    const studentName = studentNameElement.textContent;
    
    saveVoteToServer(currentNomination, studentName);
    updateNominationDisplay(currentNomination, studentName);
    updateStats();
    
    showNotification(`Вы выбрали: ${studentName}`, 'success');
    
    const modal = document.getElementById('studentModal');
    if (modal) modal.style.display = 'none';
    currentNomination = null;
}

function updateNominationDisplay(nominationId, studentName) {
    const selectedDiv = document.getElementById(`selected-${nominationId}`);
    const selectedName = document.getElementById(`selected-name-${nominationId}`);
    const buttons = document.querySelectorAll(`.nomination-vote-btn[onclick="openStudentSelection('${nominationId}')"]`);
    
    if (selectedDiv && selectedName) {
        selectedName.textContent = studentName;
        selectedDiv.style.display = 'flex';
    }
    
    buttons.forEach(button => {
        const btnText = button.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Изменить выбор';
    });
}

function showPasswordModal() {
    const modal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('adminPassword');
    
    if (modal) {
        modal.style.display = 'block';
        if (passwordInput) {
            passwordInput.value = '';
            setTimeout(() => passwordInput.focus(), 100);
        }
    }
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) modal.style.display = 'none';
}

function checkAdminPassword() {
    const passwordInput = document.getElementById('adminPassword');
    if (!passwordInput) return;
    
    const password = passwordInput.value;
    if (password === ADMIN_PASSWORD) {
        closePasswordModal();
        showAdminPanel();
        showNotification('Доступ разрешен!', 'success');
    } else {
        showNotification('Неверный пароль!', 'error');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function showAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.style.display = 'block';
}

function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) adminPanel.style.display = 'none';
}

function showResults() {
    const modal = document.getElementById('resultsModal');
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (!modal || !resultsGrid) return;
    
    resultsGrid.innerHTML = '';
    recalculateTotalResults();
    
    nominations.forEach(nomination => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const nominationResults = votingResults[nomination.id] || {};
        const totalVotes = Object.values(nominationResults).reduce((sum, count) => sum + count, 0);
        const sortedResults = Object.entries(nominationResults)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        let resultsHTML = `
            <h4>${nomination.title}</h4>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${totalVotes > 0 ? '100%' : '0%'}"></div>
            </div>
            <div class="results-stats">Всего голосов: ${totalVotes}</div>
            <ul class="result-list">
        `;
        
        if (sortedResults.length > 0) {
            sortedResults.forEach(([student, votes], index) => {
                const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : 0;
                const isLeading = index === 0 && votes > 0;
                resultsHTML += `
                    <li class="${isLeading ? 'leading' : ''}">
                        <span class="student-result-name">${student}</span>
                        <div class="result-details">
                            <span style="margin-right: 10px; color: #fff8f0;">${percentage}%</span>
                            <span class="vote-count">${votes}</span>
                        </div>
                    </li>
                `;
            });
        } else {
            resultsHTML += '<li class="no-votes">Голосов пока нет</li>';
        }
        
        resultsHTML += '</ul>';
        resultItem.innerHTML = resultsHTML;
        resultsGrid.appendChild(resultItem);
    });
    
    modal.style.display = 'block';
    hideAdminPanel();
}

async function showVoteDetails() {
    const modal = document.getElementById('resultsModal');
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (!modal || !resultsGrid) return;
    
    resultsGrid.innerHTML = '<h3 style="text-align: center; margin-bottom: 20px; color: #fff8f0;">Детали голосования - Все пользователи</h3>';
    
    const sheetData = await loadVotesFromGoogleSheets();
    const allVotes = sheetData.votes;
    const allUsers = sheetData.users;
    
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
        
        let resultsHTML = `<h4>${nomination.title}</h4><ul class="result-list">`;
        
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
        
        if (!hasVotes) resultsHTML += '<li class="no-votes">Голосов пока нет</li>';
        resultsHTML += `</ul><div class="results-stats">Проголосовало в этой номинации: ${nominationVotes}</div>`;
        resultItem.innerHTML = resultsHTML;
        resultsGrid.appendChild(resultItem);
    });
    
    modal.style.display = 'block';
    hideAdminPanel();
}

function closeResults() {
    const modal = document.getElementById('resultsModal');
    if (modal) modal.style.display = 'none';
}

function exportData() {
    recalculateTotalResults();
    
    let csvContent = "Номинация,Студент,Количество голосов,Процент\n";
    
    nominations.forEach(nomination => {
        const results = votingResults[nomination.id] || {};
        const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
        
        Object.entries(results)
            .sort(([,a], [,b]) => b - a)
            .forEach(([student, votes]) => {
                const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(2) : 0;
                csvContent += `"${nomination.title}","${student}",${votes},${percentage}%\n`;
            });
    });
    
    const allVotes = getAllVotes();
    const allUsers = getAllUsers();
    
    csvContent += "\n\nДетали голосования:\nПользователь,Номинация,Выбранный студент\n";
    
    Object.entries(allVotes).forEach(([userId, userVotes]) => {
        Object.entries(userVotes).forEach(([nominationId, studentName]) => {
            if (studentName) {
                const nomination = nominations.find(n => n.id === nominationId);
                const userInfo = allUsers[userId];
                const userName = userInfo ? userInfo.name : `Пользователь ${userId}`;
                csvContent += `"${userName}","${nomination?.title || nominationId}","${studentName}"\n`;
            }
        });
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `результаты_премии_исп_${new Date().toLocaleDateString('ru-RU')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Данные экспортированы в CSV!', 'success');
    hideAdminPanel();
}

function resetVoting() {
    if (confirm('ВНИМАНИЕ! Это действие сбросит ВСЕ данные голосования. Продолжить?')) {
        const currentUserBackup = localStorage.getItem('currentUser');
        
        localStorage.removeItem(ALL_VOTES_KEY);
        localStorage.removeItem(RESULTS_KEY);
        
        if (currentUserBackup) {
            localStorage.setItem('currentUser', currentUserBackup);
            currentUser = JSON.parse(currentUserBackup);
        }
        
        votingResults = {};
        
        showNotification('Все данные голосования сброшены!', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

function updateStats() {
    if (!currentUser) return;
    
    const allVotes = getAllVotes();
    const userVotes = allVotes[currentUser.id] || {};
    const completedNominations = Object.values(userVotes).filter(v => v).length;
    
    const completedElement = document.getElementById('completedNominations');
    const totalVotesElement = document.getElementById('totalVotes');
    
    if (completedElement) completedElement.textContent = `${completedNominations}/${nominations.length}`;
    
    recalculateTotalResults();
    let totalVotesCount = 0;
    Object.values(votingResults).forEach(nomination => {
        totalVotesCount += Object.values(nomination).reduce((sum, count) => sum + count, 0);
    });
    
    if (totalVotesElement) totalVotesElement.textContent = totalVotesCount;
}

function saveData() {
    try {
        localStorage.setItem(RESULTS_KEY, JSON.stringify(votingResults));
    } catch (e) {}
}

function loadSavedData() {
    try {
        const saved = localStorage.getItem(RESULTS_KEY);
        if (saved) {
            votingResults = JSON.parse(saved);
        } else {
            recalculateTotalResults();
        }
    } catch (e) {
        votingResults = {};
    }
}

function showNotification(message, type = 'info') {
    const oldNotifications = document.querySelectorAll('.notification');
    oldNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: #fff8f0;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.4s ease;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(146, 20, 12, 0.7);
        font-size: 1em;
        max-width: 300px;
        ${type === 'success' ? 'background: linear-gradient(135deg, #1e1e24, rgba(40, 167, 69, 0.8));' : ''}
        ${type === 'error' ? 'background: linear-gradient(135deg, #1e1e24, rgba(220, 53, 69, 0.8));' : ''}
        ${type === 'info' ? 'background: linear-gradient(135deg, #1e1e24, rgba(146, 20, 12, 0.8));' : ''}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти? Вы сможете зарегистрироваться снова.')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        showRegistrationSection();
        showNotification('Вы вышли из системы', 'info');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Запускаем приложение...');
    
    const registerButton = document.querySelector('.login-button');
    if (registerButton) registerButton.onclick = registerUser;
    
    setTimeout(() => {
        const adminControls = document.querySelector('.admin-controls');
        if (adminControls) {
            if (!document.querySelector('.admin-button[onclick="showVoteDetails()"]')) {
                const detailsButton = document.createElement('button');
                detailsButton.className = 'admin-button';
                detailsButton.innerHTML = '<span class="btn-text">Кто за кого голосовал</span><span class="btn-arrow">→</span>';
                detailsButton.onclick = showVoteDetails;
                adminControls.appendChild(detailsButton);
            }
            
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'admin-button';
            logoutBtn.innerHTML = '<span class="btn-text">Выйти</span>';
            logoutBtn.onclick = logout;
            adminControls.appendChild(logoutBtn);
        }
    }, 100);
    
    initApp();
});

// Глобальные функции для HTML
window.registerUser = registerUser;
window.openStudentSelection = openStudentSelection;
window.showPasswordModal = showPasswordModal;
window.closePasswordModal = closePasswordModal;
window.checkAdminPassword = checkAdminPassword;
window.hideAdminPanel = hideAdminPanel;
window.showResults = showResults;
window.showVoteDetails = showVoteDetails;
window.closeResults = closeResults;
window.exportData = exportData;
window.resetVoting = resetVoting;
window.logout = logout;