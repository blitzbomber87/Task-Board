// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task id
function generateTaskId() {
  const id = nextId;
  nextId++;
  localStorage.setItem("nextId", JSON.stringify(nextId));
  return id;
}

// Create a task card
function createTaskCard(task) {
  const card = $('<div>')
    .addClass('card mb-3 task-card')
    .attr('data-id', task.id)
    .append(
      $('<div>')
        .addClass('card-body')
        .append(
          $('<h5>').addClass('card-title').text(task.title),
          $('<p>').addClass('card-text').text(task.description),
          $('<p>')
            .addClass('card-text text-muted')
            .text(`Due: ${dayjs(task.dueDate).format('MM/DD/YYYY')}`),
          $('<button>')
            .addClass('btn btn-danger delete-task')
            .text('Delete')
        )
    );

  // Set background color based on due date
  const today = dayjs();
  const dueDate = dayjs(task.dueDate);
  if (dueDate.isBefore(today, 'day')) {
    card.addClass('bg-danger text-white');
  } else if (dueDate.isSame(today, 'day')) {
    card.addClass('bg-warning text-dark');
  }

  return card;
}

// Render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards, #in-progress-cards, #done-cards').empty();

  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    $(`#${task.status}-cards`).append(taskCard);
  });

  // Make cards draggable
  $('.task-card').draggable({
    revert: true,
    helper: 'clone'
  });

  // Save task list to localStorage
  localStorage.setItem('tasks', JSON.stringify(taskList));
}

// Handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $('#task-title').val().trim();
  const description = $('#task-desc').val().trim();
  const dueDate = $('#task-date').val().trim();

  if (title && description && dueDate) {
    const task = {
      id: generateTaskId(),
      title,
      description,
      dueDate,
      status: 'todo'
    };

    taskList.push(task);
    renderTaskList();

    // Clear the form
    $('#task-form')[0].reset();
    $('#formModal').modal('hide');
  }
}

// Handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.task-card').data('id');
  taskList = taskList.filter(task => task.id !== taskId);
  renderTaskList();
}

// Handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const card = ui.helper.clone();
  const status = $(this).attr('id').split('-')[0];
  const taskId = card.data('id');

  taskList.forEach(task => {
    if (task.id === taskId) {
      task.status = status;
    }
  });

  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $('#task-form').on('submit', handleAddTask);
  $(document).on('click', '.delete-task', handleDeleteTask);

  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });

  $('#task-date').datepicker({
    dateFormat: 'mm/dd/yy'
  });
});