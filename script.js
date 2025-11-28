const students = [
    "Асанбеков Тынай",
    "Барсукова Валерия", 
    "Воробьев Александр",
    "Гайдукова Валерия",
    "Гупанов Данила",
    "Демирова Анна",
    "Крутов Павел",
    "Мазур Александр",
    "Мамашарипова Зиёдахон",
    "Медведев Илья",
    "Московский Дмитрий",
    "Назаренко Ларион",
    "Никитин Кирилл",
    "Одинокова Юлия",
    "Ракуц Иван",
    "Резниченко Алексей",
    "Халваши Иван",
    "Яцышин Андриан"
];

const nominations = [
    {
        id: "best_male",
        title: "Лучший парень группы",
        description: "Главный приз за выдающиеся качества и лидерство",
        isMain: true
    },
    {
        id: "best_female", 
        title: "Лучшая девушка группы",
        description: "Главный приз за выдающиеся качества и лидерство", 
        isMain: true
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

function createSnowflakes() {
    const container = document.getElementById('snowflakes-container');
    const snowflakeCount = 60;
    
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = Math.random() * 5 + 5 + 's';
        snowflake.style.opacity = Math.random() * 0.6 + 0.4;
        snowflake.style.fontSize = Math.random() * 12 + 12 + 'px';
        container.appendChild(snowflake);
        
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.remove();
            }
        }, 10000);
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
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const nameInput = document.getElementById('userName');
    const emailInput = document.getElementById('userEmail');
    
    let isValid = true;
    
    if (!validateName(name)) {
        nameError.style.display = 'block';
        nameInput.classList.add('invalid');
        isValid = false;
    } else {
        nameError.style.display = 'none';
        nameInput.classList.remove('invalid');
    }
    
    if (!validateEmail(email)) {
        emailError.style.display = 'block';
        emailInput.classList.add('invalid');
        isValid = false;
    } else {
        emailError.style.display = 'none';
        emailInput.classList.remove('invalid');
    }
    
    return isValid;
}

function initApp() {
    createSnowflakes();
    setInterval(createSnowflakes, 500);
    
    const userNameInput = document.getElementById('userName');
    const userEmailInput = document.getElementById('userEmail');
    
    if (userNameInput && userEmailInput) {
        userNameInput.addEventListener('input', validateForm);
        userEmailInput.addEventListener('input', validateForm);
    }
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showVotingSection();
    } else {
        showRegistrationSection();
    }
    
    loadSavedData();
}

function showRegistrationSection() {
    document.getElementById('registrationSection').style.display = 'block';
    document.getElementById('votingSection').style.display = 'none';
}

function showVotingSection() {
    document.getElementById('registrationSection').style.display = 'none';
    document.getElementById('votingSection').style.display = 'block';
    
    document.getElementById('userNameDisplay').textContent = currentUser.name;
    
    renderNominations();
    setupModal();
    updateStats();
}

function registerUser() {
    const userName = document.getElementById('userName').value.trim();
    const userEmail = document.getElementById('userEmail').value.trim();
    
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

    const otherNominations = nominations.filter(n => !n.isMain);
    
    nominations.filter(n => n.isMain).forEach((nomination, index) => {
        const card = createNominationCard(nomination);
        mainContainer.appendChild(card);
    });
    
    otherNominations.forEach((nomination, index) => {
        const card = createNominationCard(nomination);
        otherContainer.appendChild(card);
    });
}

function createNominationCard(nomination) {
    const card = document.createElement('div');
    card.className = `nomination-card ${nomination.isMain ? 'main-card' : ''}`;
    
    const userVotes = JSON.parse(localStorage.getItem(`userVotes_${currentUser.id}`) || '{}');
    const selectedStudent = userVotes[nomination.id];
    
    card.innerHTML = `
        <h3>${nomination.title}</h3>
        <p>${nomination.description}</p>
        <div class="selected-student" id="selected-${nomination.id}">
            <span id="selected-name-${nomination.id}">${selectedStudent || ''}</span>
        </div>
        <button class="vote-button" onclick="openStudentSelection('${nomination.id}')">
            ${selectedStudent ? 'Изменить выбор' : 'Выбрать студента'}
        </button>
    `;
    
    if (selectedStudent) {
        const selectedDiv = document.getElementById(`selected-${nomination.id}`);
        if (selectedDiv) {
            selectedDiv.style.display = 'flex';
        }
    }
    
    return card;
}

function setupModal() {
    const modal = document.getElementById('studentModal');
    const closeBtn = document.querySelector('.close');
    const confirmBtn = document.getElementById('confirmSelection');

    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = 'none';
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = confirmSelection;
    }

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
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
    modalTitle.textContent = nomination ? nomination.title : 'Выбор победителя';
    
    studentsGrid.innerHTML = '';

    const userVotes = JSON.parse(localStorage.getItem(`userVotes_${currentUser.id}`) || '{}');
    const currentSelection = userVotes[nominationId];

    students.forEach((student, index) => {
        const studentCard = document.createElement('div');
        studentCard.className = 'student-card';
        
        if (currentSelection === student) {
            studentCard.classList.add('selected');
        }
        
        const initials = student.split(' ').map(n => n[0]).join('');
        
        studentCard.innerHTML = `
            <div class="student-photo has-image">${initials}</div>
            <div class="student-name">${student}</div>
        `;

        studentCard.onclick = () => selectStudent(student, studentCard);
        studentsGrid.appendChild(studentCard);
    });

    confirmBtn.disabled = !currentSelection;
    modal.style.display = 'block';
}

function selectStudent(student, cardElement) {
    const studentsGrid = document.getElementById('studentsGrid');
    const confirmBtn = document.getElementById('confirmSelection');
    
    if (!studentsGrid || !confirmBtn) return;
    
    Array.from(studentsGrid.children).forEach(card => {
        card.classList.remove('selected');
    });
    
    cardElement.classList.add('selected');
    confirmBtn.disabled = false;

    cardElement.style.transform = 'scale(0.95)';
    setTimeout(() => {
        cardElement.style.transform = 'scale(1.08)';
    }, 150);
    setTimeout(() => {
        cardElement.style.transform = 'scale(1.05)';
    }, 300);
}

function confirmSelection() {
    if (currentNomination) {
        const selectedCard = document.querySelector('.student-card.selected');
        if (!selectedCard) return;
        
        const studentName = selectedCard.querySelector('.student-name').textContent;
        
        updateUserVote(currentNomination, studentName);
        updateNominationDisplay(currentNomination, studentName);
        updateStats();
        
        showNotification(`Вы выбрали: ${studentName}`, 'success');
        const modal = document.getElementById('studentModal');
        modal.style.display = 'none';
    }
}

function updateUserVote(nominationId, studentName) {
    const userVotes = JSON.parse(localStorage.getItem(`userVotes_${currentUser.id}`) || '{}');
    const previousVote = userVotes[nominationId];
    
    if (!votingResults[nominationId]) {
        votingResults[nominationId] = {};
    }
    
    if (previousVote && votingResults[nominationId][previousVote]) {
        votingResults[nominationId][previousVote]--;
        if (votingResults[nominationId][previousVote] <= 0) {
            delete votingResults[nominationId][previousVote];
        }
    }
    
    if (!votingResults[nominationId][studentName]) {
        votingResults[nominationId][studentName] = 0;
    }
    votingResults[nominationId][studentName]++;
    
    userVotes[nominationId] = studentName;
    localStorage.setItem(`userVotes_${currentUser.id}`, JSON.stringify(userVotes));
    
    saveData();
}

function updateNominationDisplay(nominationId, studentName) {
    const selectedDiv = document.getElementById(`selected-${nominationId}`);
    const selectedName = document.getElementById(`selected-name-${nominationId}`);
    const voteButton = document.querySelector(`button[onclick="openStudentSelection('${nominationId}')"]`);
    
    if (selectedDiv && selectedName && voteButton) {
        selectedName.textContent = studentName;
        selectedDiv.style.display = 'flex';
        voteButton.textContent = 'Изменить выбор';
    }
}

function showPasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function checkAdminPassword() {
    const passwordInput = document.getElementById('adminPassword');
    if (!passwordInput) return;
    
    const password = passwordInput.value;
    if (password === ADMIN_PASSWORD) {
        closePasswordModal();
        showAdminPanel();
    } else {
        showNotification('Неверный пароль!', 'error');
    }
}

function showAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
}

function hideAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}

function showResults() {
    const modal = document.getElementById('resultsModal');
    const resultsGrid = document.getElementById('resultsGrid');
    
    if (!modal || !resultsGrid) return;
    
    resultsGrid.innerHTML = '';
    
    nominations.forEach(nomination => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const nominationResults = votingResults[nomination.id] || {};
        const totalVotes = Object.values(nominationResults).reduce((sum, count) => sum + count, 0);
        const sortedResults = Object.entries(nominationResults)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        let resultsHTML = `<h4>${nomination.title}</h4>`;
        resultsHTML += `<div class="progress-bar"><div class="progress-fill" style="width: ${totalVotes > 0 ? '100%' : '0%'}"></div></div>`;
        resultsHTML += `<div class="results-stats">Всего голосов: ${totalVotes}</div>`;
        resultsHTML += '<ul class="result-list">';
        
        if (sortedResults.length > 0) {
            sortedResults.forEach(([student, votes], index) => {
                const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : 0;
                const isLeading = index === 0;
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

function closeResults() {
    const modal = document.getElementById('resultsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function exportData() {
    let csvContent = "Номинация,Студент,Количество голосов,Процент\n";
    
    nominations.forEach(nomination => {
        const results = votingResults[nomination.id] || {};
        const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
        
        Object.entries(results).forEach(([student, votes]) => {
            const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(2) : 0;
            csvContent += `"${nomination.title}","${student}",${votes},${percentage}%\n`;
        });
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'результаты_голосования_исп2025.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Данные экспортированы в CSV!', 'success');
    hideAdminPanel();
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти? Вы сможете зарегистрироваться снова.')) {
        localStorage.removeItem('currentUser');
        location.reload();
    }
}

function resetVoting() {
    if (confirm('ВНИМАНИЕ! Это действие сбросит ВСЕ данные голосования. Продолжить?')) {
        localStorage.removeItem('votingResults');
        localStorage.removeItem('registeredUsers');
        localStorage.removeItem('currentUser');
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('userVotes_')) {
                localStorage.removeItem(key);
            }
        });
        
        showNotification('Все данные голосования сброшены!', 'success');
        setTimeout(() => {
            location.reload();
        }, 2000);
    }
}

function updateStats() {
    const userVotes = JSON.parse(localStorage.getItem(`userVotes_${currentUser.id}`) || '{}');
    const completedNominations = Object.values(userVotes).filter(v => v).length;
    
    const completedElement = document.getElementById('completedNominations');
    const totalVotesElement = document.getElementById('totalVotes');
    
    if (completedElement) {
        completedElement.textContent = `${completedNominations}/${nominations.length}`;
    }
    
    let totalVotesCount = 0;
    Object.values(votingResults).forEach(nomination => {
        totalVotesCount += Object.values(nomination).reduce((sum, count) => sum + count, 0);
    });
    
    if (totalVotesElement) {
        totalVotesElement.textContent = totalVotesCount;
    }
}

function saveData() {
    localStorage.setItem('votingResults', JSON.stringify(votingResults));
}

function loadSavedData() {
    const saved = localStorage.getItem('votingResults');
    if (saved) {
        votingResults = JSON.parse(saved);
    }
}

function showNotification(message, type = 'info') {
    if (!document.querySelector('#notification-styles')) {
        const styles = `
            .notification {
                position: fixed;
                top: 25px;
                right: 25px;
                padding: 18px 24px;
                border-radius: 12px;
                color: #fff8f0;
                font-weight: 600;
                z-index: 10000;
                transform: translateX(400px);
                transition: transform 0.4s ease;
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
                border: 2px solid rgba(146, 20, 12, 0.7);
                font-size: 1.1em;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification-success {
                background: linear-gradient(135deg, #1e1e24, rgba(40, 167, 69, 0.8));
            }
            .notification-error {
                background: linear-gradient(135deg, #1e1e24, rgba(220, 53, 69, 0.8));
            }
            .notification-info {
                background: linear-gradient(135deg, #1e1e24, rgba(146, 20, 12, 0.8));
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 4000);
}

document.addEventListener('DOMContentLoaded', initApp);