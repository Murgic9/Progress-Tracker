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
      saveTasks(); updateProgress(); renderTasks();
    }
  });

  projectsDiv.addEventListener('click', e => {
    if (e.target.matches('.delete-btn')) {
      tasks.splice(+e.target.dataset.index, 1);
      saveTasks(); updateProgress(); renderTasks();
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
    saveTasks(); updateProgress(); renderTasks();
    taskForm.reset();
  });

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
  });

  searchInput.addEventListener('input', renderTasks);
  filterStatus.addEventListener('change', renderTasks);

  renderTasks();
  updateProgress();
});
