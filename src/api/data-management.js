import { useApi } from './api-config';
import { sendApi } from './api-helpers';

class DataManagementApi {
    async downloadBackup() {
      if (useApi) {
        try {
          const response = await sendApi(`/api/backup`, {
            method: 'GET',
          }, true, "application/octet-stream");

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          console.log('success', blob);
          return Promise.resolve(blob);
        } catch (error) {
          console.error('Error:', error);
          return Promise.reject(error);
        }
      }
      // Fallback action when API is not available
      return Promise.resolve(null);
    }
}
  
  export const dataManagementApi = new DataManagementApi();
