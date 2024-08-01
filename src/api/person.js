import axios from 'axios';
import { sendApi } from './api-helpers'; // Assuming sendApi is a utility to send API requests
import { apiUri } from './api-config'; // Base URI for your API

class PersonApi {
  /**
   * Create a new person.
   * 
   * @param {Object} person - Person details.
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  createPerson({
    personFirstName,
    personLastName,
    personUid,
    personMobileNumber,
    personEmail,
    accessGroup,
  }) {
    const payload = {
      personFirstName: personFirstName || null,
      personLastName: personLastName || null,
      personUid: personUid || null,
      personMobileNumber: personMobileNumber || null,
      personEmail: personEmail || null,
      accessGroup: accessGroup || null,
    };

    return sendApi('/api/person', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Get all persons.
   * 
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  getPersons() {
    return sendApi('/api/persons');
  }

  /**
   * Get a specific person by ID.
   * 
   * @param {number} id - The ID of the person.
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  getPerson(id) {
    return sendApi(`/api/person/${id}`);
  }

  /**
   * Update an existing person.
   * 
   * @param {Object} person - Updated person details.
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  updatePerson({
    personId,
    personFirstName,
    personLastName,
    personUid,
    personMobileNumber,
    personEmail,
    accessGroup,
  }) {
    const payload = {
      personId: personId || null,
      personFirstName: personFirstName || null,
      personLastName: personLastName || null,
      personUid: personUid || null,
      personMobileNumber: personMobileNumber || null,
      personEmail: personEmail || null,
      accessGroup: accessGroup || null,
    };

    return sendApi('/api/person', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Delete a person by ID.
   * 
   * @param {number} id - The ID of the person to delete.
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  deletePerson(id) {
    return sendApi(`/api/person/${id}`, { method: 'DELETE' });
  }

  /**
   * Check if a UID exists.
   * 
   * @param {string} uid - The UID to check.
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  uidExists(uid) {
    return sendApi(`/api/person/uid/${uid}`);
  }

  /**
   * Check if a UID is in use by someone other than the specified ID.
   * 
   * @param {string} uid - The UID to check.
   * @param {number} id - The ID to exclude.
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  uidInUse(uid, id) {
    return sendApi(`/api/person/uid/${id}/${uid}`);
  }

  /**
   * Check if a mobile number exists.
   * 
   * @param {string} mobileNumber - The mobile number to check.
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  mobileNumberExists(mobileNumber) {
    return sendApi(`/api/person/mobileNumber/${mobileNumber}`);
  }

  /**
   * Check if an email exists.
   * 
   * @param {string} email - The email to check.
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  emailExists(email) {
    return sendApi(`/api/person/email/${email}`);
  }

  /**
   * Upload a CSV file for importing persons.
   * 
   * @param {FormData} formData - The form data containing the CSV file.
   * @returns {Promise<AxiosResponse>} - A Promise resolving to the API response.
   */
  postCSV(formData) {
    return axios.post(apiUri + '/api/person/importcsv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get JSON data from a CSV import.
   * 
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  getCSVJson() {
    return sendApi('/api/person/importcsv/json');
  }

  /**
   * Upload green data file.
   * 
   * @param {File} file - The file to upload.
   * @returns {Promise<Response>} - A Promise resolving to the API response.
   */
  postGreenData(file) {
    return sendApi('/api/person/importcsv/greenData', {
      method: 'POST',
      body: file,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const personApi = new PersonApi();
