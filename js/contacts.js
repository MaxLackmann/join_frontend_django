/**
 * Initializes the contact functionality by including HTML, loading contacts data asynchronously,
 * and rendering the list of contacts.
 * @return {Promise<void>} A promise that resolves when the initialization is complete.
 */
async function initContact() {
  await includeHTML();
  await contactsArray();
  renderListContact();
}

/**
 * Asynchronously loads contacts data from the server and populates the contacts array.
 */
async function contactsArray() {
  let contactsJson = await loadData("contacts");
  for (key in contactsJson) {
    let contact = contactsJson[key];
    console.log('Loaded contact:', contact); // Debugging-Ausgabe
    contacts.push(contact);
  }
}

/**
 * Creates a new contact and adds it to the contacts array.
 * @param {Event} event - The event object for the form submission.
 * @return {Promise<void>} - A promise that resolves when the new contact is added and saved to the server.
 */
async function newContact(event) {
  event.preventDefault();
  let lastContactId = findLastContactId(contacts);
  let nameContact = document.getElementById("nameContact").value;
  let nameContactUpper = nameContact[0].toUpperCase() + nameContact.slice(1);
  let newContact = {
    contactId: lastContactId + 1,
    name: nameContactUpper,
    email: document.getElementById("emailContact").value,
    phone: document.getElementById("phoneContact").value,
    emblem: renderEmblem(nameContact),
    color: colorRandom(),
    checked: false,
  };
  contacts.push(newContact);
  await postData("contacts", newContact);
  showNewContactDetails(newContact);
}

/**
 * Asynchronously edits a contact by updating its properties and saving the changes to the server.
 * @param {Event} event - The event object for the form submission.
 * @param {number} i - The index of the contact to be edited in the contacts array.
 * @return {Promise<void>} A promise that resolves when the contact is successfully edited and saved.
 */
async function editContact(event, i) {
  event.preventDefault();
  contactEdit = contacts[i];
  console.log("Editing contact:", contactEdit); // Debugging-Ausgabe
  contactEdit["name"] = document.getElementById("nameContact").value;
  contactEdit["email"] = document.getElementById("emailContact").value;
  contactEdit["phone"] = document.getElementById("phoneContact").value;
  contactEdit["emblem"] = renderEmblem(
    document.getElementById("nameContact").value
  );
  try {
    await databaseUpdate(contactEdit); // Aufruf der Update-Funktion
  } catch (error) {
    console.error("Error updating contact:", error);
  }
  closeDialog();
  cleanContactControls();
  renderListContact();
  showDetailContact(i);
}

/**
 * Asynchronously deletes a contact by removing it from the contacts array, clearing the details div,
 * deleting the contact from the server, and re-rendering the list of contacts. If the window width is
 * less than or equal to 710 pixels, it also navigates back to the mobile contact list.
 * @param {number} i - The index of the contact to be deleted in the contacts array.
 * @return {Promise<void>} A promise that resolves when the contact is successfully deleted.
 */
async function deleteContact(i) {
  let contactDelete = contacts[i];
  contacts.splice(i, 1);
  document.getElementById("divDetails").innerHTML = "";
  await databaseDelete(contactDelete);
  renderListContact();
  if (window.innerWidth <= 710) {
    backMobileContListe();
  }
}

/**
 * Updates a contact in the database using the contact's ID.
 * @param {Object} contactEdit - The updated contact data to be applied.
 * @return {Promise<void>} A promise that resolves when the contact is successfully updated.
 */
async function databaseUpdate(contactEdit) {
  try {
    // Nutze die ID und übergebe das aktualisierte Kontakt-Objekt
    await putData(`contacts/${contactEdit.id}`, contactEdit);
    console.log(`Contact with ID ${contactEdit.id} updated successfully`);
  } catch (error) {
    console.error("Error updating contact:", error);
  }
}

/**
 * Deletes a contact from the database using the contact's ID.
 * @param {Object} contactDelete - The contact object to be deleted.
 * @return {Promise<void>} A promise that resolves when the contact is successfully deleted.
 */
async function databaseDelete(contactDelete) {
  try {
    // Use the contact's `id` directly in the DELETE request
    console.log(`Deleting contact with ID: ${contactDelete.id}`);
    await deleteData(`contacts/${contactDelete.id}`);
    console.log("Contact deleted successfully");
  } catch (error) {
    console.error("Error during firebaseDelete:", error);
  }
}

/**
 * Generates an emblem based on the given name.
 * @param {string} name - The name to generate the emblem from.
 * @return {string} The generated emblem.
 */
function renderEmblem(name) {
  let aux = name.split(" ");
  let capital = "";
  for (let j = 0; j < aux.length; j++) {
    if (j <= 1) {
      capital += aux[j].slice(0, 1).toUpperCase();
    }
  }
  return capital;
}

/**
 * Generates a random color from the given array of colors.
 * @return {string} The randomly generated color.
 */
function colorRandom() {
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Sorts the contacts array in ascending order based on the contact's name.
 * @return {void} This function does not return anything.
 */
function sortContacts() {
  contacts = contacts.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  });
}

/**
 * Displays detailed information about a specific contact.
 * @param {number} i - The index of the contact in the contacts array.
 * @return {void} This function does not return anything.
 */
function showDetailContact(i) {
  removeSelectedClassFromAllContacts();
  addSelectedClassToCurrentContact(i);
  displayContactDetails(i);
}

/**
 * Removes the 'contact-list-container-selected' class from all contact list containers.
 * This function ensures that no contact list container is marked as selected.
 * @return {void} This function does not return anything.
 */
function removeSelectedClassFromAllContacts() {
  let allContactContainers = document.querySelectorAll(
    ".contact-list-container"
  );
  for (let i = 0; i < allContactContainers.length; i++) {
    let container = allContactContainers[i];
    container.classList.remove("contact-list-container-selected");
  }
}

/**
 * Adds the 'contact-list-container-selected' class to the currently selected contact.
 * @param {number} i - The index of the contact in the contacts array.
 * @return {void} This function does not return anything.
 */
function addSelectedClassToCurrentContact(i) {
  let contactListContainer = document.getElementById(
    `contactListContainer${i}`
  );
  contactListContainer.classList.add("contact-list-container-selected");
}

/**
 * Displays the details of the selected contact.
 * @param {number} i - The index of the contact in the contacts array.
 * @return {void} This function does not return anything.
 */
function displayContactDetails(i) {
  let infoContact = document.getElementById("divDetails");
  infoContact.innerHTML = " ";
  infoContact.classList.remove("move-left");
  infoContact.offsetWidth;
  infoContact.classList.add("move-left");
  infoContact.innerHTML += renderContactinList(i);
  mobileDetails();
}

/**
 * Opens a dialog box for adding or editing a contact.
 * @param {boolean} newContact - Indicates whether to open the dialog for adding a new contact or editing an existing one.
 * @param {number} i - The index of the contact in the contacts array (only used when editing an existing contact).
 * @return {void} This function does not return anything.
 */
function openDialog(newContact, i) {
  let dialog = document.getElementById("dialog");
  dialog.classList.remove("d-none");
  if (newContact == true) {
    let functionNew = "newContact(event)";
    dialog.innerHTML = renderContactDialog(
      "Add contact",
      functionNew,
      "Create Contact"
    );
  } else {
    let contact = contacts[i];
    let functionNew = "editContact(event," + i + ")";
    dialog.innerHTML = renderContactDialog("Edit contact", functionNew, "Save");
    document.getElementById(
      "iconContact"
    ).outerHTML = `<div class="emblem-info" id="emblemContact" style="background-color: ${contact["color"]}">${contact["emblem"]}</div>`;
    document.getElementById("textAdd").classList.add("d-none");
    document.getElementById("nameContact").value = contact["name"];
    document.getElementById("emailContact").value = contact["email"];
    document.getElementById("phoneContact").value = contact["phone"];
  }
}

/**
 * Closes the dialog box.
 * @return {void} This function does not return anything.
 */
function closeDialog() {
  let mobileMode = document.getElementById("amobile_nameContact");
  if (mobileMode != null && mobileMode.style.display == "flex") {
    mobileMode.style.display = "none";
  }
  let dialog = document.getElementById("dialog");
  dialog.classList.add("d-none");
}

/**
 * Finds the last contact ID in the given array of contacts.
 * @param {Array} contacts - An array of contact objects.
 * @return {number} The last contact ID found in the array.
 */
function findLastContactId(contacts) {
  let lastId = 1;
  for (let i = 1; i < contacts.length; i++) {
    if (contacts[i].contactId > lastId) {
      lastId = contacts[i].contactId;
    }
  }
  return lastId; // found the last contact.id
}

/**
 * Displays the details of a newly created contact.
 * @param {Object} newContact - The newly created contact object.
 * @return {void} This function does not return a value.
 */
function showNewContactDetails(newContact) {
  closeDialog();
  cleanContactControls();
  renderListContact();
  document.getElementById("contactCreated").classList.remove("d-none");
  for (let i = 0; i < contacts.length; i++) {
    if (newContact.name == contacts[i].name) {
      let infoContact = document.getElementById("divDetails");
      infoContact.innerHTML = " ";
      infoContact.classList.remove("move-left");
      infoContact.innerHTML += renderContactinList(i);
      mobileDetails();
    }
  }
  contactCreatedDiv();
}

/**
 * Sets a timeout to hide the 'contactCreated' element after 2400 milliseconds.
 * @return {void} This function does not return a value.
 */
function contactCreatedDiv() {
  setTimeout(() => {
    document.getElementById("contactCreated").classList.add("d-none");
  }, 2400);
}

/**
 * Clears the values of the 'nameContact', 'emailContact', and 'phoneContact' input fields.
 * @return {void} This function does not return a value.
 */
function cleanContactControls() {
  document.getElementById("nameContact").value = "";
  document.getElementById("emailContact").value = "";
  document.getElementById("phoneContact").value = "";
}

let mobilWindow = window.matchMedia("(max-width:710px)");
mobilWindow.addEventListener("change", () => myFunc());

/**
 * Function to handle mobile window changes and adjust contact details display accordingly.
 */
function myFunc() {
  if (mobilWindow.matches) {
    document.getElementById("divContactDetails").style.display = "none";
    document.getElementById("divContactList").style.display = "flex";
  } else {
    document.getElementById("divContactDetails").style.display = "flex";
    document.getElementById("divContactList").style.display = "flex";
    let amobileDiv = document.getElementById("amobile_nameContact");
    if (amobileDiv != null) {
      amobileDiv.style.display = "none";
    }
  }
}

/**
 * Toggles the display of the contact details and contact list based on the window width.
 * If the window width is less than or equal to 710 pixels, the contact details are displayed and the contact list is hidden.
 * The 'move-left' class is removed from the 'divDetails' element.
 * @return {void} This function does not return a value.
 */
function mobileDetails() {
  outWidth = window.innerWidth;
  if (outWidth <= 710) {
    document.getElementById("divContactDetails").style.display = "flex";
    document.getElementById("divContactList").style.display = "none";
    document.getElementById("divDetails").classList.remove("move-left");
  }
}

/**
 * Hides the contact details and displays the contact list when the window width is less than or equal to 710 pixels.
 * @return {void} This function does not return a value.
 */
function backMobileContListe() {
  outWidth = window.innerWidth;
  if (outWidth <= 710) {
    document.getElementById("divContactDetails").style.display = "none";
    document.getElementById("divContactList").style.display = "flex";
  }
}

/**
 * Toggles the display of the "mobileMode" element. If the element is currently hidden, it will be displayed as a flex container. If it is already displayed, it will be hidden.
 * @return {void} This function does not return a value.
 */
function openMobileDialog() {
  let mobileMode = document.getElementById("amobile_nameContact");
  if (mobileMode != null) {
    if (mobileMode.style.display == "none") {
      mobileMode.style.display = "flex";
    } else {
      mobileMode.style.display = "none";
    }
  }
}
