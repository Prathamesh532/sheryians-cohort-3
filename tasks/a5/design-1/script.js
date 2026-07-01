console.log("Lets Start");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const taskSection = document.querySelector("section.main");
  if (!taskSection) return;

  if (tasks.length === 0) {
    taskSection.innerHTML = "<p>No tasks yet. Add one to see task cards here.</p>";
    return;
  }

  taskSection.innerHTML = tasks
    .map(
      (task, index) => `
        <div class="card">
          <div>
            <div>
              <span>Task Name:-</span>
              <span class="card_title">${task.title}</span>
            </div>
            <div>
              <span>Category:-</span>
              <span class="card_category">${task.category}</span>
            </div>
          </div>
          <div>
            <button class="complete_btn" onclick="completeTask(${index})">Complete</button>
            <button class="delete_btn" onclick="deleteTask(${index})">Delete</button>
            <button class="edit_btn" onclick="editTask(${index})">Edit</button>
          </div>
        </div>
      `
    )
    .join("");
}

function openTaskFrom(e) {
  if (e) e.stopPropagation();
  const cardLayerDiv = document.querySelector(".layer");
  if (cardLayerDiv) cardLayerDiv.classList.add("card_layer_active");
}

function onTaskFormSumbit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const title = document.querySelector("#title").value.trim();
  const category = document.querySelector("#category").value;

  if (!title) {
    alert("Please add a title");
    return;
  }

  const newTask = { title, category };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  onCloseTaskFrom();
}

function onCloseTaskFrom(e) {
  if (e) e.preventDefault();
  const cardLayerDiv = document.querySelector(".layer");
  if (cardLayerDiv) cardLayerDiv.classList.remove("card_layer_active");
  document.querySelector("#title").value = "";
  document.querySelector("#category").value = "Work";
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function completeTask(index) {
  alert(`Task completed: ${tasks[index].title}`);
}

function editTask(index) {
  alert(`Edit task: ${tasks[index].title}`);
}

renderTasks();
