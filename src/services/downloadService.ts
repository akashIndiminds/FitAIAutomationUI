import axios from 'axios';

export const startDownload = async (): Promise<void> => {
  try {
    // API call: POST /api/automate/DownloadFiles
    await axios.post('/api/automate/DownloadFiles');
  } catch (error) {
    console.error('Error starting download:', error);
    throw error;
  }
};