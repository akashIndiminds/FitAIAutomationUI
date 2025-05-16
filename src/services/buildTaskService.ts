import axios from 'axios';

export const startBuildTask = async (startDate: string, endDate: string): Promise<void> => {
  try {
    // API call: GET /api/automate/buildTask?startDate={startDate}&endDate={endDate}
    await axios.get('http://192.168.1.130:3000/api/automate/buildTask', {
      params: { startDate, endDate }
    });
  } catch (error) {
    console.error('Error starting build task:', error);
    throw error;
  }
};