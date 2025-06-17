class Task {
    constructor(id, content, username) {
        this.id = id;
        this.content = content;
        this.status = 'pending';
        this.createdAt = new Date();
        this.username = username;
    }

    toggleStatus() {
        this.status = this.status === 'pending' ? 'done' : 'pending';
    }
}

class TaskManager {
    constructor() {
        this.tasks = [];
    }

    addTask(content, username) {
        const id = Date.now();
        const newTask = new Task(id, content, username);
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
            const task = new Task(taskData.id, taskData.content, taskData.username);
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
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');

const showAllBtn = document.getElementById('show-all');
const showPendingBtn = document.getElementById('show-pending');
const showDoneBtn = document.getElementById('show-done');

let currentFilter = 'all';

function renderTasks() {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Najpierw podaj nazwę użytkownika!');
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

        const content = document.createElement('span');
        content.textContent = `${task.content} [${task.status}]`;

        if (task.status === 'done') {
            content.classList.add('line-through', 'text-gray-500');
        }

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

    if (!username || !content) {
        alert('Podaj nazwę użytkownika i treść zadania!');
        return;
    }

    taskManager.addTask(content, username);
    taskContentInput.value = '';
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

