/**
 * Initializes the board by including HTML, fetching user and task data, and updating the HTML.
 * @return {Promise<void>} A promise that resolves when the board is fully initialized.
 */
async function initBoard() {
  includeHTML();
  await contactsArray();
  await tasksArray();
  await updateHTML();
}

let boardEdit = [];
let status = ["toDo", "in Progress", "awaitFeedback", "done"];
let currentDraggedElement;

/**
 * Updates the HTML by calling functions to update tasks by status.
 */
async function updateHTML() {
  await tasksArray();
  updateTasksByStatus("toDo", "toDo");
  updateTasksByStatus("inProgress", "inProgress");
  updateTasksByStatus("awaitFeedback", "awaitFeedback");
  updateTasksByStatus("done", "done");
}

/**
 * Updates tasks on the board based on their status.
 * @param {string} status - The status of the tasks to be updated.
 * @param {string} elementId - The ID of the HTML element to update with the tasks.
 * @return {void} This function does not return a value.
 */
function updateTasksByStatus(status, elementId) {
  let filteredTasks = tasks.filter((task) => task.status == status);
  let boardCard = document.getElementById(elementId);
  boardCard.innerHTML = "";
  if (filteredTasks.length == 0) {
    boardCard.innerHTML = renderEmptyBoard(status);
    return;
  } else
    for (let i = 0; i < filteredTasks.length; i++) {
      boardCard.innerHTML += renderSmallCardHTML(filteredTasks[i], i);
      showSmallUsersEmblem(filteredTasks[i]);
      renderProgressBar(filteredTasks[i].cardId, tasks);
    }
}

/**
 * Returns the background color category based on the given task's category.
 * @param {Object} task - The task object containing the category.
 * @return {string} The background color category as a hexadecimal color code.
 */
function getBackgroundCategory(task) {
  switch (task.category) {
    case "User Story":
      return "#0038FF";
    case "Technical Task":
      return "#1FD7C1";
    case "Development":
      return "#FFBB2B";
    case "Editing":
      return "#FF5EB3";
  }
}

/**
 * Displays the small users emblem on the task card.
 * @param {Object} task - The task object containing the cardId and user count.
 * @return {void} This function does not return a value.
 */
function showSmallUsersEmblem(task) {
  let smallUsersEmblem = document.getElementById(
    `smallUsersEmblem${task.cardId}`
  );
  smallUsersEmblem.innerHTML = "";

  let { renderedCount, extraCount } = renderUserEmblems(task, smallUsersEmblem);

  if (extraCount > 0) {
    smallUsersEmblem.innerHTML += renderGreyEmblem(extraCount);
  }
}

/**
 * Renders user emblems in a container based on the provided task.
 * @param {Object} task - The task object containing the userIds of the users.
 * @param {HTMLElement} container - The container element where the emblems will be rendered.
 * @return {Object} An object containing the renderedCount and extraCount.
 */
function renderUserEmblems(task, container) {
  let renderedCount = 0;
  let extraCount = 0;

  if (task.userId && task.userId.length > 0) {
    for (let userId of task.userId) {
      if (userId == 0) continue;

      let user = users.find((u) => u.userId == userId);
      if (user) {
        if (renderedCount < 5) {
          container.innerHTML += renderSmallUsersEmblem(user);
          renderedCount++;
        } else {
          extraCount++;
        }
      }
    }
  }
  return { renderedCount, extraCount };
}

/**
 * Renders small subtasks HTML elements for a given task.
 * @param {Object} task - The task object containing subtasks.
 * @return {void} This function does not return anything.
 */
function renderSmallSubtasks(task) {
  let smallSubtask = document.getElementById(
    `subtaskProgressBar${task.cardId}`
  );
  if (task.subtask && task.subtask.length > 0) {
    for (let j = 0; j < task.subtask.length; j++) {
      const subtask = task.subtask[j];
      smallSubtask.innerHTML += `<div>${subtask}</div> `; // Append each subtask's HTML to the string
    }
  }
}

/**
 * Sets the `currentDraggedElement` to the provided `cardId` when dragging starts.
 * @param {string} cardId - The ID of the card being dragged.
 * @return {void} This function does not return anything.
 */
function startDragging(cardId) {
  currentDraggedElement = cardId;
}

/**
 * Prevents the default behavior of the event, allowing elements to be dragged and dropped.
 * @param {DragEvent} event - The event object representing the drag and drop action.
 * @return {void} This function does not return anything.
 */
function allowDrop(event) {
  event.preventDefault();
}

/**
 * Moves a task to a specified status by updating the task object and calling the updateBoard and updateHTML functions.
 * @param {DragEvent} event - The event object representing the drag and drop action.
 * @param {string} status - The status to which the task should be moved.
 * @return {Promise<void>} A promise that resolves when the task has been successfully moved and the HTML has been updated.
 */
async function moveTo(event, status) {
  event.stopPropagation();
  // Find the task object with the cardId equal to currentDraggedElement
  const task = tasks.find((t) => t.cardId == currentDraggedElement);
  task.status = status;
  removeHighlight(status);
  await updateBoard(status); // Assuming updateBoard is an async function
  await updateHTML();
}

/**
 * Updates the board by updating the status of a task in the tasks JSON data.
 * @param {string} status - The new status to update the task to.
 * @return {Promise<void>} A promise that resolves when the task has been successfully updated.
 */
async function updateBoard(status) {
  let tasksJSON = await loadData("tasks");
  console.log(tasksJSON);
  for (let key in tasksJSON) {
    let task = tasksJSON[key];
    if (task.cardId == currentDraggedElement) {
      task.status = status;
      await putData(`tasks/${task.cardId}`, task);
    }
  }
}

/**
 * Highlights an element with the specified cardId by adding the 'drag-area-highlight' class to its classList.
 * @param {string} cardId - The id of the element to highlight.
 * @return {void} This function does not return anything.
 */
function highlight(cardId) {
  document.getElementById(cardId).classList.add("drag-area-highlight");
}

/**
 * Removes the 'drag-area-highlight' class from the element with the specified status.
 * @param {string} status - The id of the element to remove the highlight from.
 * @return {void} This function does not return anything.
 */
function removeHighlight(status) {
  document.getElementById(status).classList.remove("drag-area-highlight");
}

/**
 * Returns the element ID corresponding to the given status.
 * @param {string} status - The status to get the element ID for.
 * @return {string} The element ID corresponding to the status, or an empty string if the status is not recognized.
 */
function getElementIdByStatus(status) {
  switch (status) {
    case "toDo":
      return "toDo";
    case "inProgress":
      return "inProgress";
    case "awaitFeedback":
      return "awaitFeedback";
    case "done":
      return "done";
    default:
      return "";
  }
}

/**
 * Asynchronously shows a big card on the page.
 * @param {string} cardId - The ID of the card to show.
 * @return {Promise<void>} A promise that resolves when the big card is shown.
 */
async function showBigCard(cardId) {
  document.getElementById("showBigCard").classList.remove("dnone");
  let content = document.getElementById("showBigCard");
  content.innerHTML = "";
  content.innerHTML = renderBigCardHTML(cardId);
  showBigUsersEmblem(cardId);
  renderBigSubtasks(cardId);
  openBigCardAnimation(`bigCard${cardId}`);
}

/**
 * Deletes a task from the board by calling the deleteTask function with the given cardId.
 * Then, it updates the HTML by calling the updateHTML function.
 * Finally, it closes the big card by calling the closeBigCard function.
 * @param {string} cardId - The ID of the card to be deleted.
 * @return {Promise<void>} A promise that resolves when the task is deleted and the HTML is updated.
 */
async function deleteTaskOfBoard(cardId) {
  await deleteTask(cardId);
  await updateHTML();
  closeBigCard();
}

/**
 * Deletes a task associated with a given card ID.
 * @param {string} cardId - The ID of the card associated with the task.
 * @return {Promise<void>} A promise that resolves when the task is deleted.
 */
async function deleteTask(cardId) {
  await deleteData(`tasks/${cardId}`);
}

/**
 * Retrieves the selected user IDs from checkboxes in the '.contactlist' element.
 * @return {Array} An array of user IDs that are selected.
 */
function getSelectedUserIds() {
  let checkboxes = document.querySelectorAll(
    '.contactlist input[type="checkbox"]:checked'
  );
  let selectedUserIds = [];
  for (let checkbox of checkboxes) {
    let userId = checkbox.getAttribute("data-userid");
    selectedUserIds.push(userId);
  }
  return selectedUserIds;
}

/**
 * Updates the status of a subtask and refreshes the HTML display.
 * @param {string} cardId - The ID of the card containing the subtask.
 * @param {string} isubtask - The ID of the subtask to update.
 * @return {Promise<void>} A promise that resolves when the subtask status is updated and the HTML display is refreshed.
 */
async function checkedSubtask(cardId, subtaskIndex) {
  let tasksJSON = await loadData("tasks");
  let task = tasksJSON.find((task) => task.cardId == cardId);
  console.log("task:", task);

  if (!task) {
    console.error(`Task mit cardId ${cardId} wurde nicht gefunden.`);
    return;
  }

  let subtask = task.subtasks[subtaskIndex];
  if (!subtask) {
    console.error(`Subtask bei Index ${subtaskIndex} wurde nicht gefunden.`);
    return;
  }

  console.log(`Subtask mit ID ${subtask.id} gefunden in Task ${cardId}`);

  // Generiere die Checkbox-ID basierend auf dem Index
  let checkboxId = `checkbox${subtaskIndex}`;
  console.log(`Erwartete Checkbox ID: ${checkboxId}`);

  // Suche nach der Checkbox
  let checkbox = document.getElementById(checkboxId);
  if (!checkbox) {
    console.error(`Checkbox mit ID '${checkboxId}' wurde nicht gefunden.`);
    document.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      console.log(`Gefundene Checkbox ID: ${input.id}`);
    });
    return;
  }

  let value = checkbox.checked;
  console.log(`Subtask ${subtask.id} aktualisieren mit Wert: ${value}`);

  await updateSubtasks(cardId, subtask.id, value);
  await updateHTML();
}

async function updateSubtasks(cardId, isubtask, value) {
  let tasksJSON = await loadData("tasks");
  for (let key in tasksJSON) {
    let task = tasksJSON[key];
    if (task.cardId == cardId) {
      let subtask = task.subtasks.find((sub) => sub.id === isubtask);
      if (subtask) {
        subtask.checked = value; // Aktualisiere den `checked`-Status
        await putData(`tasks/${task.cardId}/subtasks/${isubtask}`, subtask);
        console.log(`tasks/${task.cardId}/subtasks/${isubtask}`, subtask);
      }
    }
  }
}

/**
 * Renders a progress bar for a given card ID and tasks.
 * @param {string} cardId - The ID of the card to render the progress bar for.
 * @param {Array} tasks - The array of tasks to search for the task with the given card ID.
 * @return {void} This function does not return anything.
 */
function renderProgressBar(cardId, tasks) {
  const task = tasks.find((t) => t.cardId == cardId);
  let subtasks = task.subtask;
  updateProgressBarDisplay(cardId, subtasks);
}

/**
 * A function that handles moving a card to a different status on a mobile device.
 * @param {string} status - The status to move the card to.
 * @param {number} cardId - The ID of the card to be moved.
 * @param {Event} event - The event that triggered the move.
 * @return {void} This function does not return anything.
 */
async function mobilemoveTo(status, cardId, event) {
  event.stopPropagation();
  currentDraggedElement = cardId;
  moveTo(event, status);
}

/**
 * Opens the mobile options for a specific card.
 * @param {number} cardId - The ID of the card.
 * @param {string} status - The status of the card.
 * @param {Event} event - The event object that triggered the function.
 * @return {void} This function does not return anything.
 */
function openMobileOptions(cardId, status, event) {
  event.stopPropagation();
  let link = document.getElementById("moveTo_" + cardId + "_" + status);
  link.classList.add("disabled");
  document.getElementById("amobile_boardOptions" + cardId).style.display =
    "flex";
}

/**
 * Closes the mobile options for a specific card.
 * @param {Event} event - The event object that triggered the function.
 * @param {number} cardId - The ID of the card for which options are being closed.
 * @return {void} This function does not return a value.
 */
function closeMobilOptions(event, cardId) {
  event.stopPropagation();
  document.getElementById("amobile_boardOptions" + cardId).style.display =
    "none";
}

let mobilWindow = window.matchMedia("(max-width: 770px)");
mobilWindow.addEventListener("change", myFunc);

/**
 * Updates the display style of elements with the class 'mobileBoard' based on the current media query match.
 * @return {void} This function does not return a value.
 */
function myFunc() {
  const elements = document.querySelectorAll(".mobileBoard");
  elements.forEach((element) => {
    if (mobilWindow.matches) {
      element.style.display = "flex";
    } else {
      element.style.display = "none";
    }
  });
}

/**
 * Updates the display style of elements with the class 'mobileBoard' based on the current window width.
 * @return {void} This function does not return a value.
 */
function mobileDetails() {
  const elements = document.querySelectorAll(".mobileBoard");
  outWidth = window.innerWidth;
  elements.forEach((element) => {
    if (outWidth <= 770) {
      element.style.display = "flex";
    } else {
      element.style.display = "none";
    }
  });
}
