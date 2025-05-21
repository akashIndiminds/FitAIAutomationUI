//services/importService.ts
import { FileStatus } from '@/components/types';

export const importFiles = async (files: FileStatus[]): Promise<FileStatus[]> => {
  const response = await fetch('http://192.168.1.119:3000/api/import', {
    method: 'GET',
    body: JSON.stringify(files),
  });
  if (!response.ok) throw new Error('Import failed');
  return response.json();
};