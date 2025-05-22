//services/importService.ts
import { FileStatus } from '@/components/types';
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const importFiles = async (files: FileStatus[]): Promise<FileStatus[]> => {
  const response = await fetch(`${API_BASE}/api/automate/import`, {
    method: 'GET',
    body: JSON.stringify(files),
  });
  if (!response.ok) throw new Error('Import failed');
  return response.json();
};