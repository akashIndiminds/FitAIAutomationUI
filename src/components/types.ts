///components/types
export interface ActivityLogI {
  id: number;
  dir: string;
  segment: string;
  filename: string;
  filetype: string;
  spName: string;
  spStatus: number; 
  dlStatus: number; 
  lastModified: string;
}
export interface FileStatus {
  id: string;
  dir: string;
  segment: string;
  folderPath: string;
  filename: string;
  filepath: string;
  filetype: string;
  spName: string;
  spParam: string;
  spParamValue: string;
  spPath: string;
  spStatus: number;
  dlStatus: number;
  ePath: string;
  reserved: string;
  lastModified: string;
  spTime: string;
  dlTime: string;
  createdTime: string;
  fileSize: string;
}

export interface FileStats {
  totalFiles: number;
  pendingFiles: number;
  downloadedFiles: number;
  importedFiles: number;
  processingSpeed: string;
  lastUpdated: string;
}
