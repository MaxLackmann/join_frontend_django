const BASE_URL =
  'http://127.0.0.1:8000/api/';

/**
 * Asynchronously loads data from a specified path using the Firebase Realtime Database API.
 * @param {string} [path=''] - The path to the data in the Firebase Realtime Database. Defaults to an empty string.
 * @return {Promise<Object>} - A promise that resolves to the parsed JSON response from the Firebase Realtime Database.
 */
async function loadData(path = '') {
  let response = await fetch(BASE_URL + path + '/');
  return await response.json();
}

/**
 * Asynchronously posts data to a specified path using the Firebase Realtime Database API.
 * @param {string} [path=''] - The path to the data in the Firebase Realtime Database. Defaults to an empty string.
 * @param {Object} [data={}] - The data to be posted. Defaults to an empty object.
 * @return {Promise<Object>} - A promise that resolves to the parsed JSON response from the Firebase Realtime Database.
 */
async function postData(path = '', data = {}) {
  const id = data.id;
  let response = await fetch(BASE_URL + path + '/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

/**
 * Deletes data from the server at the specified path.
 * @param {string} path - The path to the data to be deleted.
 * @return {Promise<Object>} A promise that resolves to the server's response or an error message.
 */
async function deleteData(path = '') {
  try {
      let response = await fetch(BASE_URL + path + '/', {
          method: 'DELETE',
      });

      // Check if the response is successful
      if (response.status === 204) {
          console.log('Delete successful, no content returned.');
          return { success: true };
      }

      if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
      }

      // Handle JSON response (if any)
      return await response.json();
  } catch (error) {
      console.error('Error deleting data:', error);
      return { success: false, message: error.message };
  }
}

/**
 * Updates data at the specified path using the Firebase Realtime Database API.
 * @param {string} path - The path to the data in the database (e.g., `contacts/2`).
 * @param {Object} data - The updated data to be sent.
 * @return {Promise<Object>} A promise that resolves to the server's response.
 */
async function putData(path = '', data = {}) {
  try {
      let response = await fetch(BASE_URL + path + '/', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      });

      if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
  } catch (error) {
      console.error('Error updating data:', error);
      return { success: false, message: error.message };
  }
}