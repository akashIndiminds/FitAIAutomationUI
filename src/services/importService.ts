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

export const importFiles = async (files: FileStatus[]): Promise<FileStatus[]> => {
  try {
    // API call: POST /api/automate/ImportFiles
    const response = await axios.post('http://192.168.1.130:3000/api/automate/ImportFiles', { files });
    return response.data;
  } catch (error) {
    console.error('Error importing files:', error);
    throw error;
  }
};