document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const dueDate = document.getElementById('dueDate');
    const priority = document.getElementById('priority');
    const projectsDiv = document.getElementById('projects');
    const progressBar = document.getElementById('overallProgress');
    const progressText = document.getElementById('progressText');
    const themeToggle = document.getElementById('themeToggle');
    const searchInput = document.getElementById('searchInput');
    const filterStatus = document.getElementById('filterStatus');
    const calendarDiv = document.getElementById('calendar');
    const streakElement = document.getElementById('streak'); // New: Get the streak display element

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // New: Load streak data from local storage
    let streakData = JSON.parse(localStorage.getItem('streak')) || {
        count: 0,
        lastDate: null
    };

    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));

    // New: Function to save the streak data
    const saveStreak = () => localStorage.setItem('streak', JSON.stringify(streakData));

    const updateProgress = () => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.done).length;
        const percent = total ? Math.round((completed / total) * 100) : 0;
        progressBar.style.width = `${percent}%`;
        progressText.textContent = `${percent}%`;
    };

    // New: Function to check and update the daily streak
    const checkDailyStreak = () => {
        const today = new Date().toDateString(); // e.g., "Mon Sep 08 2025"
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();

        const completedToday = tasks.some(t => t.done && new Date(t.dateCompleted).toDateString() === today);
        
        // Logic to update streak count
        if (completedToday) {
            // Check if the last completed day was yesterday
            if (streakData.lastDate === yesterdayString) {
                // Increment streak if it's a new day after yesterday's completion
                if (streakData.lastDate !== today) {
                    streakData.count++;
                }
            } else if (streakData.lastDate !== today) {
                // If the last completion was before yesterday, reset and start a new streak of 1
                streakData.count = 1;
            }
            streakData.lastDate = today;
        } else if (streakData.lastDate !== today) {
            // If no task was completed today and the last completion was before yesterday, reset the streak
            streakData.count = 0;
            streakData.lastDate = null;
        }

        streakElement.textContent = streakData.count;
        saveStreak();
    };


    const renderTasks = () => {
        const filter = filterStatus.value;
        const searchTerm = searchInput.value.toLowerCase();
        projectsDiv.innerHTML = '';

        tasks.forEach((task, idx) => {
            if ((filter === 'active' && task.done) || (filter === 'completed' && !task.done)) return;
            if (!task.name.toLowerCase().includes(searchTerm)) return;

            const div = document.createElement('div');
            div.className = `task ${task.priority}`;
            div.innerHTML = `
                <input type="checkbox" class="task-checkbox" data-index="${idx}" ${task.done ? 'checked' : ''}>
                <span class="task-content${task.done ? ' strikethrough' : ''}">
                    <strong>${task.name}</strong> — ${task.date} — ${task.priority}
                </span>
                <button class="delete-btn" data-index="${idx}">🗑️</button>
            `;
            projectsDiv.appendChild(div);
        });
    };

    projectsDiv.addEventListener('change', e => {
        if (e.target.matches('.task-checkbox')) {
            const index = +e.target.dataset.index;
            tasks[index].done = e.target.checked;
            
            // New: Add a `dateCompleted` property when a task is checked
            if (e.target.checked) {
                tasks[index].dateCompleted = new Date().toISOString();
            } else {
                tasks[index].dateCompleted = null;
            }

            saveTasks();
            updateProgress();
            renderTasks();
            checkDailyStreak(); // New: Call the streak function after a task is completed
        }
    });

    projectsDiv.addEventListener('click', e => {
        if (e.target.matches('.delete-btn')) {
            tasks.splice(+e.target.dataset.index, 1);
            saveTasks();
            updateProgress();
            renderTasks();
            checkDailyStreak(); // New: Re-check streak after a task is deleted
        }
    });

    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        tasks.push({
            name: taskInput.value.trim(),
            date: dueDate.value,
            priority: priority.value,
            done: false,
            dateCompleted: null // New: Add a dateCompleted property to new tasks
        });
        saveTasks();
        updateProgress();
        renderTasks();
        taskForm.reset();
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
    });

    searchInput.addEventListener('input', renderTasks);
    filterStatus.addEventListener('change', renderTasks);

    // Function to generate and render the calendar
    function generateCalendar() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // First Day of the Month (to get the starting day of the week)
        const firstDayOfMonth = new Date(year, month, 1).getDay();

        calendarDiv.innerHTML = "";

        // Add day names (Sun, Mon, etc.) to the calendar header
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        dayNames.forEach(day => {
            const dayNameDiv = document.createElement('div');
            dayNameDiv.classList.add('calendar-day', 'day-name');
            dayNameDiv.textContent = day;
            calendarDiv.appendChild(dayNameDiv);
        });

        // Add blank divs for the days before the 1st
        for (let i = 0; i < firstDayOfMonth; i++) {
            const blankDiv = document.createElement('div');
            calendarDiv.appendChild(blankDiv);
        }

        // Populate the days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('calendar-day');
            dayDiv.textContent = day;

            if (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
            ) {
                dayDiv.classList.add('today');
            }

            calendarDiv.appendChild(dayDiv);
        }
    }

    // Initial function calls
    renderTasks();
    updateProgress();
    generateCalendar();
    checkDailyStreak(); // New: Check the streak when the page loads
});

// All functions outside of the DOMContentLoaded listener remain unchanged
function setAlarm(message, timeInSeconds) {
    setTimeout(() => {
        alert(`⏰ Reminder: ${message}`);
        const alarmSound = new Audio('alarm.mp3');
        alarmSound.play().catch(error => {
            console.error("Error playing alarm sound:", error);
        });
    }, timeInSeconds * 1000);
}

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

function showNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    } else {
        console.log("Notification permission not granted. Cannot show notification.");
    }
}

setInterval(() => {
    showNotification('Progress Tracker', 'Don\'t forget to check your tasks today!');
}, 4 * 60 * 60 * 1000);
