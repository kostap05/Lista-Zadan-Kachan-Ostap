class Task {
    constructor(id, content, username, priority, category) {
        this.id = id;
        this.content = content;
        this.status = 'pending';
        this.createdAt = new Date();
        this.username = username;
        this.priority = priority;
        this.category = category;
    }

    toggleStatus() {
        this.status = this.status === 'pending' ? 'done' : 'pending';
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
    }

    addTask(content, username, priority, category) {
        const id = Date.now();
        const newTask = new Task(id, content, username, priority, category);
        this.tasks.push(newTask);
        this.saveTasks();
    }

    editTask(id, newContent) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.content = newContent;
            this.saveTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
    }

    toggleTaskStatus(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.toggleStatus();
            this.saveTasks();
        }
    }

    filterTasks(status) {
        if (status === 'all') return this.tasks;
        return this.tasks.filter(task => task.status === status);
    }

    getTasksForUser(username) {
        return this.tasks.filter(task => task.username === username);
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const tasksFromStorage = JSON.parse(localStorage.getItem('tasks')) || [];
        this.tasks = tasksFromStorage.map(taskData => {
            const task = new Task(
                taskData.id,
                taskData.content,
                taskData.username,
                taskData.priority,
                taskData.category
            );
            task.status = taskData.status;
            task.createdAt = new Date(taskData.createdAt);
            return task;
        });
    }
}

const taskManager = new TaskManager();
taskManager.loadTasks();

const usernameInput = document.getElementById('username');
const taskContentInput = document.getElementById('task-content');
const taskPriorityInput = document.getElementById('task-priority');
const taskCategoryInput = document.getElementById('task-category');
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

const showAllBtn = document.getElementById('show-all');
const showPendingBtn = document.getElementById('show-pending');
const showDoneBtn = document.getElementById('show-done');

let currentFilter = 'all';

function renderTasks() {
    const username = usernameInput.value.trim();
    if (!username) {
        taskList.innerHTML = '<li class="text-red-500">Podaj nazwę użytkownika!</li>';
        return;
    }

    const tasksForUser = taskManager.getTasksForUser(username);
    const filteredTasks = currentFilter === 'all'
        ? tasksForUser
        : tasksForUser.filter(task => task.status === currentFilter);

    taskList.innerHTML = '';

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center bg-white p-3 rounded shadow';

        const content = document.createElement('div');
        content.className = 'flex items-center gap-2';

        const textSpan = document.createElement('span');
        textSpan.textContent = task.content;
        if (task.status === 'done') {
            textSpan.classList.add('line-through', 'text-gray-500');
        }

        const priorityTag = document.createElement('span');
        priorityTag.textContent = task.priority;
        priorityTag.className = `priority-${task.priority}`;

        const categoryTag = document.createElement('span');
        categoryTag.textContent = task.category;
        categoryTag.className = 'category-tag';

        const statusSpan = document.createElement('span');
        statusSpan.textContent = `[${task.status}]`;
        statusSpan.className = 'text-sm text-gray-400';

        content.append(textSpan, priorityTag, categoryTag, statusSpan);

        const buttons = document.createElement('div');
        buttons.className = 'flex gap-2';

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '✓';
        toggleBtn.className = 'bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600';
        toggleBtn.onclick = () => {
            taskManager.toggleTaskStatus(task.id);
            renderTasks();
        };

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edytuj';
        editBtn.className = 'bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500';
        editBtn.onclick = () => {
            const newContent = prompt('Nowa treść zadania:', task.content);
            if (newContent) {
                taskManager.editTask(task.id, newContent);
                renderTasks();
            }
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Usuń';
        deleteBtn.className = 'bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600';
        deleteBtn.onclick = () => {
            if (confirm('Na pewno chcesz usunąć to zadanie?')) {
                taskManager.deleteTask(task.id);
                renderTasks();
            }
        };

        buttons.append(toggleBtn, editBtn, deleteBtn);
        li.append(content, buttons);
        taskList.appendChild(li);
    });
}

addTaskBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const content = taskContentInput.value.trim();
    const priority = taskPriorityInput.value;
    const category = taskCategoryInput.value;

    if (!username || !content) {
        alert('Podaj nazwę użytkownika i treść zadania!');
        return;
    }

    if (!priority || !category) {
        alert('Wybierz priorytet i kategorię!');
        return;
    }

    taskManager.addTask(content, username, priority, category);
    taskContentInput.value = '';
    taskPriorityInput.value = '';
    taskCategoryInput.value = '';
    renderTasks();
});

showAllBtn.addEventListener('click', () => {
    currentFilter = 'all';
    renderTasks();
});
showPendingBtn.addEventListener('click', () => {
    currentFilter = 'pending';
    renderTasks();
});
showDoneBtn.addEventListener('click', () => {
    currentFilter = 'done';
    renderTasks();
});

usernameInput.addEventListener('input', renderTasks);

renderTasks();
