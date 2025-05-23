///components/types
export interface ActivityLog {
  taskId: number;
  dir: string;
  segment: string;
  filename: string;
  filetype: string;
  spName: string;
  spStatus: number;
  dlStatus: number;
  lastModified: string;
  spTime: string;
  dlTime: string;
}
export interface FileStatus {
  taskId: number;
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



export interface FileConfig {
  id: number;
  childPath: string | null;
  file_name: string | null;
  file_type: string | null;
  format: string | null;
  spName: string | null;
  spParam: string | null;
  spParamValue: string | null;
  dirName: string;
  segment: string;
  folderName: string | null;
  created_at: string | null;
}

export interface FileStats {
  totalFiles: number;
  pendingFiles: number;
  downloadedFiles: number;
  importedFiles: number;
  processingSpeed: string;
  lastUpdated: string;
}
