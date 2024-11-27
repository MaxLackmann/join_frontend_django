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

/**
 * Asynchronously loads the users array from the 'users' data source and updates the global 'users' array.
 *
 * @return {Promise<void>} A Promise that resolves when the users array is updated.
 */
async function contactsArray() {
  let conctactsJson = await loadData('contacts');
  for (let key in conctactsJson) {
    let contact = conctactsJson[key];
    contacts.push(contact);
  }
}

/**
 * Asynchronously includes HTML content in elements with the attribute 'w3-include-html'.
 *
 * @return {Promise<void>} A Promise that resolves after including the HTML content.
 */
async function includeHTML() {
  let includeElements = document.querySelectorAll('[w3-include-html]');
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute('w3-include-html');
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = 'Page not found';
    }
  }
  focusSidebar();
  focusMobileSidebar();
  getuseremblem();
  openSidebarRules();
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
