let colors = [
  '#FF7A00',
  '#FF5EB3',
  '#6E52FF',
  '#9327FF',
  '#00BEE8',
  '#1FD7C1',
  '#FF745E',
  '#FFA35E',
  '#FC71FF',
  '#FFC701',
  '#0038FF',
  '#C3FF2B',
  '#FFE62B',
  '#FF4646',
  '#FFBB2B',
];

let categorys = ['Technical Task', 'User Story', 'Development', 'Editing'];
let contacts = [];
let tasks = [];
let taskContacts = [];
let isTasksArrayLoading = false;

/**
 * Asynchronously loads the tasks array from the 'tasks' data source and updates the global 'tasks' array.
 *
 * @return {Promise<void>} A Promise that resolves when the tasks array is updated.
 */
async function tasksArray() {
  if (isTasksArrayLoading) {
    return;
  }
  isTasksArrayLoading = true;
  try {
    tasks = [];

    let tasksJson = await loadData('tasks');

    for (let key in tasksJson) {
      let task = tasksJson[key];
      tasks.push(task);
    }
  } finally {
    isTasksArrayLoading = false;
  }
}

async function contactsArray() {
  try {
    let conctactsJson = await loadData('contacts');
    for (let key in conctactsJson) {
      let contact = conctactsJson[key];
      contacts.push(contact);
    }
  } catch (error) {
    console.error('Fehler beim Laden von Kontakten:', error);
  }
}

async function taskContactsArray() {
  try {
    let taskContactsJson = await loadData('taskcontacts'); // Anstatt 'contacts'
    for (let key in taskContactsJson) {
      let taskContact = taskContactsJson[key];
      taskContacts.push(taskContact); // Hier kommen die Task-Contact-Verknüpfungen
    }
  } catch (error) {
    console.error('Fehler beim Laden von Task-Contacts:', error);
  }
  console.log('Task-Contacts geladen:', taskContacts);
}

/**
 * Dynamically includes HTML content from specified files into elements with the 'w3-include-html' attribute.
 * @return {Promise<void>}
 */
async function includeHTML() {
  let includeElements = document.querySelectorAll('[w3-include-html]');
  for (let element of includeElements) {
    let file = element.getAttribute('w3-include-html');
    try {
      let response = await fetch(file);
      if (response.ok) {
        element.innerHTML = await response.text();
      } else {
        console.error(`Error fetching file: ${file}, Status: ${response.status}`);
        element.innerHTML = 'Content not found';
      }
    } catch (error) {
      console.error(`Error including HTML for ${file}:`, error);
    }
  }
}

/**
 * Fokus auf die Sidebar-Links setzen.
 */
function focusSidebar() {
  let currentPage = window.location.href.split('/').pop();
  let menu = document.getElementById('mysidebar');
  let links = menu.getElementsByTagName('a');
  for (let i = 0; i < links.length; i++) {
    let linkHref = links[i].getAttribute('href');
    if (linkHref.replace('./', '') === currentPage.replace('?', '')) {
      links[i].focus();
      links[i].classList.add('active');
      break;
    }
  }
}

/**
 * Fokus auf die Mobile Sidebar-Links setzen.
 */
function focusMobileSidebar() {
  let currentPage = window.location.href.split('/').pop();
  let mobileMenu = document.getElementById('mobile-menu');
  let mobileLinks = mobileMenu.getElementsByTagName('a');
  for (let i = 0; i < mobileLinks.length; i++) {
    let linkHref = mobileLinks[i].getAttribute('href');
    if (linkHref.replace('./', '') === currentPage.replace('?', '')) {
      mobileLinks[i].focus();
      mobileLinks[i].classList.add('active');
      break;
    }
  }
}

let usersJsonCache = null; // Cache für Benutzer
let usersLoadingPromise = null; // Promise für laufende Datenabfrage

/**
 * Lädt Benutzer nur einmal und speichert sie im Cache.
 */
async function loadUsers() {
  if (usersJsonCache) {
    return usersJsonCache;
  }

  if (!usersLoadingPromise) {
    usersLoadingPromise = loadData('users');
  }

  usersJsonCache = await usersLoadingPromise;
  usersLoadingPromise = null;
  return usersJsonCache;
}

/**
 * Holt den eingeloggten Benutzer basierend auf `userId` aus `sessionStorage`.
 */
async function getUserLogin() {
  let userID = window.sessionStorage.getItem('userId');
  let usersJson = await loadUsers();

  if (!userID) {
    return usersJson.find(user => user.id === 0); // Gast-Benutzer
  }

  let loggedInUser = usersJson.find(user => user.id.toString() === userID);
  if (!loggedInUser) {
    return usersJson.find(user => user.id === 0); // Fallback
  }

  return loggedInUser; // Rückgabe des gefundenen Benutzers
}

let currentUserCache = null; // Globale Variable für eingeloggten Benutzer

/**
 * Holt das Emblem des aktuellen Benutzers.
 */
async function getuseremblem() {
  if (!currentUserCache) {
    currentUserCache = await getUserLogin(); // Benutzerdaten laden, wenn Cache leer ist
  }
  const emblemUser = document.getElementById('emblemUser');
  if (emblemUser) {
    emblemUser.innerHTML = currentUserCache?.emblem || ''; // Emblem setzen
  }
}


/**
 * Logs out the current user by removing the user ID from session storage and redirecting to the index page.
 *
 * @return {void} This function does not return anything.
 */
function userLogOut() {
  window.sessionStorage.removeItem('userId');
  window.location.href = '../index.html';
}

async function openSidebarRules() {
  let currentUser = await getUserLogin();
  let sidebarRules = document.getElementById('menu');

  if (!currentUser || currentUser.userId === '0') {
    if (sidebarRules) sidebarRules.style.display = 'block';
  } else {
    if (sidebarRules) sidebarRules.style.display = 'block';
  }
}

async function checkUserAccess() {
  let userID = window.sessionStorage.getItem('userId');

  // Ausnahme für die index.html: keine Weiterleitung
  if (window.location.pathname.includes('/index.html')) {
    return;
  }

  if (!userID) {
    window.location.href = '/index.html';
    return;
  }

  if (userID !== '0') {
    let currentUser = await getUserLogin();
    if (!currentUser) {
      window.location.href = '/index.html';
      return;
    }
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  await checkUserAccess();
});
