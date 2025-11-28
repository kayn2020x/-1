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
    const snowflakeCount = 20;
    
    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = (Math.random() * 3 + 3) + 's';
        snowflake.style.opacity = Math.random() * 0.3 + 0.2;
        snowflake.style.fontSize = (Math.random() * 8 + 8) + 'px';
        container.appendChild(snowflake);
        
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.remove();
            }
        }, 6000);
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
    setInterval(createSnowflakes, 2000);
    
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
    showNotification(`Добро пожаловать, ${userName}!`, 'success');
}

function renderNominations() {
    const mainContainer = document.getElementById('mainNominationsContainer');
    const otherContainer = document.getElementById('otherNominationsContainer');
    
    if (!mainContainer || !otherContainer) return;
    
    mainContainer.innerHTML = '';
    otherContainer.innerHTML = '';

    nominations.forEach((nomination) => {
        const card = createNominationCard(nomination);
        if (nomination.isMain) {
            mainContainer.appendChild(card);
        } else {
            otherContainer.appendChild(card);
        }
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

    students.forEach((student) => {
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
}

function confirmSelection() {
    if (currentNomination) {
        const selectedCard = document.querySelector('.student-card.selected');
        if (!selectedCard)