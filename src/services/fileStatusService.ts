import axios from 'axios';

export interface FileStatus {
  id: string;
  dir?: string;
  segment?: string;
  folderPath?: string;
  filename: string;
  filepath: string;
  fileSize?: string;
  filetype?: string;
  spName?: string;
  spParam?: string;
  spParamValue?: string;
  spPath?: string;
  spStatus?: number;
  dlStatus: number;
  ePath?: string;
  reserved?: string;
  lastModified?: string;
  spTime?: string;
  dlTime?: string;
  createdTime: string;
  downloadedAt?: string;
  importedAt?: string;
}

export const getFileStatus = async (startDate: string, endDate: string): Promise<FileStatus[]> => {
  try {
    // API call: GET /api/automate/status?startDate={startDate}&endDate={endDate}
    const response = await axios.get(`http://192.168.1.130:3000/api/automate/status`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting file status:', error);
    throw error;
  }
};