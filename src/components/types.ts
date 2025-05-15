// types.ts (create this file if not already present)
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

export interface ActivityLog {
  id: string;
  action: string;
  status: string;
  timestamp: string;
  details: string;
  user: string;
}