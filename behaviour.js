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
  const calendarDiv = document.getElementById('calendar'); // Corrected variable name

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));

  const updateProgress = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${percent}%`;
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
      tasks[+e.target.dataset.index].done = e.target.checked;
      saveTasks();
      updateProgress();
      renderTasks();
    }
  });

  projectsDiv.addEventListener('click', e => {
    if (e.target.matches('.delete-btn')) {
      tasks.splice(+e.target.dataset.index, 1);
      saveTasks();
      updateProgress();
      renderTasks();
    }
  });

  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    tasks.push({
      name: taskInput.value.trim(),
      date: dueDate.value,
      priority: priority.value,
      done: false
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

    calendarDiv.innerHTML = ""; // Corrected: Using calendarDiv

    // Add day names (Sun, Mon, etc.) to the calendar header
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach(day => {
      const dayNameDiv = document.createElement('div');
      dayNameDiv.classList.add('calendar-day', 'day-name'); // Added 'day-name' class for styling
      dayNameDiv.textContent = day;
      calendarDiv.appendChild(dayNameDiv);
    });

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
  generateCalendar(); // Call the calendar function inside the DOMContentLoaded listener
});

// Alarm function (note: 'alarm.mp3' will need to be in your project directory)
function setAlarm(message, timeInSeconds) {
  setTimeout(() => {
    alert(`⏰ Reminder: ${message}`);
    // Check if alarm.mp3 exists, otherwise, the play() method will fail
    const alarmSound = new Audio('alarm.mp3');
    alarmSound.play().catch(error => {
      console.error("Error playing alarm sound:", error);
    });
  }, timeInSeconds * 1000);
}

// Notification permissions and function
if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

function showNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, { body: message });
  } else {
    // You can handle the case where permission is not granted here
    console.log("Notification permission not granted. Cannot show notification.");
  }
}

// Example of calling showNotification periodically
setInterval(() => {
  showNotification('Progress Tracker', 'Don\'t forget to check your tasks today!');
}, 4 * 60 * 60 * 1000); // Every 4 hours
