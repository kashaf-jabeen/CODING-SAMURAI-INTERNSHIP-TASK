document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const taskCountSpan = document.getElementById('task-count');
    const progressBar = document.getElementById('progress-bar');

    // Load tasks from Local Storage or use default tasks
    let tasks = JSON.parse(localStorage.getItem('todoTasks')) || [
        { id: 'css-snippets', text: 'CSSnippets', completed: false },
        { id: 'html', text: 'html', completed: true },
        { id: 'css', text: 'css', completed: true },
        { id: 'javascript', text: 'javascript', completed: true }
    ];

    // Function to save tasks to Local Storage
    function saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    // Function to render tasks
    function renderTasks() {
        taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id; // Store ID for easy access

            li.innerHTML = `
                <input type="checkbox" id="${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="${task.id}">${task.text}</label>
                <div class="task-actions">
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">🗑️</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        updateProgress();
        saveTasks(); // Save tasks every time they are rendered
    }

    // Function to add a new task
    addTaskBtn.addEventListener('click', () => {
        const taskText = newTaskInput.value.trim();
        if (taskText !== '') {
            const newId = `task-${Date.now()}`; // Unique ID for each task
            const newTask = { id: newId, text: taskText, completed: false };
            tasks.push(newTask);
            newTaskInput.value = '';

            // Add new task with a fade-in animation
            const li = document.createElement('li');
            li.className = 'task-item fade-in'; // Apply fade-in class
            li.dataset.id = newTask.id;
            li.innerHTML = `
                <input type="checkbox" id="${newTask.id}">
                <label for="${newTask.id}">${newTask.text}</label>
                <div class="task-actions">
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">🗑️</button>
                </div>
            `;
            taskList.appendChild(li);

            updateProgress();
            saveTasks();
        }
    });

    // Handle task actions (checkbox, edit, delete) using event delegation
    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return; // If clicked outside a task item, do nothing

        const taskId = taskItem.dataset.id;
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        // Handle checkbox click
        if (target.type === 'checkbox') {
            tasks[taskIndex].completed = target.checked;
            taskItem.classList.toggle('completed', target.checked); // Add/remove 'completed' class
            updateProgress();
            saveTasks();
        }
        // Handle edit button click
        else if (target.classList.contains('edit-btn')) {
            const currentLabel = taskItem.querySelector('label');
            const currentText = currentLabel.textContent;

            // Create an input field
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = currentText;
            inputField.className = 'edit-input'; // Add a class for specific styling
            
            // Replace the label with the input field
            currentLabel.replaceWith(inputField);
            inputField.focus(); // Focus on the input field for immediate typing

            // Event listener to save changes when input field loses focus (blur)
            inputField.addEventListener('blur', () => {
                const newText = inputField.value.trim();
                if (newText !== '') {
                    tasks[taskIndex].text = newText; // Update task text in array
                    currentLabel.textContent = newText; // Update the label's text
                }
                // Replace input field back with the label
                inputField.replaceWith(currentLabel);
                saveTasks();
                renderTasks(); // Re-render to ensure consistency and correct styling
            }, { once: true }); // Ensure listener runs only once

            // Event listener to save changes when Enter key is pressed
            inputField.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    inputField.blur(); // Trigger the blur event to save
                }
            });
        }
        // Handle delete button click
        else if (target.classList.contains('delete-btn')) {
            taskItem.classList.add('fade-out'); // Add fade-out class for animation
            taskItem.addEventListener('transitionend', () => { // Wait for animation to finish
                tasks.splice(taskIndex, 1); // Remove task from the array
                renderTasks(); // Re-render the list
            }, { once: true }); // Ensure listener runs only once
        }
    });

    // Update progress bar and task count
    function updateProgress() {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        taskCountSpan.textContent = `${completedTasks} / ${totalTasks}`;

        const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Initial render when the page loads
    renderTasks();
});